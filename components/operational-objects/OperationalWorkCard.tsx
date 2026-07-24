"use client";

import Link from "next/link";
import { useState } from "react";
import type { OperationalObject } from "@/lib/operational-objects/operational-object.types";
import { routeOperationalObject } from "@/lib/operational-objects/operational-object-routing";
import {
  translateOperationalObjectDomain,
  translateOperationalObjectStatus,
  translateOperationalObjectType,
} from "@/lib/i18n/operational-object-translation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

type OperationalWorkCardProps = {
  readonly object: OperationalObject;
  readonly mode?: "compact" | "standard" | "mobile";
};

export default function OperationalWorkCard({ object, mode = "standard" }: OperationalWorkCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const route = routeOperationalObject(object);
  const completedSteps = object.requiredInputs.filter(Boolean).length;
  const totalSteps = Math.max(object.requiredInputs.length, 1);
  const progressPct = object.status === "completed" ? 100 : Math.round((completedSteps / totalSteps) * 100);

  return (
    <article className={`cbai-op-work-card cbai-op-work-card--${mode}`}>
      <div className="cbai-op-work-card__head">
        <div>
          <p className="cbai-op-work-card__type">
            {translateOperationalObjectType(object.type, t)} · {translateOperationalObjectDomain(object.domain, t)}
          </p>
          <h3 className="cbai-op-work-card__title">{object.title}</h3>
        </div>
        <span className="cbai-op-work-card__status">{translateOperationalObjectStatus(object.status, t)}</span>
      </div>

      <p className="cbai-op-work-card__next">{object.nextAction || "—"}</p>

      {object.requiredInputs.length > 0 ? (
        <p className="cbai-op-work-card__progress">
          {t("operationalObject.progressLabel")}: {progressPct}%
        </p>
      ) : null}

      <p className="cbai-op-work-card__updated">
        {t("operationalObject.lastUpdated")}: {new Date(object.updatedAt).toLocaleString()}
      </p>

      {expanded ? (
        <div className="cbai-op-work-card__details">
          <p>{object.objective}</p>
          {object.expectedOutcome ? <p>{object.expectedOutcome}</p> : null}
          {object.humanDecision ? <p>{object.humanDecision}</p> : null}
        </div>
      ) : null}

      <div className="cbai-op-work-card__actions">
        <button
          type="button"
          className={`cbai-op-work-card__toggle ${cbaiFocusRing}`}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t("operationalObject.collapseDetails") : t("operationalObject.expandDetails")}
        </button>
        <Link href={route.href} className={`cbai-op-work-card__primary ${cbaiFocusRing}`}>
          {t("operationalObject.primaryAction")}
        </Link>
      </div>
    </article>
  );
}
