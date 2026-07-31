"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  deriveContextualAssistance,
  type ContextualEngineId,
} from "@/lib/intelligence-os/contextual-assistance";
import styles from "./LivingProblemHome.module.css";

const engineOrder: readonly ContextualEngineId[] = ["algorithm", "cybernetics", "ai"];

const copy = {
  en: {
    eyebrow: "Collaborative Intelligence Operating System",
    title: "Bring the situation. Build the decision together.",
    subtitle:
      "Speak naturally or add material. CBAI turns it into a verified, reviewable course of action without replacing human judgment.",
    authority: "Human authority",
    authorityNote: "Always highest",
    placeholder:
      "Describe what you need to understand, improve, or create. For example: My biology thesis results conflict with the published method…",
    open: "Structure this situation",
    voice: "Voice",
    document: "Document",
    image: "Image",
    video: "Video",
    sensor: "Sensor",
    device: "Device",
    attached: "Attached locally",
    privacy: "Nothing is uploaded or acted on until you confirm the next step.",
    emptyTitle: "Your Problem Space will form here",
    emptyBody: "Add a situation or material. CBAI will reveal only the capabilities this context needs.",
    steps: [
      ["Human intent", "What outcome matters?"],
      ["Current signals", "What was observed?"],
      ["Evidence & gaps", "What is verified or missing?"],
      ["Options", "What paths can be compared?"],
      ["Human gate", "Review and approve the next step"],
    ],
    algorithm: ["Algorithm", "Structures sequence, rules, and the next step"],
    cybernetics: ["Cybernetics", "Watches feedback, deviation, and adaptation"],
    ai: ["AI", "Verifies evidence, exposes contradictions, and builds scenarios"],
    suggested: "Suggested for this situation",
    humanReview: "Human review",
    humanReviewBody: "Choose the supporting engines, then review the draft before anything is created.",
    review: "Review Problem draft",
    voiceTitle: "Voice Operator",
    voiceReady: "Ready to hear the situation and navigate the work.",
    speak: "Speak to CBAI",
    doing: "What CBAI is doing now",
    noAction: "No consequential action taken",
    waiting: "Waiting for human purpose",
    structured: "Context structured locally",
    control: "Human control",
    controlBody: "You review every consequential step.",
    guides: "Contextual guides",
    processGuide: "Process · called when sequence is needed",
    feedbackGuide: "Feedback · called when monitoring is needed",
  },
  uz: {
    eyebrow: "Hamkorlikdagi intellekt operatsion tizimi",
    title: "Vaziyatni olib keling. Qarorni birga ishlab chiqing.",
    subtitle:
      "Tabiiy gapiring yoki material qo‘shing. CBAI inson hukmini almashtirmasdan uni tekshiriladigan va ko‘rib chiqiladigan ish jarayoniga aylantiradi.",
    authority: "Inson vakolati",
    authorityNote: "Har doim eng yuqori",
    placeholder:
      "Nimani tushunish, yaxshilash yoki yaratish kerakligini ayting. Masalan: biologiya bo‘yicha PhD natijalarim e’lon qilingan metodga zid…",
    open: "Vaziyatni tizimlashtirish",
    voice: "Ovoz",
    document: "Hujjat",
    image: "Rasm",
    video: "Video",
    sensor: "Sensor",
    device: "Qurilma",
    attached: "Lokal biriktirildi",
    privacy: "Keyingi qadamni tasdiqlamaguningizcha hech narsa yuklanmaydi yoki bajarilmaydi.",
    emptyTitle: "Problem Space shu yerda shakllanadi",
    emptyBody: "Vaziyat yoki material kiriting. CBAI faqat shu kontekstga kerakli imkoniyatlarni ochadi.",
    steps: [
      ["Inson maqsadi", "Qaysi natija muhim?"],
      ["Joriy signallar", "Nima kuzatildi?"],
      ["Dalil va bo‘shliqlar", "Nima tekshirilgan yoki yetishmaydi?"],
      ["Variantlar", "Qaysi yo‘llarni taqqoslash mumkin?"],
      ["Inson darvozasi", "Keyingi qadamni ko‘rib chiqing va tasdiqlang"],
    ],
    algorithm: ["Algoritm", "Ketma-ketlik, qoidalar va keyingi qadamni tuzadi"],
    cybernetics: ["Kibernetika", "Teskari aloqa, og‘ish va moslashishni kuzatadi"],
    ai: ["AI", "Dalillarni tekshiradi, ziddiyatlarni ochadi va ssenariy tuzadi"],
    suggested: "Bu vaziyat uchun tavsiya qilindi",
    humanReview: "Inson ko‘rib chiqishi",
    humanReviewBody: "Yordamchi dvigatellarni tanlang, so‘ng biror ish yaratilishidan oldin draftni tekshiring.",
    review: "Muammo draftini ko‘rish",
    voiceTitle: "Ovoz operatori",
    voiceReady: "Vaziyatni eshitish va ish jarayonini boshqarishga tayyor.",
    speak: "CBAI bilan gaplashish",
    doing: "CBAI hozir nima qilmoqda",
    noAction: "Muhim amal bajarilmadi",
    waiting: "Inson maqsadi kutilmoqda",
    structured: "Kontekst lokal tizimlashtirildi",
    control: "Inson nazorati",
    controlBody: "Har bir muhim qadamni siz ko‘rib chiqasiz.",
    guides: "Kontekstual yo‘lboshchilar",
    processGuide: "Jarayon · ketma-ketlik kerak bo‘lganda chaqiriladi",
    feedbackGuide: "Teskari aloqa · monitoring kerak bo‘lganda chaqiriladi",
  },
} as const;

