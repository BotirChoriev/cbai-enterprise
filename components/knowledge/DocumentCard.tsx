import type { DocumentStatus, KnowledgeCollection } from "@/lib/knowledge";
import { Card, CardContent } from "@/components/ui/Card";

const statusConfig: Record<
  DocumentStatus,
  { label: string; dot: string; badge: string }
> = {
  indexed: {
    label: "Indexed",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  indexing: {
    label: "Indexing",
    dot: "bg-sky-400 animate-pulse",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  error: {
    label: "Error",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const typeIcons: Record<string, React.ReactNode> = {
  reports: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
    />
  ),
  strategy: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  ),
  legal: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  ),
  research: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
    />
  ),
  education: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a2.25 2.25 0 002.25 2.25H15a2.25 2.25 0 002.25-2.25V9.75A2.25 2.25 0 0015 7.5h-6A2.25 2.25 0 006.75 9.75V15z"
    />
  ),
  investor: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15M12 10.5a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v6m0-6h6m-6 0H9"
    />
  ),
};

type DocumentCardProps = {
  collection: KnowledgeCollection;
};

export default function DocumentCard({ collection }: DocumentCardProps) {
  const status = statusConfig[collection.status];

  return (
    <Card className="transition-colors hover:border-zinc-700">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {typeIcons[collection.type]}
            </svg>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${status.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <h3 className="mt-4 text-sm font-semibold text-zinc-50">
          {collection.name}
        </h3>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {collection.typeLabel}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
          {collection.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-800 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Documents
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-200">
              {collection.documentsCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Last Indexed
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-200">
              {collection.lastIndexed}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Confidence
            </p>
            <p
              className={`mt-0.5 text-sm font-semibold ${
                collection.confidenceScore >= 95
                  ? "text-emerald-400"
                  : collection.confidenceScore >= 90
                    ? "text-sky-400"
                    : "text-amber-400"
              }`}
            >
              {collection.confidenceScore}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
