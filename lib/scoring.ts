import type { Patient } from "@/data/patients";

export type RiskTier = "high" | "medium" | "low" | "missed";

export type ScoreReason =
  | "past_appointment"
  | "prior_no_shows"
  | "far_and_far_out"
  | "some_prior_no_shows"
  | "appointment_far_out"
  | "same_day"
  | "no_prior_appts_record";

/** Declarative tier rules, evaluated in order (after missed-date guard). First match wins. */
type TierRule = {
  id: string;
  tier: Exclude<RiskTier, "missed">;
  matches: (patient: Patient, daysUntilAppointment: number) => boolean;
};

const TIER_RULES_IN_ORDER: TierRule[] = [
  {
    id: "high_no_show_or_far_combo",
    tier: "high",
    matches: (p, d) =>
      p.priorNoShows >= 3 || (d > 14 && p.distanceMiles > 10),
  },
  {
    id: "medium_history_or_lead_time",
    tier: "medium",
    matches: (p, d) => p.priorNoShows >= 1 || d > 7,
  },
  {
    id: "low_default",
    tier: "low",
    matches: () => true,
  },
];

export type ScoreResult = {
  tier: RiskTier;
  /** 0–100; higher = call sooner within the same tier (sorting tie-breaker only). */
  score: number;
  reasons: ScoreReason[];
  daysUntilAppointment: number;
  /**
   * Single comparable metric: lower value = higher outreach priority.
   * Enables fast sort (and optional radix/counting strategies on very large N).
   */
  sortMetric: number;
  /** Rule id that locked the tier (omit for missed). */
  matchedRuleId?: string;
};

export type ScoredPatient = Patient & {
  scoreResult: ScoreResult;
};

const TIER_ORDER: Record<RiskTier, number> = {
  high: 0,
  medium: 1,
  low: 2,
  missed: 3,
};

const SORT_METRIC_TIER_MULTIPLIER = 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffCalendarDays(from: Date, to: Date): number {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function collectReasons(
  patient: Patient,
  daysUntilAppointment: number
): ScoreReason[] {
  const reasons: ScoreReason[] = [];

  if (patient.priorAppts === 0 && patient.priorNoShows === 0) {
    reasons.push("no_prior_appts_record");
  }

  if (daysUntilAppointment < 0) {
    reasons.push("past_appointment");
    return reasons;
  }

  if (daysUntilAppointment === 0) {
    reasons.push("same_day");
  }

  if (patient.priorNoShows >= 1) {
    reasons.push("some_prior_no_shows");
  }
  if (patient.priorNoShows >= 3) {
    reasons.push("prior_no_shows");
  }

  if (daysUntilAppointment > 7) {
    reasons.push("appointment_far_out");
  }

  if (daysUntilAppointment > 14 && patient.distanceMiles > 10) {
    reasons.push("far_and_far_out");
  }

  return reasons;
}

function resolveTier(
  patient: Patient,
  daysUntilAppointment: number
): { tier: RiskTier; matchedRuleId?: string } {
  if (daysUntilAppointment < 0) {
    return { tier: "missed" };
  }

  for (const rule of TIER_RULES_IN_ORDER) {
    if (rule.matches(patient, daysUntilAppointment)) {
      return { tier: rule.tier, matchedRuleId: rule.id };
    }
  }

  return { tier: "low", matchedRuleId: "low_fallback" };
}

function computeNumericScore(
  tier: RiskTier,
  patient: Patient,
  daysUntilAppointment: number
): number {
  if (tier === "missed") {
    return 0;
  }

  const tierBase =
    tier === "high" ? 72 : tier === "medium" ? 44 : tier === "low" ? 18 : 0;
  const noShowPart = Math.min(22, patient.priorNoShows * 5);
  const distancePart = Math.min(12, Math.round(patient.distanceMiles / 2));
  const proximityPart =
    daysUntilAppointment <= 1 ? 10 : daysUntilAppointment <= 7 ? 6 : 0;
  const sameDayBoost = daysUntilAppointment === 0 ? 8 : 0;

  let score = clamp(
    Math.round(
      tierBase + noShowPart + distancePart + proximityPart + sameDayBoost
    ),
    0,
    100
  );

  if (tier === "high") {
    score = clamp(score, 75, 100);
  } else if (tier === "medium") {
    score = clamp(score, 45, 89);
  } else {
    score = clamp(score, 15, 59);
  }

  return score;
}

/**
 * Packs tier order and within-group urgency into one integer sort key.
 * Sort ascending on this value to obtain final outreach order.
 */
export function computeSortMetric(
  tier: RiskTier,
  numericScore: number
): number {
  const tierPart = TIER_ORDER[tier] * SORT_METRIC_TIER_MULTIPLIER;
  const scorePart = SORT_METRIC_TIER_MULTIPLIER - 1 - clamp(numericScore, 0, 100);
  return tierPart + scorePart;
}

/**
 * Rule-based, interpretable scoring. Rules live in `TIER_RULES_IN_ORDER` for auditability.
 */
export function scorePatient(
  patient: Patient,
  referenceDate: Date = new Date()
): ScoreResult {
  const appt = startOfDay(new Date(patient.apptDate + "T12:00:00"));
  const ref = startOfDay(referenceDate);
  const daysUntilAppointment = diffCalendarDays(ref, appt);

  const reasons = collectReasons(patient, daysUntilAppointment);

  if (daysUntilAppointment < 0) {
    return {
      tier: "missed",
      score: 0,
      reasons,
      daysUntilAppointment,
      sortMetric: computeSortMetric("missed", 0),
    };
  }

  const { tier, matchedRuleId } = resolveTier(patient, daysUntilAppointment);
  const score = computeNumericScore(tier, patient, daysUntilAppointment);

  return {
    tier,
    score,
    reasons,
    daysUntilAppointment,
    sortMetric: computeSortMetric(tier, score),
    matchedRuleId,
  };
}

/**
 * O(n log n) full roster ranking. For multi-million row batches, pre-sort in a worker
 * or bucket by `sortMetric` first — the packed key keeps comparisons cheap.
 */
export function rankPatients(
  list: Patient[],
  referenceDate: Date = new Date()
): ScoredPatient[] {
  const scored: ScoredPatient[] = new Array(list.length);
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    scored[i] = {
      ...p,
      scoreResult: scorePatient(p, referenceDate),
    };
  }

  scored.sort((a, b) => {
    const diff = a.scoreResult.sortMetric - b.scoreResult.sortMetric;
    if (diff !== 0) return diff;
    return a.id - b.id;
  });

  return scored;
}

export { TIER_ORDER, TIER_RULES_IN_ORDER };
