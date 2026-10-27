// The 6-Week Challenge video set — the code fallback for the challenge_videos table (which
// the Media Studio edits). Videos are on Vimeo; a video without a link renders a branded
// "coming soon" placeholder, so every email/library URL already resolves.

export type ChallengeVideo = {
  slug: string;
  order: number;
  badge: string; // e.g. "Week 1", "Invitation", "Closing"
  title: string;
  subtitle: string;
  description: string;
  // Videos are hosted off the VPS and played through our own branded facade so the page
  // never looks like the host. Provide ONE source:
  //   youtubeId — 11-char id from a YouTube watch URL (youtu.be/<ID> or watch?v=<ID>)
  //   vimeo     — put the Vimeo page link (vimeo.com/<id>) in videoUrl; the player embeds it
  //   driveId   — Google Drive file id (drive.google.com/file/d/<ID>/view); file must be
  //               shared "Anyone with the link". Player order of preference: youtube → drive → url.
  youtubeId: string | null;
  driveId?: string | null;
  // Show the host's player directly (no facade poster) so it plays on a single click.
  // Used as a stopgap for Drive (which can't autoplay behind our poster). Reversible.
  embedDirect?: boolean;
  videoUrl: string | null; // optional alternative: a self-hosted mp4/hls URL
  // Code-rendered branded poster (preferred): Mike's photo + this text + a play button,
  // theme-aware. Set both to use it; leave null to fall back to a thumbnail image / panel.
  posterEyebrow?: string | null;
  posterTitle?: string | null;
  thumbnailUrl: string | null; // custom poster image (used in light mode) if no poster text
  thumbnailDark?: string | null; // optional dark-mode poster image
  durationLabel: string | null; // e.g. "11 min"
  // Availability chip shown on the card body: 'available' | 'coming_soon' | 'none'. When unset,
  // it's derived — Available if a video source exists, otherwise Coming Soon.
  availability?: string | null;
};

export const CHALLENGE_VIDEOS: ChallengeVideo[] = [
  {
    slug: "invitation",
    order: 0,
    badge: "Invitation",
    title: "An Invitation",
    subtitle: "What The Life You're Building is — and who it's for.",
    description:
      "What kind of life are you actually building? Michael Gauthier invites you into The Life You’re Building Men’s Challenge, a six-week Stewardship Blueprint experience for men who are ready to stop drifting and start building on purpose. You don’t need a polished story or all the answers. Bring a guide, a pen, and a willingness to be real.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239686215",
    posterEyebrow: null,
    posterTitle: null,
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/invitation.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/invitation.jpg",
    durationLabel: null,
  },
  {
    slug: "homework",
    order: 0.5,
    badge: "Homework",
    title: "Your First Assignment",
    subtitle: "Do the pre-work before Week 1 begins.",
    description:
      "The work between sessions is where real growth begins. Complete your check-in, fill out your guide, share what you're learning with another man, and take the next step by bringing it to your group.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239920175",
    thumbnailUrl: "/6-week-challenge/thumbnails/homework.svg",
    thumbnailDark: "/6-week-challenge/thumbnails/homework.svg",
    durationLabel: null,
  },
  {
    slug: "week-1",
    order: 1,
    badge: "Week 1",
    title: "Wake Up",
    subtitle: "Name your current reality and notice the drift.",
    description:
      "Drift is subtle, and busyness can disguise it. This week, Michael helps you see the structure your life already has and the scoreboard you’ve been playing on. Take the Created for More Check-In, name where you’re drifting, and choose one man to walk with you through the next six weeks.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239685393",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-1.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-1.jpg",
    durationLabel: null,
  },
  {
    slug: "week-2",
    order: 2,
    badge: "Week 2",
    title: "See the Blueprint",
    subtitle: "Clarify bedrock, identity, values, mission, and daily purpose.",
    description:
      "Identity before strategy. This week goes down to your bedrock (faith and identity) and the foundation built on it: your mission, values, life verse, and daily purpose. Bring a rough first draft to your group. A messy, true mission beats a polished one you never live by.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239689416",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-2.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-2.jpg",
    durationLabel: null,
  },
  {
    slug: "week-3",
    order: 3,
    badge: "Week 3",
    title: "Evaluate the Pillars",
    subtitle: "Assess family, fitness, fun, and finances; choose one focus.",
    description:
      "Family, Fitness, Fun, and Finances are the four pillars that carry everyday life. The goal isn’t perfect balance but faithful stewardship. Score each pillar, choose one Focus Pillar for the next 90 days, and give the other three one faithful touch each week. Focus one. Steward all four.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239698700",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-3.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-3.jpg",
    durationLabel: null,
  },
  {
    slug: "week-4",
    order: 4,
    badge: "Week 4",
    title: "Install the Guardrails",
    subtitle: "Build one specific boundary that protects what matters.",
    description:
      "A guardrail is a decision made before the moment of pressure. It protects what you don’t want to lose. This week, draft one specific guardrail for your Focus Pillar, scan the other pillars for danger zones, and tell one trusted man who can ask how it’s going.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239702336",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-4.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-4.jpg",
    durationLabel: null,
  },
  {
    slug: "week-5",
    order: 5,
    badge: "Week 5",
    title: "Strengthen the Structure",
    subtitle: "Choose one keystone rhythm and one renewal rhythm.",
    description:
      "You are shaped less by inspiration than by rhythm. Michael walks through keystone habits and how to steward your physical, emotional, mental, and spiritual energy. Design one habit, protect one rhythm of renewal, and run it for seven days.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239699941",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-5.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-5.jpg",
    durationLabel: null,
  },
  {
    slug: "week-6",
    order: 6,
    badge: "Week 6",
    title: "Design My Life",
    subtitle: "Assemble your Personal Blueprint and retake the Check-In.",
    description:
      "This is where it all comes together. Complete your Personal Blueprint, explore the final layer of legacy, and retake the Check-In to see how far you’ve come. Then commit to a 30-day focus with a four-pillar rhythm and the man who will help you keep it.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: null,
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/week-6.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/week-6.jpg",
    durationLabel: null,
  },
  {
    slug: "closing",
    order: 7,
    badge: "Closing",
    title: "What's Next",
    subtitle: "Keep building — and help another man begin.",
    description:
      "You finished, but a blueprint was never meant to sit in a drawer. Michael shares three next steps: keep the accountability alive, carry the framework into daily life with the ForgedLife app, and invite the next man to walk through the challenge with you. Keep building.",
    youtubeId: null,
    embedDirect: false,
    videoUrl: "https://vimeo.com/1239704415",
    thumbnailUrl: "/6-week-challenge/thumbnails/v2/closing.jpg",
    thumbnailDark: "/6-week-challenge/thumbnails/v2/closing.jpg",
    durationLabel: null,
  },
];

export function getChallengeVideo(slug: string): ChallengeVideo | undefined {
  return CHALLENGE_VIDEOS.find((v) => v.slug === slug);
}

export const CHALLENGE_VIDEOS_BY_ORDER = [...CHALLENGE_VIDEOS].sort((a, b) => a.order - b.order);
