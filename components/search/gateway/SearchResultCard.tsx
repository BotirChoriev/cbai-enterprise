import Link from "next/link";
import type { SearchResultEntry } from "@/lib/search-intelligence-entry";
import { isUnavailableRoute } from "@/lib/search-intelligence-entry";

const cardLink =
  "group block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-600 hover:bg-zinc-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const cardStatic =
  "rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-5";

type SearchResultCardProps = {
  entry: SearchResultEntry;
};

export default function SearchResultCard({ entry }: SearchResultCardProps) {
  const fields = [
    { label: "Name", value: entry.name },
    { label: "Type", value: entry.type },
    { label: "Evidence Status", value: entry.evidenceStatus },
    { label: "Available Information", value: entry.availableInformation },
    { label: "Route", value: entry.route },
  ];

  const disabled = !entry.linked || isUnavailableRoute(entry.route);

  if (disabled) {
    return (
      <div className={cardStatic}>
        <ResultFields fields={fields} />
      </div>
    );
  }

  return (
    <Link href={entry.href} className={cardLink}>
      <ResultFields fields={fields} linked />
    </Link>
  );
}

function ResultFields({
  fields,
  linked = false,
}: {
  fields: { label: string; value: string }[];
  linked?: boolean;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {field.label}
          </dt>
          <dd
            className={`mt-1 text-sm leading-relaxed ${
              field.label === "Name"
                ? linked
                  ? "font-semibold text-zinc-50 group-hover:text-sky-300"
                  : "font-semibold text-zinc-100"
                : field.label === "Route"
                  ? "font-mono text-xs text-zinc-500"
                  : "text-zinc-400"
            }`}
          >
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
