import { BLUEPRINT_PAGES, FREE_PAGES } from "@/lib/steward/blueprint";
import { Conversation } from "@/components/steward/conversation";
import { PrototypeBanner } from "@/components/steward/prototype-banner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward" };

export default async function ConversationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const context = [...BLUEPRINT_PAGES, ...FREE_PAGES].find((p) => p.slug === page);

  return (
    <>
      <div className="mx-auto w-full max-w-2xl px-6 pt-8">
        <PrototypeBanner />
      </div>
      <Conversation pageContext={context?.title} />
    </>
  );
}
