import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_KIT } from "@/lib/brand/assets";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Assets"
        title="Brand Kit & Design System"
        description="Logos, colors, fonts, and voice for Michael J. Gauthier. Steward uses these when generating emails and content."
      />

      <Card>
        <CardHeader><CardTitle>Logos</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {BRAND_KIT.logos.map((logo) => (
            <div key={logo.key} className="space-y-2 rounded-lg border p-4">
              <div className={`flex h-24 items-center justify-center rounded-md ${logo.key === "logo_white" ? "bg-neutral-900" : "bg-muted"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.url} alt={logo.label} className="h-10 w-auto object-contain" />
              </div>
              <p className="text-sm font-medium">{logo.label}</p>
              <p className="text-xs text-muted-foreground">{logo.usage}</p>
              <p className="break-all font-mono text-[11px] text-muted-foreground">{logo.url}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(BRAND_KIT.colors).map(([key, color]) => (
            <div key={key} className="space-y-1.5">
              <div className="h-16 w-full rounded-md border" style={{ background: color.hex }} />
              <p className="text-xs font-medium">{color.label}</p>
              <p className="font-mono text-[11px] uppercase text-muted-foreground">{color.hex}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Serif (headings)</p>
              <p className="text-2xl" style={{ fontFamily: BRAND_KIT.fonts.serif }}>Created for More</p>
              <p className="font-mono text-[11px] text-muted-foreground">{BRAND_KIT.fonts.serif}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sans (body / UI)</p>
              <p className="text-lg" style={{ fontFamily: BRAND_KIT.fonts.sans }}>Faithful stewardship, every day.</p>
              <p className="font-mono text-[11px] text-muted-foreground">{BRAND_KIT.fonts.sans}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Brand Voice</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {BRAND_KIT.voice.map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_KIT.colors.gold.hex }} />
                  {v}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
