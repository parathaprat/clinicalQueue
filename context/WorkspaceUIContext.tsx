"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type WorkspaceView = "call" | "list";

type WorkspaceUIValue = {
  view: WorkspaceView;
  setView: (v: WorkspaceView) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  toggleShortcuts: () => void;
};

const WorkspaceUIContext = createContext<WorkspaceUIValue | null>(null);

export function WorkspaceUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [view, setView] = useState<WorkspaceView>("call");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const toggleShortcuts = useCallback(() => {
    setShortcutsOpen((o) => !o);
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      shortcutsOpen,
      setShortcutsOpen,
      toggleShortcuts,
    }),
    [view, shortcutsOpen, toggleShortcuts]
  );

  return (
    <WorkspaceUIContext.Provider value={value}>
      {children}
    </WorkspaceUIContext.Provider>
  );
}

export function useWorkspaceUI() {
  const ctx = useContext(WorkspaceUIContext);
  if (!ctx) {
    throw new Error("useWorkspaceUI must be used within WorkspaceUIProvider");
  }
  return ctx;
}
