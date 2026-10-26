// The areas an agent token can be granted, each as read or write (write
// includes read). People signed in through OAuth get everything ("*").
// Keys are ToolDomain values (lib/tools/types.ts).

export const AGENT_SCOPE_DOMAINS = [
  { key: "content", label: "Marketing page content" },
  { key: "website", label: "Website pages & editor" },
  { key: "blog", label: "Blog" },
  { key: "media", label: "Media & brand" },
  { key: "legal", label: "Legal documents" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "calls", label: "Calls" },
  { key: "social", label: "Social media" },
  { key: "people", label: "Participants & users" },
  { key: "commerce", label: "Orders, refunds, access & coupons" },
  { key: "crm", label: "Contacts, cards, bookings, forms" },
  { key: "ops", label: "Projects & operations" },
  { key: "dev", label: "Dev requests" },
  { key: "data", label: "Read-only database queries" },
  { key: "agent", label: "Agent memory & training docs" },
] as const;

/** Areas never offered to agent tokens: shipping code to the live site stays with people. */
export const PEOPLE_ONLY_DOMAINS = ["deploy"] as const;
