"use client";

import { CallQueue } from "@/components/CallQueue";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { QueueList } from "@/components/QueueList";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { QueueProvider } from "@/context/QueueContext";
import { WorkspaceUIProvider } from "@/context/WorkspaceUIContext";

function HomeInner() {
  return (
    <>
      <WorkspaceShell
        callQueue={<CallQueue />}
        rankedList={<QueueList />}
      />
      <KeyboardShortcuts />
    </>
  );
}

export default function Home() {
  return (
    <QueueProvider>
      <WorkspaceUIProvider>
        <HomeInner />
      </WorkspaceUIProvider>
    </QueueProvider>
  );
}
