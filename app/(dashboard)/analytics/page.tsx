import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Monitor usage, costs, and performance across your AI platform."
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">
            Analytics dashboard coming soon
          </p>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Detailed reports on token consumption, model performance, agent
            activity, and cost attribution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
