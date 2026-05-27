import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PilotShell } from "@/components/pilot/pilot-shell";

export default function PastorReviewPage() {
  return (
    <PilotShell
      eyebrow="Pastor / Elder review"
      title="Would You Help Me Evaluate a 7-Day Stewardship Journey for Biblical, Pastoral, and Church Usefulness?"
      description="I am asking a few pastors, elders, and church leaders I trust to walk through the 7-day pilot and give honest feedback. I am not asking you to promote this. I am asking you to help me discern it."
      cta={{ href: "/check-in?source=pastor_elder&type=pastor_elder", label: "Begin the Pastor / Elder Review" }}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What I am asking you to evaluate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>Does this feel biblically grounded?</p>
            <p>Does the tone feel pastorally helpful?</p>
            <p>Is it convicting without being condemning?</p>
            <p>Could this serve people in a church environment?</p>
            <p>What would need to be clarified, strengthened, or changed?</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>How the process works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>Complete the Created for More Check-In.</p>
            <p>Receive one short email each day for 7 days.</p>
            <p>Consider the content personally and pastorally.</p>
            <p>Complete a pastor / elder feedback survey at the end.</p>
            <p>Let Michael know whether you are open to a follow-up conversation.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4 text-sm leading-6 text-muted-foreground">
          Your feedback will be used to help strengthen the book and future resources. Michael will not quote you, name you, reference your church, or use your feedback publicly without separate permission.
        </CardContent>
      </Card>
    </PilotShell>
  );
}
