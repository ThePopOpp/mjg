import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PilotShell } from "@/components/pilot/pilot-shell";

export default function CreatedForMorePilotPage() {
  return (
    <PilotShell
      eyebrow="Private pilot"
      title="Help Me Test a 7-Day Journey to Stop Drifting and Build a Life That Matters"
      description="I am writing a book called The Life You're Building and building a larger framework called The Stewardship Blueprint. Before I take it further, I am inviting a small group of people I trust to help me test a 7-day reflection journey called Created for More."
      cta={{ href: "/check-in?source=direct_text", label: "Start the Created for More Check-In" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>A personal note from Michael</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-7 text-muted-foreground">
            <p>For nearly 20 years, I have carried a dream and prayer to encourage and inspire people to use their God-given resources - their time, talents, and treasure - for God-given purposes: the people and causes God has placed on their hearts.</p>
            <p>This is not a sales pitch. I am not asking you to buy anything. I am asking you to walk through a short 7-day journey, take the Created for More Check-In, and give me honest feedback so I can make the book and future resources as helpful and transformational as possible.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>How the pilot works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>1. Complete the Created for More Check-In.</p>
            <p>2. Record your score and lowest area.</p>
            <p>3. Receive one short email each day for 7 days.</p>
            <p>4. Choose one faithful next step.</p>
            <p>5. Complete a short survey at the end.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4 text-sm leading-6 text-muted-foreground">
          By joining this pilot, you agree to receive the Created for More 7-Day Stewardship Pilot emails. Your feedback may be used anonymously to improve the book and future resources. Michael will not use your name, quote, story, or personal details publicly without separate permission.
        </CardContent>
      </Card>
    </PilotShell>
  );
}
