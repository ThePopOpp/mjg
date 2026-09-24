"use client";

import * as React from "react";

/**
 * Browser dictation for the Frontend Editor, on top of the Web Speech API — the
 * same engine the Steward chat mic uses.
 *
 * Differences from the chat mic, because this one feeds a long description
 * rather than a one-shot message: it stays listening until it is stopped, and it
 * APPENDS each finished phrase to whatever is already written instead of
 * replacing it, so Mike can dictate a paragraph, pause, type a correction, and
 * carry on.
 *
 * Support is patchy (Chrome and Edge yes, Firefox no), so `supported` is exposed
 * and the caller hides the button rather than showing one that does nothing.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionLike = any;

export type Dictation = {
  supported: boolean;
  listening: boolean;
  /** Words recognised but not yet finalised — render them greyed out. */
  interim: string;
  error: string | null;
  toggle: () => void;
  stop: () => void;
};

export function useDictation(onPhrase: (text: string) => void): Dictation {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [interim, setInterim] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike>(null);

  // Keep the newest callback without restarting recognition on every keystroke.
  const onPhraseRef = React.useRef(onPhrase);
  React.useEffect(() => { onPhraseRef.current = onPhrase; }, [onPhrase]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    };
  }, []);

  const stop = React.useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
    setInterim("");
  }, []);

  const toggle = React.useCallback(() => {
    if (listening) { stop(); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setError("This browser cannot do voice input. Chrome or Edge can."); return; }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event: SpeechRecognitionLike) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) onPhraseRef.current(String(result[0].transcript).trim());
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    rec.onerror = (event: SpeechRecognitionLike) => {
      const code = String(event?.error ?? "");
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone access was blocked. Allow it in your browser, then try again."
          : code === "no-speech"
            ? "I didn't catch anything — try again."
            : "Voice input stopped unexpectedly.",
      );
      setListening(false);
      setInterim("");
    };
    rec.onend = () => { setListening(false); setInterim(""); };

    recognitionRef.current = rec;
    setError(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      // start() throws if it is already running; treat that as "already on".
      setListening(true);
    }
  }, [listening, stop]);

  return { supported, listening, interim, error, toggle, stop };
}
