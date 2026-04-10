"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { useQueue } from "@/context/QueueContext";
import { explainRisk, tierLabel } from "@/lib/explanations";
import { cn } from "@/lib/utils";

function tierRowAccent(tier: "high" | "medium" | "low" | "missed") {
  switch (tier) {
    case "high":
      return "border-l-[3px] border-l-red-500";
    case "medium":
      return "border-l-[3px] border-l-amber-500";
    case "low":
      return "border-l-[3px] border-l-emerald-500";
    case "missed":
      return "border-l-[3px] border-l-muted-foreground/35";
    default:
      return "";
  }
}

const ROW_ESTIMATE_PX = 118;

export function QueueList() {
  const { rankedPatients, contactedIds } = useQueue();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rankedPatients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 14,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Ranked roster</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {rankedPatients.length.toLocaleString()} patients sorted by outreach
          priority. Only visible rows are mounted for performance. Contacted
          records stay in the list but fade.
        </p>
      </div>

      <div
        ref={parentRef}
        className="h-[min(70vh,calc(100vh-14rem))] overflow-auto rounded-2xl border border-slate-200/90 bg-white/80 shadow-md shadow-slate-200/40 scroll-smooth backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
        role="region"
        aria-label="Virtualized patient roster"
      >
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const p = rankedPatients[virtualRow.index];
            const contacted = contactedIds.has(p.id);
            const explanation = explainRisk(p, p.scoreResult);
            return (
              <div
                key={p.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute left-0 top-0 w-full px-3 py-2"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div
                  className={cn(
                    "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]",
                    tierRowAccent(p.scoreResult.tier),
                    contacted && "opacity-[0.42]"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          #{virtualRow.index + 1}
                        </span>
                        <span
                          className={cn(
                            "text-base font-semibold",
                            contacted &&
                              "line-through decoration-muted-foreground/70"
                          )}
                        >
                          {p.name}
                        </span>
                        {contacted && (
                          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            Contacted
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm leading-snug text-muted-foreground",
                          contacted && "line-through"
                        )}
                      >
                        {explanation}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-xs font-semibold",
                        p.scoreResult.tier === "high" &&
                          "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100",
                        p.scoreResult.tier === "medium" &&
                          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
                        p.scoreResult.tier === "low" &&
                          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100",
                        p.scoreResult.tier === "missed" &&
                          "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {tierLabel(p.scoreResult.tier)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
