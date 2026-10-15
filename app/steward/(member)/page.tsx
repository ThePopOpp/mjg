import { BLUEPRINT_PAGES, EXAMPLE_BLUEPRINT, FREE_PAGES } from "@/lib/steward/blueprint";
import { Conversation } from "@/components/steward/conversation";
import { PrototypeBanner } from "@/components/steward/prototype-banner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward" };

// Steward is where a member lands.
//
// Owner decision: the conversation is the front door, with the Blueprint reached
// either by asking Steward or by the nav link. The committed next step still
// sits above the conversation, so opening the app shows what you already decided
// rather than only an invitation to talk more.

export default async function StewardLanding({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const context = [...BLUEPRINT_PAGES, ...FREE_PAGES].find((p) => p.slug === page);
  const nextStep = EXAMPLE_BLUEPRINT["starting-plan"]?.entries?.[0]?.value;

  return (
    <>
      <div className="mx-auto w-full max-w-2xl px-5 pt-8">
        <PrototypeBanner />
      </div>
      <Conversation
        nextStep={nextStep}
        pageContext={context ? { title: context.title, href: `/steward/blueprint/${context.slug}` } : undefined}
      />
    </>
  );
}
