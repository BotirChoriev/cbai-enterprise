import Link from "next/link";
import { cbaiBtnSecondary, cbaiGlassCard } from "@/components/brand/brand-classes";

export default function ResearchTopicNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className={`${cbaiGlassCard} w-full space-y-4 p-8`}>
        <h1 className="text-xl font-semibold text-zinc-100">Research topic not found</h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          This topic is not in the Research Intelligence catalog. Browse available research
          topics to explore domains and methods.
        </p>
        <Link href="/research" className={cbaiBtnSecondary}>
          Back to Research topics
        </Link>
      </div>
    </div>
  );
}
