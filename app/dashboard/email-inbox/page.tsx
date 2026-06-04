import { redirect } from "next/navigation";

export default function EmailInboxPage() {
  redirect("/dashboard/emails/inbox");
}
