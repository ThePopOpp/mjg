import StewardshipBlueprint from "@/components/stewardship-blueprint";

export const metadata = {
  title: "The Stewardship Blueprint — Michael J. Gauthier",
  description: "Living by design, not by default.",
};

// Public, full-bleed preview of the MJG brand animation. Lives outside /dashboard
// so it is openly accessible (e.g. as a business-card splash target).
export default function AnimationPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0C0C0C] p-4">
      <div className="w-full max-w-5xl">
        <StewardshipBlueprint theme="dark" autoPlay loop fonts />
      </div>
    </main>
  );
}
