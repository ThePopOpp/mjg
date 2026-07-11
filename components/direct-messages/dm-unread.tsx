"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type DmUnreadValue = { unread: number; refresh: () => void };

const DmUnreadContext = createContext<DmUnreadValue>({ unread: 0, refresh: () => {} });

/**
 * Single source of truth for the DM unread count — one poll feeds the header
 * bell, the nav badge, and the FAB badge so they never disagree.
 */
export function DmUnreadProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/direct-messages/unread", { cache: "no-store" });
      const data = await res.json();
      setUnread(typeof data.unread === "number" ? data.unread : 0);
    } catch {
      /* leave the last known count on a transient error */
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 20000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return <DmUnreadContext.Provider value={{ unread, refresh }}>{children}</DmUnreadContext.Provider>;
}

export function useDmUnread() {
  return useContext(DmUnreadContext);
}
