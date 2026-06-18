import { SectionHeader } from "@/components/dashboard/section-header";
import { ContactsManager } from "@/components/contacts/contacts-manager";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contacts"
        description="Manage contacts and leads. Import, track, and convert them to participants or dashboard users."
      />
      <ContactsManager />
    </div>
  );
}
