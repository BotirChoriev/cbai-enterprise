"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildWorldAndMeProjection,
  explainRelationship,
  listWorldChangeRadar,
  previewMapToActionDraft,
  consumeWimDraftIdempotency,
  emptyMyWorldConsent,
  filterMyWorldNodes,
  relationshipLabelEn,
  WIM_VIEW_MODES,
  type WimViewMode,
  type MyWorldConsentProfile,
} from "@/lib/world-and-me-intelligence";
import { getWimCopy } from "@/lib/i18n/platform-copy-world-and-me";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

function parseMode(raw: string | null): WimViewMode {
  return raw && (WIM_VIEW_MODES as readonly string[]).includes(raw) ? (raw as WimViewMode) : "map";
}

export default function WorldAndMeIntelligenceHome() {
  const { language } = useTranslation();
  const copy = getWimCopy(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const operationalObjects = useOperationalObjectsOptional();

  const mode = parseMode(searchParams.get("view"));
  const projection = useMemo(() => buildWorldAndMeProjection(), []);
  const radar = useMemo(() => listWorldChangeRadar(), []);

  const [selectedId, setSelectedId] = useState(projection.nodes.find((n) => n.kind === "country")?.id ?? projection.nodes[0]?.id ?? "");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [explainToId, setExplainToId] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [consent, setConsent] = useState<MyWorldConsentProfile>(() => emptyMyWorldConsent(language));
  const [status, setStatus] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);

  const selected = projection.nodes.find((n) => n.id === selectedId) ?? null;
  const selectedRels = projection.relationships.filter(
    (r) => r.sourceNodeId === selectedId || r.targetNodeId === selectedId,
  );

  const myNodes = filterMyWorldNodes(projection.nodes, consent);
  const explanation = explainToId
    ? explainRelationship(projection.nodes, projection.relationships, selectedId, explainToId)
    : null;

  function setMode(next: WimViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`/graph?${params.toString()}`, { scroll: false });
  }

  function openDraft() {
    const preview = previewMapToActionDraft({
      kind: "evidence_request",
      locale: language,
      selected,
      relationships: selectedRels,
    });
    setDraftKey(preview.idempotencyKey);
    if (operationalObjects) {
      operationalObjects.openComposer(preview.draft, preview.inferredFields, "manual");
    }
    setStatus(copy.confirmBeforeCreate);
  }

  function confirmDraftOnce() {
    if (!draftKey) return;
    const ok = consumeWimDraftIdempotency(draftKey, true);
    setStatus(ok ? copy.exactlyOnce : `${copy.exactlyOnce} (duplicate blocked)`);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="space-y-4 pb-24" data-cbai-wim-network="" data-cbai-voice-dock-clearance="">
      <p className={`${cbaiTextMuted} text-sm`}>{copy.honestyBanner}</p>

      <div className={`${cbaiMineralPanel} space-y-3`}>
        <p className={cbaiSectionEyebrow}>Intelligence OS</p>
        <h2 className="text-lg font-semibold text-[var(--cbai-text-primary)]">{copy.title}</h2>
        <p className="text-base font-medium text-[var(--cbai-text-primary)]">{copy.primaryQuestion}</p>
        <p className={`text-sm ${cbaiTextMuted}`}>{copy.oneSentence}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} data-cbai-primary-action="" onClick={openDraft}>
            {copy.primaryAction}
          </button>
          <Link href="/evidence" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} inline-flex min-h-11 items-center`}>
            {copy.secondaryAction}
          </Link>
          <div className="relative">
            <button type="button" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`} aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>
              {copy.moreActions}
            </button>
            {moreOpen ? (
              <div className="absolute right-0 z-20 mt-1 min-w-[12rem] space-y-1 rounded-lg border border-[var(--cbai-border)] bg-[var(--cbai-surface)] p-2 shadow-lg">
                <Link href="/my-work" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  My Work
                </Link>
                <Link href="/reports" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Reports
                </Link>
                <Link href="/research" className={`${cbaiFocusRing} block min-h-11 px-2 py-2 text-sm`}>
                  Research
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        {status ? (
          <p className="text-sm text-teal-800 dark:text-teal-200" role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
        {draftKey ? (
          <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`} onClick={confirmDraftOnce}>
            {copy.confirmBeforeCreate}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={copy.canvas}>
        {WIM_VIEW_MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`${cbaiFocusRing} min-h-11 rounded-md border px-3 text-sm ${
              mode === m ? "border-teal-500/40 text-teal-700 dark:text-teal-300" : "border-[var(--cbai-border)]"
            }`}
            onClick={() => setMode(m)}
          >
            {m === "map"
              ? copy.modeMap
              : m === "relationships"
                ? copy.modeRelationships
                : m === "timeline"
                  ? copy.modeTimeline
                  : m === "compare"
                    ? copy.modeCompare
                    : copy.modeMyWorld}
          </button>
        ))}
      </div>

      <div className="flex gap-2 lg:hidden">
        <button type="button" className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`} onClick={() => setNavOpen((v) => !v)}>
          {navOpen ? copy.filtersClose : copy.filtersOpen}
        </button>
        <button type="button" className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`} onClick={() => setContextOpen((v) => !v)}>
          {contextOpen ? copy.contextClose : copy.contextOpen}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(12rem,16rem)]">
        <aside className={`${navOpen ? "block" : "hidden lg:block"}`} data-cbai-wim-navigator="">
          <div className={`${cbaiMineralPanel} space-y-2`}>
            <h3 className="text-sm font-semibold">{copy.navigator}</h3>
            <ul className="space-y-1 text-xs text-[var(--cbai-text-secondary)]">
              <li>{copy.importantChanges}: {radar.records.length}</li>
              <li>{copy.myField}: {copy.unknown}</li>
              <li>{copy.myGoals}: {consent.goals.length}</li>
              <li>{copy.myProjects}: {copy.unknown}</li>
              <li>
                Universities: {projection.nodes.filter((n) => n.kind === "university").length}
              </li>
              <li>
                Evidence:{" "}
                <Link href="/evidence" className="underline">
                  /evidence
                </Link>
              </li>
              <li>{copy.watchlist}: {consent.watchedEntityIds.length}</li>
              <li>{copy.openQuestions}: {copy.unknown}</li>
              <li>{copy.nextDecision}: {copy.humanDecision}</li>
            </ul>
            <div className="max-h-56 space-y-1 overflow-y-auto" role="listbox" aria-label={copy.navigator}>
              {projection.nodes.slice(0, 30).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="option"
                  aria-selected={selectedId === n.id}
                  className={`${cbaiFocusRing} w-full rounded-md border px-2 py-2 text-left text-xs ${
                    selectedId === n.id ? "border-teal-500/40 bg-teal-500/10" : "border-[var(--cbai-border)]"
                  }`}
                  onClick={() => setSelectedId(n.id)}
                >
                  <span lang={n.sourceLanguage ?? undefined}>{n.fullLabel}</span>
                  {n.shortCode ? (
                    <span className="mt-0.5 block text-[10px] text-[var(--cbai-text-muted)]">
                      {n.shortCode} = {n.officialName}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4" data-cbai-wim-canvas="">
          {(mode === "map" || mode === "relationships") && (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-wim-map="">
              <h3 className="text-sm font-semibold">{mode === "map" ? copy.modeMap : copy.modeRelationships}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{projection.honestyNotice}</p>
              <p className="text-xs text-[var(--cbai-text-muted)]">
                nodes: {projection.nodes.length} · relationships: {projection.relationships.length} · live:{" "}
                {projection.liveSourceStatus}
              </p>
              <details>
                <summary className={`${cbaiFocusRing} cursor-pointer text-sm`}>{copy.listFallback}</summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs">
                  {projection.listFallback.map((row) => (
                    <li key={row.label + row.detail}>
                      <span lang="en">{row.label}</span> — {row.detail}
                    </li>
                  ))}
                </ul>
              </details>
              {mode === "relationships" && selected ? (
                <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
                  {selectedRels.slice(0, 12).map((rel) => (
                    <li key={rel.id}>
                      {relationshipLabelEn(rel.type)} · {rel.evidenceStatus} · {rel.classification}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          )}

          {mode === "timeline" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-wim-timeline="">
              <h3 className="text-sm font-semibold">{copy.modeTimeline}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.timelineHint}</p>
              <p className="text-sm">{copy.noLiveSource}</p>
            </section>
          ) : null}

          {mode === "compare" ? (
            <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-wim-compare="">
              <h3 className="text-sm font-semibold">{copy.modeCompare}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.compareHint}</p>
              <div className="flex flex-wrap gap-2">
                {projection.nodes.filter((n) => n.kind === "country" || n.kind === "university").slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`${cbaiFocusRing} min-h-11 rounded-md border px-2 text-xs ${
                      compareIds.includes(n.id) ? "border-teal-500/40" : "border-[var(--cbai-border)]"
                    }`}
                    onClick={() => toggleCompare(n.id)}
                  >
                    {n.officialName}
                  </button>
                ))}
              </div>
              <p className="text-sm">
                Selected: {compareIds.length} · {copy.unknown} dimensions until verified indicators connect
              </p>
            </section>
          ) : null}

          {mode === "my_world" ? (
            <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-wim-my-world="">
              <h3 className="text-sm font-semibold">{copy.modeMyWorld}</h3>
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.consentRequired}</p>
              {!consent.consentGiven ? (
                <button
                  type="button"
                  className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 px-4`}
                  onClick={() => setConsent({ ...consent, consentGiven: true, role: "researcher", field: "unknown" })}
                >
                  {copy.giveConsent}
                </button>
              ) : (
                <>
                  <p className="text-sm">
                    {copy.myField}: {consent.field ?? copy.unknown} · role: {consent.role ?? copy.unknown}
                  </p>
                  <ul className="text-xs text-[var(--cbai-text-secondary)]">
                    {myNodes.slice(0, 10).map((n) => (
                      <li key={n.id}>{n.fullLabel}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} min-h-11`}
                    onClick={() => setConsent(emptyMyWorldConsent(language))}
                  >
                    {copy.resetConsent}
                  </button>
                </>
              )}
            </section>
          ) : null}

          <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-wim-change-radar="">
            <h3 className="text-sm font-semibold">{copy.changeRadar}</h3>
            <p className={`text-sm ${cbaiTextMuted}`}>{radar.honestyNotice}</p>
            <p className="text-sm">{radar.emptyState}</p>
          </section>

          <section className={`${cbaiMineralPanel} space-y-2`} data-cbai-wim-explainer="">
            <h3 className="text-sm font-semibold">{copy.relationshipExplainer}</h3>
            <label className="block text-xs">
              Target node
              <select
                className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2`}
                value={explainToId}
                onChange={(e) => setExplainToId(e.target.value)}
              >
                <option value="">—</option>
                {projection.nodes
                  .filter((n) => n.id !== selectedId)
                  .slice(0, 40)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.fullLabel}
                    </option>
                  ))}
              </select>
            </label>
            {explanation ? (
              explanation.found ? (
                <ul className="text-sm text-[var(--cbai-text-secondary)]">
                  {explanation.path.map((step, i) => (
                    <li key={`${step.from}-${step.to}-${i}`}>
                      {step.type} ({step.evidenceStatus})
                    </li>
                  ))}
                  <li>{explanation.whyItMayMatter}</li>
                </ul>
              ) : (
                <p className={`text-sm ${cbaiTextMuted}`}>{explanation.message || copy.noPath}</p>
              )
            ) : (
              <p className={`text-sm ${cbaiTextMuted}`}>{copy.noPath}</p>
            )}
          </section>
        </div>

        <aside className={`${contextOpen ? "block" : "hidden lg:block"} ${cbaiMineralPanel} space-y-3`} data-cbai-wim-context-rail="">
          <h3 className="text-sm font-semibold">{copy.contextRail}</h3>
          {selected ? (
            <>
              <p className="text-sm font-medium" lang={selected.sourceLanguage ?? undefined}>
                {selected.officialName}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>{selected.fullLabel}</p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.officialSource} / {copy.cbaiInference}: {selected.classification}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.whyRelevant}: {selectedRels[0]?.relevanceExplanation ?? copy.unknown}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>
                {copy.known}: {selected.evidenceStatus} · {copy.disputed}: {copy.unknown}
              </p>
              <p className={`text-xs ${cbaiTextMuted}`}>{copy.nextDecision}: {copy.humanDecision}</p>
              <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing} min-h-11 w-full px-3`} onClick={openDraft}>
                {copy.linkToMyWork}
              </button>
              <Link href="/evidence" className={`${cbaiBtnSecondarySm} ${cbaiFocusRing} inline-flex min-h-11 w-full items-center justify-center`}>
                {copy.viewEvidence}
              </Link>
              {selected.href ? (
                <Link href={selected.href} className={`${cbaiFocusRing} text-xs underline`}>
                  Open profile
                </Link>
              ) : null}
              <p className={`text-xs ${cbaiTextMuted}`}>{copy.voiceClearance}</p>
            </>
          ) : (
            <p className={`text-sm ${cbaiTextMuted}`}>{copy.unknown}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
