"use client";

import { useState } from "react";
import type { ProjectQuestion } from "@/lib/project/project-types";
import { loadProjectQuestions, createProjectQuestion, resolveProjectQuestion } from "@/lib/project/project-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectOpenQuestionsPanelProps = {
  projectId: string;
};

/** Real Open Questions — remain visible until the user marks them resolved. Never auto-resolved. */
export default function ProjectOpenQuestionsPanel({ projectId }: ProjectOpenQuestionsPanelProps) {
  const [questions, setQuestions] = useState<ProjectQuestion[]>(() => loadProjectQuestions(projectId));
  const [text, setText] = useState("");

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const question = createProjectQuestion(projectId, trimmed);
    setQuestions((current) => [question, ...current]);
    setText("");
  }

  function handleResolve(questionId: string) {
    const updated = resolveProjectQuestion(questionId);
    if (updated) {
      setQuestions((current) => current.map((q) => (q.questionId === questionId ? updated : q)));
    }
  }

  const open = questions.filter((q) => !q.resolved);
  const resolved = questions.filter((q) => q.resolved);

  return (
    <section id="project-questions" aria-labelledby="project-questions-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow} id="project-questions-heading">
        Open Questions
      </p>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New open question…"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
        />
        <button
          type="submit"
          className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50"
        >
          Add question
        </button>
      </form>

      {open.length > 0 ? (
        <ul className="space-y-1.5">
          {open.map((q) => (
            <li key={q.questionId} className="flex items-start justify-between gap-2 text-xs text-zinc-400">
              <span>{q.question}</span>
              <button
                type="button"
                onClick={() => handleResolve(q.questionId)}
                className="shrink-0 text-[10px] text-cyan-400 hover:underline"
              >
                Mark resolved
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">No open questions right now.</p>
      )}

      {resolved.length > 0 ? (
        <details className="text-xs text-zinc-600">
          <summary className="cursor-pointer text-zinc-500">{resolved.length} resolved question(s)</summary>
          <ul className="mt-1.5 space-y-1">
            {resolved.map((q) => (
              <li key={q.questionId} className="line-through">
                {q.question}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
