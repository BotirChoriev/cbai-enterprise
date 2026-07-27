"use client";

import { usePathname } from "next/navigation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import { buildEvidenceConnectFallbackDraft } from "@/lib/operational-objects/linked-work-draft";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnSecondarySm, cbaiFocusRing } from "@/components/brand/brand-classes";

export type EvidenceConnectActionProps = {
  readonly category: string;
  readonly relatedEntityName?: string;
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  /** When a real connector URL exists, navigate there instead of drafting a request. */
  readonly connectorHref?: string | null;
  readonly compact?: boolean;
};

/**
 * Honest evidence-connect control: live connector when present, otherwise Evidence Request draft.
 * Never claims evidence was connected when only a request was opened.
 */
export default function EvidenceConnectAction({
  category,
  relatedEntityName,
  relatedEntityKind,
  relatedEntityId,
  connectorHref,
  compact,
}: EvidenceConnectActionProps) {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const operationalObjects = useOperationalObjectsOptional();

  if (connectorHref) {
    return (
      <a
        href={connectorHref}
        className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} ${compact ? "text-[11px]" : ""}`}
        data-cbai-evidence-connect="live"
      >
        {t("operationalObject.evidenceConnectLive")}
      </a>
    );
  }

  if (!operationalObjects) return null;

  function openRequest() {
    const { draft, inferredFields } = buildEvidenceConnectFallbackDraft({
      category,
      relatedEntityName,
      relatedEntityKind,
      relatedEntityId,
      routePath: pathname || "/evidence",
      locale: language,
      reason: t("operationalObject.evidenceConnectUnavailableReason"),
    });
    operationalObjects!.openComposer(draft, inferredFields, "manual");
  }

  return (
    <button
      type="button"
      className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} ${compact ? "text-[11px]" : ""}`}
      data-cbai-evidence-connect="request"
      onClick={openRequest}
    >
      {t("operationalObject.evidenceConnectRequest")}
    </button>
  );
}
