// The Steward help button that sits on every public page.
//
// The frontend is served two different ways and both need this, which is why
// the content lives here rather than in a component:
//
//   * main/*.html, transformed into a string at request time — no React;
//   * React pages wrapped in SiteShell.
//
// So: one list of links, one set of words, rendered twice. The HTML renderer is
// below; the React one is components/public-site/steward-fab.tsx and reads the
// same list, so a changed destination or label can only be changed in one place.

export type StewardFabLink = {
  /** Picks the glyph in each renderer. */
  icon: "steward" | "pricing" | "contact" | "account";
  label: string;
  note: string;
  href: string;
};

export const STEWARD_FAB_PILL_PREFIX = "Need help?";
export const STEWARD_FAB_PILL_ACTION = "Ask Steward";
export const STEWARD_FAB_TITLE = "Steward";
export const STEWARD_FAB_SUBTITLE =
  "A personal guide for designing and living a life that matters.";

export function stewardFabLinks({ siteUrl, appUrl }: { siteUrl: string; appUrl: string }): StewardFabLink[] {
  return [
    {
      icon: "steward",
      label: "Talk to Steward",
      // Opens the member app with the conversation in view. Signed out, that
      // lands on sign-in and returns here afterwards.
      //
      // This used to carry `?page=guardrails`, which only ever meant something
      // to the scripted prototype — the live page returns <LiveConversation />
      // and never reads searchParams, so it was a parameter that promised
      // context and delivered none. Opening a Blueprint page in context is a
      // real feature; when it exists, the link can say so again.
      href: `${appUrl}/steward`,
      note: "Open the chat and start where you are",
    },
    {
      icon: "pricing",
      label: "Plans and pricing",
      href: `${appUrl}/steward/pricing`,
      note: "Free, the Full Build, and Premium",
    },
    {
      icon: "contact",
      label: "Contact us",
      href: `${siteUrl}/contact`,
      note: "Questions, speaking, partnership",
    },
    {
      icon: "account",
      label: "Create an account",
      href: `${appUrl}/register`,
      note: "Start free — no card needed",
    },
  ];
}

/** Inline glyphs for the string renderer. Lucide equivalents in the component. */
const ICON_SVG: Record<StewardFabLink["icon"], string> = {
  steward:
    '<path d="M7.5 3.5 8.6 6.4 11.5 7.5 8.6 8.6 7.5 11.5 6.4 8.6 3.5 7.5 6.4 6.4Z"></path><path d="M16 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"></path>',
  pricing:
    '<path d="M3 7a2 2 0 0 1 2-2h5.2a2 2 0 0 1 1.4.6l8 8a2 2 0 0 1 0 2.8l-5.2 5.2a2 2 0 0 1-2.8 0l-8-8A2 2 0 0 1 3 12.2Z"></path><circle cx="7.5" cy="9.5" r="1.2"></circle>',
  contact:
    '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3.5 7 8.5 6 8.5-6"></path>',
  account:
    '<path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"></path><circle cx="9.5" cy="7" r="3.5"></circle><path d="M18 8.5v5M20.5 11h-5"></path>',
};

