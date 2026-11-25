"use client";

import { createContext, useContext } from "react";
import type { AppRole } from "@/lib/rbac/roles";
import type { OverviewLayout } from "@/lib/dashboard/overview/layout";

export type OverviewProfile = { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };

export type OverviewApi = {
  role: AppRole;
  profile: OverviewProfile;
  layout: OverviewLayout;
  editing: boolean;
  setCardSettings: (uid: string, settings: Record<string, unknown>) => void;
  setLayoutField: <K extends "statRange" | "location" | "density">(key: K, value: OverviewLayout[K]) => void;
  hideCard: (uid: string) => void;
  openAddCard: () => void;
  openFeatures: () => void;
  openSearch: (query?: string) => void;
  startCustomize: () => void;
  openWizard: () => void;
};

export const OverviewContext = createContext<OverviewApi | null>(null);

export function useOverview(): OverviewApi {
  const ctx = useContext(OverviewContext);
  if (!ctx) throw new Error("useOverview must be used inside the Overview board.");
  return ctx;
}
