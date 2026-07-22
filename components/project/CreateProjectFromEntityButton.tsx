"use client";

import Link from "next/link";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type CreateProjectFromEntityButtonProps = {
  entity: ContextEntityRef;
  className?: string;
};

/** Real "Create Project from this entity" — pre-fills the new project's Primary Entity field, never fabricated. */
export default function CreateProjectFromEntityButton({ entity, className = "" }: CreateProjectFromEntityButtonProps) {
  const { t } = useTranslation();
  const params = new URLSearchParams({ entityKind: entity.kind, entityId: entity.id, entityName: entity.name });

  return (
    <Link
      href={`/my-work?${params.toString()}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 transition-colors hover:border-teal-500/50 ${className}`}
    >
      {t("project.createProject")}
    </Link>
  );
}