function svg(body: string, size = 18) {
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * The whole thing as one string: styles, markup and behaviour.
 *
 * Self-contained by design. Several of the pages this lands on are Bricks
 * exports with their own CSS, so it defines its own custom properties rather
 * than borrowing the nav's, and every selector is scoped under the root id.
 * Dark mode keys off [data-theme="dark"], which the site's theme toggle sets on
 * <html> alongside the .dark class the React side uses.
 */
export function renderStewardFab({ siteUrl, appUrl }: { siteUrl: string; appUrl: string }) {
  const links = stewardFabLinks({ siteUrl, appUrl });

  const rows = links
    .map(
      (link) => `
      <a class="mjg-fab-row" href="${escapeAttr(link.href)}">
        <span class="mjg-fab-ico">${svg(ICON_SVG[link.icon])}</span>
        <span class="mjg-fab-copy">
          <span class="mjg-fab-label">${link.label}</span>
          <span class="mjg-fab-note">${link.note}</span>
        </span>
        <span class="mjg-fab-chev">${svg('<path d="m9 6 6 6-6 6"></path>', 15)}</span>
      </a>`,
    )
    .join("");

  return `
<style>
  #mjg-steward-fab {
    --fab-bg: #ffffff;
    --fab-text: #111110;
    --fab-muted: #6b665c;
    --fab-border: #e8e6e0;
    --fab-gold: #b88a4a;
    --fab-ink: #111110;
    --fab-on-ink: #ffffff;
    --fab-hover: rgba(17, 17, 17, 0.05);
    --fab-shadow: 0 18px 44px -14px rgba(17, 16, 14, 0.3);
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 9990;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
    font-family: 'Roboto', system-ui, -apple-system, sans-serif;
  }
  [data-theme="dark"] #mjg-steward-fab {
    --fab-bg: #17150f;
    --fab-text: #f4f1ea;
    --fab-muted: #a9a497;
    --fab-border: rgba(255, 255, 255, 0.11);
    --fab-gold: #d8bd86;
    --fab-ink: #f4f1ea;
    --fab-on-ink: #17150f;
    --fab-hover: rgba(255, 255, 255, 0.07);
    --fab-shadow: 0 18px 44px -14px rgba(0, 0, 0, 0.75);
  }

  #mjg-steward-fab .mjg-fab-card {
    width: 320px;
    max-width: calc(100vw - 2.5rem);
    background: var(--fab-bg);
    border: 1px solid var(--fab-border);
    border-radius: 16px;
    box-shadow: var(--fab-shadow);
    overflow: hidden;
    transform-origin: bottom right;
    animation: mjg-fab-in 0.16s ease-out;
  }
  @keyframes mjg-fab-in {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    #mjg-steward-fab .mjg-fab-card { animation: none; }
  }

  #mjg-steward-fab .mjg-fab-head { padding: 1rem 1.1rem 0.85rem; }
  #mjg-steward-fab .mjg-fab-title {
    margin: 0; font-size: 1rem; font-weight: 700; color: var(--fab-text);
  }
  #mjg-steward-fab .mjg-fab-sub {
    margin: 0.2rem 0 0; font-size: 0.8125rem; line-height: 1.45; color: var(--fab-muted);
  }

  #mjg-steward-fab .mjg-fab-row {
    display: flex; align-items: center; gap: 0.8rem;
    padding: 0.8rem 1.1rem;
    border-top: 1px solid var(--fab-border);
    color: var(--fab-text); text-decoration: none;
    transition: background 0.15s;
  }
  #mjg-steward-fab .mjg-fab-row:hover { background: var(--fab-hover); }
  #mjg-steward-fab .mjg-fab-ico { display: flex; flex: none; color: var(--fab-gold); }
  #mjg-steward-fab .mjg-fab-copy { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  #mjg-steward-fab .mjg-fab-label { font-size: 0.875rem; font-weight: 500; }
  #mjg-steward-fab .mjg-fab-note { font-size: 0.75rem; color: var(--fab-muted); margin-top: 0.1rem; }
  #mjg-steward-fab .mjg-fab-chev { display: flex; flex: none; color: var(--fab-muted); opacity: 0.6; }

  #mjg-steward-fab .mjg-fab-bar { display: flex; align-items: center; gap: 0.6rem; }
  #mjg-steward-fab .mjg-fab-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.7rem 1.15rem;
    background: var(--fab-bg); color: var(--fab-text);
    border: 1px solid var(--fab-border); border-radius: 999px;
    box-shadow: var(--fab-shadow);
    font-family: inherit; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: transform 0.15s;
  }
  #mjg-steward-fab .mjg-fab-pill:hover { transform: translateY(-1px); }
  #mjg-steward-fab .mjg-fab-pill b { font-weight: 600; color: var(--fab-gold); }

  #mjg-steward-fab .mjg-fab-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 54px; height: 54px; flex: none;
    background: var(--fab-ink); color: var(--fab-on-ink);
    border: none; border-radius: 50%;
    box-shadow: var(--fab-shadow);
    cursor: pointer;
    transition: transform 0.15s;
  }
  #mjg-steward-fab .mjg-fab-btn:hover { transform: scale(1.05); }
  #mjg-steward-fab .mjg-fab-pill:focus-visible,
  #mjg-steward-fab .mjg-fab-btn:focus-visible,
  #mjg-steward-fab .mjg-fab-row:focus-visible {
    outline: 2px solid var(--fab-gold); outline-offset: 2px;
  }

  /* On a phone the pill costs more width than it earns; the round button and
     the card carry the whole thing. */
  @media (max-width: 560px) {
    #mjg-steward-fab { right: 1rem; bottom: 1rem; }
    #mjg-steward-fab .mjg-fab-pill { display: none; }
  }
</style>
<div id="mjg-steward-fab">
  <div class="mjg-fab-card" id="mjg-fab-card" role="dialog" aria-label="${escapeAttr(STEWARD_FAB_TITLE)}" hidden>
    <div class="mjg-fab-head">
      <p class="mjg-fab-title">${STEWARD_FAB_TITLE}</p>
      <p class="mjg-fab-sub">${STEWARD_FAB_SUBTITLE}</p>
    </div>${rows}
  </div>
  <div class="mjg-fab-bar">
    <button type="button" class="mjg-fab-pill" data-mjg-fab-toggle aria-expanded="false" aria-controls="mjg-fab-card">
      ${STEWARD_FAB_PILL_PREFIX} <b>${STEWARD_FAB_PILL_ACTION}</b>
    </button>
    <button type="button" class="mjg-fab-btn" data-mjg-fab-toggle aria-expanded="false" aria-controls="mjg-fab-card"
            aria-label="Open the Steward menu">
      <span data-mjg-fab-icon="closed">${svg('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z"></path>', 22)}</span>
      <span data-mjg-fab-icon="open" hidden>${svg('<path d="M6 6 18 18M18 6 6 18"></path>', 22)}</span>
    </button>
  </div>
</div>
<script>
(function () {
  var root = document.getElementById('mjg-steward-fab');
  if (!root || root.dataset.wired === '1') return;
  root.dataset.wired = '1';

  var card = root.querySelector('#mjg-fab-card');
  var toggles = root.querySelectorAll('[data-mjg-fab-toggle]');
  var closedIcon = root.querySelector('[data-mjg-fab-icon="closed"]');
  var openIcon = root.querySelector('[data-mjg-fab-icon="open"]');

  function setOpen(next) {
    card.hidden = !next;
    if (closedIcon) closedIcon.hidden = next;
    if (openIcon) openIcon.hidden = !next;
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute('aria-expanded', next ? 'true' : 'false');
      toggles[i].setAttribute(
        'aria-label',
        toggles[i].classList.contains('mjg-fab-btn')
          ? (next ? 'Close the Steward menu' : 'Open the Steward menu')
          : toggles[i].getAttribute('aria-label') || ''
      );
    }
  }

  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', function () { setOpen(card.hidden); });
  }
  document.addEventListener('click', function (e) {
    if (!card.hidden && !root.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !card.hidden) {
      setOpen(false);
      var btn = root.querySelector('.mjg-fab-btn');
      if (btn) btn.focus();
    }
  });
})();
</script>`;
}
