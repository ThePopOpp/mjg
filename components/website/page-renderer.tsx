// Frontend Editor — the public page renderer (spec §27).
//
// Maps validated block types onto approved React components. An unknown type
// renders nothing rather than throwing, so a page can never be taken down by a
// block type that was removed from the registry after it was published.

import { isRegisteredBlock } from "@/lib/website/registry";
import type { WebsiteBlock, WebsiteContent } from "@/lib/website/types";
import {
  BlogFeedBlock, BlueprintSectionBlock, BookingCtaBlock, ButtonGroupBlock, CardGridBlock, CtaBlock,
  DividerBlock, EventFeedBlock, FaqBlock, FeatureGridBlock, GalleryBlock, HeroBlock, ImageContentBlock,
  LogoGridBlock, PricingBlock, QuoteBlock, ResourceCardBlock, RichTextBlock, SpacerBlock, StatsBlock,
  SubscriptionCtaBlock, TeamMemberBlock, TestimonialBlock, TimelineBlock, TwoColumnBlock, VideoBlock,
} from "./blocks";
import { ContactFormBlock, NewsletterBlock, TabsBlock } from "./blocks/interactive";

type BlockComponent = (args: { props: Record<string, unknown>; isFirst?: boolean }) => React.ReactNode | Promise<React.ReactNode>;

/**
 * type → component. The keys here must match lib/website/registry.ts; anything
 * registered without a component simply does not render.
 */
const RENDERERS: Record<string, BlockComponent> = {
  hero: HeroBlock,
  richText: RichTextBlock,
  twoColumn: TwoColumnBlock,
  imageContent: ImageContentBlock,
  video: VideoBlock,
  featureGrid: FeatureGridBlock,
  cardGrid: CardGridBlock,
  cta: CtaBlock,
  buttonGroup: ButtonGroupBlock,
  testimonial: TestimonialBlock,
  quote: QuoteBlock,
  faq: FaqBlock,
  tabs: TabsBlock,
  stats: StatsBlock,
  timeline: TimelineBlock,
  teamMember: TeamMemberBlock,
  resourceCard: ResourceCardBlock,
  blueprintSection: BlueprintSectionBlock,
  pricing: PricingBlock,
  subscriptionCta: SubscriptionCtaBlock,
  contactForm: ContactFormBlock,
  bookingCta: BookingCtaBlock,
  newsletter: NewsletterBlock,
  gallery: GalleryBlock,
  logoGrid: LogoGridBlock,
  blogFeed: BlogFeedBlock,
  eventFeed: EventFeedBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
};

export function hasRenderer(type: string): boolean {
  return Boolean(RENDERERS[type]);
}

export function BlockRenderer({ block, isFirst }: { block: WebsiteBlock; isFirst?: boolean }) {
  if (block.hidden) return null;
  if (!isRegisteredBlock(block.type)) return null;
  const Component = RENDERERS[block.type];
  if (!Component) return null;
  return <Component props={block.props ?? {}} isFirst={isFirst} />;
}

export function PageRenderer({ content }: { content: WebsiteContent }) {
  const blocks = (content?.blocks ?? []).filter((b) => !b.hidden);
  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer key={block.id} block={block} isFirst={i === 0} />
      ))}
    </>
  );
}
