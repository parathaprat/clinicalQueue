"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueue } from "@/context/QueueContext";
import { explainRisk, tierLabel } from "@/lib/explanations";
import { cn } from "@/lib/utils";

function tierBadgeClass(tier: "high" | "medium" | "low" | "missed") {
  switch (tier) {
    case "high":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100";
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100";
    case "missed":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "";
  }
}

export function CallQueue() {
  const { markContacted, skip, activeQueue } = useQueue();

  if (activeQueue.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Outreach queue
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Work patients in priority order. Mark contacted when you&apos;re
            done, or skip to bump someone to the back of your list.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-dashed border-border/80 bg-muted/25 px-10 py-14 text-center"
        >
          <p className="text-lg font-semibold text-foreground">
            Nothing left in your working queue
          </p>
          <p className="mt-3 max-w-md mx-auto text-sm text-muted-foreground">
            Everyone has been marked contacted, or the roster is empty. Check
            the ranked list if you need the full panel view.
          </p>
        </motion.div>
      </div>
    );
  }

  const p = activeQueue[0];

  const explanation = explainRisk(p, p.scoreResult);
  const label = tierLabel(p.scoreResult.tier);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Outreach queue</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Next up follows your live queue (including skips). Priority is
          computed from the same rules as the full roster.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/90 bg-white/95 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/40 dark:ring-white/10">
              <CardHeader className="gap-3 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Next patient
                    </p>
                    <CardTitle className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                      {p.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 px-3 py-1 text-sm font-semibold",
                      tierBadgeClass(p.scoreResult.tier)
                    )}
                  >
                    {label}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1">
                    <Calendar className="size-3.5" aria-hidden />
                    {new Date(p.apptDate + "T12:00:00").toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {p.distanceMiles} mi
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1">
                    <Shield className="size-3.5" aria-hidden />
                    {p.insurance}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/35 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Why they&apos;re prioritized
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    {explanation}
                  </p>
                </div>
              </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:justify-stretch">
              <div className="flex w-full flex-1 flex-col gap-1">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-sky-500/10"
                  onClick={() => markContacted(p.id)}
                >
                  {p.scoreResult.tier === "missed"
                    ? "Mark reviewed"
                    : "Mark contacted"}
                </Button>
                <span className="text-center text-[0.65rem] text-muted-foreground">
                  <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.6rem] font-medium">
                    Enter
                  </kbd>
                </span>
              </div>
              <div className="flex w-full flex-1 flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-xl text-base"
                  onClick={() => skip(p.id)}
                >
                  Skip for now
                </Button>
                <span className="text-center text-[0.65rem] text-muted-foreground">
                  <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.6rem] font-medium">
                    S
                  </kbd>
                </span>
              </div>
            </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {activeQueue.length - 1 > 0 ? (
            <>
              <span className="tabular-nums font-medium text-foreground">
                {activeQueue.length - 1}
              </span>{" "}
              more in your queue after this one.
            </>
          ) : (
            "Last patient in your working queue."
          )}
        </p>
      </div>
    </div>
  );
}
