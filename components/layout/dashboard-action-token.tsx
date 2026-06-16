"use client";

import { createContext, useContext } from "react";

const DashboardActionTokenContext = createContext("");

export function DashboardActionTokenProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) {
  return <DashboardActionTokenContext.Provider value={token}>{children}</DashboardActionTokenContext.Provider>;
}

export function useDashboardActionToken() {
  return useContext(DashboardActionTokenContext);
}
