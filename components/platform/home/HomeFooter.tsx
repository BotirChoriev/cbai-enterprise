import Link from "next/link";
import { HOME_FOOTER, PLATFORM_VERSION } from "@/lib/platform-home";

// The full constitution, methodology, evidence policy, and version history live at /trust, and the
// full founding story lives at /about — this footer stays a short mission statement plus links to
// each, not a second copy of either page.
export default function HomeFooter() {
  return (
    <footer className="home-surface rounded-2xl border border-zinc-800 px-8 py-10 sm:px-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Mission
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
            {HOME_FOOTER.mission}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link href="/about" className="inline-flex text-sm font-medium text-teal-400 hover:text-teal-300">
            Read our story →
          </Link>
          <Link href="/trust" className="inline-flex text-sm font-medium text-teal-400 hover:text-teal-300">
            Visit Trust Center →
          </Link>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-1 border-t border-zinc-800 pt-6 text-xs text-zinc-600 sm:flex-row sm:justify-between">
        <p>CBAI Evidence Intelligence Platform</p>
        <p>Version {PLATFORM_VERSION}</p>
      </div>
    </footer>
  );
}
