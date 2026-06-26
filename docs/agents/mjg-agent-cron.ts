export const mjgAgentCronJobs = [
  {
    name: "daily_user_journey_check",
    schedule: "0 8 * * *",
    description: "Checks active users and identifies next actions.",
  },
  {
    name: "invitation_reminder_check",
    schedule: "0 9 * * *",
    description: "Finds invited users who have not accepted.",
  },
  {
    name: "blueprint_reminder_check",
    schedule: "0 10 * * *",
    description: "Finds users with incomplete Blueprints.",
  },
  {
    name: "booking_reminder_check",
    schedule: "0 11 * * *",
    description: "Finds users who completed Blueprint but did not book.",
  },
  {
    name: "weekly_staff_digest",
    schedule: "0 8 * * 1",
    description: "Sends weekly MJG engagement summary.",
  },
];