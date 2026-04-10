"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Patient } from "@/data/patients";
import {
  DEFAULT_SHIFT_GOAL_CONTACTS,
  MAX_SHIFT_GOAL_CONTACTS,
  MIN_SHIFT_GOAL_CONTACTS,
  STORAGE_KEY_CONTACTED,
  STORAGE_KEY_ROSTER,
  STORAGE_KEY_SHIFT_GOAL,
} from "@/lib/constants";
import { getSeedPatients } from "@/lib/patientDataset";
import { rankPatients, type ScoredPatient } from "@/lib/scoring";

type QueueContextValue = {
  patients: Patient[];
  rankedPatients: ScoredPatient[];
  totalPatients: number;
  queueIds: number[];
  contactedIds: Set<number>;
  shiftGoal: number;
  setShiftGoal: (n: number) => void;
  markContacted: (id: number) => void;
  undoContacted: () => void;
  skip: (id: number) => void;
  activeQueue: ScoredPatient[];
  currentPatient: ScoredPatient | null;
  highRiskRemaining: number;
  callsCompleted: number;
  outstandingInQueue: number;
  contactsUntilShiftGoal: number;
  canUndo: boolean;
  /** Returns false if roster could not be persisted (e.g. storage quota). */
  importRoster: (next: Patient[]) => boolean;
  resetRosterToSeed: () => void;
};

const QueueContext = createContext<QueueContextValue | null>(null);

function loadContactedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTACTED);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is number => typeof x === "number")
      : [];
  } catch {
    return [];
  }
}

function persistContactedIds(ids: Set<number>) {
  localStorage.setItem(
    STORAGE_KEY_CONTACTED,
    JSON.stringify(Array.from(ids).sort((a, b) => a - b))
  );
}

function clampGoal(n: number): number {
  return Math.max(
    MIN_SHIFT_GOAL_CONTACTS,
    Math.min(MAX_SHIFT_GOAL_CONTACTS, Math.round(n))
  );
}

function readStoredShiftGoal(): number {
  if (typeof window === "undefined") return DEFAULT_SHIFT_GOAL_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHIFT_GOAL);
    if (raw == null) return DEFAULT_SHIFT_GOAL_CONTACTS;
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return DEFAULT_SHIFT_GOAL_CONTACTS;
    return clampGoal(n);
  } catch {
    return DEFAULT_SHIFT_GOAL_CONTACTS;
  }
}

function isLikelyPatient(x: unknown): x is Patient {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.id === "number" &&
    typeof p.name === "string" &&
    typeof p.apptDate === "string" &&
    typeof p.priorNoShows === "number" &&
    typeof p.priorAppts === "number" &&
    typeof p.distanceMiles === "number" &&
    typeof p.insurance === "string"
  );
}

function loadStoredRoster(): Patient[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROSTER);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data) || data.length === 0) return null;
    const parsed = data.filter(isLikelyPatient);
    if (parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => getSeedPatients());

  const rankedPatients = useMemo(() => rankPatients(patients), [patients]);

  const [queueIds, setQueueIds] = useState<number[]>(() =>
    rankPatients(getSeedPatients()).map((p) => p.id)
  );

  const [contactedIds, setContactedIds] = useState<Set<number>>(
    () => new Set()
  );
  const [contactHistory, setContactHistory] = useState<number[]>([]);
  const [shiftGoal, setShiftGoalState] = useState(DEFAULT_SHIFT_GOAL_CONTACTS);

  useEffect(() => {
    setContactedIds(new Set(loadContactedIds()));
  }, []);

  useEffect(() => {
    setShiftGoalState(readStoredShiftGoal());
  }, []);

  useEffect(() => {
    const stored = loadStoredRoster();
    if (stored) setPatients(stored);
  }, []);

  useEffect(() => {
    setQueueIds(rankedPatients.map((p) => p.id));
  }, [rankedPatients]);

  const setShiftGoal = useCallback((n: number) => {
    const v = clampGoal(n);
    setShiftGoalState(v);
    localStorage.setItem(STORAGE_KEY_SHIFT_GOAL, String(v));
  }, []);

  const importRoster = useCallback((next: Patient[]) => {
    setPatients(next);
    let persisted = false;
    try {
      localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(next));
      persisted = true;
    } catch {
      /* quota exceeded — in-memory only */
    }
    setContactedIds(new Set());
    setContactHistory([]);
    persistContactedIds(new Set());
    return persisted;
  }, []);

  const resetRosterToSeed = useCallback(() => {
    const seed = getSeedPatients();
    setPatients(seed);
    localStorage.removeItem(STORAGE_KEY_ROSTER);
    setContactedIds(new Set());
    setContactHistory([]);
    persistContactedIds(new Set());
  }, []);

  const patientMap = useMemo(() => {
    const m = new Map<number, ScoredPatient>();
    rankedPatients.forEach((p) => m.set(p.id, p));
    return m;
  }, [rankedPatients]);

  const markContacted = useCallback((id: number) => {
    setContactedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistContactedIds(next);
      return next;
    });
    setContactHistory((h) => [...h, id]);
  }, []);

  const undoContacted = useCallback(() => {
    setContactHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      const next = h.slice(0, -1);
      setContactedIds((prev) => {
        const s = new Set(prev);
        s.delete(last);
        persistContactedIds(s);
        return s;
      });
      return next;
    });
  }, []);

  const skip = useCallback((id: number) => {
    setQueueIds((q) => {
      if (!q.includes(id)) return q;
      return [...q.filter((x) => x !== id), id];
    });
  }, []);

  const activeQueue = useMemo(() => {
    return queueIds
      .filter((id) => !contactedIds.has(id))
      .map((id) => patientMap.get(id))
      .filter((p): p is ScoredPatient => p != null);
  }, [queueIds, contactedIds, patientMap]);

  const currentPatient = activeQueue[0] ?? null;

  const highRiskRemaining = useMemo(
    () => activeQueue.filter((p) => p.scoreResult.tier === "high").length,
    [activeQueue]
  );

  const callsCompleted = contactedIds.size;
  const outstandingInQueue = activeQueue.length;
  const contactsUntilShiftGoal = Math.max(0, shiftGoal - callsCompleted);
  const canUndo = contactHistory.length > 0;

  const value = useMemo(
    () => ({
      patients,
      rankedPatients,
      totalPatients: rankedPatients.length,
      queueIds,
      contactedIds,
      shiftGoal,
      setShiftGoal,
      markContacted,
      undoContacted,
      skip,
      activeQueue,
      currentPatient,
      highRiskRemaining,
      callsCompleted,
      outstandingInQueue,
      contactsUntilShiftGoal,
      canUndo,
      importRoster,
      resetRosterToSeed,
    }),
    [
      patients,
      rankedPatients,
      queueIds,
      contactedIds,
      shiftGoal,
      setShiftGoal,
      markContacted,
      undoContacted,
      skip,
      activeQueue,
      currentPatient,
      highRiskRemaining,
      callsCompleted,
      outstandingInQueue,
      contactsUntilShiftGoal,
      canUndo,
      importRoster,
      resetRosterToSeed,
    ]
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) {
    throw new Error("useQueue must be used within QueueProvider");
  }
  return ctx;
}
