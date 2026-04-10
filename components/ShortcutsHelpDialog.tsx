"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceUI } from "@/context/WorkspaceUIContext";

function Kbd({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`pointer-events-none inline-flex h-5 min-w-[1.25rem] select-none items-center justify-center rounded border border-border/80 bg-muted px-1 font-mono text-[0.65rem] font-medium text-foreground shadow-sm ${className}`}
    >
      {children}
    </kbd>
  );
}

export function ShortcutsHelpDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useWorkspaceUI();

  return (
    <Dialog
      open={shortcutsOpen}
      onOpenChange={(open) => setShortcutsOpen(open)}
    >
      <DialogContent
        className="max-w-md gap-0 border-border/60 bg-card/95 p-0 shadow-2xl ring-1 ring-black/5 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="border-b border-border/50 px-5 py-4">
          <DialogTitle className="font-display text-lg tracking-tight">
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className="text-sm leading-snug">
            Built for fast coordinator workflows. Shortcuts are disabled while
            typing in fields.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 px-5 py-4">
          <ShortcutRow
            keys={[<Kbd key="e">Enter</Kbd>]}
            label="Mark current patient contacted"
            hint="Outreach queue"
          />
          <ShortcutRow
            keys={[<Kbd key="s">S</Kbd>]}
            label="Skip — send to back of queue"
            hint="Outreach queue"
          />
          <ShortcutRow
            keys={[<Kbd key="u">U</Kbd>]}
            label="Undo last contact"
            hint="Global"
          />
          <ShortcutRow
            keys={[<Kbd key="q">?</Kbd>]}
            label="Open this panel"
            hint="Global"
          />
        </div>
        <p className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
          Press <Kbd>Esc</Kbd> to close. On Mac, use{" "}
          <Kbd className="mx-0.5">?</Kbd> (Shift + /).
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({
  keys,
  label,
  hint,
}: {
  keys: ReactNode[];
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg py-2.5 pr-1 pl-2 hover:bg-muted/50">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{keys}</div>
    </div>
  );
}
