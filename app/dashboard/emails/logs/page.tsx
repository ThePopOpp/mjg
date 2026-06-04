import { redirect } from "next/navigation";

export default async function EmailLogsPage() {
  redirect("/dashboard/emails/history");
}
