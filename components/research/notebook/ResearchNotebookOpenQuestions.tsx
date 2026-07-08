import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";
import { OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE } from "@/lib/research/open-questions/question-types";

type ResearchNotebookOpenQuestionsProps = {
  notebook: ResearchNotebook;
};

export default function ResearchNotebookOpenQuestions({
  notebook,
}: ResearchNotebookOpenQuestionsProps) {
  if (notebook.openQuestionCategories.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Open questions
        </h4>
        <p className="text-xs text-zinc-500">{OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Open questions
      </h4>
      <p className="text-[11px] text-zinc-600">{OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE}</p>
      <ul className="flex flex-wrap gap-1.5">
        {notebook.openQuestionCategories.map((category) => (
          <li
            key={category}
            className="rounded-md border border-cyan-500/15 bg-cyan-500/5 px-2 py-0.5 text-[11px] text-zinc-400"
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
}
