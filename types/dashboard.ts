import type { AppRole } from "@/lib/rbac/roles";

export type ParticipantType = "general_participant" | "pastor_elder_church_leader";
export type ParticipantStatus = "invited" | "opted_in" | "active" | "completed" | "inactive";

export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  wave: "Wave 0" | "Wave 1" | "Wave 2" | "Wave 3";
  participantType: ParticipantType;
  status: ParticipantStatus;
  checkInStatus: "not_started" | "started" | "completed";
  surveyStatus: "not_sent" | "sent" | "completed";
  innerCircleStatus: "not_invited" | "invited" | "accepted";
  tags: string[];
};

export type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  status: "active" | "invited" | "inactive";
  lastActive?: string;
  createdAt: string;
};
