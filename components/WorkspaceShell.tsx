"use client";

import { LayoutList, ListOrdered, PhoneCall, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { CsvImportPanel } from "@/components/CsvImportPanel";
import { HeaderSummary } from "@/components/HeaderSummary";
import { useWorkspaceUI } from "@/context/WorkspaceUIContext";
import { cn } from "@/lib/utils";

const nav: {
  id: "call" | "list";
  label: string;
  description: string;
  icon: typeof PhoneCall;
}[] = [
  {
    id: "call",
    label: "Outreach queue",
    description: "Focus — one patient at a time",
    icon: PhoneCall,
  },
  {
    id: "list",
    label: "Ranked roster",
    description: "Virtualized full list",
    icon: ListOrdered,
  },
];

export function WorkspaceShell({
  callQueue,
  rankedList,
}: {
  callQueue: ReactNode;
  rankedList: ReactNode;
}) {
  const { view, setView } = useWorkspaceUI();

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0c1222]">
      {/* Ambient gradient orbs (CSS-only, no images) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,#38bdf8_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,#6366f1_0%,transparent_70%)] blur-3xl" />
      </div>

      <aside
        className="relative z-10 flex w-[17.5rem] min-w-0 shrink-0 flex-col overflow-x-hidden border-r border-white/[0.06] bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] shadow-[8px_0_32px_-12px_rgba(0,0,0,0.5)]"
        aria-label="Primary navigation"
      >
        <div className="border-b border-white/[0.06] px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold tracking-tight text-white shadow-lg shadow-sky-500/25">
              CQ
              <span className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                clinicalQ
              </p>
              <p className="truncate font-display text-[0.95rem] font-semibold tracking-tight text-slate-100">
                No-show outreach
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
          <p className="mb-0.5 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Workspace
          </p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
                  active
                    ? "bg-white/[0.09] text-white shadow-lg shadow-black/20 ring-1 ring-white/[0.08]"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-white/[0.06] text-slate-400 group-hover:bg-white/[0.09]"
                  )}
                >
                  <Icon className="size-[1.05rem]" aria-hidden />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-sm font-semibold leading-snug">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs leading-snug",
                      active ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/[0.06] px-3 py-4">
          <CsvImportPanel />
          <div className="flex min-w-0 items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-[0.7rem] leading-relaxed text-slate-400">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-300/80" aria-hidden />
            <span className="min-w-0 break-words">
              <LayoutList className="mb-0.5 inline size-3 align-text-bottom opacity-60" />
              &nbsp;Rule-based priority. Roster list virtualizes for large
              files.
            </span>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <HeaderSummary />
        <div className="relative flex-1 overflow-y-auto">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsla(220,30%,99%,0.97)_0%,hsla(210,40%,99%,0.99)_35%,hsla(210,60%,98%,1)_100%)] dark:hidden"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-6 py-10 lg:px-12 lg:py-12">
            {view === "call" ? callQueue : rankedList}
          </div>
        </div>
        <footer className="relative border-t border-slate-200/80 bg-white/60 px-6 py-5 backdrop-blur-md dark:border-white/10 dark:bg-black/20">
          <p className="mx-auto max-w-4xl text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            Rule-based operational triage — not clinical decision support or ML.
            Roster may persist in your browser; PHI policies apply.
          </p>
        </footer>
      </div>
    </div>
  );
}
