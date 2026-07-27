"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  confirmHumanVerification,
  createEvidencePassport,
  getEmptyEvidencePassportSnapshot,
  listEvidencePassports,
  subscribeEvidencePassports,
} from "@/lib/evidence-passport";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondarySm,
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

export default function EvidencePassportPanel() {
  const { language } = useTranslation();
  const passports = useSyncExternalStore(
    subscribeEvidencePassports,
    listEvidencePassports,
    getEmptyEvidencePassportSnapshot,
  );
  const [claim, setClaim] = useState("");
  const [source, setSource] = useState("");
  const [synthesis, setSynthesis] = useState("");
  const [confirmedReview, setConfirmedReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = useMemo(() => passports[0] ?? null, [passports]);

  function onCreate() {
    setError(null);
    if (!confirmedReview) {
      setError("Confirm review before creating a passport.");
      return;
    }
    try {
      createEvidencePassport({
        confirmCreate: true,
        claimText: claim,
        stance: "supports",
        originalSourceContent: source,
        cbaiSynthesis: synthesis.trim() || null,
        contentLocale: language,
        createdLocale: language,
      });
      setClaim("");
      setSource("");
      setSynthesis("");
      setConfirmedReview(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "create_failed");
    }
  }

  return (
    <section className={`${cbaiMineralPanel} space-y-4 p-4`} data-cbai-evidence-passport="" aria-labelledby="passport-heading">
      <div>
        <h2 id="passport-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
          Evidence Passport
        </h2>
        <p className={`text-sm ${cbaiTextMuted}`}>
          Source material stays original. CBAI synthesis is stored separately. Nothing becomes operational without human confirmation.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className={cbaiTextMuted}>Claim</span>
          <input
            className="min-h-11 w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className={cbaiTextMuted}>Original source content</span>
          <textarea
            className="min-h-[88px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className={cbaiTextMuted}>CBAI synthesis (separate)</span>
          <textarea
            className="min-h-[64px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2"
            value={synthesis}
            onChange={(e) => setSynthesis(e.target.value)}
          />
        </label>
      </div>

      <label className="flex min-h-11 items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmedReview}
          onChange={(e) => setConfirmedReview(e.target.checked)}
          data-cbai-passport-confirm=""
        />
        I reviewed claim, original source, and synthesis separation — create passport
      </label>

      {error ? (
        <p className="text-sm text-amber-200" role="alert">
          {error}
        </p>
      ) : null}

      <button type="button" className={`${cbaiBtnPrimary} min-h-11 ${cbaiFocusRing}`} onClick={onCreate}>
        Confirm and create passport
      </button>

      {latest ? (
        <article className="space-y-2 rounded-xl border border-[color:var(--cbai-border-subtle)] p-3" data-cbai-passport-card="">
          <p className="font-medium text-[color:var(--cbai-text-primary)]">{latest.claimText}</p>
          <p className={`text-xs ${cbaiTextMuted}`}>
            fingerprint {latest.fingerprint} · {latest.humanVerificationStatus} · {latest.knowledgeState}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[color:var(--cbai-border-subtle)] p-2">
              <p className="text-[10px] uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">Official / source</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{latest.originalSourceContent}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--cbai-accent-primary)]/30 bg-[color:var(--cbai-surface-glass)] p-2">
              <p className="text-[10px] uppercase tracking-wider text-[color:var(--cbai-accent-primary)]">CBAI synthesis</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{latest.cbaiSynthesis || "—"}</p>
            </div>
          </div>
          {latest.humanVerificationStatus !== "human_confirmed" ? (
            <button
              type="button"
              className={`${cbaiBtnSecondarySm} min-h-11 ${cbaiFocusRing}`}
              onClick={() => confirmHumanVerification(latest.passportId, "Human verifier")}
            >
              Confirm human verification
            </button>
          ) : null}
        </article>
      ) : null}

      <ul className="space-y-2">
        {passports.slice(0, 5).map((p) => (
          <li key={p.passportId} className={`text-sm ${cbaiTextMuted}`}>
            {p.claimText} · {p.stance} · {p.humanVerificationStatus}
          </li>
        ))}
      </ul>
    </section>
  );
}
