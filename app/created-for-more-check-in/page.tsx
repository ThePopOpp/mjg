import type { Metadata } from "next";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { CreatedForMoreAssessment } from "@/components/check-in/created-for-more-assessment";

export const metadata: Metadata = {
  title: "Created for More Check-In | A Stewardship Blueprint Assessment",
  description: "A 15-minute check-in on the life you're actually building. See where you're aligned, where you may be drifting, and what deserves your attention next.",
};

export default function CreatedForMoreCheckInPage() {
  return (
    <PilotShell
      heroVariant="centered"
      eyebrow="A Stewardship Blueprint Assessment"
      title="Created for More Check-In"
      description="A 15-minute check-in on the life you're actually building."
    >
      {/* Intro copy */}
      <div className="mx-auto mb-8 max-w-3xl space-y-4 text-[15px] leading-7 text-muted-foreground">
        <p>You were created for more than simply getting through the week, meeting expectations, and checking off the next task. But even when we know what matters most, it is remarkably easy for life to drift.</p>
        <p>The Created for More Check-In is a 28-question whole-life reflection tool designed to help you slow down long enough to see where your life is aligned with what matters most, where you may be drifting, and what deserves your attention next.</p>
        <p>It is built around <strong className="text-foreground">The Stewardship Blueprint</strong> — a framework for intentionally building a life around what God has entrusted to you and what He has called you toward.</p>
        <p>And when we talk about stewardship, we mean much more than money.</p>
        <p>We are called to steward our faith, our relationships, our bodies, our time, our abilities, our resources, our energy, our influence, and ultimately the legacy our lives are creating.</p>

        <p className="border-l-2 border-primary pl-4 text-lg font-semibold text-foreground">The goal isn&rsquo;t a perfect score. It&rsquo;s greater awareness.</p>

        <p>This isn&rsquo;t a pass/fail test, and it isn&rsquo;t about comparing your life to someone else&rsquo;s. Think of it as a mirror and a map. A mirror helps you honestly see where you are today. A map helps you determine where you want to go next.</p>
        <p>Your answers will help you look across seven interconnected areas of your life — from your faith and identity at the bedrock to the legacy your life is ultimately producing.</p>
      </div>

      <CreatedForMoreAssessment />
    </PilotShell>
  );
}
