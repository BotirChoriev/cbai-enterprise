import type { ResearchTopic } from "@/lib/research/research-topics";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import {
  OPEN_QUESTION_CATEGORY_DESCRIPTIONS,
  OPEN_QUESTION_STATUS_LABELS,
  OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE,
} from "@/lib/research/open-questions/question-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type OpenResearchQuestionsProps = {
  topic: ResearchTopic;
};

export default function OpenResearchQuestions({ topic }: OpenResearchQuestionsProps) {
  const { questions, hasTopicSpecific } = getOpenQuestionsForTopic(topic);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">Open research questions</h3>
        <p className="mt-1 text-xs text-zinc-500">{OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE}</p>
      </div>

      <ul className="space-y-2">
        {questions.slice(0, 3).map((question) => (
          <li key={question.questionId} className={`${cbaiGlassCard} p-3`}>
            <p className="text-xs font-medium text-teal-400/90">{question.questionCategory}</p>
            <dl className="mt-2 space-y-2 text-[11px]">
              <div>
                <dt className="font-medium uppercase tracking-wider text-zinc-600">Why it matters</dt>
                <dd className="mt-0.5 leading-relaxed text-zinc-500">
                  {OPEN_QUESTION_CATEGORY_DESCRIPTIONS[question.questionCategory]}
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-zinc-600">Status</dt>
                <dd className="mt-0.5 text-zinc-400">
                  {OPEN_QUESTION_STATUS_LABELS[question.status]}
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-zinc-600">
                  Future evidence
                </dt>
                <dd className="mt-0.5 text-zinc-500">
                  {question.futureEvidenceSources.join(" · ")}
                </dd>
              </div>
            </dl>
            {question.humanReviewRequired ? (
              <p className="mt-2 border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
                Human scientific review required.
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {!hasTopicSpecific ? (
        <p className="text-[11px] text-zinc-600">
          Generic open question categories apply — topic-specific records not configured yet.
        </p>
      ) : null}
    </div>
  );
}
