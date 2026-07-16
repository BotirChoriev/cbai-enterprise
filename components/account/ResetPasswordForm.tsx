"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnPrimary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Completes a Supabase password reset. This page is the `redirectTo` target passed to
 * `requestPasswordReset` (see lib/supabase/cloud-auth.ts) — Supabase appends recovery tokens to
 * the URL, and the browser client (detectSessionInUrl: true, lib/supabase/client.ts) exchanges
 * them for a real recovery session automatically before this component ever calls
 * `completePasswordReset`.
 */
export default function ResetPasswordForm() {
  const { completePasswordReset, isCloudConfigured } = useAuth();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isCloudConfigured) {
    return (
      <div className={`${cbaiGlassCard} space-y-3 p-6`}>
        <p className={cbaiSectionEyebrow}>{t("accountPage.resetPassword")}</p>
        <p className="text-sm text-zinc-500">{t("accountPage.cloudNotConfigured")}</p>
        <Link href="/account" className="text-sm font-medium text-teal-400 hover:text-teal-300">
          {t("accountPage.backToSignIn")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${cbaiGlassCard} space-y-3 p-6`}>
        <p className={cbaiSectionEyebrow}>{t("accountPage.resetPassword")}</p>
        <h2 className="text-lg font-semibold text-zinc-100">{t("resetPasswordPage.passwordUpdated")}</h2>
        <p className="text-sm text-zinc-500">{t("resetPasswordPage.passwordUpdatedBody")}</p>
        <Link href="/account" className={`${cbaiBtnPrimary} inline-flex`}>
          {t("accountPage.signIn")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("resetPasswordPage.minPasswordLength", { length: String(MIN_PASSWORD_LENGTH) }));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("validation.passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    const result = await completePasswordReset(password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>{t("accountPage.resetPassword")}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">{t("resetPasswordPage.chooseNewPassword")}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t("resetPasswordPage.chooseNewPasswordBody")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="reset-password" className="text-xs text-zinc-500">
            {t("resetPasswordPage.newPassword")}
          </label>
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("accountPage.passwordSignUpPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>
        <div>
          <label htmlFor="reset-password-confirm" className="text-xs text-zinc-500">
            {t("resetPasswordPage.confirmNewPassword")}
          </label>
          <input
            id="reset-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("accountPage.passwordSignInPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting ? t("common.saving") : t("resetPasswordPage.setNewPassword")}
        </button>
      </form>
    </div>
  );
}
