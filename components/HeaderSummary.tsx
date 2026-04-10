"use client";

import { Keyboard, Phone, ShieldAlert, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { useQueue } from "@/context/QueueContext";
import { useWorkspaceUI } from "@/context/WorkspaceUIContext";
import {
  MAX_SHIFT_GOAL_CONTACTS,
  MIN_SHIFT_GOAL_CONTACTS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HeaderSummary() {
  const {
    callsCompleted,
    contactsUntilShiftGoal,
    highRiskRemaining,
    outstandingInQueue,
    totalPatients,
    shiftGoal,
    setShiftGoal,
    canUndo,
    undoContacted,
  } = useQueue();

  const { setShortcutsOpen } = useWorkspaceUI();

  const pctTowardGoal = Math.min(
    100,
    shiftGoal > 0 ? Math.round((callsCompleted / shiftGoal) * 100) : 0
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-6 lg:px-12">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operations workspace
            </p>
            <h1 className="font-display mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[1.65rem]">
              Appointment retention outreach
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="font-medium tabular-nums text-slate-900 dark:text-slate-200">
                {totalPatients.toLocaleString()}
              </span>{" "}
              patients ranked with auditable rules. Focus queue respects skips;
              roster shows global order.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-end sm:justify-end">
            <label
              className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5"
              data-no-shortcuts
            >
              <span className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <Target className="size-3" aria-hidden />
                Shift goal
              </span>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  min={MIN_SHIFT_GOAL_CONTACTS}
                  max={MAX_SHIFT_GOAL_CONTACTS}
                  value={shiftGoal}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) return;
                    setShiftGoal(v);
                  }}
                  className="h-9 w-[4.5rem] rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold tabular-nums text-slate-900 shadow-inner outline-none ring-sky-500/30 transition-shadow focus-visible:ring-2 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Shift contact goal"
                />
                <span className="text-xs text-slate-500">contacts</span>
              </div>
              <span className="text-[0.65rem] text-slate-400">
                Typical {MIN_SHIFT_GOAL_CONTACTS}–{MAX_SHIFT_GOAL_CONTACTS}
              </span>
            </label>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShortcutsOpen(true)}
                className="h-10 gap-1.5 rounded-xl border-slate-200 bg-white/90 px-3 shadow-sm dark:border-white/15 dark:bg-transparent"
              >
                <Keyboard className="size-3.5 opacity-70" aria-hidden />
                Shortcuts
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canUndo}
                onClick={undoContacted}
                className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm dark:border-white/15 dark:bg-transparent"
              >
                Undo
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div
            className={cn(
              "rounded-2xl border px-4 py-4 shadow-sm transition-shadow",
              highRiskRemaining > 0
                ? "border-red-200/80 bg-gradient-to-br from-red-50 to-white dark:border-red-900/50 dark:from-red-950/40 dark:to-transparent"
                : "border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/[0.04]"
            )}
          >
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <ShieldAlert className="size-4 shrink-0 opacity-85" aria-hidden />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
                High risk in queue
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
              {highRiskRemaining}
            </p>
            <p className="mt-1 text-xs text-slate-500">Among outstanding</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-slate-500">
              <Phone className="size-4 shrink-0" aria-hidden />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
                Outstanding
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
              {outstandingInQueue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">Left in working queue</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="size-4 shrink-0" aria-hidden />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
                Toward goal
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
              {contactsUntilShiftGoal.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                {callsCompleted}
              </span>{" "}
              completed this session
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Progress to shift goal</span>
            <span className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
              {callsCompleted} / {shiftGoal}
            </span>
          </div>
          <Progress
            value={pctTowardGoal}
            className="mt-2 w-full"
            aria-label={`${callsCompleted} of ${shiftGoal} contacts toward shift goal`}
          >
            <ProgressTrack className="h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10">
              <ProgressIndicator className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            </ProgressTrack>
          </Progress>
        </div>
      </div>
    </header>
  );
}
