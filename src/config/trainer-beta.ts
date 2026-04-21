/**
 * Frontend beta-gate for the trainer feature.
 *
 * This is a UX convenience — the authoritative gate is the server-side
 * TRAINER_BETA_USER_IDS env var in server/.env. This frontend list
 * controls button visibility and prevents casual devtools access.
 * It does NOT replace server-side auth.
 */
export const TRAINER_BETA_USER_IDS: ReadonlySet<string> = new Set([
  "116309596734842366110",
]);

export const isTrainerBetaUser = (userId: string | undefined | null): boolean =>
  typeof userId === "string" && TRAINER_BETA_USER_IDS.has(userId);
