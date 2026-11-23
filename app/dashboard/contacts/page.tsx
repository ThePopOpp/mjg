import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ContactsManager } from "@/components/contacts/contacts-manager";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contacts"
        description="Manage contacts and leads. Import, track, and convert them to participants or dashboard users."
        action={
          <Link href="/dashboard/contacts/leads" className="ml-2 rounded-md border px-2.5 py-1 text-sm font-medium text-primary hover:bg-secondary">
            Lead pipeline →
          </Link>
        }
      />
      <ContactsManager />
    </div>
  );
}
