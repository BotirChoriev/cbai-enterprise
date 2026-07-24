"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

type EntityNotFoundNoticeProps = {
  requestedId: string;
  entityLabel: string;
  fallbackName: string;
};

export default function EntityNotFoundNotice({ requestedId, entityLabel, fallbackName }: EntityNotFoundNoticeProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
      {t("entities.entityNotFound", { requestedId, entityLabel, fallbackName })}
    </div>
  );
}
