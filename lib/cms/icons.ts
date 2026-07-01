// CMS icon library — real Solar Icons Set (Community) artwork, the same set as the
// linked Figma file (https://www.figma.com/community/file/1166831539721848736).
// Solar ships genuine per-style vector art (Linear / Bold / Broken / Bold-Duotone),
// so we store the SVG BODIES as a static asset (public/cms/solar-icons.json) that the
// server renderer reads directly and the client editor fetches once. This module is
// CLIENT-SAFE: it holds only lightweight metadata + the SVG wrapper, never the bodies,
// so the editor bundle stays lean. Solar Icons are licensed CC BY 4.0.

export type IconStyle = "line" | "solid" | "broken" | "duotone";

export const ICON_STYLES: { value: IconStyle; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "solid", label: "Solid" },
  { value: "broken", label: "Broken line" },
  { value: "duotone", label: "Duotone" },
];

export type IconMeta = { id: string; label: string };

export const DEFAULT_ICON = "star";

// Body store shape: { [id]: { line, solid, broken, duotone } }.
export type IconBodies = Record<string, Partial<Record<IconStyle, string>>>;

// Public path to the SVG-body asset (server reads via fs, client fetches once).
export const ICON_BODIES_URL = "/cms/solar-icons.json";

// Metadata only — ids + labels. Bodies live in the JSON asset above.
export const CMS_ICONS: IconMeta[] = [
  { id: "heart", label: "Heart" },
  { id: "heart-angle", label: "Heart Angle" },
  { id: "hand-heart", label: "Hand Heart" },
  { id: "hand-stars", label: "Hand Stars" },
  { id: "star", label: "Star" },
  { id: "stars", label: "Stars" },
  { id: "crown", label: "Crown" },
  { id: "crown-star", label: "Crown Star" },
  { id: "cup-star", label: "Trophy" },
  { id: "medal-ribbon-star", label: "Medal Ribbon" },
  { id: "medal-star", label: "Medal Star" },
  { id: "verified-check", label: "Verified Check" },
  { id: "shield-check", label: "Shield Check" },
  { id: "shield-star", label: "Shield Star" },
  { id: "shield", label: "Shield" },
  { id: "diploma", label: "Diploma" },
  { id: "wallet", label: "Wallet" },
  { id: "wallet-money", label: "Wallet Money" },
  { id: "card", label: "Card" },
  { id: "banknote", label: "Banknote" },
  { id: "banknote-2", label: "Banknote 2" },
  { id: "money-bag", label: "Money Bag" },
  { id: "hand-money", label: "Hand Money" },
  { id: "bill-list", label: "Bill List" },
  { id: "bill-check", label: "Bill Check" },
  { id: "safe-2", label: "Safe" },
  { id: "dollar-minimalistic", label: "Dollar" },
  { id: "chart", label: "Chart" },
  { id: "chart-2", label: "Bar Chart" },
  { id: "graph-up", label: "Graph Up" },
  { id: "pie-chart-2", label: "Pie Chart" },
  { id: "course-up", label: "Trending Up" },
  { id: "music-note", label: "Music Note" },
  { id: "music-notes", label: "Music Notes" },
  { id: "microphone", label: "Microphone" },
  { id: "microphone-2", label: "Microphone 2" },
  { id: "headphones-round", label: "Headphones" },
  { id: "headphones-round-sound", label: "Headphones Sound" },
  { id: "play", label: "Play" },
  { id: "play-circle", label: "Play Circle" },
  { id: "pause", label: "Pause" },
  { id: "volume-loud", label: "Volume" },
  { id: "soundwave", label: "Soundwave" },
  { id: "gallery", label: "Gallery" },
  { id: "camera", label: "Camera" },
  { id: "videocamera", label: "Video Camera" },
  { id: "clapperboard-play", label: "Clapperboard" },
  { id: "letter", label: "Mail" },
  { id: "letter-opened", label: "Mail Opened" },
  { id: "inbox", label: "Inbox" },
  { id: "chat-round", label: "Chat" },
  { id: "chat-round-dots", label: "Chat Dots" },
  { id: "chat-line", label: "Chat Line" },
  { id: "dialog", label: "Dialog" },
  { id: "phone", label: "Phone" },
  { id: "phone-calling", label: "Phone Calling" },
  { id: "smartphone", label: "Smartphone" },
  { id: "user", label: "User" },
  { id: "user-circle", label: "User Circle" },
  { id: "user-rounded", label: "User Rounded" },
  { id: "users-group-rounded", label: "People" },
  { id: "users-group-two-rounded", label: "People Group" },
  { id: "user-heart", label: "User Heart" },
  { id: "home", label: "Home" },
  { id: "home-smile", label: "Home Smile" },
  { id: "calendar", label: "Calendar" },
  { id: "calendar-mark", label: "Calendar Mark" },
  { id: "clock-circle", label: "Clock" },
  { id: "alarm", label: "Alarm" },
  { id: "map-point", label: "Location" },
  { id: "map", label: "Map" },
  { id: "global", label: "Globe" },
  { id: "compass", label: "Compass" },
  { id: "gift", label: "Gift" },
  { id: "bell", label: "Bell" },
  { id: "settings", label: "Settings" },
  { id: "bookmark", label: "Bookmark" },
  { id: "book", label: "Book" },
  { id: "book-2", label: "Book 2" },
  { id: "notebook", label: "Notebook" },
  { id: "document-text", label: "Document" },
  { id: "folder", label: "Folder" },
  { id: "magnifer", label: "Search" },
  { id: "pen", label: "Pen" },
  { id: "pen-new-square", label: "Edit" },
  { id: "trash-bin-minimalistic", label: "Trash" },
  { id: "download-minimalistic", label: "Download" },
  { id: "upload-minimalistic", label: "Upload" },
  { id: "share", label: "Share" },
  { id: "link-round", label: "Link" },
  { id: "key", label: "Key" },
  { id: "lock-keyhole", label: "Lock" },
  { id: "sun", label: "Sun" },
  { id: "moon", label: "Moon" },
  { id: "cloud", label: "Cloud" },
  { id: "fire", label: "Fire" },
  { id: "lightbulb", label: "Idea" },
  { id: "lightbulb-bolt", label: "Idea Bolt" },
  { id: "cup", label: "Cup" },
  { id: "rocket", label: "Rocket" },
  { id: "target", label: "Target" },
  { id: "checklist-minimalistic", label: "Checklist" },
  { id: "check-circle", label: "Check Circle" },
  { id: "flag", label: "Flag" },
  { id: "bolt", label: "Bolt" },
  { id: "like", label: "Like" },
  { id: "smile-circle", label: "Smile" },
  { id: "confetti", label: "Confetti" },
  { id: "hand-shake", label: "Handshake" },
  { id: "leaf", label: "Leaf" },
  { id: "water-sun", label: "Sunrise" },
];

// Solar Bold/Duotone bodies use <defs id="…"> + <use href="#…">. When several icons
// share a page, those ids must be unique per instance — salt them (usually the block id).
function uniquifyIds(svg: string, salt: string): string {
  if (!salt || svg.indexOf('id="') < 0) return svg;
  const s = salt.replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = new Set<string>();
  svg.replace(/id="([^"]+)"/g, (m, id: string) => { ids.add(id); return m; });
  let out = svg;
  for (const id of ids) {
    const nid = `${id}-${s}`;
    out = out.split(`id="${id}"`).join(`id="${nid}"`)
      .split(`href="#${id}"`).join(`href="#${nid}"`)
      .split(`url(#${id})`).join(`url(#${nid})`);
  }
  return out;
}

// Wrap a raw Solar body (currentColor-based) into a sized, colored <svg> string.
// Works in the HTML renderer (inlined) and the React canvas (dangerouslySetInnerHTML).
export function wrapIcon(body: string | undefined, opts: { color?: string; size?: number; salt?: string } = {}): string {
  if (!body) return "";
  const color = opts.color || "currentColor";
  const size = opts.size || 28;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="color:${color}" aria-hidden="true" focusable="false">${uniquifyIds(body, opts.salt || "")}</svg>`;
}
