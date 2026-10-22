#!/usr/bin/env node
/**
 * Creates the Stripe products and prices for every offer in steward_offers,
 * and writes the resulting ids back onto the catalogue rows.
 *
 * WHY A SCRIPT AND NOT THE DASHBOARD. The catalogue in Postgres is the source of
 * truth for what a customer is charged. Hand-building prices in the Stripe UI
 * invites a mismatch where the page promises $149 and Stripe takes $199, which
 * is the kind of error nobody notices until a customer does.
 *
 * IDEMPOTENT. A price is matched by its lookup_key, so re-running changes
 * nothing. Stripe prices are immutable: if an amount, interval or currency
 * changes, the old price is archived and a new one created, because mutating a
 * live price would silently alter what existing subscribers pay — the docset's
 * purchased_terms_immutable rule.
 *
 * TAX. Prices are created with tax_behavior from steward_config (default
 * "exclusive"). This cannot be changed after creation, and a price created
 * without it can never be used with Stripe Tax, so it is set now even though
 * tax calculation is off.
 *
 * Usage:
 *   node scripts/stripe-sync-catalogue.mjs --dry-run   # report, change nothing
 *   node scripts/stripe-sync-catalogue.mjs             # create / reconcile
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const dryRun = process.argv.includes("--dry-run");

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("STRIPE_SECRET_KEY is not set (looked in .env.local and .env).");
  process.exit(1);
}
// Refuse live keys unless someone deliberately said so. A mis-pasted live key
// would create real products on a real account mid-review.
if (/^(sk|rk)_live_/.test(secret) && process.env.STRIPE_MODE !== "live") {
  console.error("Refusing to run: STRIPE_SECRET_KEY is a LIVE key but STRIPE_MODE is not 'live'.");
  process.exit(1);
}

const stripe = new Stripe(secret);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const INTERVAL = { MONTH: "month", YEAR: "year" };

/**
 * Looks a price up by lookup_key using LIST, not SEARCH.
 *
 * stripe.prices.search() is backed by an index that lags behind writes by up to
 * a minute, so immediately after creating a price the search returns nothing and
 * a re-run tries to create it again — which fails on the duplicate lookup_key
 * and leaves the sync non-idempotent. prices.list({ lookup_keys }) reads the
 * primary store and is consistent straight away.
 */
async function findPriceByLookupKey(lookupKey) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  return found.data[0] ?? null;
}

/** Returns the usable price, creating or replacing it only when it has to. */
async function ensurePrice({ lookupKey, productId, amountMinor, currency, interval, taxBehavior }) {
  const existing = await findPriceByLookupKey(lookupKey);

  if (existing) {
    const sameAmount = existing.unit_amount === amountMinor;
    const sameCurrency = existing.currency === currency.toLowerCase();
    const sameInterval = (existing.recurring?.interval ?? null) === (interval ? INTERVAL[interval] : null);
    if (sameAmount && sameCurrency && sameInterval && existing.active) {
      return { price: existing, action: "unchanged" };
    }
    if (dryRun) return { price: existing, action: "would-replace" };

    // Immutable: free the lookup key, archive, then create fresh. Existing
    // subscriptions stay on the archived price, which is the point.
    await stripe.prices.update(existing.id, { lookup_key: null, active: false });
  }

  if (dryRun) return { price: null, action: existing ? "would-replace" : "would-create" };

  const created = await stripe.prices.create({
    product: productId,
    unit_amount: amountMinor,
    currency: currency.toLowerCase(),
    lookup_key: lookupKey,
    tax_behavior: taxBehavior,
    ...(interval ? { recurring: { interval: INTERVAL[interval] } } : {}),
  });
  return { price: created, action: existing ? "replaced" : "created" };
}

