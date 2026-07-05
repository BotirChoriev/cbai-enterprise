import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workflows"
        description="Automate multi-step processes with AI-powered workflows."
        action={
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            New Workflow
          </button>
        }
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">
            Workflow builder coming soon
          </p>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Design, deploy, and monitor automated workflows with human-in-the-loop
            approval gates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
