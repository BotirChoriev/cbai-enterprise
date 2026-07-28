"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import {
  createLocalPdfMetadata,
  validatePdfFile,
  type LocalPdfMetadata,
} from "@/lib/pdf-ingestion/local-pdf-ingestion";
import { validateDocumentUploadCandidate } from "@/lib/document-intake/document-intake";
import {
  extractPdfLocally,
  type BrowserPdfExtraction,
} from "@/lib/pdf-ingestion/browser-pdf-extraction";
import {
  ARTIFACT_ROOM_STAGES,
  confirmArtifactUnderstanding,
  createArtifactUnderstandingDraft,
  saveArtifactRoom,
  type ArtifactUnderstandingDraft,
  type ConfirmedArtifactRoom,
} from "@/lib/artifact-workspace/artifact-workspace";
import {
  uploadArtifactToQuarantine,
  type ArtifactCloudReceipt,
} from "@/lib/artifact-workspace/cloud-artifact-storage";

const COPY = {
  en: {
    eyebrow: "ARTIFACT INTELLIGENCE · PHD PILOT",
    title: "Turn one document into a living research room.",
    intro: "Add a PDF and explain what you want to develop. CBAI prepares the work structure; nothing advances until you confirm its understanding.",
    add: "1 · Add material",
    understand: "2 · Review CBAI understanding",
    room: "3 · Work together",
    file: "Choose PhD or research PDF",
    titleField: "Working title",
    domain: "Research domain",
    purpose: "What do you want to improve or discover?",
    question: "Main research question",
    inspect: "Inspect locally",
    inspecting: "Inspecting…",
    voice: "Explain by voice",
    invalid: "Choose a valid PDF. The file must be non-empty, within the limit, and contain a PDF signature.",
    localOnly: "Privacy boundary: only file metadata and checksum are inspected locally. File bytes are not uploaded or stored.",
    reviewTitle: "This is what CBAI understood",
    source: "Verified material identity",
    known: "Known from you",
    unknown: "Still unknown",
    modules: "Suggested research room",
    confirm: "Yes, open this room",
    change: "Change my description",
    human: "Human checkpoint",
    humanBody: "Confirm the title, purpose, question, and room modules. CBAI cannot proceed on its own.",
    active: "Virtual Research Room",
    activeBody: "The room is active. Start with evidence; compare alternatives before recording a human decision.",
    original: "Original file",
    checksum: "SHA-256 identity",
    noExtraction: "This module is not yet human-reviewed. CBAI will not treat extracted text, citations, figures, or formulas as verified evidence.",
    evidence: "Open Evidence",
    work: "Create structured work",
    ask: "Ask Al-Khwarizmi / Voice Operator",
    archive: "Upload to secure quarantine",
    archiving: "Uploading securely…",
    quarantined: "Uploaded to private quarantine. Download and processing stay blocked until an external malware scanner returns clean.",
    archiveError: "Secure upload failed. No readiness claim was made.",
    archiveNeedsCloud: "Cloud sign-in is required for private quarantine upload. Local extraction remains available.",
    extracted: "Local document extraction",
    pages: "pages",
    characters: "characters",
    headings: "Detected section labels",
    scanned: "This appears to be an image/scanned PDF. OCR is required before textual analysis.",
    extractionLimit: "Extraction was limited for browser safety; the limitation is preserved in provenance.",
  },
  uz: {
    eyebrow: "ARTEFAKT INTELLEKTI · PHD PILOT",
    title: "Bitta hujjatni jonli ilmiy ish xonasiga aylantiring.",
    intro: "PDFni kiriting va nimani rivojlantirmoqchi ekaningizni ayting. CBAI ish tuzilmasini tayyorlaydi; siz tasdiqlamaguncha jarayon davom etmaydi.",
    add: "1 · Material kiriting",
    understand: "2 · CBAI tushunganini tekshiring",
    room: "3 · Birga ishlang",
    file: "PhD yoki ilmiy PDF tanlang",
    titleField: "Ishchi nom",
    domain: "Ilmiy yo‘nalish",
    purpose: "Nimani rivojlantirmoqchi yoki aniqlamoqchisiz?",
    question: "Asosiy tadqiqot savoli",
    inspect: "Mahalliy tekshirish",
    inspecting: "Tekshirilmoqda…",
    voice: "Ovoz bilan tushuntirish",
    invalid: "Haqiqiy PDF tanlang. Fayl bo‘sh bo‘lmasligi, limitdan oshmasligi va PDF imzosiga ega bo‘lishi kerak.",
    localOnly: "Maxfiylik chegarasi: faqat metadata va checksum qurilmangizda tekshiriladi. Fayl baytlari yuklanmaydi va saqlanmaydi.",
    reviewTitle: "CBAI sizni mana shunday tushundi",
    source: "Tasdiqlangan material identifikatori",
    known: "Sizdan ma’lum",
    unknown: "Hali noma’lum",
    modules: "Taklif qilingan ilmiy xona",
    confirm: "Ha, shu xonani oching",
    change: "Tavsifni o‘zgartiraman",
    human: "Inson nazorat nuqtasi",
    humanBody: "Nom, maqsad, savol va xona modullarini tasdiqlang. CBAI o‘zi keyingi bosqichga o‘ta olmaydi.",
    active: "Virtual ilmiy ish xonasi",
    activeBody: "Xona faol. Avval dalillarni yig‘ing; inson qarorini qayd etishdan oldin variantlarni taqqoslang.",
    original: "Asl fayl",
    checksum: "SHA-256 identifikator",
    noExtraction: "Bu modul hali inson tomonidan tekshirilmagan. CBAI ajratilgan matn, iqtibos, rasm yoki formulalarni tasdiqlangan dalil deb olmaydi.",
    evidence: "Dalillarni ochish",
    work: "Tizimli ish yaratish",
    ask: "Al-Xorazmiy / Ovozli operatordan so‘rash",
    archive: "Xavfsiz karantinga yuklash",
    archiving: "Xavfsiz yuklanmoqda…",
    quarantined: "Private karantinga yuklandi. Tashqi malware scanner «clean» javobini bermaguncha o‘qish va processing yopiq qoladi.",
    archiveError: "Xavfsiz yuklash bajarilmadi. Tizim tayyor deb da’vo qilmadi.",
    archiveNeedsCloud: "Private karantinga yuklash uchun Cloud Account kerak. Lokal extraction ishlashda davom etadi.",
    extracted: "Qurilmadagi hujjat extraction’i",
    pages: "sahifa",
    characters: "belgi",
    headings: "Aniqlangan bo‘lim nomlari",
    scanned: "Bu rasm/skanerlangan PDFga o‘xshaydi. Matnli tahlildan oldin OCR kerak.",
    extractionLimit: "Brauzer xavfsizligi uchun extraction cheklandi; bu cheklov provenance’da saqlandi.",
  },
} as const;

