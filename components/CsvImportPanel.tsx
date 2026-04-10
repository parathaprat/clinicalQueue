"use client";

import { FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useQueue } from "@/context/QueueContext";
import { parsePatientCsv, patientCsvTemplateHeader } from "@/lib/csvImport";
import { cn } from "@/lib/utils";

const CSV_COLUMNS = patientCsvTemplateHeader().split(",");

export function CsvImportPanel() {
  const { importRoster, resetRosterToSeed } = useQueue();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const runImport = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const result = await parsePatientCsv(file);
        if (!result.ok) {
          const rest = result.errors.length - 5;
          toast.error("Could not import CSV", {
            description:
              result.errors.slice(0, 5).join("\n") +
              (rest > 0 ? `\n…${rest} more issue${rest === 1 ? "" : "s"}` : ""),
          });
          return;
        }
        const persisted = importRoster(result.patients);
        toast.success(`Imported ${result.rowCount.toLocaleString()} patients`, {
          description: persisted
            ? "Roster saved in this browser. Contact history was cleared."
            : "Roster loaded but not saved — browser storage may be full.",
        });
      } finally {
        setBusy(false);
      }
    },
    [importRoster]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please use a .csv file");
        return;
      }
      void runImport(file);
    },
    [runImport]
  );

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) void runImport(file);
    },
    [runImport]
  );

  return (
    <div
      className="space-y-3"
      data-no-shortcuts
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragActive(false);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <p className="px-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
        Data
      </p>
      <div
        className={cn(
          "w-full min-w-0 overflow-hidden rounded-xl border border-dashed px-3 py-4 transition-colors",
          dragActive
            ? "border-sky-400/80 bg-sky-500/10"
            : "border-white/15 bg-white/[0.04] hover:border-white/25"
        )}
      >
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Upload className="size-4 text-slate-200" aria-hidden />
            </div>
            <p className="px-1 text-xs font-medium leading-snug text-slate-100">
              Drop a roster CSV here
            </p>
          </div>

          <div className="w-full min-w-0 border-t border-white/[0.08] pt-3">
            <p className="mb-2 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-slate-500">
              First row (headers)
            </p>
            <ul className="flex w-full min-w-0 flex-wrap justify-center gap-1.5">
              {CSV_COLUMNS.map((col) => (
                <li key={col}>
                  <span
                    className="inline-block max-w-full break-all rounded-md bg-black/25 px-1.5 py-0.5 text-center font-mono text-[0.58rem] leading-tight text-slate-200 ring-1 ring-white/[0.06]"
                    title={col}
                  >
                    {col}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFile}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="h-8 w-full shrink-0 border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
          >
            <FileSpreadsheet className="size-3.5" aria-hidden />
            Browse files
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            resetRosterToSeed();
            toast.success("Restored demo roster");
          }}
          className="h-8 justify-start text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset to bundled demo data
        </Button>
        <a
          href="/sample-roster.csv"
          download
          className="px-3 text-[0.7rem] text-sky-300/90 underline-offset-2 hover:text-sky-200 hover:underline"
        >
          Download sample CSV template
        </a>
      </div>
    </div>
  );
}
