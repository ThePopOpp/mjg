// The homepage (home.dc.html). Section order is fixed in code; everything a
// visitor reads or clicks is here.

import { defineScope, defineSection, type ContentField, type Cta, type MediaValue, type VideoFileValue } from "../kit";
import { f, photo, seoSection } from "./shared";

// ── Hero: the Steward video ──────────────────────────────────────────────────

type Hero = { eyebrow: string; title: string; subtitle: string; body: string; primaryCta: Cta; secondaryCta: Cta; video: VideoFileValue; videoLabel: string };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero (Steward video)",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "subtitle", label: "Subtitle", kind: "text", maxLength: 160 },
    f.body(),
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
    { key: "video", label: "Looping video", kind: "videoFile", help: "Silent loop. Desktop 16:9 in src, phone 9:16 in mobileSrc." },
    { key: "videoLabel", label: "Video description (screen readers)", kind: "text", maxLength: 200 },
  ],
  defaults: {
    eyebrow: "Your Personal Stewardship Guide",
    title: "Meet Steward AI",
    subtitle: "Reflect. Build your Blueprint. Decide with clarity.",
    body: "Steward is a personal guide built around the Stewardship Blueprint — it helps you make space to think, clarify priorities, and return to the decisions that matter when life gets busy. Your convictions lead; Steward proposes the words and you approve what is saved.",
    primaryCta: { label: "Get Started", href: "/start" },
    secondaryCta: { label: "Prices & Plans", href: "/steward/pricing" },
    video: {
      src: "/marketing/video/steward-agent.mp4",
      mobileSrc: "/marketing/video/steward-agent-mobile.mp4",
      poster: "/marketing/video/steward-agent-poster.jpg",
      mobilePoster: "/marketing/video/steward-agent-mobile-poster.jpg",
    },
    videoLabel:
      "A short silent demo of Steward: a member talks through a family situation, and Steward proposes a guardrail they approve into their Blueprint.",
  },
});

// ── 01 Awaken ────────────────────────────────────────────────────────────────

type Awaken = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
  moreBody: string;
  readMoreLabel: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  film: string;
  filmPoster: MediaValue;
  filmLabel: string;
};

const awaken = defineSection<Awaken>({
  key: "awaken",
  label: "01 · Awaken",
  fields: [
    f.eyebrow(),
    f.title(),
    f.lead(),
    f.body(),
    { key: "moreBody", label: "Read-more text (dialog)", kind: "textarea", maxLength: 3000 },
    { key: "readMoreLabel", label: "Read-more button", kind: "text", maxLength: 30 },
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
    { key: "film", label: "Brand film (Vimeo / YouTube link)", kind: "embed", help: "Plays only when clicked." },
    f.media("filmPoster", "Film poster"),
    { key: "filmLabel", label: "Film play button label", kind: "text", maxLength: 80 },
  ],
  defaults: {
    eyebrow: "The Stewardship Blueprint",
    title: "What Kind of Life Are You Actually Building?",
    lead: "Most people don’t intentionally drift. Life simply gets full.",
    body: "We work hard, care for people, pursue opportunities, and manage countless responsibilities. But somewhere along the way, we can stop asking whether the life we’re building reflects what matters most.\n\nThe Stewardship Blueprint is a whole-life framework that helps you stop drifting, steward what God has entrusted to you, and build a life that matters.",
    moreBody:
      "We work hard, care for people, pursue opportunities, and manage countless responsibilities. But somewhere along the way, we can stop asking whether the life we’re building reflects what matters most.\n\nYour life is taking shape every day—through your calendar, relationships, habits, health, decisions, and use of resources. The question isn’t whether you are building. It’s whether you are building on purpose.\n\nThe Stewardship Blueprint is a whole-life framework that helps you stop drifting, steward what God has entrusted to you, and build a life that matters.",
    readMoreLabel: "Read more",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
    secondaryCta: { label: "Explore the Blueprint →", href: "/stewardship-blueprint" },
    film: "https://player.vimeo.com/video/1237401025?h=c37d5b82d1",
    filmPoster: photo("/marketing/stock/brand-film-poster.jpg", "A road winding through rolling hills at sunset", "Photo: Julien Riedel / Unsplash"),
    filmLabel: "Play the Stewardship Blueprint film",
  },
});

// ── 02 See the Framework ─────────────────────────────────────────────────────

type Framework = { eyebrow: string; title: string; layerCta: string; frameworkCta: Cta };

const framework = defineSection<Framework>({
  key: "framework",
  label: "02 · See the Framework",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "layerCta", label: "Layer link text", kind: "text", maxLength: 40 },
    f.cta("frameworkCta", "Framework link"),
  ],
  defaults: {
    eyebrow: "02 · See the Framework",
    title: "A Life That Matters Is Built on Purpose.",
    layerCta: "Explore this layer",
    frameworkCta: { label: "Explore the Framework →", href: "/stewardship-blueprint" },
  },
});

