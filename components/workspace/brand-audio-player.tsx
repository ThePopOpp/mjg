"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, SkipBack, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const GOLD = "hsl(var(--primary))";

/** Branded, theme-aware audio player. The control pill inverts with the theme (dark on
 * light, light on dark) and uses the MJG gold accent throughout. */
export function BrandAudioPlayer({ src }: { src?: string | null }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime);
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); };
  }, [src]);

  function toggle() { const a = audio.current; if (!a) return; if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); } }
  function skip(delta: number) { const a = audio.current; if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta)); }
  function restart() { const a = audio.current; if (a) { a.currentTime = 0; setCur(0); } }
  function seek(v: number) { const a = audio.current; if (a) { a.currentTime = v; setCur(v); } }
  function setVolume(v: number) { const a = audio.current; if (a) { a.volume = v; setVol(v); } }
  function cycleRate() { const next = rate >= 2 ? 1 : rate === 1 ? 1.5 : 2; setRate(next); if (audio.current) audio.current.playbackRate = next; }

  const IconBtn = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full text-background/80 transition-colors hover:bg-background/10 hover:text-background">{children}</button>
  );

  return (
    <div className="not-prose w-full select-none rounded-2xl border bg-card p-3">
      <audio ref={audio} src={src ?? undefined} preload="metadata" />

      {/* progress */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">{fmt(cur)}</span>
        <input type="range" min={0} max={dur || 0} step={0.1} value={cur} onChange={(e) => seek(Number(e.target.value))} className="h-1.5 w-full cursor-pointer" style={{ accentColor: GOLD }} />
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{fmt(dur)}</span>
      </div>

      {/* control pill (inverts with theme) */}
      <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-foreground px-3 py-1.5">
        <IconBtn onClick={restart} label="Restart"><SkipBack className="h-4 w-4" /></IconBtn>
        <IconBtn onClick={() => skip(-10)} label="Back 10 seconds"><span className="relative flex items-center"><RotateCcw className="h-5 w-5" /><span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">10</span></span></IconBtn>
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform hover:scale-105">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>
        <IconBtn onClick={() => skip(10)} label="Forward 10 seconds"><span className="relative flex items-center"><RotateCw className="h-5 w-5" /><span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">10</span></span></IconBtn>
        <button type="button" onClick={cycleRate} aria-label="Playback speed" className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold text-background/80 transition-colors hover:bg-background/10 hover:text-background">{rate}x</button>
      </div>

      {/* volume */}
      <div className="mt-3 flex items-center justify-end gap-2 px-1">
        <button type="button" onClick={() => setVolume(vol > 0 ? 0 : 1)} aria-label="Mute" className="text-muted-foreground hover:text-foreground">{vol > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
        <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVolume(Number(e.target.value))} className={cn("h-1 w-24 cursor-pointer")} style={{ accentColor: GOLD }} />
      </div>
    </div>
  );
}