async function ensureProduct(offer) {
  // Prefer the id we already recorded: a direct retrieve is consistent, whereas
  // products.search has the same indexing lag as prices.search.
  if (offer.stripe_product_id) {
    try {
      const known = await stripe.products.retrieve(offer.stripe_product_id);
      if (!known.deleted) return known;
    } catch {
      // Deleted or belongs to another account — fall through and re-create.
    }
  }
  const existing = await stripe.products.search({
    query: `metadata['steward_product_key']:"${offer.product_key}"`,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0];
  if (dryRun) return { id: `(would create product ${offer.product_key})` };

  return stripe.products.create({
    name: offer.label,
    description: offer.description || undefined,
    metadata: { steward_product_key: offer.product_key },
  });
}

try {
  const { rows: cfg } = await client.query(
    "select key, value from steward_config where key in ('tax.behavior','tax.enabled')",
  );
  const taxBehavior = (cfg.find((r) => r.key === "tax.behavior")?.value ?? "exclusive").toString().replace(/"/g, "");
  const taxEnabled = cfg.find((r) => r.key === "tax.enabled")?.value === true;

  const { rows: offers } = await client.query(
    `select offer_key, product_key, label, description, price_minor, currency, billing, interval,
            renewal_price_minor, renewal_interval, trial_days, production_enabled, is_historical_record, stripe_product_id
       from steward_offers order by sort_order`,
  );

  console.log(`\nStripe catalogue sync${dryRun ? " (DRY RUN)" : ""}`);
  console.log(`tax_behavior=${taxBehavior} · tax calculation ${taxEnabled ? "ON" : "off"}\n`);

  for (const offer of offers) {
    // Free has nothing to charge; there is no Stripe object for it.
    if (offer.billing === "NONE" || offer.price_minor === 0) {
      console.log(`  --  ${offer.offer_key.padEnd(28)} free — no Stripe objects needed`);
      continue;
    }
    // Historical rows exist so prior purchases resolve; they are never sold
    // and so never need a Stripe object.
    if (offer.is_historical_record) {
      console.log(`  --  ${offer.offer_key.padEnd(28)} historical record — skipped`);
      continue;
    }

    const product = await ensureProduct(offer);

    const isRecurring = offer.billing === "RECURRING";
    const main = await ensurePrice({
      lookupKey: `steward_${offer.offer_key}`,
      productId: product.id,
      amountMinor: offer.price_minor,
      currency: offer.currency,
      interval: isRecurring ? offer.interval : null,
      taxBehavior,
    });

    // The bundle's second phase: a recurring price the subscription moves onto
    // after the initial term. Created now so checkout can reference it.
    let renewal = null;
    if (offer.billing === "INITIAL_BUNDLE_THEN_RECURRING_ANNUAL" && offer.renewal_price_minor) {
      renewal = await ensurePrice({
        lookupKey: `steward_${offer.offer_key}_renewal`,
        productId: product.id,
        amountMinor: offer.renewal_price_minor,
        currency: offer.currency,
        interval: offer.renewal_interval,
        taxBehavior,
      });
    }

    const trial = offer.trial_days ? ` · ${offer.trial_days}d trial` : "";
    const enabled = offer.production_enabled ? "" : " · NOT enabled for sale";
    console.log(
      `  ok  ${offer.offer_key.padEnd(28)} ${String(main.action).padEnd(12)}` +
        `${renewal ? ` + renewal ${renewal.action}` : ""}${trial}${enabled}`,
    );

    if (!dryRun) {
      await client.query(
        `update steward_offers
            set stripe_product_id = $2, stripe_price_id = $3, stripe_renewal_price_id = $4, updated_at = now()
          where offer_key = $1`,
        [offer.offer_key, product.id, main.price?.id ?? null, renewal?.price?.id ?? null],
      );
    }
  }

  console.log(
    dryRun
      ? "\nDry run — nothing created and no ids written.\n"
      : "\nDone. Stripe ids written back to steward_offers.\n",
  );
} catch (err) {
  console.error("\nSync failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