// ── 03 First Step ────────────────────────────────────────────────────────────

export type CheckInDemoContent = {
  heading: string;
  captureHeading: string;
  sampleName: string;
  sampleEmail: string;
  submitLabel: string;
  clickHint: string;
};
type FirstStep = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  demo: CheckInDemoContent;
};

const firstStep = defineSection<FirstStep>({
  key: "firstStep",
  label: "03 · First Step",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
    {
      key: "demo",
      label: "Animated Check-In preview",
      kind: "group",
      fields: [
        f.text("heading", "Card heading", 80),
        f.text("captureHeading", "Results step heading", 80),
        f.text("sampleName", "Sample name typed in", 40),
        f.text("sampleEmail", "Sample email typed in", 80),
        f.text("submitLabel", "Results button", 40),
        f.text("clickHint", "Hint shown on hover", 60),
      ],
    },
  ],
  defaults: {
    eyebrow: "03 · First Step",
    title: "Awareness Is Where Stewardship Begins.",
    body: "Before you can build differently, you need to see clearly where you are today.\n\nThe Created for More Check-In is a free, 28-question reflection across seven connected layers of the Blueprint. In about fifteen minutes, it helps you notice where your life is aligned, where you may be drifting, and what deserves attention next.\n\nThis is not a grade. It is a starting point for honest reflection and one faithful next step.",
    primaryCta: { label: "Begin My Free Check-In", href: "/created-for-more-check-in" },
    secondaryCta: { label: "Explore Other Assessments", href: "/assessments" },
    demo: {
      heading: "Created for More Check-In",
      captureHeading: "Send me my results and next step",
      sampleName: "Jordan",
      sampleEmail: "jordan@example.com",
      submitLabel: "Send my results",
      clickHint: "Start the Check-In →",
    },
  },
});

// ── 04 Ways to Engage ────────────────────────────────────────────────────────

type EngageCard = { id: string; title: string; body: string; href: string; image: MediaValue };
type Engage = { eyebrow: string; title: string; body: string; cards: EngageCard[]; primaryCta: Cta; secondaryCta: Cta };

const engageCardFields: ContentField[] = [
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 60 },
  { key: "body", label: "Description", kind: "textarea", maxLength: 300 },
  { key: "href", label: "Link", kind: "url" },
  { key: "image", label: "Image", kind: "media" },
];

const engage = defineSection<Engage>({
  key: "engage",
  label: "04 · Ways to Engage",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.list("cards", "Cards", engageCardFields, 6, "Card"),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "04 · Ways to Engage",
    title: "There Is More Than One Way to Begin.",
    body: "You can start with quiet reflection, a good book, meaningful conversation, a group experience, or a more detailed personal plan. Each path is connected to the same framework.",
    cards: [
      {
        id: "learn",
        title: "Learn & Reflect",
        body: "Assessments, insights, and tools that help you notice what matters.",
        href: "/assessments",
        image: photo("/marketing/stock/reflection-journal.jpg", "Someone writing in a journal beside a coffee", "Photo: Prophsee Journals / Unsplash"),
      },
      {
        id: "read",
        title: "Read & Discover",
        body: "The Life You’re Building and practical resources that explain the framework.",
        href: "/the-life-youre-building",
        image: { ...photo("/marketing/brand/the-life-youre-building-book.webp", "The Life You’re Building, by Michael J. Gauthier"), fit: "contain" },
      },
      {
        id: "grow",
        title: "Grow Together",
        body: "Small-group studies and church experiences that turn insight into honest conversation and action.",
        href: "/studies",
        image: photo("/marketing/stock/small-group.jpg", "A small group Bible study around a wooden table", "Photo: Nicolas Lobos / Unsplash"),
      },
      {
        id: "build",
        title: "Build Your Blueprint",
        body: "A personal plan rooted in your mission, values, relationships, commitments, and current season.",
        href: "/personal-blueprint",
        image: photo("/marketing/stock/blueprint-journal.jpg", "Someone writing in a journal beside a cup of coffee", "Photo: Cathryn Lavery / Unsplash"),
      },
    ],
    primaryCta: { label: "Find My Starting Point", href: "/start" },
    secondaryCta: { label: "Explore Learning & Resources", href: "/learn-and-grow" },
  },
});

// ── 05 Personal Blueprint ────────────────────────────────────────────────────

type Blueprint = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  cover: MediaValue;
  northStar: MediaValue;
  interior: MediaValue;
};

