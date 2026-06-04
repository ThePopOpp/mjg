import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const guides = [
  {
    title: "1. Create an email template",
    steps: [
      "Open the Templates tab.",
      "Add a template name, category, subject, preheader, and HTML body.",
      "Use dynamic fields like {{first_name}}, {{email}}, {{invite_url}}, and {{site_url}} when the message should personalize itself.",
      "Use Preview to inspect the rendered email before saving.",
      "Save as Draft while building, then switch to Active when it is ready to send.",
    ],
  },
  {
    title: "2. Preview and test safely",
    steps: [
      "Use the Preview button inside the template editor to review the HTML layout.",
      "Use Deploy Email in test mode to send the template to yourself first.",
      "Audience sending remains locked until a test email succeeds for the selected template.",
      "Check the History tab after testing to confirm sent, skipped, or failed results.",
    ],
  },
  {
    title: "3. Connect templates to Email Automations",
    steps: [
      "Open the Email Automations tab.",
      "Choose an event such as User invitation, Check-In completed, Survey invite, Inner Circle invite, or a 7-day journey step.",
      "Select the template that should power that event.",
      "Leave an automation disabled while a template is still being drafted.",
      "Save the mapping. The system will use that template when the event is triggered.",
    ],
  },
  {
    title: "4. Send to an audience",
    steps: [
      "Open the Templates tab and choose a template in Deploy Email.",
      "Send a test email first.",
      "Switch mode to Deploy to audience.",
      "Choose Active dashboard users or Participants.",
      "Review the recipient count and limit, then confirm before sending.",
    ],
  },
  {
    title: "5. Send the 7-day journey",
    steps: [
      "Make sure each journey step has a mapped active template in Email Automations.",
      "Participants must opt in to the 7-day journey through the Check-In form.",
      "Open the Journey tab.",
      "Use Send due journey emails with a small limit during Wave 0 testing.",
      "Review skipped or failed events in the Journey table and History.",
    ],
  },
  {
    title: "6. Sync and review inbox messages",
    steps: [
      "Open the Inbox tab.",
      "Use Sync inbox to pull recent IMAP messages into Supabase.",
      "Messages are matched to participants or dashboard users by email when possible.",
      "Use this area to review replies, follow-up needs, and future CRM-style communication history.",
    ],
  },
  {
    title: "7. Read email history",
    steps: [
      "Open the History tab.",
      "Review recipient, template, subject, status, and send time.",
      "Use failed or skipped rows to troubleshoot SMTP settings, missing automations, or unfinished templates.",
      "Keep logs as the audit trail for user invitations, pilot emails, and manual audience sends.",
    ],
  },
];

export default function EmailWizardPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="A step-by-step guide for templates, automations, sending, inbox sync, and logs." />
      <EmailTabs active="wizard" />

      <Card>
        <CardHeader>
          <CardTitle>Email Wizard</CardTitle>
          <CardDescription>Use this as the operating map for the email system. Start at the top if you are new.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {guides.map((guide, index) => (
            <Accordion key={guide.title} type="single" collapsible defaultValue={index === 0 ? guide.title : undefined}>
              <AccordionItem value={guide.title} className="rounded-md border bg-background px-4">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">{guide.title}</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    {guide.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
