"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import { deriveCbaiGuideCycle } from "@/lib/cbai-guide/cycle";
import {
  guidePersonaForPath,
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
    cycle: ["Sense", "Structure", "Compare", "Human decide", "Act", "Verify", "Learn"],
    unknowns: "Open items",
    checkpoint: "Human checkpoint",
    noBlocker: "Ready for human review.",
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
    cycle: ["Sezish", "Tizimlash", "Taqqoslash", "Inson qarori", "Harakat", "Tekshirish", "O‘rganish"],
    unknowns: "Ochiq masalalar",
    checkpoint: "Inson nazorat nuqtasi",
    noBlocker: "Inson ko‘rib chiqishi uchun tayyor.",
  },
} as const;

const PERSONA_COPY = {
  en: {
    "al-khwarizmi": {
      role: "Sequence guide",
      name: "Al-Khwarizmi",
      open: "Open Al-Khwarizmi sequence guide",
      intro: "I organize the sequence; you evaluate the evidence and make the decision.",
      promptPrefix: "Guide me through this CBAI reasoning step:",
      activeAsset: "/guides/al-khwarizmi-guide-v1.png",
      idleAsset: "/guides/al-khwarizmi-reading-v1.png",
      idleWord: "ALGORITHM",
    },
    "norbert-wiener": {
      role: "Feedback guide",
      name: "Norbert Wiener",
      open: "Open Norbert Wiener feedback guide",
      intro: "I structure feedback, verification, and learning; you retain authority over every action.",
      promptPrefix: "Help me verify this CBAI feedback step:",
      activeAsset: "/guides/norbert-wiener-guide-v1.png",
      idleAsset: "/guides/norbert-wiener-reading-v1.png",
      idleWord: "FEEDBACK",
    },
  },
  uz: {
    "al-khwarizmi": {
      role: "Ketma-ketlik yo‘lko‘rsatuvchisi",
      name: "Al-Xorazmiy",
      open: "Al-Xorazmiy ketma-ketlik yo‘lko‘rsatuvchisini ochish",
      intro: "Men ketma-ketlikni tartiblayman; dalilni siz baholaysiz va qarorni siz berasiz.",
      promptPrefix: "CBAI fikrlash bosqichida menga yo‘l ko‘rsat:",
      activeAsset: "/guides/al-khwarizmi-guide-v1.png",
      idleAsset: "/guides/al-khwarizmi-reading-v1.png",
      idleWord: "ALGORITM",
    },
    "norbert-wiener": {
      role: "Qayta aloqa yo‘lko‘rsatuvchisi",
      name: "Norbert Wiener",
      open: "Norbert Wiener qayta aloqa yo‘lko‘rsatuvchisini ochish",
      intro: "Men qayta aloqa, tekshiruv va o‘rganishni tartiblayman; har bir harakat vakolati sizda qoladi.",
      promptPrefix: "CBAI qayta aloqa bosqichini tekshirishga yordam ber:",
      activeAsset: "/guides/norbert-wiener-guide-v1.png",
      idleAsset: "/guides/norbert-wiener-reading-v1.png",
      idleWord: "QAYTA ALOQA",
    },
  },
} as const;

export default function AlKhwarizmiGuide() {
  const pathname = usePathname();
  const { language } = useTranslation();
  const voice = useVoiceOperator();
  const { mission } = useMissionContext();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [idle, setIdle] = useState(false);
  const locale = language === "uz" ? "uz" : "en";
  const copy = COPY[locale];
  const persona = useMemo(() => guidePersonaForPath(pathname), [pathname]);
  const personaCopy = PERSONA_COPY[locale][persona];
  const stageIndex = useMemo(() => guideStageIndexForPath(pathname), [pathname]);
  const nextStage = useMemo(() => nextGuideStage(pathname), [pathname]);
  const cycle = useMemo(
    () => deriveCbaiGuideCycle(deriveMissionLifecycle(mission)),
    [mission],
  );

  useEffect(() => {
    if (open || voice.dockOpen) return;

    let timeout = window.setTimeout(() => setIdle(true), 14_000);
    const markActive = (event: Event) => {
      if (
        event.type === "pointerdown" &&
        event.target instanceof Element &&
        event.target.closest("[data-cbai-progress-guide]")
      ) {
        return;
      }
      setIdle(false);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setIdle(true), 14_000);
    };

    window.addEventListener("pointerdown", markActive, { passive: true });
    window.addEventListener("keydown", markActive);
    window.addEventListener("scroll", markActive, { passive: true });
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("scroll", markActive);
    };
  }, [open, pathname, voice.dockOpen]);

  const askGuide = () => {
    const value = question.trim();
    if (!value) return;
    voice.setTextInput(`${personaCopy.promptPrefix} ${value}`);
    voice.openDock();
    setOpen(false);
  };

  if (voice.dockOpen) return null;

  return (
    <aside
      className={`${styles.root} ${!open ? (idle ? styles.idle : styles.roaming) : ""}`}
      data-cbai-progress-guide={persona}
      data-guide-persona={persona}
      data-guide-motion={open ? "engaged" : idle ? "reading" : "roaming"}
    >
      {open ? (
        <section className={`${styles.panel} ${persona === "norbert-wiener" ? styles.feedbackPanel : ""}`} aria-label={personaCopy.open}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{personaCopy.role}</p>
              <h2 className={styles.name}>{personaCopy.name}</h2>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)}>
              {copy.close}
            </button>
          </header>
          <div className={styles.body}>
            <p className={styles.explanation}>{personaCopy.intro}</p>
            <div className={styles.progress} aria-label={`${cycle.completedCount}/${cycle.stages.length}`}>
              {cycle.stages.map((stage, index) => (
                <span
                  key={stage.id}
                  title={copy.cycle[index]}
                  className={`${styles.progressItem} ${
                    stage.status === "complete"
                      ? styles.progressItemComplete
                      : index === cycle.activeIndex
                        ? styles.progressItemActive
                        : ""
                  }`}
                />
              ))}
            </div>
            <div className={styles.cycleStatus}>
              <div>
                <span>{copy.cycle[cycle.activeIndex]}</span>
                <strong>{cycle.completedCount}/{cycle.stages.length}</strong>
              </div>
              <p>{cycle.nextBlocker ?? copy.noBlocker}</p>
              <small>
                {copy.unknowns}: {cycle.unknownCount}
                {cycle.stages[cycle.activeIndex]?.humanCheckpoint
                  ? ` · ${copy.checkpoint}`
                  : ""}
              </small>
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
        className={`${styles.launcher} ${idle ? styles.launcherIdle : ""}`}
        onClick={() => {
          setIdle(false);
          setOpen((value) => !value);
        }}
        aria-label={personaCopy.open}
        aria-expanded={open}
      >
        <Image
          className={`${styles.avatar} ${idle ? styles.avatarReading : ""}`}
          src={idle ? personaCopy.idleAsset : personaCopy.activeAsset}
          width={168}
          height={168}
          alt=""
          priority
        />
        {idle ? <span className={styles.algorithmWord}>{personaCopy.idleWord}</span> : null}
      </button>
    </aside>
  );
}
