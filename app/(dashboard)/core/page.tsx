import type { Metadata } from "next";
import Link from "next/link";
import PreviewInDevelopmentPage from "@/components/preview/PreviewInDevelopmentPage";
import { platformModules } from "@/lib/navigation";

// Not in primary navigation (confirmed unreachable from any real nav link) and honestly
// self-describes as inactive — kept reachable by direct URL for the platform module grid it
// still provides, but excluded from search indexing so it never competes with the real product
// surfaces for discovery.
export const metadata: Metadata = {
  title: "Core",
  description: "Core inference and agent orchestration are not active in this deployment.",
  robots: { index: false, follow: true },
};

export default function CorePage() {
  return (
    <PreviewInDevelopmentPage variant="core">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platformModules.map((module) => (
          <li key={module.href}>
            <Link
              href={module.href}
              className="block rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition-colors hover:border-teal-500/30"
            >
              <p className="text-sm font-semibold text-zinc-200">{module.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{module.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PreviewInDevelopmentPage>
  );
}
