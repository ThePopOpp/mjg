"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  church: string;
  source: string;
  list: string;
  tags: string;
  status: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  profile_photo_url: string;
  sms_opt_in: boolean;
  email_opt_in: boolean;
};

export const BLANK_CONTACT: ContactFormData = {
  first_name: "", last_name: "", email: "", phone: "",
  company: "", website: "", church: "",
  source: "", list: "", tags: "", status: "active",
  address_line_1: "", address_line_2: "", city: "", state: "", zip_code: "",
  notes: "", profile_photo_url: "", sms_opt_in: false, email_opt_in: true,
};

type Props = {
  data: ContactFormData;
  onChange: (patch: Partial<ContactFormData>) => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ContactFormFields({ data, onChange }: Props) {
  const set = (key: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ [key]: e.target.value });

  return (
    <div className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name">
          <Input value={data.first_name} onChange={set("first_name")} placeholder="First" />
        </Field>
        <Field label="Last Name">
          <Input value={data.last_name} onChange={set("last_name")} placeholder="Last" />
        </Field>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <Input type="email" value={data.email} onChange={set("email")} placeholder="email@example.com" />
        </Field>
        <Field label="Phone">
          <Input type="tel" value={data.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <Input value={data.company} onChange={set("company")} placeholder="Company name" />
        </Field>
        <Field label="Church">
          <Input value={data.church} onChange={set("church")} placeholder="Church name" />
        </Field>
      </div>

      <Field label="Website">
        <Input type="url" value={data.website} onChange={set("website")} placeholder="https://example.com" />
      </Field>

      {/* CRM fields */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source">
          <Input value={data.source} onChange={set("source")} placeholder="e.g. Referral, Event" />
        </Field>
        <Field label="List">
          <Input value={data.list} onChange={set("list")} placeholder="e.g. Newsletter" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tags (comma-separated)">
          <Input value={data.tags} onChange={set("tags")} placeholder="tag1, tag2" />
        </Field>
        <Field label="Status">
          <Select value={data.status} onValueChange={(v) => onChange({ status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Address */}
      <Field label="Address Line 1">
        <Input value={data.address_line_1} onChange={set("address_line_1")} placeholder="Street address" />
      </Field>
      <Field label="Address Line 2">
        <Input value={data.address_line_2} onChange={set("address_line_2")} placeholder="Apt, suite, etc." />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="City">
          <Input value={data.city} onChange={set("city")} placeholder="City" />
        </Field>
        <Field label="State">
          <Input value={data.state} onChange={set("state")} placeholder="State" />
        </Field>
        <Field label="Zip Code">
          <Input value={data.zip_code} onChange={set("zip_code")} placeholder="00000" />
        </Field>
      </div>

      {/* Photo URL */}
      <Field label="Profile Photo URL">
        <Input value={data.profile_photo_url} onChange={set("profile_photo_url")} placeholder="https://..." />
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <Textarea value={data.notes} onChange={set("notes")} placeholder="Any notes…" rows={3} />
      </Field>

      {/* Opt-ins */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.email_opt_in} onChange={(e) => onChange({ email_opt_in: e.target.checked })} className="rounded" />
          Email opt-in
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.sms_opt_in} onChange={(e) => onChange({ sms_opt_in: e.target.checked })} className="rounded" />
          SMS opt-in
        </label>
      </div>
    </div>
  );
}
