// Animated weather icons (inline SVG + CSS keyframes). Motion stops for people who
// ask for reduced motion. Colours: gold sun, ink-grey clouds, steel rain.

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunder";

/** WMO weather interpretation codes → icon. */
export function weatherKind(code: number | null | undefined): WeatherKind {
  if (code === null || code === undefined) return "cloudy";
  if (code === 0) return "clear";
  if (code <= 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  return "cloudy";
}

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  clear: "Clear",
  partly: "Partly cloudy",
  cloudy: "Cloudy",
  fog: "Fog",
  drizzle: "Drizzle",
  rain: "Rain",
  snow: "Snow",
  thunder: "Thunderstorms",
};

const STYLES = `
.wx-spin{transform-origin:32px 32px;animation:wx-spin 18s linear infinite}
.wx-drift{animation:wx-drift 5s ease-in-out infinite alternate}
.wx-drift2{animation:wx-drift 7s ease-in-out infinite alternate-reverse}
.wx-drop{animation:wx-drop 1.1s linear infinite}
.wx-flake{animation:wx-flake 2.6s linear infinite}
.wx-flash{animation:wx-flash 2.8s ease-in-out infinite}
.wx-fog{animation:wx-drift 4s ease-in-out infinite alternate}
.wx-glow{transform-origin:32px 32px;animation:wx-glow 3.5s ease-in-out infinite}
@keyframes wx-spin{to{transform:rotate(360deg)}}
@keyframes wx-drift{from{transform:translateX(-2.5px)}to{transform:translateX(2.5px)}}
@keyframes wx-drop{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(10px);opacity:0}}
@keyframes wx-flake{0%{transform:translate(0,-4px);opacity:0}30%{opacity:1}100%{transform:translate(2px,11px);opacity:0}}
@keyframes wx-flash{0%,72%,100%{opacity:.25}76%,84%{opacity:1}80%{opacity:.4}}
@keyframes wx-glow{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@media (prefers-reduced-motion:reduce){.wx-spin,.wx-drift,.wx-drift2,.wx-drop,.wx-flake,.wx-flash,.wx-fog,.wx-glow{animation:none}}
`;

const SUN = "#d9a441";
const CLOUD = "currentColor";
const RAIN = "#5b8fb9";

function Sun({ small = false }: { small?: boolean }) {
  const r = small ? 7 : 10;
  const cx = small ? 22 : 32;
  const cy = small ? 22 : 32;
  return (
    <g className="wx-spin" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const r1 = r + 4;
        const r2 = r + (small ? 8 : 11);
        return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={SUN} strokeWidth="3" strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill={SUN} />
    </g>
  );
}

function Moon({ small = false }: { small?: boolean }) {
  const t = small ? "translate(-10 -10)" : undefined;
  // The animation sets `transform`, so the offset lives on an outer group.
  return (
    <g transform={t}>
      <g className="wx-glow">
        <path d="M40 18a14 14 0 1 0 6 26 16 16 0 0 1-6-26z" fill="#c9b37e" />
      </g>
    </g>
  );
}

function Cloud({ y = 0, className = "wx-drift", opacity = 1 }: { y?: number; className?: string; opacity?: number }) {
  return (
    <g className={className} opacity={opacity}>
      <path d={`M18 ${44 + y}h28a9 9 0 0 0 0-18 13 13 0 0 0-25-3A8 8 0 0 0 18 ${44 + y}z`} fill={CLOUD} transform={`translate(0 ${y})`} />
    </g>
  );
}

export function WeatherIcon({ code, isDay = true, className }: { code: number | null | undefined; isDay?: boolean; className?: string }) {
  const kind = weatherKind(code);
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={WEATHER_LABEL[kind]}>
      <style>{STYLES}</style>
      <g className="text-slate-300 dark:text-slate-500">
        {kind === "clear" ? isDay ? <Sun /> : <Moon /> : null}
        {kind === "partly" ? (
          <>
            {isDay ? <Sun small /> : <Moon small />}
            <Cloud y={4} />
          </>
        ) : null}
        {kind === "cloudy" ? (
          <>
            <Cloud y={-6} className="wx-drift2" opacity={0.55} />
            <Cloud y={2} />
          </>
        ) : null}
        {kind === "fog" ? (
          <>
            <Cloud y={-4} />
            {[46, 52, 58].map((y, i) => (
              <line key={y} className="wx-fog" style={{ animationDelay: `${i * 0.6}s` }} x1="14" x2="50" y1={y} y2={y} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            ))}
          </>
        ) : null}
        {kind === "drizzle" || kind === "rain" || kind === "thunder" ? (
          <>
            <Cloud y={-6} />
            {(kind === "drizzle" ? [24, 36] : [20, 30, 40]).map((x, i) => (
              <line key={x} className="wx-drop" style={{ animationDelay: `${i * 0.35}s` }} x1={x} x2={x - 2} y1="44" y2="50" stroke={RAIN} strokeWidth="2.6" strokeLinecap="round" />
            ))}
            {kind === "thunder" ? <path className="wx-flash" d="M34 40l-7 12h6l-3 10 10-14h-6l4-8z" fill={SUN} /> : null}
          </>
        ) : null}
        {kind === "snow" ? (
          <>
            <Cloud y={-6} />
            {[20, 31, 42].map((x, i) => (
              <circle key={x} className="wx-flake" style={{ animationDelay: `${i * 0.7}s` }} cx={x} cy="48" r="2.4" fill="#9fb6c8" />
            ))}
          </>
        ) : null}
      </g>
    </svg>
  );
}
