"use client";

import { useEffect } from "react";

import { ShortcutsHelpDialog } from "@/components/ShortcutsHelpDialog";
import { useQueue } from "@/context/QueueContext";
import { useWorkspaceUI } from "@/context/WorkspaceUIContext";

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return el.closest("[data-no-shortcuts]") != null;
}

export function KeyboardShortcuts() {
  const { view, setShortcutsOpen, shortcutsOpen } = useWorkspaceUI();
  const {
    activeQueue,
    markContacted,
    skip,
    undoContacted,
    canUndo,
  } = useQueue();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;

      if (e.key === "Escape" && shortcutsOpen) {
        e.preventDefault();
        setShortcutsOpen(false);
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === "u" || e.key === "U") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey && canUndo) {
          e.preventDefault();
          undoContacted();
        }
        return;
      }

      if (view !== "call") return;

      const current = activeQueue[0];
      if (!current) return;

      if (e.key === "Enter") {
        e.preventDefault();
        markContacted(current.id);
        return;
      }

      if ((e.key === "s" || e.key === "S") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        skip(current.id);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    view,
    activeQueue,
    markContacted,
    skip,
    undoContacted,
    canUndo,
    shortcutsOpen,
    setShortcutsOpen,
  ]);

  return <ShortcutsHelpDialog />;
}
