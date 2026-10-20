import { BLUEPRINT_PAGES, EXAMPLE_BLUEPRINT, FREE_PAGES } from "@/lib/steward/blueprint";
import { getStewardConfigOrNull } from "@/lib/steward/config";
import { Conversation } from "@/components/steward/conversation";
import { LiveConversation } from "@/components/steward/live-conversation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward" };

// Steward is where a member lands.
//
// Two versions live here, and which one a member gets is a Super Admin switch
// rather than a deploy:
//
//   agent.live_conversation = false  the scripted design prototype
//   agent.live_conversation = true   the real agent
//
// The switch exists because turning this on sends what a member writes to an AI
// provider, and the docset requires a provider-fit review before that. It is
// also the fastest way to turn it OFF if something is wrong in front of real
// people — faster than a redeploy, which is the point.

export default async function StewardLanding({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const live = (await getStewardConfigOrNull("agent.live_conversation").catch(() => null)) === true;
  if (live) return <LiveConversation />;

  const { page } = await searchParams;
  const context = [...BLUEPRINT_PAGES, ...FREE_PAGES].find((p) => p.slug === page);
  const nextStep = EXAMPLE_BLUEPRINT["starting-plan"]?.entries?.[0]?.value;

  return (
    <Conversation
      nextStep={nextStep}
      pageContext={context ? { title: context.title, href: `/steward/blueprint/${context.slug}` } : undefined}
    />
  );
}
