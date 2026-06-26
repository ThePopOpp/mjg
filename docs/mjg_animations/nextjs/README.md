# Stewardship Blueprint — Next.js integration

A self-contained, dependency-free animated brand component (20s loop, 16:9, responsive).

## Install
Copy `StewardshipBlueprint.tsx` into your app, e.g. `components/StewardshipBlueprint.tsx`.
No npm packages required — just React 18+.

## Use
```tsx
import StewardshipBlueprint from "@/components/StewardshipBlueprint";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl">
      <StewardshipBlueprint />            {/* dark by default */}
    </div>
  );
}
```

## Props
| prop       | type                | default | notes |
|------------|---------------------|---------|-------|
| `theme`    | `"dark" \| "light"` | `dark`  | dark resolves your shadcn CSS vars |
| `autoPlay` | `boolean`           | `true`  | |
| `loop`     | `boolean`           | `true`  | |
| `controls` | `boolean`           | `false` | shows a shadcn-style scrub/play bar |
| `fonts`    | `boolean`           | `true`  | auto-injects Playfair Display + Manrope from Google Fonts |
| `duration` | `number`            | `20`    | seconds |
| `className`/`style` | —          | —       | forwarded to the card wrapper |

## Theming (shadcn)
In `theme="dark"` the component reads your tokens and falls back if absent:
`--background`, `--foreground`, `--muted-foreground`, `--border`, and `--gold` (accent).
Set `--gold` on a parent to recolor the accent:
```css
.brand-gold { --gold: #CBA75E; }
```

## Fonts (optional, recommended)
The component injects the fonts itself. To self-host instead, set `fonts={false}` and
add Playfair Display (serif headlines) + Manrope (wordmark/labels) via `next/font`.

## Notes
- The file carries `// @ts-nocheck` so it compiles in strict TS projects untouched. Remove it if you want to add types.
- Rendered with absolutely-positioned divs + SVG scaled to the container — crisp at any width.
