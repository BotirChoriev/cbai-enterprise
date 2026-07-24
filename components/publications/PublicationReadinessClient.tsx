"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

type PubState = "private_draft" | "team_review" | "publication_ready" | "public";

export default function PublicationReadinessClient() {
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const prepare = useSearchParams().get("prepare") === "1";
  const [state, setState] = useState<PubState>("private_draft");
  const [authorship, setAuthorship] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [license, setLicense] = useState("CC-BY-4.0");
  const [version, setVersion] = useState("1.0");
  const [message, setMessage] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <OperatingPageShell title={t("authCollab.publicationsTitle")} description={t("authCollab.guestNeedsSignInPublish")}>
        <Link href="/account?resume=pending" className="inline-flex min-h-11 items-center rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm text-[var(--cbai-on-accent)]">
          {t("authCollab.consentOpenAccount")}
        </Link>
      </OperatingPageShell>
    );
  }

  return (
    <OperatingPageShell title={t("authCollab.publicationsTitle")} description={t("authCollab.publicationsIntro")}>
      <p className="text-sm font-medium">{t("authCollab.pubNeverAuto")}</p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
        <li className={state === "private_draft" ? "font-semibold" : ""}>{t("authCollab.pubStatePrivate")}</li>
        <li className={state === "team_review" ? "font-semibold" : ""}>{t("authCollab.pubStateTeam")}</li>
        <li className={state === "publication_ready" ? "font-semibold" : ""}>{t("authCollab.pubStateReady")}</li>
        <li className={state === "public" ? "font-semibold" : ""}>{t("authCollab.pubStatePublic")}</li>
      </ol>
      {(prepare || state !== "public") && (
        <form
          className="mt-6 grid max-w-lg gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!authorship || !privacy || !license.trim() || !version.trim()) {
              setMessage(t("authCollab.guestNeedsSignInPublish"));
              return;
            }
            if (state === "private_draft") setState("team_review");
            else if (state === "team_review") setState("publication_ready");
            else if (state === "publication_ready") {
              setState("public");
              setMessage(t("authCollab.pubFinalApprove"));
            }
          }}
        >
          <label className="flex min-h-11 items-start gap-2 text-sm">
            <input type="checkbox" checked={authorship} onChange={(e) => setAuthorship(e.target.checked)} className="mt-1" />
            {t("authCollab.pubConfirmAuthorship")}
          </label>
          <label className="flex min-h-11 items-start gap-2 text-sm">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1" />
            {t("authCollab.pubConfirmPrivacy")}
          </label>
          <label className="grid gap-1 text-sm">
            {t("authCollab.pubLicense")}
            <input
              className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("authCollab.pubVersion")}
            <input
              className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm text-[var(--cbai-on-accent)]">
            {state === "publication_ready" ? t("authCollab.pubFinalApprove") : t("authCollab.signInToContinue")}
          </button>
        </form>
      )}
      <div aria-live="polite" className="mt-3 text-sm" role="status">
        {message}
      </div>
    </OperatingPageShell>
  );
}
