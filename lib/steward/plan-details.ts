// What each plan actually includes, for the "What's included" dialog.
//
// The pricing CARD stays short — price, one line, a few benefits — because a
// card that explains everything stops being scannable. The detail lives here
// and opens on request.
//
// Two rules this copy is written against, both from the accepted docset:
//
//   1. The Free Blueprint is genuinely useful on its own. It is three real
//      pages, not a teaser, and it is described as such.
//   2. Free is NOT a slow route to the full Blueprint. Being guided through all
//      thirteen pages section by section is continuing guided redevelopment and
//      is what the Full Build is (DEF-B02-FREE-SCOPE-001). Saying so plainly on
//      the pricing page is better than letting someone discover it later.
//
// Page titles, taglines and purposes are not repeated here — they are rendered
// from lib/steward/blueprint.ts, which transcribes them from the docset, so
// this file cannot describe a Blueprint that differs from the one built.

export type PlanDetailSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type PlanDetail = {
  /** Headline inside the dialog. */
  heading: string;
  lede: string;
  /** Which page list to render, if any. */
  pages?: "free" | "full";
  pagesIntro?: string;
  sections: PlanDetailSection[];
  /** Said plainly, so nobody discovers it after paying. */
  notIncluded?: string[];
  fineprint?: string[];
};

const PROPOSE_AND_APPROVE: PlanDetailSection = {
  title: "How anything gets written",
  body:
    "Steward proposes wording and you approve the exact words. Nothing reaches your Blueprint until you say so, and you can change or remove anything at any time. Steward never fills a page in for you.",
};

const THREE_WAYS: PlanDetailSection = {
  title: "Three ways to talk, whenever you want them",
  bullets: [
    "Listen First — say it out loud. No advice back unless you ask.",
    "Help Me Think — work through it together. Questions, options, trade-offs.",
    "Help Me Take a Step — turn it into one thing you can actually do this week.",
  ],
};

const SAFETY_FINEPRINT =
  "Steward is not a counsellor, doctor or crisis service, and it does not give financial, legal or medical advice.";

