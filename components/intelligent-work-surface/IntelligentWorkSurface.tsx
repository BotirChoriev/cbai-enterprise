"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { validateDocumentUploadCandidate } from "@/lib/document-intake/document-intake";
import {
  detectWorkContext,
  toolsForWorkContext,
  type WorkContext,
} from "@/lib/intelligent-work-surface/context";
import styles from "./IntelligentWorkSurface.module.css";

type SelectedDocument = {
  readonly name: string;
  readonly size: number;
};

export default function IntelligentWorkSurface() {
  const { language } = useTranslation();
  const { openDock } = useVoiceOperator();
  const locale = language === "uz" ? "uz" : "en";
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [document, setDocument] = useState<SelectedDocument | null>(null);
  const [workPrompt, setWorkPrompt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const context: WorkContext = detectWorkContext(`${document?.name ?? ""} ${workPrompt}`);
  const tools = toolsForWorkContext(context);

  async function inspectFile(file: File | null) {
    if (!file) return;
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const validation = validateDocumentUploadCandidate({
      fileName: file.name,
      sizeBytes: file.size,
      mimeType: file.type || null,
      headerBytes: header,
    });
    if (!validation.ok) {
      setDocument(null);
      setMessage(
        locale === "uz"
          ? "Hozir markaz faqat haqiqiy PDF faylini qabul qiladi."
          : "The center currently accepts validated PDF files only.",
      );
      return;
    }
    setDocument({ name: file.name, size: file.size });
    setMessage(
      locale === "uz"
        ? "Fayl lokal tekshirildi. Hech narsa avtomatik tasdiqlanmadi yoki bulutga yuklanmadi."
        : "The file was inspected locally. Nothing was auto-approved or uploaded to cloud storage.",
    );
  }

  return (
    <section className={styles.surface} data-cbai-intelligent-work-surface="">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{locale === "uz" ? "Intelligent Work Surface" : "Intelligent Work Surface"}</p>
        <h2 className={styles.title}>
          {locale === "uz" ? "Materialni markazga qo‘ying. CBAI ish muhitini ochadi." : "Put the material at the center. CBAI opens the work around it."}
        </h2>
        <p className={styles.description}>
          {locale === "uz"
            ? "CBAI material kontekstini aniqlaydi va faqat kerakli yordamchi funksiyalarni ko‘rsatadi. Yakuniy yo‘nalish va har qanday amalni inson tasdiqlaydi."
            : "CBAI detects the material context and reveals only the relevant supporting tools. A human confirms the direction and every consequential action."}
        </p>
        <label className={styles.prompt}>
          <span>{locale === "uz" ? "Bu material bilan nima qilmoqchisiz?" : "What do you want to do with this material?"}</span>
          <input
            value={workPrompt}
            onChange={(event) => setWorkPrompt(event.target.value)}
            placeholder={locale === "uz" ? "Masalan: kimyo bo‘yicha PhD nazariyasini tekshirish" : "For example: review a chemistry PhD theory"}
          />
        </label>
        <div className={styles.quickActions}>
          <button type="button" onClick={() => inputRef.current?.click()}>
            ⇧ {locale === "uz" ? "PDF’ni markazga qo‘yish" : "Put a PDF at the center"}
          </button>
          <button type="button" onClick={openDock}>
            ◉ {locale === "uz" ? "Ovoz bilan boshlash" : "Start with voice"}
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        <label
          className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void inspectFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)}
          />
          <span>
            <span className={styles.dropIcon} aria-hidden="true">{document ? "✓" : "⇧"}</span>
            <span className={styles.dropTitle}>
              {document?.name ?? (locale === "uz" ? "PDF faylni shu yerga tashlang" : "Drop a PDF here")}
            </span>
            <span className={styles.dropDetail}>
              {document
                ? `${context.toUpperCase()} · ${(document.size / 1024 / 1024).toFixed(1)} MB`
                : locale === "uz"
                  ? "yoki fayl tanlash uchun bosing"
                  : "or click to choose a file"}
            </span>
          </span>
        </label>

        <nav className={styles.tools} aria-label={locale === "uz" ? "Kontekst yordamchilari" : "Context assistants"}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.href} className={styles.tool} data-context-tool={tool.id}>
              <span className={styles.toolIcon} aria-hidden="true">{tool.icon}</span>
              <span>
                <strong>{tool.label[locale]}</strong>
                <span>{tool.detail[locale]}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.status} role="status">
        <span>
          {message ?? (locale === "uz"
            ? "Kontekst hali aniqlanmadi — umumiy vositalar ko‘rsatilmoqda."
            : "No context detected yet — showing general tools.")}
        </span>
        <button type="button" className={styles.voice} onClick={openDock}>
          ◉ {locale === "uz" ? "Ovoz bilan boshqarish" : "Control by voice"}
        </button>
      </div>
    </section>
  );
}
