"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Saves an assessment's results to the member's account the moment they're shown,
// so Steward can see them without the member pressing "Send my results".
//
//   const autosave = useAssessmentAutosave({ assessment: "energy-audit", label: "Energy Audit", signedIn, answers, ready: showingResults });
//
// `ready` is true while the results are showing. One sitting is one attempt (one row):
// going back to change an answer and returning updates it. Call newAttempt() when a
// fresh sitting begins (a retake). Forms that resume progress after a refresh pass
// persistAttempt so the resumed sitting keeps its row. Signed in → POST /api/assessments/[key]/save, debounced,
// one row per attempt. Signed out → the results wait in this browser
// (PendingAssessmentClaimer attaches them after sign-in) and the save-results modal opens.

const PENDING_KEY = "mjg-pending-assessments";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type PendingAssessment = {
  assessment: string;
  label: string;
  answers: Record<string, number>;
  attemptId: string;
  savedAt: number;
};

export function readPending(): PendingAssessment[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p: PendingAssessment) => p && p.attemptId && p.answers && Date.now() - p.savedAt < MAX_AGE_MS);
  } catch {
    return [];
  }
}

function writePending(list: PendingAssessment[]) {
  try {
    if (list.length) window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable (private mode, blocked) — results just can't wait for sign-in */
  }
}

/** Keep one waiting result per assessment: the latest attempt replaces an older one. */
function stashPending(entry: PendingAssessment) {
  writePending([...readPending().filter((p) => p.assessment !== entry.assessment), entry]);
}

export function removePending(attemptId: string) {
  writePending(readPending().filter((p) => p.attemptId !== attemptId));
}

const attemptStorageKey = (assessment: string) => `mjg-assessment-attempt:${assessment}`;

function storedAttempt(assessment: string): string | null {
  try {
    return window.localStorage.getItem(attemptStorageKey(assessment));
  } catch {
    return null;
  }
}

function storeAttempt(assessment: string, attemptId: string | null) {
  try {
    if (attemptId) window.localStorage.setItem(attemptStorageKey(assessment), attemptId);
    else window.localStorage.removeItem(attemptStorageKey(assessment));
  } catch {
    /* storage unavailable — a refresh just starts a new attempt */
  }
}

function newAttemptId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export async function postAssessment(assessment: string, answers: Record<string, number>, attemptId: string) {
  const res = await fetch(`/api/assessments/${encodeURIComponent(assessment)}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, attemptId }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, id: typeof data.id === "string" ? (data.id as string) : null };
}

export type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "needs-account";

export function useAssessmentAutosave({
  assessment,
  label,
  signedIn,
  answers,
  ready,
  persistAttempt = false,
}: {
  assessment: string;
  label: string;
  signedIn: boolean;
  answers: Record<string, number>;
  ready: boolean;
  /** Keep the attempt id across page loads (for forms that resume after a refresh). */
  persistAttempt?: boolean;
}) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const attemptRef = useRef<string | null>(null);
  const promptedRef = useRef<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const key = JSON.stringify(answers);
  const empty = Object.keys(answers).length === 0;

  useEffect(() => {
    if (!ready || empty) return;
    if (!attemptRef.current) {
      attemptRef.current = (persistAttempt && storedAttempt(assessment)) || newAttemptId();
      if (persistAttempt) storeAttempt(assessment, attemptRef.current);
    }
    const attemptId = attemptRef.current;

    const holdForSignIn = () => {
      stashPending({ assessment, label, answers, attemptId, savedAt: Date.now() });
      setStatus("needs-account");
      if (promptedRef.current !== attemptId) {
        promptedRef.current = attemptId;
        setModalOpen(true);
      }
    };

    if (!signedIn) {
      holdForSignIn();
      return;
    }

    let cancelled = false;
    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const res = await postAssessment(assessment, answers, attemptId);
        if (cancelled) return;
        if (res.status === 401) return holdForSignIn(); // session ended since the page loaded
        if (res.status >= 400 || !res.id) return setStatus("error");
        setSubmissionId(res.id);
        setStatus("saved");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `key` stands in for `answers` (a new object each render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready, signedIn, assessment, label, persistAttempt, retryTick]);

  const retry = useCallback(() => setRetryTick((n) => n + 1), []);

  /** A fresh sitting: the next results save as a new row. */
  const newAttempt = useCallback(() => {
    attemptRef.current = null;
    storeAttempt(assessment, null);
    setStatus("idle");
    setSubmissionId(null);
  }, [assessment]);

  return { status, submissionId, modalOpen, setModalOpen, retry, newAttempt };
}
