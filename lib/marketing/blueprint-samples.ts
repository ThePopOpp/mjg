// Sample Personal Stewardship Blueprints for /personal-blueprint ("A look inside").
//
// Source: docs/personal-blueprint (Stewardship_Blueprint_Complete_Review_Packet
// and the per-person PDFs). Every person, relationship and detail is a FICTIONAL
// ILLUSTRATION — the page must say so wherever the samples appear.
//
// Only the editions the product actually builds are shown: Free (3 pages) and
// Full (13 pages), matching FREE_PAGES / BLUEPRINT_PAGES in lib/steward/blueprint.
// The packet's 6-page "Essentials" edition is a proposal, not a product, so its
// sample is deliberately not published.
//
// Images: public/marketing/blueprint-samples/<id>/page-NN.webp (rendered from
// the PDFs at 150 dpi, 1000px wide). The PDF sits beside them as sample.pdf.

export type BlueprintSample = {
  id: string;
  person: string;
  age: number;
  edition: "Free" | "Full";
  /** One line about who this fictional person is. */
  about: string;
  pages: string[];
};

const FULL_PAGES = [
  "Cover — My Current Stewardship Blueprint",
  "My North Star",
  "What I Stand On",
  "The Person I Am Becoming + My Why",
  "My Governing Values",
  "My Four Pillars",
  "My Finances — Enough. Freedom. Multiplication.",
  "Guardrails — Protect What Matters",
  "Drift + Return — Recognize Drift. Return Quickly.",
  "My Accountability Partner",
  "Keystone Rhythms — The Rhythms That Sustain Alignment",
  "Energy — Steward the Fuel Behind the Life",
  "Legacy — What My Life Is Multiplying",
];

export const BLUEPRINT_SAMPLES: BlueprintSample[] = [
  {
    id: "rachel-full",
    person: "Rachel",
    age: 43,
    edition: "Full",
    about: "Operations executive, married, parenting teenagers and sharing care for aging parents.",
    pages: FULL_PAGES,
  },
  {
    id: "rachel-free",
    person: "Rachel",
    age: 43,
    edition: "Free",
    about: "The same person at the free depth: a whole-life view and one next step she can live.",
    pages: ["Cover — My Current Stewardship Blueprint", "My North Star", "My Next Faithful Step"],
  },
  {
    id: "ethan-full",
    person: "Ethan",
    age: 26,
    edition: "Full",
    about: "Early-career engineer building faith, friendships, independence, and financial stability.",
    pages: FULL_PAGES,
  },
  {
    id: "thomas-full",
    person: "Thomas",
    age: 67,
    edition: "Full",
    about: "Recently retired leader learning shared freedom, family presence, and living generosity.",
    pages: FULL_PAGES,
  },
];

export const sampleImage = (id: string, index: number) =>
  `/marketing/blueprint-samples/${id}/page-${String(index + 1).padStart(2, "0")}.webp`;

export const samplePdf = (id: string) => `/marketing/blueprint-samples/${id}/sample.pdf`;

export const SAMPLE_NOTE =
  "Fictional illustrations. Every name, relationship, and detail is invented to show what a finished Blueprint can look like — not a testimonial, a financial plan, or a promise of results.";
