"use client";

import { Download } from "lucide-react";
import { trackEvent } from "@/components/analytics/site-analytics";

/** The thank-you page's download. Counts a click (not a read) and leaves the URL free of personal data. */
export function DownloadGuideButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      onClick={() => trackEvent("retreat_download")}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c9aa70] px-7 py-4 text-[17px] font-semibold text-[#10110f] shadow-sm transition hover:bg-[#b9975a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10110f] focus-visible:ring-offset-2 dark:focus-visible:ring-[#e2ca9a] dark:focus-visible:ring-offset-[#10110f]"
    >
      <Download className="h-5 w-5" aria-hidden />
      {label}
    </a>
  );
}
