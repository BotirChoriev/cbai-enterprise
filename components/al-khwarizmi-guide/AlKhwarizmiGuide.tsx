"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  GUIDE_STAGES,
  guideStageIndexForPath,
  nextGuideStage,
} from "@/lib/al-khwarizmi-guide/progress";
import styles from "./AlKhwarizmiGuide.module.css";

const COPY = {
  en: {
    role: "Progress guide",
    name: "Al-Khwarizmi",
    open: "Open Al-Khwarizmi progress guide",
    close: "Close",
    intro:
      "I organize the sequence; you evaluate the evidence and make the decision.",
    current: ["Define the problem", "Verify evidence", "Resolve contradictions", "Compare scenarios", "Record the human decision", "Monitor change"],
    detail: [
      "Clarify the objective, owner, scope, and unknowns.",
      "Inspect sources, provenance, reliability, and missing information.",
      "Surface claims that cannot all be true at the same time.",
      "Compare consequences, assumptions, risks, and uncertainty.",
      "Document the rationale without transferring authority to AI.",
      "Set review triggers and watch for evidence that changes the decision.",
    ],
    next: "Open next function",
    ask: "Ask",
    placeholder: "What do you not understand?",
    promptPrefix: "Guide me through this CBAI step:",
  },
  uz: {
    role: "Progress yo‘lko‘rsatuvchi",
    name: "Al-Xorazmiy",
    open: "Al-Xorazmiy progress yo‘lko‘rsatuvchisini ochish",
    close: "Yopish",
    intro:
      "Men ketma-ketlikni tartiblayman; dalilni siz baholaysiz va qarorni siz berasiz.",
    current: ["Muammoni aniqlash", "Dalilni tekshirish", "Qarama-qarshilikni yechish", "Ssenariylarni taqqoslash", "Inson qarorini qayd etish", "O‘zgarishni kuzatish"],
    detail: [
      "Maqsad, ega, doira va noma’lumlarni aniqlang.",
      "Manba, kelib chiqish, ishonchlilik va yetishmayotgan ma’lumotni tekshiring.",
      "Bir vaqtda to‘g‘ri bo‘la olmaydigan da’volarni ko‘rsating.",
      "Oqibat, taxmin, risk va noaniqlikni taqqoslang.",
      "Vakolatni AI’ga bermasdan inson asosini hujjatlashtiring.",
      "Tekshiruv triggerlarini belgilang va qarorni o‘zgartiradigan dalilni kuzating.",
    ],
    next: "Keyingi funksiyani ochish",
    ask: "So‘rash",
    placeholder: "Qaysi joyini tushunmadingiz?",
    promptPrefix: "CBAI’ning ushbu bosqichida menga yo‘l ko‘rsat:",
  },
} as const;

export default function AlKhwarizmiGuide() {
  const pathname = usePathname();
  const { language } = useTranslation();
  const voice = useVoiceOperator();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const locale = language === "uz" ? "uz" : "en";
  const copy = COPY[locale];
  const stageIndex = useMemo(() => guideStageIndexForPath(pathname), [pathname]);
  const nextStage = useMemo(() => nextGuideStage(pathname), [pathname]);

  const askGuide = () => {
    const value = question.trim();
    if (!value) return;
    voice.setTextInput(`${copy.promptPrefix} ${value}`);
    voice.openDock();
    setOpen(false);
  };

  if (voice.dockOpen) return null;

  return (
    <aside className={styles.root} data-cbai-progress-guide="al-khwarizmi">
      {open ? (
        <section className={styles.panel} aria-label={copy.open}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{copy.role}</p>
              <h2 className={styles.name}>{copy.name}</h2>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)}>
              {copy.close}
            </button>
          </header>
          <div className={styles.body}>
            <p className={styles.explanation}>{copy.intro}</p>
            <div className={styles.progress} aria-label={`${stageIndex + 1}/${GUIDE_STAGES.length}`}>
              {GUIDE_STAGES.map((stage, index) => (
                <span
                  key={stage.id}
                  className={`${styles.progressItem} ${index <= stageIndex ? styles.progressItemActive : ""}`}
                />
              ))}
            </div>
            <div className={styles.stage}>
              <strong>{copy.current[stageIndex]}</strong>
              <span>{copy.detail[stageIndex]}</span>
            </div>
            <div className={styles.actions}>
              <Link className={styles.next} href={nextStage.href} onClick={() => setOpen(false)}>
                {copy.next} →
              </Link>
              <button type="button" className={styles.askButton} onClick={() => voice.openDock()}>
                {locale === "uz" ? "Ovoz" : "Voice"}
              </button>
            </div>
            <div className={styles.questionRow}>
              <input
                className={styles.question}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") askGuide();
                }}
                placeholder={copy.placeholder}
                aria-label={copy.placeholder}
              />
              <button type="button" className={styles.askButton} onClick={askGuide}>
                {copy.ask}
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((value) => !value)}
        aria-label={copy.open}
        aria-expanded={open}
      >
        <Image
          className={styles.avatar}
          src="/guides/al-khwarizmi-guide-v1.png"
          width={168}
          height={168}
          alt=""
          priority
        />
      </button>
    </aside>
  );
}
