// /contact (contact.dc.html).

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageContact } from "@/lib/marketing/content/scopes/page-contact";
import { ContactExperience } from "../contact-form";
import { Band, Eyebrow, Heading, Prose } from "../primitives";

export async function ContactPage() {
  const { contact } = await getScopeContent(pageContact);

  return (
    <>
      <Band innerClassName="pb-8 md:pb-10">
        <div className="max-w-3xl">
          <Eyebrow pill>{contact.eyebrow}</Eyebrow>
          <Heading title={contact.title} level={1} className="mt-6" />
          <Prose text={contact.body} className="mt-6 text-[17px] leading-8 text-muted-foreground" />
        </div>
      </Band>
      <Band innerClassName="pt-0 md:pt-0">
        <ContactExperience content={contact} />
      </Band>
    </>
  );
}