const blueprint = defineSection<Blueprint>({
  key: "blueprint",
  label: "05 · Personal Blueprint",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    f.media("cover", "Large image"),
    f.media("northStar", "Top-right image"),
    f.media("interior", "Bottom-right image"),
  ],
  defaults: {
    eyebrow: "05 · Personal Blueprint",
    title: "Your Life Deserves More Than Good Intentions.",
    body: "Imagine having one place to return to when decisions become difficult, the calendar gets crowded, or the season changes.\n\nYour Personal Stewardship Blueprint brings together your identity, mission, values, pillars, boundaries, habits, energy, accountability, and living legacy. It helps you remember what matters, protect it, and choose the next step.\n\nIt is a living guide—not a document you finish and put away.",
    primaryCta: { label: "See a Sample Blueprint", href: "/personal-blueprint#sample" },
    secondaryCta: { label: "Explore How to Build Yours", href: "/personal-blueprint" },
    cover: photo("/marketing/stock/writing-notebook.jpg", "A man writing his plans in a notebook", "Photo: Terrillo Walls / Unsplash"),
    northStar: photo("/marketing/stock/family-walk.jpg", "A family walking hand in hand down a sunlit path", "Photo: Seljan Salim / Unsplash"),
    interior: photo("/marketing/stock/journal-desk.jpg", "A closed journal and a pen on a wooden desk", "Photo: Justin Morgan / Unsplash"),
  },
});

// ── 06 Meet Steward ──────────────────────────────────────────────────────────

export type ChatMessage = { id: string; from: string; text: string };
export type ChatProposal = { label: string; text: string; approve: string; edit: string; dismiss: string };
type StewardBand = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  messages: ChatMessage[];
  proposal: ChatProposal;
};

export const chatFields: ContentField[] = [
  f.list(
    "messages",
    "Example conversation",
    [
      { key: "from", label: "Who speaks", kind: "select", options: [{ value: "member", label: "Member" }, { value: "steward", label: "Steward" }] },
      { key: "text", label: "Message", kind: "textarea", required: true, maxLength: 500 },
    ],
    6,
    "Message",
  ),
  {
    key: "proposal",
    label: "Proposal card",
    kind: "group",
    fields: [
      f.text("label", "Label", 40),
      f.textarea("text", "Proposed wording", 300),
      f.text("approve", "Approve button", 40),
      f.text("edit", "Edit button", 20),
      f.text("dismiss", "Dismiss button", 20),
    ],
  },
];

const steward = defineSection<StewardBand>({
  key: "steward",
  label: "06 · Meet Steward",
  fields: [f.eyebrow(), f.title(), f.lead(), f.body(), f.cta("primaryCta", "Primary button"), f.cta("secondaryCta", "Secondary button"), ...chatFields],
  defaults: {
    eyebrow: "06 · Meet Steward",
    title: "Meet Steward, Your Personal Stewardship Guide.",
    lead: "Creating a plan matters. Living it is where change happens.",
    body: "Steward helps you reflect, organize your thinking, develop your Personal Stewardship Blueprint, and revisit it as life unfolds. When priorities compete, decisions feel complicated, or habits start slipping, Steward helps you connect your next choice with the life you are building.\n\nYou remain in control. Steward can suggest and clarify; you decide what belongs in your Blueprint.",
    primaryCta: { label: "Meet Steward", href: "/meet-steward" },
    secondaryCta: { label: "See How It Works", href: "/meet-steward#demo" },
    messages: [
      { id: "m1", from: "member", text: "My work calendar keeps crowding out family. Help me think through what needs to change." },
      {
        id: "m2",
        from: "steward",
        text: "Your Blueprint names “present with Kristi and the kids on weeknights” as a priority. Three late meetings landed there this week. Would a guardrail help — a hard stop at 5:30 on Tuesdays and Thursdays?",
      },
    ],
    proposal: {
      label: "Proposed guardrail",
      text: "“No meetings after 5:30 on Tue/Thu — family dinner is protected.”",
      approve: "Add to my Blueprint",
      edit: "Edit",
      dismiss: "Not now",
    },
  },
});

// ── 07 Grow Together ─────────────────────────────────────────────────────────

type Grow = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; photo: MediaValue; secondPhoto: MediaValue; thirdPhoto: MediaValue };

