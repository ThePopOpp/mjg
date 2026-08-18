// The 6-Week Challenge video set. Content is fixed; the actual video + thumbnail URLs are
// filled in once Michael provides the recordings (see the memory note). Until then each page
// renders a branded "coming soon" placeholder, so every email/library URL already resolves.

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
  //   driveId   — Google Drive file id (drive.google.com/file/d/<ID>/view); file must be
  //               shared "Anyone with the link". Player order of preference: youtube → drive → url.
  youtubeId: string | null;
  driveId?: string | null;
  videoUrl: string | null; // optional alternative: a self-hosted mp4/hls URL
  thumbnailUrl: string | null; // custom poster (used in light mode); falls back to a branded placeholder
  thumbnailDark?: string | null; // optional dark-mode poster; swapped in when the site is in dark theme
  durationLabel: string | null; // e.g. "11 min"
};

export const CHALLENGE_VIDEOS: ChallengeVideo[] = [
  {
    slug: "invitation",
    order: 0,
    badge: "Invitation",
    title: "The Invitation",
    subtitle: "What The Life You're Building is — and who it's for.",
    description:
      "A short invitation to the 6-Week Challenge. Share this with any man you're inviting into the group — it makes the ask easy and helps him say yes.",
    youtubeId: null,
    driveId: "19cxy_A-IbP674i9ykbLFhl2RdgBUSRxh",
    videoUrl: null,
    thumbnailUrl: "/6-week-challenge/thumbnails/invitation-light.png",
    thumbnailDark: "/6-week-challenge/thumbnails/invitation-dark.png",
    durationLabel: null,
  },
  {
    slug: "week-1",
    order: 1,
    badge: "Week 1",
    title: "Wake Up",
    subtitle: "Name your current reality and notice the drift.",
    description:
      "Week 1 isn't about shame or a dramatic overhaul — it's about awareness. We slow down and tell the truth about the life we're actually building.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "week-2",
    order: 2,
    badge: "Week 2",
    title: "See the Blueprint",
    subtitle: "Clarify bedrock, identity, values, mission, and daily purpose.",
    description:
      "A blueprint shows where the walls go, but not why the house is being built. Week 2 gets clear on what your life is rooted in and built toward.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "week-3",
    order: 3,
    badge: "Week 3",
    title: "Evaluate the Pillars",
    subtitle: "Assess family, fitness, fun, and finances; choose one focus.",
    description:
      "The four visible pillars carry the weight of everyday life. Week 3 assesses each honestly and chooses the one focus pillar for the next 90 days.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "week-4",
    order: 4,
    badge: "Week 4",
    title: "Install the Guardrails",
    subtitle: "Build one specific boundary that protects what matters.",
    description:
      "A guardrail is a decision made before the moment of pressure — not after regret. Week 4 builds one boundary specific enough to actually keep.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "week-5",
    order: 5,
    badge: "Week 5",
    title: "Strengthen the Structure",
    subtitle: "Choose one keystone habit and one renewal rhythm.",
    description:
      "Change is sustained by rhythm, not intensity. Week 5 focuses on keystone habits and the energy needed to steward what matters without running empty.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "week-6",
    order: 6,
    badge: "Week 6",
    title: "Design My Life",
    subtitle: "Assemble your Personal Blueprint and retake the Check-In.",
    description:
      "Week 6 brings the whole structure together into one Personal Blueprint, retakes the Created for More Check-In, and names the next 30-day commitment.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
  {
    slug: "closing",
    order: 7,
    badge: "Closing",
    title: "What's Next",
    subtitle: "Keep building — and help another man begin.",
    description:
      "A closing word after Week 6: how to keep the Blueprint from sitting in a drawer, protect your 30-day commitment, and multiply what you built.",
    youtubeId: null,
    videoUrl: null,
    thumbnailUrl: null,
    durationLabel: null,
  },
];

export function getChallengeVideo(slug: string): ChallengeVideo | undefined {
  return CHALLENGE_VIDEOS.find((v) => v.slug === slug);
}

export const CHALLENGE_VIDEOS_BY_ORDER = [...CHALLENGE_VIDEOS].sort((a, b) => a.order - b.order);
