"use client";

import { CheckInScaleGuide } from "@/components/check-in/created-for-more-assessment";
import { ReadMoreDialog } from "./read-more";

/**
 * "Learn more" and "Check-In Form 101" under the Check-In title — two dialogs,
 * two equal-width buttons (stacked full-width on phones). Used by the live page
 * and the redesign alike, so they always match.
 */
export function CheckInIntroButtons({
  eyebrow,
  title,
  learnMoreLabel,
  body,
  guideLabel,
  guideTitle,
  guideBody,
}: {
  eyebrow: string;
  title: string;
  learnMoreLabel: string;
  body: string;
  guideLabel: string;
  guideTitle: string;
  guideBody: string;
}) {
  return (
    // Side by side at a fixed, equal width from sm up; stacked full-width on phones.
    <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-60">
      {body ? <ReadMoreDialog trigger="button" label={learnMoreLabel} eyebrow={eyebrow} title={title} body={body} /> : null}
      {guideBody ? (
        <ReadMoreDialog trigger="button" label={guideLabel} eyebrow={eyebrow} title={guideTitle} body={guideBody}>
          <CheckInScaleGuide />
        </ReadMoreDialog>
      ) : null}
    </div>
  );
}
