import {
  recentConversations,
  pinnedKnowledge,
  savedCommands,
} from "@/lib/core";

function EmptyNotice({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-xs text-zinc-500">
      {message}
    </p>
  );
}

export default function MemoryPanel() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
              Context Memory
            </h2>
            <p className="text-xs text-zinc-500">
              Extended route shell — no persistent memory connected
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        <section className="p-5">
          <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Recent Conversations
          </h3>
          {recentConversations.length === 0 ? (
            <EmptyNotice message="No conversation history — command interface not connected." />
          ) : (
            <ul className="space-y-2">
              {recentConversations.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
                >
                  <p className="truncate text-xs text-zinc-400 group-hover:text-zinc-200">
                    {item.title}
                  </p>
                  <span className="ml-3 shrink-0 text-[10px] text-zinc-600">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5">
          <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Pinned Knowledge
          </h3>
          {pinnedKnowledge.length === 0 ? (
            <EmptyNotice message="No pinned knowledge — evidence must be connected first." />
          ) : (
            <ul className="space-y-2">
              {pinnedKnowledge.map((item) => (
                <li
                  key={item.id}
                  className="group rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
                >
                  <p className="truncate text-xs text-zinc-400 group-hover:text-zinc-200">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">{item.source}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5">
          <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Saved Commands
          </h3>
          {savedCommands.length === 0 ? (
            <EmptyNotice message="No saved commands — interface not connected." />
          ) : (
            <ul className="space-y-2">
              {savedCommands.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
                >
                  <p className="truncate font-mono text-xs text-zinc-400 group-hover:text-sky-300">
                    {item.command}
                  </p>
                  <span className="ml-3 shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                    ×{item.usedCount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