export const PLAN_DETAILS: Record<string, PlanDetail> = {
  free: {
    heading: "What you get for free",
    lede:
      "There are only two depths and no middle edition. The Free Blueprint is three real pages — a genuinely useful whole-life summary and one concrete next step — not a locked preview of a longer document.",
    pages: "free",
    pagesIntro: "Your three pages",
    sections: [
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
      {
        title: "What Steward will help you with on Free",
        bullets: [
          "Think through a decision that is in front of you right now",
          "Explain wording you already have and name what is unclear in it",
          "Draft a sentence for one of your three pages, for you to approve",
          "Find one next step small enough that you will actually take it",
        ],
      },
      {
        title: "What it costs",
        body: "Nothing. No card, no trial that turns into a charge, no expiry on the three pages you build.",
      },
    ],
    notIncluded: [
      "The other ten Blueprint pages",
      "Being guided section by section through the full Blueprint — that is the Full Build, not a slower version of Free",
    ],
    fineprint: [SAFETY_FINEPRINT],
  },

  initial_full: {
    heading: "What the Full Build includes",
    lede:
      "One purchase, all thirteen pages, and a guided window with Steward to build them. It is a one-time purchase — not a subscription — and the Blueprint you build is yours to keep.",
    pages: "full",
    pagesIntro: "The thirteen pages",
    sections: [
      {
        title: "A 30-day guided build window",
        body:
          "Thirty days of working through the Blueprint with Steward, page by page, in whatever order the season calls for. The window starts when you activate — not when you pay — and you have 90 days to decide when to start.",
      },
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
      {
        title: "Pages show their real state",
        body:
          "Every page says where it actually stands: Not Yet Explored, Taking Shape, or Defined for This Season. A page you have not come to yet still shows what it is for. Nothing is dressed up as finished.",
      },
      {
        title: "Yours to keep",
        body:
          "When the build window ends, the Blueprint stays. Nothing is deleted, nothing is locked, and you are never asked to buy the build a second time.",
      },
    ],
    notIncluded: [
      "Continuing to refine with Steward after the 30-day window — that is Premium",
    ],
    fineprint: [
      "$149.00 once. This is not a subscription and does not renew.",
      SAFETY_FINEPRINT,
    ],
  },

  build_plus_first_year: {
    heading: "What Build + first year includes",
    lede:
      "The full thirteen-page build and a full year of Premium, paid once. $50 less than buying the two separately, and it does not renew — no card is kept on file.",
    pages: "full",
    pagesIntro: "The thirteen pages",
    sections: [
      {
        title: "Everything in the Full Build",
        body:
          "All thirteen pages and the 30-day guided build window with Steward, yours to keep.",
      },
      {
        title: "Plus twelve months of Premium",
        body:
          "A year of carrying on with Steward after the build window closes — revisiting pages as the season changes, working on a guardrail that stopped holding, returning to drift when you notice it.",
      },
      {
        title: "Both clocks start when you activate",
        body:
          "The 30-day build window and the 12-month Premium term start together, the moment you activate — not when you pay. You have 90 days to activate, and nothing is ticking until you do.",
      },
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
    ],
    notIncluded: ["Automatic renewal — when the year ends, nothing is charged"],
    fineprint: [
      "$299.00 once, covering 12 months. It does not renew and no card is kept on file.",
      "When the prepaid year ends your Blueprint is retained and access returns to free. Continuing with Premium is a separate purchase you choose to make.",
      SAFETY_FINEPRINT,
    ],
  },

  premium_monthly: {
    heading: "What Premium includes",
    lede:
      "Premium is for after the build: keeping a Blueprint you already have true to the life you are actually living.",
    sections: [
      {
        title: "Keep building and refining",
        body:
          "Revisit any of the thirteen pages as often as you want. Rework a guardrail that stopped holding, change what this season's focus is, rewrite a value in words that fit better now.",
      },
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
      {
        title: "Ending it never costs you anything you built",
        body:
          "Cancelling stops future charges and keeps the access you have already paid for. Your Blueprint is retained in full — ending Premium never deletes it and never asks you to buy the build again.",
      },
    ],
    notIncluded: [
      "The Full Blueprint build itself — Premium adds to a Blueprint you already own",
    ],
    fineprint: ["$19.00 every month until canceled.", SAFETY_FINEPRINT],
  },

  premium_annual: {
    heading: "What Premium includes",
    lede:
      "Premium is for after the build: keeping a Blueprint you already have true to the life you are actually living. Billed yearly, which is $29 less than paying monthly.",
    sections: [
      {
        title: "Keep building and refining",
        body:
          "Revisit any of the thirteen pages as often as you want. Rework a guardrail that stopped holding, change what this season's focus is, rewrite a value in words that fit better now.",
      },
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
      {
        title: "Ending it never costs you anything you built",
        body:
          "Cancelling stops future charges and keeps the access you have already paid for. Your Blueprint is retained in full — ending Premium never deletes it and never asks you to buy the build again.",
      },
    ],
    notIncluded: [
      "The Full Blueprint build itself — Premium adds to a Blueprint you already own",
    ],
    fineprint: ["$199.00 every year until canceled.", SAFETY_FINEPRINT],
  },

  facilitator_premium_trial: {
    heading: "What the facilitator trial includes",
    lede:
      "Premium for facilitators, free for an introductory period so you can see what participants will be working in before you walk anyone through it.",
    sections: [
      {
        title: "Full Premium during the trial",
        body: "Everything Premium includes, with no limits placed on the trial period itself.",
      },
      THREE_WAYS,
      PROPOSE_AND_APPROVE,
      {
        title: "What happens at the end",
        body:
          "A card is collected when you start, and billing begins when the trial ends unless you cancel before then. Cancelling keeps everything you built.",
      },
    ],
    fineprint: [SAFETY_FINEPRINT],
  },
};