function Icon({ id }: { id: ContextualEngineId }) {
  if (id === "ai") return <span className={styles.engineIcon}>✦</span>;
  return (
    <Image
      src={
        id === "algorithm"
          ? "/guides/al-khwarizmi-guide-v1.png"
          : "/guides/norbert-wiener-guide-v1.png"
      }
      width={48}
      height={48}
      alt=""
    />
  );
}

export default function LivingProblemHome() {
  const { language } = useTranslation();
  const c = language === "uz" ? copy.uz : copy.en;
  const voice = useVoiceOperator();
  const operationalObjects = useOperationalObjects();
  const [statement, setStatement] = useState("");
  const [file, setFile] = useState<{ name: string; type: string } | null>(null);
  const [structured, setStructured] = useState(false);
  const assistance = useMemo(
    () => deriveContextualAssistance({ text: statement, fileName: file?.name, fileType: file?.type }),
    [file, statement],
  );
  const [engineOverrides, setEngineOverrides] = useState<
    Partial<Record<ContextualEngineId, boolean>>
  >({});

  const engineActive = (id: ContextualEngineId) =>
    engineOverrides[id] ?? assistance.suggestedEngines.includes(id);

  function structureSituation() {
    if (!statement.trim() && !file) return;
    setStructured(true);
    setEngineOverrides({});
  }

  function openHumanReview() {
    const selected = engineOrder.filter(engineActive);
    const objective = statement.trim() || `Review attached material: ${file?.name ?? "material"}`;
    operationalObjects.openComposer(
      {
        type: file?.type === "application/pdf" ? "pdf_review" : "research_question",
        title: objective.slice(0, 90),
        summary: objective,
        objective,
        rationale: "Context was structured by CBAI; human confirmation is required.",
        expectedOutcome: "A verified, reviewable course of action selected by the human decision owner.",
        domain:
          assistance.domain === "business"
            ? "companies"
            : assistance.domain === "general"
              ? "general"
              : "research",
        status: "draft",
        priority: "normal",
        requiredInputs: file ? [file.name] : [],
        evidenceRequirements: [...assistance.evidenceGaps],
        nextAction: assistance.options[0] ?? "Review the structured Problem",
        humanDecision: "Confirm the objective, supporting engines, and next step.",
        knownInformation: [...assistance.signals],
        missingInformation: [...assistance.evidenceGaps],
        assumptions: [],
        humanApprovalRequired: true,
        relatedObjectIds: [],
        sourceCommand: statement,
        locale: language,
        provenance: {
          source: "manual",
          locale: language,
          inferredFields: ["domain", "objective", "evidenceRequirements", "nextAction"],
        },
      },
      ["domain", "objective", "evidenceRequirements", "nextAction", ...selected.map((id) => `engine:${id}`)],
      "manual",
    );
  }

  const stepItems = structured
    ? [
        [assistance.intent],
        assistance.signals,
        assistance.evidenceGaps,
        assistance.options,
        [c.humanReviewBody],
      ]
    : [];

  return (
    <section className={styles.home} data-living-problem-home="true">
      <div className={styles.shell}>
        <div className={styles.main}>
          <header className={styles.intro}>
            <div>
              <p className={styles.eyebrow}>{c.eyebrow}</p>
              <h1>{c.title}</h1>
              <p>{c.subtitle}</p>
            </div>
            <div className={styles.authority}>
              <strong>◈ {c.authority}</strong>
              <span>{c.authorityNote}</span>
            </div>
          </header>

          <section className={styles.composer} aria-label={c.open}>
            <textarea
              value={statement}
              onChange={(event) => {
                setStatement(event.target.value);
                setStructured(false);
              }}
              placeholder={c.placeholder}
              aria-label={c.placeholder}
            />
            <div className={styles.composerBar}>
              <div className={styles.inputModes}>
                <button type="button" className={styles.mode} onClick={voice.openDock}>
                  ◉ {c.voice}
                </button>
                <label className={styles.fileLabel}>
                  ▤ {c.document}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,image/*,video/*"
                    onChange={(event) => {
                      const selected = event.target.files?.[0];
                      setFile(selected ? { name: selected.name, type: selected.type } : null);
                      setStructured(false);
                    }}
                  />
                </label>
                <span className={styles.mode}>▧ {c.image}</span>
                <span className={styles.mode}>▻ {c.video}</span>
                <span className={styles.mode}>◌ {c.sensor}</span>
                <span className={styles.mode}>⌁ {c.device}</span>
              </div>
              <button
                type="button"
                className={styles.analyzeButton}
                disabled={!statement.trim() && !file}
                onClick={structureSituation}
              >
                {c.open} →
              </button>
            </div>
            {file ? (
              <p className={styles.fileNotice}>
                {c.attached}: <strong>{file.name}</strong>. {c.privacy}
              </p>
            ) : null}
          </section>

          {structured ? (
            <>
              <section className={styles.canvas} aria-label="Living Problem Canvas">
                {c.steps.map(([title, prompt], index) => (
                  <article className={styles.canvasStep} key={title}>
                    <span className={styles.stepIndex}>0{index + 1}</span>
                    <h2>{title}</h2>
                    <p>{prompt}</p>
                    <ul>
                      {stepItems[index].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>

              <section className={styles.engineArea} aria-label="Contextual supporting engines">
                <div className={styles.engineList}>
                  {engineOrder.map((id) => {
                    const active = engineActive(id);
                    const [title, description] = c[id];
                    return (
                      <article className={styles.engine} data-active={active} key={id}>
                        <Icon id={id} />
                        <div>
                          <strong>{title}</strong>
                          <p>{description}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.engineToggle}
                          aria-pressed={active}
                          aria-label={`${title}: ${c.suggested}`}
                          onClick={() =>
                            setEngineOverrides((current) => ({ ...current, [id]: !active }))
                          }
                        />
                      </article>
                    );
                  })}
                </div>
                <aside className={styles.humanGate}>
                  <strong>{c.humanReview}</strong>
                  <p>{c.humanReviewBody}</p>
                  <button type="button" className={styles.reviewButton} onClick={openHumanReview}>
                    {c.review} →
                  </button>
                </aside>
              </section>
            </>
          ) : (
            <section className={styles.emptyCanvas}>
              <div>
                <strong>{c.emptyTitle}</strong>
                <span>{c.emptyBody}</span>
              </div>
            </section>
          )}
        </div>

        <aside className={styles.rail}>
          <section className={styles.railCard}>
            <h2>{c.voiceTitle}</h2>
            <p>{c.voiceReady}</p>
            <button type="button" className={styles.voiceButton} onClick={voice.openDock}>
              ◉ {c.speak}
            </button>
          </section>

          <section className={styles.railCard}>
            <h2>{c.doing}</h2>
            <ul className={styles.statusList}>
              <li>{structured ? c.structured : c.waiting}</li>
              <li>{c.noAction}</li>
              <li>{c.controlBody}</li>
            </ul>
          </section>

          <section className={styles.railCard}>
            <h2>{c.guides}</h2>
            <div className={styles.guide}>
              <Image src="/guides/al-khwarizmi-guide-v1.png" width={48} height={48} alt="" />
              <div>
                <strong>Al-Khwarizmi</strong>
                <span>{c.processGuide}</span>
              </div>
            </div>
            <div className={styles.guide}>
              <Image src="/guides/norbert-wiener-guide-v1.png" width={48} height={48} alt="" />
              <div>
                <strong>Norbert Wiener</strong>
                <span>{c.feedbackGuide}</span>
              </div>
            </div>
          </section>

          <section className={`${styles.railCard} ${styles.authority}`}>
            <h2>{c.control}</h2>
            <p>{c.controlBody}</p>
          </section>
        </aside>

        <nav className={styles.workflow} aria-label="CBAI decision workflow">
          {["Sense", "Structure", "Verify", "Compare", "Human Decide", "Act", "Monitor", "Learn"].map(
            (stage, index) => (
              <span
                className={
                  stage === "Human Decide"
                    ? styles.human
                    : index < (structured ? 2 : 1)
                      ? styles.active
                      : undefined
                }
                key={stage}
              >
                {stage}
              </span>
            ),
          )}
        </nav>
      </div>
    </section>
  );
}
