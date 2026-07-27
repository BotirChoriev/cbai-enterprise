"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { GatewaySearchResponse } from "@/lib/search-gateway";
import { projectUniversalEvidenceSearch, UES_GROUP_IDS } from "@/lib/universal-evidence-search";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiLinkMuted, cbaiMineralPanel, cbaiTextMuted } from "@/components/brand/brand-classes";

const GROUP_LABEL: Record<(typeof UES_GROUP_IDS)[number], { en: string; uz: string }> = {
  entities: { en: "Entities", uz: "Obyektlar" },
  evidence: { en: "Evidence", uz: "Dalillar" },
  people: { en: "People", uz: "Odamlar" },
  work: { en: "Work", uz: "Ish" },
  changes: { en: "Changes", uz: "O‘zgarishlar" },
  opportunities: { en: "Opportunities", uz: "Imkoniyatlar" },
};

export default function UniversalEvidenceSearchGroups({ response }: { readonly response: GatewaySearchResponse }) {
  const { language } = useTranslation();
  const projection = useMemo(
    () => projectUniversalEvidenceSearch(response, { locale: language }),
    [response, language],
  );

  if (!response.query) return null;

  return (
    <section className={`${cbaiMineralPanel} space-y-4 p-4`} data-cbai-ues-groups="" aria-label="Universal Evidence Search">
      <p className={`text-sm ${cbaiTextMuted}`}>{projection.honestyBanner}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {projection.groups.map((group) => {
          const label = GROUP_LABEL[group.id][language === "uz" ? "uz" : "en"];
          return (
            <div key={group.id} className="space-y-2 rounded-xl border border-[color:var(--cbai-border-subtle)] p-3">
              <h3 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">
                {label}{" "}
                <span className={cbaiTextMuted}>({group.items.length})</span>
              </h3>
              <p className={`text-xs ${cbaiTextMuted}`}>{group.coverageNote}</p>
              {group.items.length === 0 ? (
                <p className={`text-sm ${cbaiTextMuted}`}>—</p>
              ) : (
                <ul className="space-y-2">
                  {group.items.slice(0, 6).map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.href ? (
                        <Link href={item.href} className={cbaiLinkMuted}>
                          {item.title}
                        </Link>
                      ) : (
                        <span className="text-[color:var(--cbai-text-primary)]">{item.title}</span>
                      )}
                      <p className={`text-xs ${cbaiTextMuted}`}>
                        {item.sourceLabel} · {item.evidenceState} · {item.officialVsCbai}
                      </p>
                      <p className={`text-xs ${cbaiTextMuted}`}>{item.whyRelevant}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <Link href="/my-work" className={cbaiLinkMuted}>
                  Link to my work
                </Link>
                <Link href="/evidence" className={cbaiLinkMuted}>
                  Request evidence
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
