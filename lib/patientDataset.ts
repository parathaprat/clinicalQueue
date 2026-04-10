import type { Patient } from "@/data/patients";
import { patients as seedPatients } from "@/data/patients";

/** Immutable copy of bundled demo data — baseline for reset and SSR. */
export function getSeedPatients(): Patient[] {
  return seedPatients.map((p) => ({ ...p }));
}

/**
 * @deprecated Prefer `getSeedPatients()` for clarity. Same as seed export.
 */
export function loadPatientDataset(): Patient[] {
  return getSeedPatients();
}
