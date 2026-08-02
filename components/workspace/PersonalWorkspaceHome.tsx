"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { deviceLocalWorkspaceLifecycleRepository } from "@/lib/human-centered-workspace/device-local-workspace-lifecycle-repository";

const FALLBACK_LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/my-work", label: "My Work" },
  { href: "/files", label: "Files" },
  { href: "/trust", label: "Privacy" },
] as const;

export default function PersonalWorkspaceHome() {
  const { language } = useTranslation();
  const uz = language === "uz";
  const hydrated = useHydrated();
  const params = useSearchParams();
  const workspaceId = params.get("workspace");
  const runId = params.get("run");
  const workspace = hydrated && workspaceId
    ? deviceLocalWorkspaceLifecycleRepository.readWorkspace(workspaceId)
    : null;
  const run = hydrated && runId ? deviceLocalWorkspaceLifecycleRepository.readRun(runId) : null;

  if (workspace) {
    return (
      <OperatingPageShell
        title={workspace.manifest.title}
        description={workspace.manifest.objective}
      >
        <section className="rounded-xl border border-teal-500/25 bg-teal-500/[0.05] p-4" data-workspace-lifecycle={run?.status ?? "active"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300">
                {uz ? "Personal operatsion muhit" : "Personal operating environment"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {uz ? "Context versiyasi" : "Context version"}: {workspace.contextVersion}
              </p>
            </div>
            <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs text-teal-200">
              {run?.status === "completed" ? (uz ? "Yaratildi" : "Created") : (uz ? "Faol" : "Active")}
            </span>
          </div>
          {run ? (
            <p className="mt-3 text-xs text-slate-300" data-last-checkpoint={run.lastSuccessfulCheckpoint}>
              {uz ? "Oxirgi muvaffaqiyatli checkpoint" : "Last successful checkpoint"}: {run.lastSuccessfulCheckpoint}
            </p>
          ) : null}
        </section>

        <section className="mt-5">
          <h2 className="text-base font-semibold text-white">{uz ? "Workspace modullari" : "Workspace modules"}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {workspace.manifest.modules.map((module) => (
              <article key={module.moduleId} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{module.capabilityId}</h3>
                    <p className="mt-1 text-xs text-slate-500">{module.blockRefs.map((block) => block.blockId).join(" · ")}</p>
                  </div>
                  <span className={module.state === "blocked" ? "text-xs text-amber-300" : "text-xs text-teal-300"}>
                    {module.state === "blocked" ? (uz ? "Kutilmoqda" : "Waiting") : (uz ? "Faol" : "Active")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {workspace.executionBlueprint ? (
          <section className="mt-5" aria-labelledby="execution-roadmap">
            <h2 id="execution-roadmap" className="text-base font-semibold text-white">
              {uz ? "Amaliy bajarish roadmap’i" : "Executable roadmap"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {uz
                ? "Suhbatdagi tasdiqlangan jarayondan yaratilgan. Har bir bosqich natijasi inson tomonidan tekshiriladi."
                : "Generated from the confirmed process. A human verifies every module output."}
            </p>
            <ol className="mt-3 space-y-2">
              {workspace.executionBlueprint.modules.map((module, index) => (
                <li key={module.moduleId} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-xs font-semibold text-teal-200">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-100">{module.title}</h3>
                        <span className={module.status === "ready" ? "text-xs text-teal-300" : "text-xs text-amber-300"}>
                          {module.status === "ready" ? (uz ? "Boshlashga tayyor" : "Ready") : (uz ? "Oldingi bosqichni kutmoqda" : "Blocked")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{module.objective}</p>
                      <p className="mt-2 text-[11px] text-slate-500">
                        {uz ? "Tekshiruv" : "Verification"}: {module.verificationCriterion}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-400/[0.04] p-4">
              <h3 className="text-sm font-semibold text-sky-100">{uz ? "Integratsiyalar" : "Integrations"}</h3>
              {workspace.executionBlueprint.integrations.length ? (
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {workspace.executionBlueprint.integrations.map((integration) => (
                    <li key={integration.integrationId}>
                      • {integration.label} — {uz ? "mavjudligini tekshirish va ruxsat so‘rash kerak" : "verify availability and request consent"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  {uz ? "Foydalanuvchi hali aniq vendor integratsiyasini aytmadi; hech biri taxmin qilinmadi." : "No vendor integration was explicitly named; none was invented."}
                </p>
              )}
            </div>
          </section>
        ) : null}

        <section className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
          <h2 className="text-sm font-semibold text-amber-100">{uz ? "Yetishmayotgan ma’lumotlar" : "Missing information"}</h2>
          {workspace.manifest.missingItems.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {workspace.manifest.missingItems.map((item) => (
                <li key={item.id}>• {item.label} — <span className="text-slate-500">{item.reason}</span></li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">{uz ? "Majburiy noma’lumlar yo‘q." : "No required unknowns remain."}</p>
          )}
        </section>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/my-work" className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950">
            {uz ? "Ishni davom ettirish" : "Continue the work"}
          </Link>
          <Link href="/trust" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200">
            {uz ? "Nazorat va maxfiylik" : "Control and privacy"}
          </Link>
        </div>
      </OperatingPageShell>
    );
  }

  if (!hydrated) {
    return (
      <OperatingPageShell title="Personal workspace" description="Loading…">
        <div className="h-20 animate-pulse rounded-xl bg-white/[0.035]" />
      </OperatingPageShell>
    );
  }

  return (
    <OperatingPageShell
      title={uz ? "Personal Workspace" : "Personal workspace"}
      description={uz ? "Tasdiqlangan kontekstdan yaratilgan operatsion muhit shu yerda ochiladi." : "Your confirmed-context operating environment opens here."}
    >
      {workspaceId ? (
        <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] p-4" role="alert">
          <p className="text-sm font-semibold text-rose-200">{uz ? "Workspace topilmadi" : "Workspace not found"}</p>
          <p className="mt-1 text-xs text-slate-400">
            {uz ? "Yig‘ilgan ma’lumotni qayta kiritmang. Voice Operator’da “davom et” deb recovery’ni ishga tushiring." : "Do not repeat discovery. Say “continue” in Voice Operator to resume recovery."}
          </p>
        </div>
      ) : (
        <nav aria-label="Personal workspace" className="grid gap-2 sm:grid-cols-2">
          {FALLBACK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-200">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </OperatingPageShell>
  );
}
