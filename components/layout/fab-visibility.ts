"use client";

import * as React from "react";

/**
 * Whether the floating quick-actions button (the Review FAB in the bottom-right
 * corner) is shown. Three places read it: the FAB itself, the Settings toggle,
 * and anything that has to keep clear of the FAB's corner — currently the
 * Website Editor's "Ask Steward" pill.
 *
 * Stored in localStorage rather than the database on purpose: it is chrome for
 * one person on one screen, it has to apply on the very first paint with no
 * round trip, and getting it wrong costs nothing. A same-tab CustomEvent plus
 * the cross-tab `storage` event keep every mounted consumer in step.
 */

const KEY = "mjg.fab.visible";
const EVENT = "mjg:fab-visibility";

function read(): boolean {
  try {
    // Default ON — absence of the key means "never touched it".
    return window.localStorage.getItem(KEY) !== "0";
  } catch {
    // Private mode / blocked storage: fall back to showing it.
    return true;
  }
}

/** Set the preference from outside React (rare — prefer the hook's setter). */
export function setFabVisible(next: boolean): void {
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    /* the in-memory broadcast below still works for this session */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export type FabVisibility = {
  /** `null` until the stored preference has been read on the client. */
  visible: boolean | null;
  ready: boolean;
  setVisible: (next: boolean) => void;
};

export function useFabVisible(): FabVisibility {
  // Starts as null so nothing renders in the wrong state on the first paint.
  // A button that appears a frame late is much better than one the user hid
  // flashing back in on every navigation.
  const [visible, setVisible] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setVisible(read());

    const onBroadcast = (event: Event) => setVisible((event as CustomEvent<boolean>).detail);
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) setVisible(read());
    };

    window.addEventListener(EVENT, onBroadcast);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onBroadcast);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = React.useCallback((next: boolean) => {
    setVisible(next);
    setFabVisible(next);
  }, []);

  return { visible, ready: visible !== null, setVisible: set };
}
