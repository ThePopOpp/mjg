// Client-safe defaults for the card builder (no server imports).
import type { BusinessCard, BusinessCardSection, LeadFormSettings, SectionType } from "./types";

export const DEFAULT_LEAD_FORM: LeadFormSettings = {
  enabled: true,
  title: "Send me your info",
  description: "Share your details and I will follow up.",
  button_label: "Send me your info",
  submit_label: "Send info",
  fields: [
    { key: "name", label: "Name", enabled: true, required: true },
    { key: "email", label: "Email", enabled: true, required: true },
    { key: "phone", label: "Phone", enabled: true, required: false },
    { key: "company", label: "Company", enabled: false, required: false },
    { key: "message", label: "Message", enabled: true, required: false },
  ],
};

function uid(): string {
  try { return crypto.randomUUID(); } catch { return `tmp-${Math.random().toString(36).slice(2)}`; }
}

export function makeDefaultSections(): BusinessCardSection[] {
  const base: { type: SectionType; label: string; visible: boolean }[] = [
    { type: "opener", label: "Opener / splash", visible: false },
    { type: "profile_header", label: "Profile header", visible: true },
    { type: "quick_actions", label: "Quick actions", visible: true },
    { type: "slideshow", label: "Slideshow", visible: false },
    { type: "links", label: "Links & socials", visible: true },
    { type: "steps", label: "Steps / how it works", visible: false },
    { type: "lead_capture", label: "Lead capture", visible: true },
    { type: "video", label: "Intro video", visible: false },
    { type: "qr_code", label: "QR code", visible: true },
    { type: "nfc", label: "NFC tap to share", visible: false },
  ];
  return base.map((s, i) => ({
    id: uid(),
    section_type: s.type,
    label: s.label,
    content: {},
    display_order: i + 1,
    is_visible: s.visible,
    margin_top: 0,
    margin_bottom: 16,
    padding_top: 0,
    padding_bottom: 0,
  }));
}

export function makeNewCard(owner?: { display_name?: string; email?: string }): BusinessCard {
  return {
    id: "",
    staff_user_id: null,
    slug: "",
    card_name: owner?.display_name ? `${owner.display_name}'s Card` : "My Business Card",
    status: "draft",
    is_public: false,
    display_name: owner?.display_name ?? "",
    first_name: "",
    last_name: "",
    job_title: "",
    company_name: "Michael J. Gauthier",
    department: "",
    bio: "",
    profile_photo_url: null,
    logo_url: null,
    background_image_url: null,
    background_color: "#1A2E3B",
    accent_color: "#C9A96E",
    text_color: "#F4F1EA",
    card_mode: "standard",
    theme_mode: "dark",
    layout_template: "classic",
    primary_phone: "",
    sms_phone: "",
    primary_email: owner?.email ?? "",
    website_url: "https://michaeljgauthier.com",
    maps_url: "",
    intro_video_url: "",
    qr_settings: { foreground: "#1A2E3B", background: "#ffffff", size: 512 },
    lead_form_settings: DEFAULT_LEAD_FORM,
    media_settings: {},
    slider_pages: [],
    automations: [],
    nfc_status: "not_ordered",
    view_count: 0,
    click_count: 0,
    published_at: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    business_card_links: [],
    business_card_sections: makeDefaultSections(),
  };
}

export const COLOR_PRESETS: { name: string; bg: string; accent: string; text: string }[] = [
  { name: "MJG Teal", bg: "#1A2E3B", accent: "#C9A96E", text: "#F4F1EA" },
  { name: "MJG Ink", bg: "#141414", accent: "#C9A96E", text: "#F4F1EA" },
  { name: "Paper", bg: "#F4F1EA", accent: "#1A2E3B", text: "#141414" },
  { name: "Stewardship Green", bg: "#0f1c14", accent: "#C9A96E", text: "#f5f3ee" },
  { name: "Slate", bg: "#0f172a", accent: "#38bdf8", text: "#e2e8f0" },
];
