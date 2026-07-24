import { Suspense } from "react";
import RoomShell from "@/components/live-intelligence-rooms/RoomShell";

export default function LiveRoomSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-[color:var(--cbai-text-secondary)]" role="status">
          …
        </div>
      }
    >
      <RoomShell />
    </Suspense>
  );
}
