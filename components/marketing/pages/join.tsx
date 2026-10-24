// /join (join.dc.html). The form is the shared JoinJourneyForm, so fields,
// consent, interest chips, and the thank-you all come from global:join-form.

import { getScopeContent } from "@/lib/marketing/content/read";
import { globalJoinForm } from "@/lib/marketing/content/scopes/global";
import { pageJoin } from "@/lib/marketing/content/scopes/page-join";
import { JoinJourneyForm } from "../join-journey-form";
import { Band, CheckList, Eyebrow, Heading, Prose } from "../primitives";

export async function JoinPage() {
  const [{ intro, receive, formCard }, { joinForm }] = await Promise.all([
    getScopeContent(pageJoin),
    getScopeContent(globalJoinForm),
  ]);

  return (
    <Band>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-14">
        <div className="min-w-0">
          <Eyebrow pill>{intro.eyebrow}</Eyebrow>
          <Heading title={intro.title} level={1} className="mt-6" />
          <Prose text={intro.body} className="mt-6 text-[18px] leading-8 text-muted-foreground" />

          <div className="mt-12">
            <Eyebrow>{receive.eyebrow}</Eyebrow>
            <Heading title={receive.title} level={2} className="mt-3" />
            <CheckList items={receive.items.map((i) => i.text)} className="mt-6 [&_span]:text-pretty" />
          </div>
        </div>

        <div className="dark-band min-w-0 self-start rounded-2xl bg-band p-6 text-[#f4f1ea] shadow-lg sm:p-8">
          <Eyebrow>{formCard.eyebrow}</Eyebrow>
          <Heading title={formCard.title} level={2} accent className="mt-3" />
          <JoinJourneyForm content={joinForm} source="join-page" tone="dark" className="mt-6" />
        </div>
      </div>
    </Band>
  );
}
