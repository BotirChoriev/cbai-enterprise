"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
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
    liveTitle: "Situation intelligence is active",
    liveBody: "The canvas now reacts to this problem. Select a path to prepare the human decision checkpoint.",
    domainLabel: "Detected context",
    signalsLabel: "Signals structured",
    gapsLabel: "Open evidence gaps",
    pathsLabel: "Paths ready to compare",
    selectPath: "Select this path",
    selectedPath: "Selected for review",
    noPath: "Select a path before the human review step",
    heightenedReview: "Heightened human review",
    workflowAria: "CBAI decision workflow",
    workflow: ["Sense", "Structure", "Verify", "Compare", "Human Decide", "Act", "Monitor", "Learn"],
    askTitle: "Ask about this situation",
    askBody: "CBAI answers from the structured context without inventing missing evidence.",
    askPlaceholder: "Ask a follow-up question…",
    askAction: "Ask",
    askEvidence: "What evidence is missing?",
    askWhy: "Why this approach?",
    askFirst: "What should I do first?",
    answerLabel: "Contextual answer",
    evidenceAnswer: "Evidence still required",
    firstAnswer: "Start here",
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
    liveTitle: "Vaziyat intellekti faollashdi",
    liveBody: "Canvas endi shu muammoga javob bermoqda. Inson qarori bosqichini tayyorlash uchun yo‘lni tanlang.",
    domainLabel: "Aniqlangan kontekst",
    signalsLabel: "Tizimlangan signallar",
    gapsLabel: "Ochiq dalil bo‘shliqlari",
    pathsLabel: "Taqqoslashga tayyor yo‘llar",
    selectPath: "Shu yo‘lni tanlash",
    selectedPath: "Ko‘rib chiqish uchun tanlandi",
    noPath: "Inson ko‘rib chiqishidan oldin yo‘lni tanlang",
    heightenedReview: "Kuchaytirilgan inson nazorati",
    workflowAria: "CBAI qaror jarayoni",
    workflow: ["Sezish", "Tizimlash", "Tekshirish", "Taqqoslash", "Inson qarori", "Amal", "Monitoring", "O‘rganish"],
    askTitle: "Shu vaziyat haqida savol bering",
    askBody: "CBAI yetishmagan dalilni o‘ylab topmasdan, tizimlangan kontekst asosida javob beradi.",
    askPlaceholder: "Qo‘shimcha savol yozing…",
    askAction: "So‘rash",
    askEvidence: "Qaysi dalil yetishmaydi?",
    askWhy: "Nega shu yondashuv?",
    askFirst: "Avval nima qilish kerak?",
    answerLabel: "Kontekstual javob",
    evidenceAnswer: "Hali talab qilinadigan dalil",
    firstAnswer: "Shu yerdan boshlang",
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const assistance = useMemo(
    () => deriveContextualAssistance({
      text: statement,
      fileName: file?.name,
      fileType: file?.type,
      locale: language === "uz" ? "uz" : "en",
    }),
    [file, language, statement],
  );
  const [engineOverrides, setEngineOverrides] = useState<
    Partial<Record<ContextualEngineId, boolean>>
  >({});

  const engineActive = (id: ContextualEngineId) =>
    engineOverrides[id] ?? assistance.suggestedEngines.includes(id);

  function structureSituation() {
    if (!statement.trim() && !file) return;
    setStructured(true);
    setSelectedOption(null);
    setFollowUpQuestion("");
    setFollowUpAnswer(null);
    setEngineOverrides({});
  }

  function answerFollowUp(question: string) {
    const normalized = question.trim().toLocaleLowerCase(language === "uz" ? "uz" : "en");
    if (!normalized) return;

    if (/evidence|missing|source|proof|dalil|manba|yetish|isbot/.test(normalized)) {
      setFollowUpAnswer(`${c.evidenceAnswer}: ${assistance.evidenceGaps.join("; ")}.`);
    } else if (/why|reason|nega|nima uchun/.test(normalized)) {
      setFollowUpAnswer(`${assistance.intent}. ${assistance.humanBoundary}`);
    } else if (/first|start|begin|avval|birinchi|boshl/.test(normalized)) {
      setFollowUpAnswer(`${c.firstAnswer}: ${assistance.options[0]}. ${assistance.evidenceGaps[0]}.`);
    } else {
      setFollowUpAnswer(`${assistance.intent}. ${assistance.humanBoundary}`);
    }
    setFollowUpQuestion(question.trim());
  }

  function openHumanReview() {
    if (!selectedOption) return;
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
            : assistance.domain === "research"
              ? "research"
              : assistance.domain === "evidence"
                ? "evidence"
                : assistance.domain === "public_policy" || assistance.domain === "public_safety"
                  ? "governance"
                  : "general",
        status: "draft",
        priority: "normal",
        requiredInputs: file ? [file.name] : [],
        evidenceRequirements: [...assistance.evidenceGaps],
        nextAction: selectedOption,
        humanDecision: assistance.humanBoundary,
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
        [assistance.humanBoundary],
      ]
    : [];
  const domainLabel =
    language === "uz"
      ? ({
          research: "Tadqiqot",
          education: "Ta’lim",
          healthcare: "Sog‘liqni saqlash",
          public_policy: "Davlat siyosati",
          public_safety: "Jamoat xavfsizligi",
          creative: "Ijod",
          operations: "Operatsiyalar",
          evidence: "Dalil va tekshiruv",
          public_interest: "Jamoat manfaati",
          engineering: "Muhandislik",
          agriculture: "Qishloq xo‘jaligi",
          business: "Biznes",
          general: "Umumiy",
        } as const)[assistance.domain]
      : ({
          research: "Research",
          education: "Education",
          healthcare: "Healthcare",
          public_policy: "Public policy",
          public_safety: "Public safety",
          creative: "Creative work",
          operations: "Operations",
          evidence: "Evidence and verification",
          public_interest: "Public interest",
          engineering: "Engineering",
          agriculture: "Agriculture",
          business: "Business",
          general: "General",
        } as const)[assistance.domain];

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
                setSelectedOption(null);
                setFollowUpAnswer(null);
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
                      setSelectedOption(null);
                      setFollowUpAnswer(null);
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
              <section className={styles.livePulse} aria-live="polite" data-state="active">
                <div className={styles.liveSignal} aria-hidden="true"><span /></div>
                <div className={styles.liveCopy}>
                  <strong>{c.liveTitle}</strong>
                  <span>{c.liveBody}</span>
                </div>
                <dl className={styles.liveMetrics}>
                  <div><dt>{c.domainLabel}</dt><dd>{domainLabel}</dd></div>
                  <div><dt>{c.signalsLabel}</dt><dd>{assistance.signals.length}</dd></div>
                  <div><dt>{c.gapsLabel}</dt><dd>{assistance.evidenceGaps.length}</dd></div>
                  <div><dt>{c.pathsLabel}</dt><dd>{assistance.options.length}</dd></div>
                </dl>
                {assistance.riskLevel === "heightened" ? (
                  <div className={styles.riskBanner}>
                    <strong>{c.heightenedReview}</strong>
                    <span>{assistance.humanBoundary}</span>
                  </div>
                ) : null}
              </section>

              <section className={styles.followUp} aria-labelledby="living-problem-follow-up-title">
                <div className={styles.followUpIntro}>
                  <h2 id="living-problem-follow-up-title">{c.askTitle}</h2>
                  <p>{c.askBody}</p>
                </div>
                <div className={styles.quickQuestions}>
                  {[c.askEvidence, c.askWhy, c.askFirst].map((question) => (
                    <button type="button" onClick={() => answerFollowUp(question)} key={question}>
                      {question}
                    </button>
                  ))}
                </div>
                <form
                  className={styles.followUpForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    answerFollowUp(followUpQuestion);
                  }}
                >
                  <input
                    value={followUpQuestion}
                    onChange={(event) => setFollowUpQuestion(event.target.value)}
                    placeholder={c.askPlaceholder}
                    aria-label={c.askPlaceholder}
                  />
                  <button type="submit" disabled={!followUpQuestion.trim()}>{c.askAction}</button>
                </form>
                {followUpAnswer ? (
                  <div className={styles.followUpAnswer} aria-live="polite">
                    <strong>{c.answerLabel}</strong>
                    <p>{followUpAnswer}</p>
                  </div>
                ) : null}
              </section>

              <section className={styles.canvas} aria-label="Living Problem Canvas" data-active="true">
                {c.steps.map(([title, prompt], index) => (
                  <article className={styles.canvasStep} style={{ "--step-delay": `${index * 90}ms` } as CSSProperties} key={title}>
                    <span className={styles.stepIndex}>0{index + 1}</span>
                    <h2>{title}</h2>
                    <p>{prompt}</p>
                    {index === 3 ? (
                      <div className={styles.pathList}>
                        {stepItems[index].map((item) => {
                          const selected = selectedOption === item;
                          return (
                            <button
                              type="button"
                              className={styles.pathOption}
                              data-selected={selected}
                              aria-pressed={selected}
                              onClick={() => setSelectedOption(item)}
                              key={item}
                            >
                              <span>{item}</span>
                              <small>{selected ? c.selectedPath : c.selectPath}</small>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <ul>
                        {stepItems[index].map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
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
                  <p>{selectedOption ? `${c.selectedPath}: ${selectedOption}` : c.noPath}</p>
                  <button type="button" className={styles.reviewButton} disabled={!selectedOption} onClick={openHumanReview}>
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
              {structured ? <li>{selectedOption ?? c.noPath}</li> : null}
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

        <nav className={styles.workflow} aria-label={c.workflowAria}>
          {c.workflow.map(
            (stage, index) => (
              <span
                className={
                  index === 4
                    ? `${styles.human} ${selectedOption ? styles.humanReady : ""}`
                    : index < (structured ? 4 : 1)
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
