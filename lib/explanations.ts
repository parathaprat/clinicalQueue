import type { Patient } from "@/data/patients";
import type { ScoreResult } from "@/lib/scoring";

function formatDaysPhrase(days: number): string {
  if (days < 0) return "appointment date has passed";
  if (days === 0) return "appointment is today";
  if (days === 1) return "appointment is tomorrow";
  return `appointment in ${days} days`;
}

/**
 * One short, plain-language sentence for care coordinators.
 * Example: "3 prior no-shows, appointment in 18 days, lives 12 miles away."
 */
export function explainRisk(
  patient: Patient,
  result: ScoreResult
): string {
  const { daysUntilAppointment, tier } = result;

  if (tier === "missed") {
    return `This visit already passed (${patient.apptDate}). No call needed.`;
  }

  const parts: string[] = [];

  if (patient.priorNoShows > 0) {
    parts.push(
      `${patient.priorNoShows} prior no-show${patient.priorNoShows === 1 ? "" : "s"}`
    );
  }

  parts.push(formatDaysPhrase(daysUntilAppointment));

  if (patient.distanceMiles > 0) {
    parts.push(`lives ${patient.distanceMiles} miles away`);
  }

  if (patient.priorAppts === 0) {
    parts.push("no prior visits on file");
  }

  return parts.join(", ") + ".";
}

export function tierLabel(tier: ScoreResult["tier"]): string {
  switch (tier) {
    case "high":
      return "High risk";
    case "medium":
      return "Medium risk";
    case "low":
      return "Low risk";
    case "missed":
      return "Missed date";
  }
}
