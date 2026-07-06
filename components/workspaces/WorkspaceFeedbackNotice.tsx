import type { CitizenFeedbackNotice } from "@/lib/workspaces";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type WorkspaceFeedbackNoticeProps = {
  notice: CitizenFeedbackNotice;
};

export default function WorkspaceFeedbackNotice({ notice }: WorkspaceFeedbackNoticeProps) {
  return (
    <section className="space-y-4" aria-labelledby="workspace-feedback-heading">
      <div>
        <h2
          id="workspace-feedback-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Feedback Notice
        </h2>
      </div>

      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardHeader title={notice.title} />
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">{notice.description}</p>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Allowed responses (future)
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {notice.allowedResponses.map((response) => (
                <li
                  key={response}
                  className="rounded-md border border-zinc-700/50 bg-zinc-900/50 px-2 py-1 text-xs text-zinc-400"
                >
                  {response}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-zinc-600">{notice.notImplementedNote}</p>
        </CardContent>
      </Card>
    </section>
  );
}