export default function ArtifactResearchRoom() {
  const { language } = useTranslation();
  const copy = COPY[language === "uz" ? "uz" : "en"];
  const voice = useVoiceOperator();
  const auth = useAuth();
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [purpose, setPurpose] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<LocalPdfMetadata | null>(null);
  const [draft, setDraft] = useState<ArtifactUnderstandingDraft | null>(null);
  const [room, setRoom] = useState<ConfirmedArtifactRoom | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudReceipt, setCloudReceipt] = useState<ArtifactCloudReceipt | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<BrowserPdfExtraction | null>(null);

  function openVoice(prompt: string) {
    voice.setTextInput(prompt);
    voice.openDock();
  }

  async function inspect() {
    setError(null);
    const basic = validatePdfFile(file);
    if (!basic.ok || !file) {
      setError(copy.invalid);
      return;
    }
    setBusy(true);
    try {
      const header = await file.slice(0, 8).arrayBuffer();
      const validated = validateDocumentUploadCandidate({
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: file.type || null,
        headerBytes: header,
      });
      if (!validated.ok) {
        setError(copy.invalid);
        return;
      }
      const nextMetadata = await createLocalPdfMetadata(file, {
        originalLanguage: language,
      });
      const nextExtraction = await extractPdfLocally(file);
      const enrichedMetadata: LocalPdfMetadata = {
        ...nextMetadata,
        pageCount: nextExtraction.pageCount,
        extractionStatus: nextExtraction.likelyScannedDocument
          ? "scanned_document_unsupported"
          : "metadata_ready",
        limitations: [
          "Text was extracted locally in the browser and was not uploaded by this step.",
          ...(nextExtraction.truncated
            ? ["Local extraction was truncated at the documented browser safety limit."]
            : []),
          ...(nextExtraction.likelyScannedDocument
            ? ["The PDF contains too little extractable text and requires OCR."]
            : []),
        ],
      };
      const nextDraft = createArtifactUnderstandingDraft({
        title,
        domain,
        purpose,
        researchQuestion: question,
        material: enrichedMetadata,
      });
      setMetadata(enrichedMetadata);
      setExtraction(nextExtraction);
      setDraft(nextDraft);
    } catch {
      setError(copy.invalid);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(145deg,#061426_0%,#0a2332_55%,#07111f_100%)] text-slate-50 shadow-2xl" data-cbai-artifact-room="">
      <header className="relative overflow-hidden border-b border-cyan-200/15 px-5 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,rgba(34,211,238,.16),transparent_68%)]" />
        <p className="relative text-xs font-semibold tracking-[.28em] text-cyan-300">{copy.eyebrow}</p>
        <h2 className="relative mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h2>
        <p className="relative mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{copy.intro}</p>
        <ol className="relative mt-6 grid gap-2 text-xs sm:grid-cols-3">
          {[copy.add, copy.understand, copy.room].map((label, index) => (
            <li key={label} className={`rounded-full border px-4 py-2 ${room || (draft && index < 2) || (!draft && index === 0) ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-500"}`}>{label}</li>
          ))}
        </ol>
      </header>

      {!draft && !room ? (
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_.9fr] lg:p-10">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm" htmlFor={`${id}-file`}>
              {copy.file}
              <input id={`${id}-file`} type="file" accept="application/pdf,.pdf" className="min-h-14 rounded-xl border border-dashed border-cyan-300/40 bg-slate-950/40 p-4" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(null); }} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm" htmlFor={`${id}-title`}>{copy.titleField}<input id={`${id}-title`} value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-12 rounded-xl border border-white/15 bg-slate-950/50 px-4" /></label>
              <label className="grid gap-2 text-sm" htmlFor={`${id}-domain`}>{copy.domain}<input id={`${id}-domain`} value={domain} onChange={(event) => setDomain(event.target.value)} className="min-h-12 rounded-xl border border-white/15 bg-slate-950/50 px-4" /></label>
            </div>
            <label className="grid gap-2 text-sm" htmlFor={`${id}-purpose`}>{copy.purpose}<textarea id={`${id}-purpose`} value={purpose} onChange={(event) => setPurpose(event.target.value)} className="min-h-24 rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3" /></label>
            <label className="grid gap-2 text-sm" htmlFor={`${id}-question`}>{copy.question}<textarea id={`${id}-question`} value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-20 rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3" data-cbai-artifact-question="" /></label>
            {error ? <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={inspect} disabled={busy} className="min-h-12 rounded-xl bg-cyan-300 px-5 font-semibold text-slate-950 disabled:opacity-50" data-cbai-artifact-inspect="">{busy ? copy.inspecting : copy.inspect}</button>
              <button type="button" onClick={() => openVoice(`${copy.purpose} ${purpose} ${copy.question} ${question}`.trim())} className="min-h-12 rounded-xl border border-cyan-300/35 px-5 text-cyan-100">{copy.voice}</button>
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
            <div className="grid place-items-center rounded-2xl border border-cyan-300/15 bg-[radial-gradient(circle,rgba(34,211,238,.18),transparent_65%)] py-10" aria-hidden="true">
              <span className="text-7xl">⌬</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">{copy.localOnly}</p>
          </aside>
        </div>
      ) : null}

      {draft && !room ? (
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2 lg:p-10" data-cbai-understanding-checkpoint="">
          <article className="rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">{copy.reviewTitle}</p>
            <h3 className="mt-3 text-2xl font-semibold">{draft.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{draft.domain}</p>
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">{copy.known}</h4>
            <ul className="mt-2 space-y-2 text-sm">{draft.knownFromHuman.map((item) => <li key={item}>✓ {item}</li>)}</ul>
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-amber-300">{copy.unknown}</h4>
            <ul className="mt-2 space-y-2 text-sm text-amber-100">{draft.unknowns.map((item) => <li key={item}>? {item}</li>)}</ul>
            {extraction ? (
              <div className="mt-6 rounded-xl border border-emerald-300/25 bg-emerald-300/5 p-4" data-cbai-local-pdf-extraction="">
                <h4 className="font-semibold text-emerald-200">{copy.extracted}</h4>
                <p className="mt-2 text-sm text-slate-200">
                  {extraction.pageCount} {copy.pages} · {extraction.characterCount.toLocaleString()} {copy.characters}
                </p>
                {extraction.detectedHeadings.length ? (
                  <p className="mt-2 text-xs text-slate-300">
                    {copy.headings}: {extraction.detectedHeadings.join(", ")}
                  </p>
                ) : null}
                {extraction.likelyScannedDocument ? <p className="mt-2 text-xs text-amber-200">{copy.scanned}</p> : null}
                {extraction.truncated ? <p className="mt-2 text-xs text-amber-200">{copy.extractionLimit}</p> : null}
              </div>
            ) : null}
          </article>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
              <h4 className="font-semibold">{copy.source}</h4>
              <dl className="mt-3 space-y-3 text-sm"><div><dt className="text-slate-400">{copy.original}</dt><dd>{metadata?.fileName}</dd></div><div><dt className="text-slate-400">{copy.checksum}</dt><dd className="break-all font-mono text-xs">{metadata?.checksumSha256}</dd></div></dl>
              <h4 className="mt-6 font-semibold">{copy.modules}</h4>
              <div className="mt-3 flex flex-wrap gap-2">{draft.suggestedModules.map((module) => <span key={module} className="rounded-full border border-cyan-300/25 px-3 py-1 text-xs text-cyan-100">{module}</span>)}</div>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5" data-human-decision-required="true">
              <h4 className="font-semibold text-amber-100">{copy.human}</h4><p className="mt-2 text-sm text-amber-50/80">{copy.humanBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => { const confirmed = confirmArtifactUnderstanding(draft); saveArtifactRoom(confirmed); setRoom(confirmed); }} className="min-h-12 rounded-xl bg-cyan-300 px-5 font-semibold text-slate-950" data-cbai-artifact-confirm="">{copy.confirm}</button>
              <button type="button" onClick={() => setDraft(null)} className="min-h-12 rounded-xl border border-white/15 px-5">{copy.change}</button>
            </div>
          </aside>
        </div>
      ) : null}

      {room ? (
        <div className="space-y-6 p-5 sm:p-8 lg:p-10" data-cbai-virtual-research-room="">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold tracking-[.22em] text-cyan-300">{copy.active}</p><h3 className="mt-2 text-3xl font-semibold">{room.title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-300">{copy.activeBody}</p></div><span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs text-emerald-200">Human confirmed</span></div>
          <ol className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7" data-cbai-cybernetic-loop="">{ARTIFACT_ROOM_STAGES.map((stage, index) => <li key={stage} className={`rounded-xl border p-3 text-xs ${index === 0 ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-500"}`}><span className="block text-[10px]">{String(index + 1).padStart(2, "0")}</span>{stage.replace("_", " ")}</li>)}</ol>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{room.suggestedModules.map((module, index) => <article key={module} className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/35 p-4"><span className="text-xs text-cyan-300">0{index + 1}</span><h4 className="mt-4 font-semibold">{module}</h4><p className="mt-2 text-xs text-slate-400">{index === 0 ? room.researchQuestion || copy.noExtraction : copy.noExtraction}</p></article>)}</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/evidence" className="inline-flex min-h-12 items-center rounded-xl bg-cyan-300 px-5 font-semibold text-slate-950">{copy.evidence}</Link>
            <button type="button" onClick={() => openVoice(`${room.title}. ${room.researchQuestion}. Help me structure the next evidence-based step. Human approval is required.`)} className="min-h-12 rounded-xl border border-cyan-300/35 px-5 text-cyan-100">{copy.ask}</button>
            <button
              type="button"
              disabled={cloudBusy || Boolean(cloudReceipt) || auth.accountMode !== "cloud"}
              onClick={async () => {
                if (!file) return;
                setCloudBusy(true);
                setCloudError(null);
                try {
                  setCloudReceipt(await uploadArtifactToQuarantine({ file, room, locale: language }));
                } catch {
                  setCloudError(copy.archiveError);
                } finally {
                  setCloudBusy(false);
                }
              }}
              className="min-h-12 rounded-xl border border-amber-300/40 px-5 text-amber-100 disabled:opacity-60"
              data-cbai-artifact-cloud-upload=""
            >
              {cloudBusy ? copy.archiving : copy.archive}
            </button>
          </div>
          {cloudReceipt ? (
            <p role="status" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-50" data-cbai-artifact-quarantined="">
              {copy.quarantined}
            </p>
          ) : null}
          {!cloudReceipt && auth.accountMode !== "cloud" ? (
            <p className="text-xs text-slate-400" data-cbai-artifact-cloud-auth-required="">
              {copy.archiveNeedsCloud}
            </p>
          ) : null}
          {cloudError ? <p role="alert" className="text-sm text-rose-200">{cloudError}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
