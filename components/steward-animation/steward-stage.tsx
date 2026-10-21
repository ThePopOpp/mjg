"use client";

import * as React from "react";
import nextDynamic from "next/dynamic";
import { STAGE, type SceneLayout } from "./steward-script";
import type { StewardSceneProps } from "./steward-scene";

// Fits the fixed-size composition into whatever box it is given.
//
// The scene is authored at exactly 1920x1080 (desktop) or 1080x1920 (phone) and
// nothing inside it is responsive — the camera aims at measured pixel positions,
// so the stage has to stay those dimensions and be scaled as a unit. That is
// also why this is a transform rather than a flexible layout: at any other size
// the camera would frame the wrong things.
//
// `fit` decides what happens when the box is not the stage's shape:
//
//   cover    fill the box and crop the overhang. Right for a full-bleed hero,
//            where bars down the sides would look like a video player.
//   contain  shrink until the whole composition is visible. Right whenever the
//            composition is the thing being read — a crop takes live text off
//            the edges, and the conversation runs close to them. Any spare room
//            is the stage's own background colour, so it does not read as
//            letterboxing.
//
// This is also the lazy boundary. three.js is around 150 kB and the hero's
// words should not wait behind it, so the scene is loaded here rather than
// imported by a page — which is why STAGE lives in steward-script.ts, the one
// module both sides can import without dragging three.js along.
const Scene = nextDynamic(() => import("./steward-scene").then((m) => m.StewardScene), {
  ssr: false,
});

type Props = Omit<StewardSceneProps, "layout"> & {
  /** Omit to pick from the container's shape. */
  layout?: SceneLayout;
  /** How to handle a box that is not the stage's shape. Defaults to "cover". */
  fit?: "cover" | "contain";
  className?: string;
};

export function StewardStage({ layout, fit = "cover", className, ...scene }: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const read = () => setBox({ w: host.clientWidth, h: host.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Portrait-ish boxes get the phone composition. Decided on the container
  // rather than the viewport, so the same stage behaves correctly in a hero, in
  // a card, or side by side with something else.
  const auto: SceneLayout = box && box.h > box.w * 1.05 ? "mobile" : "desktop";
  const pick = layout ?? auto;
  const { w: SW, h: SH } = STAGE[pick];
  const scale = box
    ? fit === "contain"
      ? Math.min(box.w / SW, box.h / SH)
      : Math.max(box.w / SW, box.h / SH)
    : 0;

  return (
    <div ref={hostRef} className={className} style={{ position: "relative", overflow: "hidden" }}>
      {/* Rendered only once the box is known. A first frame at the wrong scale
          is a visible jump, and the scene's own first frame already has to wait
          a tick for its camera targets to mount. */}
      {box ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: SW,
            height: SH,
            marginLeft: -SW / 2,
            marginTop: -SH / 2,
            transform: `scale(${scale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <Scene {...scene} layout={pick} />
        </div>
      ) : null}
    </div>
  );
}

export default StewardStage;
