/** Default daily outreach target (coordinators adjust to their shift). Not a system cap on data. */
export const DEFAULT_SHIFT_GOAL_CONTACTS = 40;

export const MIN_SHIFT_GOAL_CONTACTS = 5;
export const MAX_SHIFT_GOAL_CONTACTS = 200;

export const STORAGE_KEY_CONTACTED = "clinicalq-no-show-contacted-ids";
export const STORAGE_KEY_SHIFT_GOAL = "clinicalq-no-show-shift-goal";
/** Persisted roster JSON (browser localStorage; quota applies). */
export const STORAGE_KEY_ROSTER = "clinicalq-no-show-roster";
