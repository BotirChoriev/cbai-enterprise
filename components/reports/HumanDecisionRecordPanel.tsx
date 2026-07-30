"use client";

import { useEffect, useMemo, useState } from "react";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  loadMissionDecisions,
  persistConfirmedHumanDecision,
  type PersistedHumanDecision,
} from "@/lib/decision-ledger/persistence";
import { deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import { loadProjectEvidence } from "@/lib/project/project-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const COPY = {
  en: {
    eyebrow: "Human decision record",
    title: "Record your decision",
    empty: "Open a mission before recording a decision.",
    summary: "Decision summary",
    options: "Options considered — one per line",
    chosen: "Chosen option",
    rationale: "Why did you choose it?",
    confirm: "I confirm this is my decision. AI did not decide for me.",
    save: "Confirm and record",
    saved: "Decision recorded.",
    history: "Confirmed decisions",
  },
  uz: {
    eyebrow: "Inson qarori yozuvi",
    title: "Qaroringizni qayd eting",
    empty: "Qarorni qayd etishdan oldin muammoni oching.",
    summary: "Qarorning qisqa mazmuni",
    options: "Ko‘rib chiqilgan variantlar — har qatorda bittadan",
    chosen: "Tanlangan variant",
    rationale: "Nima sababdan shu variantni tanladingiz?",
    confirm: "Bu mening qarorim ekanini tasdiqlayman. AI men uchun qaror bermadi.",
    save: "Tasdiqlash va qayd etish",
    saved: "Qaror qayd etildi.",
    history: "Tasdiqlangan qarorlar",
  },
  ru: {
    eyebrow: "Запись решения человека",
    title: "Зафиксируйте ваше решение",
    empty: "Сначала откройте проблему.",
    summary: "Краткое решение",
    options: "Рассмотренные варианты — по одному в строке",
    chosen: "Выбранный вариант",
    rationale: "Почему вы выбрали этот вариант?",
    confirm: "Подтверждаю: это моё решение. AI не решал за меня.",
    save: "Подтвердить и записать",
    saved: "Решение записано.",
    history: "Подтверждённые решения",
  },
  tr: {
    eyebrow: "İnsan karar kaydı",
    title: "Kararınızı kaydedin",
    empty: "Karar kaydetmeden önce bir problem açın.",
    summary: "Karar özeti",
    options: "Değerlendirilen seçenekler — her satırda bir tane",
    chosen: "Seçilen seçenek",
    rationale: "Bu seçeneği neden seçtiniz?",
    confirm: "Bunun benim kararım olduğunu onaylıyorum. AI benim yerime karar vermedi.",
    save: "Onayla ve kaydet",
    saved: "Karar kaydedildi.",
    history: "Onaylanmış kararlar",
  },
} as const;

export default function HumanDecisionRecordPanel() {
  const { mission, revision } = useMissionContext();
  const { language } = useTranslation();
  const locale = language in COPY ? language as keyof typeof COPY : "en";
  const copy = COPY[locale];
  const [summary, setSummary] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [chosen, setChosen] = useState("");
  const [rationale, setRationale] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [history, setHistory] = useState<readonly PersistedHumanDecision[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const options = useMemo(
    () => optionsText.split("\n").map((value) => value.trim()).filter(Boolean),
    [optionsText],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const decisions = mission ? await loadMissionDecisions(mission.id) : [];
      if (!cancelled) setHistory(decisions);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [mission, revision]);

  if (!mission) {
    return <section className={cbaiGlassCard}><p>{copy.empty}</p></section>;
  }

  const save = async () => {
    setSaving(true);
    setStatus("");
    const lifecycle = deriveMissionLifecycle(mission);
    const unknowns = lifecycle.flatMap((stage) => stage.missing ? [stage.missing] : []);
    const evidenceRefs = mission.projectId
      ? loadProjectEvidence(mission.projectId).map((item) => item.evidenceRefId)
      : [];
    const result = await persistConfirmedHumanDecision({
      missionLocalId: mission.id,
      problemLocalId: mission.projectId ?? null,
      decisionSummary: summary,
      optionsConsidered: options,
      chosenOption: chosen,
      rationale,
      evidenceRefs,
      unknownsAtDecision: unknowns,
      idempotencyKey: `${mission.id}:${crypto.randomUUID()}`,
      humanConfirmed: confirmed,
    });
    setSaving(false);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setHistory((current) => [result.value, ...current]);
    setSummary("");
    setOptionsText("");
    setChosen("");
    setRationale("");
    setConfirmed(false);
    setStatus(copy.saved);
    notifyMissionDataChanged("decision");
  };

  return (
    <section className={`${cbaiGlassCard} space-y-4`} aria-labelledby="human-decision-record-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{copy.eyebrow}</p>
        <h2 id="human-decision-record-heading" className="mt-1 text-lg font-semibold text-zinc-100">{copy.title}</h2>
      </div>
      <input className="min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-zinc-100 outline-none focus:border-teal-400/60" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder={copy.summary} />
      <textarea className="min-h-24 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-zinc-100 outline-none focus:border-teal-400/60" value={optionsText} onChange={(event) => setOptionsText(event.target.value)} placeholder={copy.options} />
      <select className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-zinc-100 outline-none focus:border-teal-400/60" value={chosen} onChange={(event) => setChosen(event.target.value)}>
        <option value="">{copy.chosen}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <textarea className="min-h-24 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-zinc-100 outline-none focus:border-teal-400/60" value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder={copy.rationale} />
      <label className="flex items-start gap-3 text-sm text-zinc-300">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
        <span>{copy.confirm}</span>
      </label>
      <button
        type="button"
        disabled={saving || !confirmed || !summary.trim() || options.length < 2 || !chosen || !rationale.trim()}
        onClick={() => void save()}
        className="min-h-11 rounded-lg bg-teal-400 px-4 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.save}
      </button>
      {status ? <p className="text-sm text-amber-200" role="status">{status}</p> : null}
      {history.length > 0 ? (
        <div>
          <p className={cbaiSectionEyebrow}>{copy.history}</p>
          <ul className="mt-2 space-y-2">
            {history.map((decision) => (
              <li key={decision.id} className="rounded-lg border border-white/10 p-3 text-sm">
                <strong className="text-zinc-100">{decision.chosenOption}</strong>
                <p className="mt-1 text-zinc-400">{decision.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
