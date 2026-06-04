export const PARTICIPANT_STATUSES = {
  checkIn: ["not_started", "started", "completed"],
  journey: ["not_started", "started", "completed", "paused"],
  survey: ["not_sent", "sent", "completed"],
  innerCircle: ["not_invited", "invited", "accepted", "declined"],
} as const;
