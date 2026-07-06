import type { PlatformCapabilityStatus } from "@/lib/platform-home";
import { getStatusLabel } from "@/lib/platform-home";

const statusStyles: Record<PlatformCapabilityStatus, string> = {
  available:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  evidence_not_connected:
    "border-zinc-600 bg-zinc-800/80 text-zinc-400",
};

type StatusBadgeProps = {
  status: PlatformCapabilityStatus;
  className?: string;
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${statusStyles[status]} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