const grow = defineSection<Grow>({
  key: "grow",
  label: "07 · Grow Together",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    f.media("photo", "Main photo"),
    f.media("secondPhoto", "Second photo"),
    f.media("thirdPhoto", "Third photo"),
  ],
  defaults: {
    eyebrow: "07 · Grow Together",
    title: "Some of the Most Important Growth Happens Together.",
    body: "A good conversation can help you recognize what you could not see alone. Trusted relationships can help you follow through on what you already know matters.\n\nThe Stewardship Blueprint offers six-week studies, group discussions, and church experiences that combine Scripture, reflection, practical action, and encouragement. Whether you’re joining a group or leading one, there is a place to begin.",
    primaryCta: { label: "Explore Studies & Experiences", href: "/studies" },
    secondaryCta: { label: "For Churches & Group Leaders", href: "/churches" },
    photo: photo("/marketing/stock/group-gathering.jpg", "A small group in conversation around a table", "Photo: Small Group Network / Unsplash"),
    secondPhoto: photo("/marketing/stock/bible-reading-friends.jpg", "Two friends reading the Bible together outdoors", "Photo: Meredith Spencer / Unsplash"),
    thirdPhoto: photo("/marketing/stock/friends-coffee.jpg", "Friends talking over coffee", "Photo: Toa Heftiba / Unsplash"),
  },
});

// ── 08 The Book ──────────────────────────────────────────────────────────────

type Book = { eyebrow: string; title: string; subtitle: string; body: string; primaryCta: Cta; secondaryCta: Cta; cover: MediaValue; model: string };

const book = defineSection<Book>({
  key: "book",
  label: "08 · The Book",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "subtitle", label: "Subtitle", kind: "text", maxLength: 160 },
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Waitlist button"),
    f.media("cover", "Book image", "Shown while the 3D book loads, and instead of it where 3D is unavailable."),
    { key: "model", label: "3D book (.glb)", kind: "url", help: "A .glb file; leave empty to show only the image." },
  ],
  defaults: {
    eyebrow: "08 · The Book",
    title: "The Life You’re Building",
    subtitle: "How to Stop Drifting and Design a Life That Matters.",
    body: "A life can look successful from a distance and still feel misaligned up close. Through personal stories, biblical insight, and practical reflection, The Life You’re Building invites you to examine the life taking shape and begin building with greater purpose.\n\nThe goal is not simply to finish another book. It is to live differently because of what you discover.",
    primaryCta: { label: "Explore the Book", href: "/the-life-youre-building" },
    secondaryCta: { label: "Join the Book Waitlist", href: "/book-waitlist" },
    cover: { ...photo("/marketing/brand/the-life-youre-building-book.webp", "The Life You’re Building, by Michael J. Gauthier"), fit: "contain" },
    model: "/marketing/3d/the-life-youre-building.glb",
  },
});

// ── 09 Michael ───────────────────────────────────────────────────────────────

type Michael = { eyebrow: string; title: string; body: string; photo: MediaValue; links: { id: string; label: string; href: string }[] };

const michael = defineSection<Michael>({
  key: "michael",
  label: "09 · Michael",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.media("photo", "Portrait"),
    f.list("links", "Links", [f.text("label", "Label", 60), { key: "href", label: "Link", kind: "url" }], 4, "Link"),
  ],
  defaults: {
    eyebrow: "09 · Michael",
    title: "A Question That Changed How I Look at Life.",
    body: "Early in my career, I was pursuing the markers of success our culture often celebrates. After the birth of our first child, a question began reshaping my priorities: *If everything I am chasing works, will it actually matter?*\n\nThat question led me to think differently about my faith, family, work, health, money, and the purposes God had entrusted to me.\n\nI created the Stewardship Blueprint because I believe meaningful lives are not built accidentally—and I am still learning to live it myself.",
    photo: photo("/marketing/brand/michael-gauthier.webp", "Michael J. Gauthier"),
    links: [
      { id: "story", label: "Read My Story →", href: "/about" },
      { id: "mission", label: "Our Mission →", href: "/mission" },
    ],
  },
});

// ── 10 Stay Connected ────────────────────────────────────────────────────────

type Join = { eyebrow: string; title: string; lead: string; body: string };

const join = defineSection<Join>({
  key: "join",
  label: "10 · Stay Connected",
  fields: [f.eyebrow(), f.title(), f.lead(), f.body()],
  defaults: {
    eyebrow: "10 · Stay Connected",
    title: "Keep Building a Life That Matters.",
    lead: "A meaningful life is built through repeated choices, not one moment of inspiration.",
    body: "Join the Stewardship Blueprint journey for occasional reflections, practical tools, book news, studies, and new opportunities to grow.",
  },
});

export const pageHome = defineScope({
  key: "page:home",
  label: "Homepage",
  path: "/",
  sections: {
    _seo: seoSection({
      title: "Michael J. Gauthier — The Stewardship Blueprint",
      description:
        "A whole-life framework that helps you stop drifting, steward what God has entrusted to you, and build a life that matters. Start with the free Created for More Check-In.",
    }),
    hero,
    awaken,
    framework,
    firstStep,
    engage,
    blueprint,
    steward,
    grow,
    book,
    michael,
    join,
  },
});
