"use client";

import SyncStatusBadge from "@/components/shared/SyncStatusBadge";
import PendingSyncNotice from "@/components/shared/PendingSyncNotice";
import { useAuth } from "@/components/platform/context/AuthProvider";

const COPY = {
  en: {
    cloud: "Cloud-protected Problem",
    local: "Saved on this device",
    restoring: "Checking cloud session…",
  },
  uz: {
    cloud: "Cloud himoyasidagi muammo",
    local: "Ushbu qurilmada saqlandi",
    restoring: "Cloud sessiya tekshirilmoqda…",
  },
} as const;

export default function ProblemCloudStatus({
  problemId,
  locale,
}: {
  problemId: string;
  locale: keyof typeof COPY;
}) {
  const { cloudUser, cloudSessionRestoring } = useAuth();
  const copy = COPY[locale];

  if (cloudSessionRestoring) {
    return <span className="text-[11px] text-zinc-500">{copy.restoring}</span>;
  }

  if (!cloudUser) {
    return <span className="text-[11px] text-zinc-500">{copy.local}</span>;
  }

  return (
    <div className="text-right">
      <p className="text-[11px] text-emerald-300">{copy.cloud}</p>
      <SyncStatusBadge table="problem_snapshots" localId={problemId} />
      <PendingSyncNotice cloudUserId={cloudUser.id} />
    </div>
  );
}
