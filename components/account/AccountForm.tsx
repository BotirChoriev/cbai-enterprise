"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { loadProjects } from "@/lib/project/project-store";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import {
  ASSISTANT_AVATARS,
  ASSISTANT_LANGUAGES,
  type AssistantAvatarId,
} from "@/lib/assistant/assistant-profile";
import { upsertCloudProfile } from "@/lib/supabase/cloud-profile";
import Avatar from "@/components/shared/Avatar";

type LocalMode = "sign-in" | "sign-up";
type CloudMode = "sign-in" | "sign-up" | "forgot-password";
type AccountTab = "cloud" | "local";

const MIN_PASSWORD_LENGTH = 8;
const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30";

function AccountModeBadge() {
  const { accountMode } = useAuth();
  const { t } = useTranslation();
  const labels: Record<typeof accountMode, string> = {
    cloud: t("accountPage.modeCloud"),
    "device-local": t("accountPage.modeLocal"),
    "signed-out": t("accountPage.modeSignedOut"),
  };
  const colors: Record<typeof accountMode, string> = {
    cloud: "bg-emerald-500/10 text-emerald-300",
    "device-local": "bg-amber-500/10 text-amber-300",
    "signed-out": "bg-zinc-800 text-zinc-500",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${colors[accountMode]}`}>
      {labels[accountMode]}
    </span>
  );
}

function CloudActiveSessionSection() {
  const { cloudUser, cloudSessionRestoring } = useAuth();
  const { t } = useTranslation();
  if (!cloudUser) return null;

  return (
    <section className="space-y-2 border-t border-zinc-800/80 pt-4" aria-labelledby="cloud-session-heading">
      <p className={cbaiSectionEyebrow} id="cloud-session-heading">
        {t("accountPage.sessionHeading")}
      </p>
      <p className="text-sm text-zinc-300">{t("accountPage.sessionEmail", { email: cloudUser.email })}</p>
      <p className="text-xs text-zinc-500">
        {cloudSessionRestoring ? t("accountPage.sessionRestoring") : t("accountPage.sessionRestored")}
      </p>
      <p className="text-xs leading-relaxed text-zinc-600">{t("accountPage.sessionNoMultiDeviceRevoke")}</p>
    </section>
  );
}

function CloudProfileSection() {
  const { cloudUser } = useAuth();
  const { profile, updateProfile } = useAssistantProfile();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(profile.name);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage);
  const [avatarMode, setAvatarMode] = useState<AssistantAvatarId>(profile.avatar);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile.name);
    setPreferredLanguage(profile.preferredLanguage);
    setAvatarMode(profile.avatar);
  }, [profile.name, profile.preferredLanguage, profile.avatar]);

  if (!cloudUser) return null;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    setError(null);
    setIsSaving(true);

    updateProfile({
      name: displayName.trim(),
      preferredLanguage,
      avatar: avatarMode,
    });

    const cloudResult = await upsertCloudProfile(cloudUser!.id, {
      displayName: displayName.trim(),
      preferredLanguage,
      avatarMode,
      assistantName: displayName.trim(),
    });
    setIsSaving(false);

    if (!cloudResult) {
      setError(t("accountPage.profileSaveFailed"));
      return;
    }
    setNotice(t("accountPage.profileSaved"));
  }

  return (
    <section className="space-y-3 border-t border-zinc-800/80 pt-4" aria-labelledby="cloud-profile-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="cloud-profile-heading">
          {t("accountPage.profileHeading")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{t("accountPage.profileBody")}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label htmlFor="cloud-display-name" className="text-xs text-zinc-500">
            {t("accountPage.displayName")}
          </label>
          <input
            id="cloud-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("accountPage.namePlaceholder")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="cloud-preferred-language" className="text-xs text-zinc-500">
            {t("accountPage.preferredLanguage")}
          </label>
          <select
            id="cloud-preferred-language"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className={inputClass}
          >
            {ASSISTANT_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code} disabled={!language.available}>
                {language.label}
                {language.available ? "" : " — n/a"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">{t("accountPage.avatarMode")}</span>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setAvatarMode(avatar)}
                aria-pressed={avatarMode === avatar}
                title={avatar}
                className={`rounded-full transition-shadow ${
                  avatarMode === avatar ? "ring-2 ring-teal-400/60 ring-offset-2 ring-offset-slate-950" : ""
                }`}
              >
                <Avatar name={displayName || avatar} avatar={avatar} />
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}
        {notice ? <p className="text-xs text-emerald-400">{notice}</p> : null}

        <button type="submit" disabled={isSaving} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSaving ? t("accountPage.pleaseWait") : t("accountPage.saveProfile")}
        </button>
      </form>
    </section>
  );
}

function CloudSecuritySection() {
  const { changeSignedInPassword, isCloudConfigured } = useAuth();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCloudConfigured) {
    return (
      <section className="space-y-2 border-t border-zinc-800/80 pt-4" aria-labelledby="cloud-security-heading">
        <p className={cbaiSectionEyebrow} id="cloud-security-heading">
          {t("accountPage.securityHeading")}
        </p>
        <p className="text-xs leading-relaxed text-zinc-600">{t("accountPage.passwordChangeUnavailable")}</p>
      </section>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("resetPasswordPage.minPasswordLength", { length: String(MIN_PASSWORD_LENGTH) }));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("validation.passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    const result = await changeSignedInPassword(password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setNotice(t("accountPage.passwordUpdated"));
  }

  return (
    <section className="space-y-3 border-t border-zinc-800/80 pt-4" aria-labelledby="cloud-security-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="cloud-security-heading">
          {t("accountPage.securityHeading")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{t("accountPage.securityBody")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="cloud-change-password" className="text-xs text-zinc-500">
            {t("accountPage.newPassword")}
          </label>
          <input
            id="cloud-change-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("accountPage.passwordSignUpPlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cloud-change-password-confirm" className="text-xs text-zinc-500">
            {t("accountPage.confirmNewPassword")}
          </label>
          <input
            id="cloud-change-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("accountPage.passwordSignInPlaceholder")}
            className={inputClass}
          />
        </div>

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}
        {notice ? <p className="text-xs text-emerald-400">{notice}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting ? t("accountPage.pleaseWait") : t("accountPage.changePassword")}
        </button>
      </form>
    </section>
  );
}

function CloudSignedInView() {
  const { cloudUser, cloudSignOut, resendEmailConfirmation } = useAuth();
  const { t } = useTranslation();
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  if (!cloudUser) return null;

  async function handleResendConfirmation() {
    setResendNotice(null);
    setResendError(null);
    setIsResending(true);
    const result = await resendEmailConfirmation(cloudUser!.email);
    setIsResending(false);
    if (!result.ok) {
      setResendError(result.error);
      return;
    }
    setResendNotice(t("accountPage.resendConfirmationSent"));
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>{t("accountPage.cloudAccount")}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{cloudUser.email}</h2>
        </div>
        <AccountModeBadge />
      </div>

      {!cloudUser.emailConfirmed ? (
        <div className="space-y-2 rounded-md bg-amber-500/10 px-3 py-2">
          <p className="text-xs text-amber-300">{t("accountPage.emailNotConfirmed")}</p>
          <button
            type="button"
            onClick={() => {
              void handleResendConfirmation();
            }}
            disabled={isResending}
            className="text-xs font-medium text-teal-400 hover:text-teal-300 disabled:opacity-50"
          >
            {isResending ? t("accountPage.pleaseWait") : t("accountPage.resendConfirmation")}
          </button>
          {resendError ? <p className="text-xs text-amber-400">{resendError}</p> : null}
          {resendNotice ? <p className="text-xs text-emerald-400">{resendNotice}</p> : null}
        </div>
      ) : null}

      <CloudActiveSessionSection />
      <CloudProfileSection />
      <CloudSecuritySection />

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{t("accountPage.cloudNotice")}</p>

      <div className="flex flex-wrap gap-2">
        <Link href="/my-work" className={cbaiBtnPrimary}>
          {t("accountPage.continueWorking")}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await cloudSignOut();
          }}
          className={cbaiBtnSecondary}
        >
          {t("accountPage.signOutCloud")}
        </button>
      </div>
    </div>
  );
}

function CloudSignedOutView() {
  const { cloudSignIn, cloudSignUp, requestPasswordReset, isCloudConfigured } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<CloudMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    if (mode === "forgot-password") {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";
      const result = await requestPasswordReset(email, redirectTo);
      setIsSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(t("accountPage.resetLinkSent"));
      return;
    }

    const result = mode === "sign-in" ? await cloudSignIn(email, password) : await cloudSignUp(email, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "sign-up" && !result.user.emailConfirmed) {
      setNotice(t("accountPage.accountCreatedConfirmEmail"));
      return;
    }
    window.location.href = "/my-work";
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>{t("accountPage.cloudAccount")}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          {mode === "sign-in"
            ? t("accountPage.signIn")
            : mode === "sign-up"
              ? t("accountPage.createCloudAccount")
              : t("accountPage.resetPassword")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("accountPage.cloudSubtitle")}</p>
      </div>

      {!isCloudConfigured ? (
        <p className="rounded-md bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500">{t("accountPage.cloudNotConfigured")}</p>
      ) : null}

      {mode !== "forgot-password" ? (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("sign-in");
              setError(null);
              setNotice(null);
            }}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-in" ? "bg-teal-500/10 text-teal-300" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            {t("accountPage.signInTab")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sign-up");
              setError(null);
              setNotice(null);
            }}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-up" ? "bg-teal-500/10 text-teal-300" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            {t("accountPage.createAccountTab")}
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="cloud-email" className="text-xs text-zinc-500">
            {t("accountPage.email")}
          </label>
          <input
            id="cloud-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("accountPage.emailPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        {mode !== "forgot-password" ? (
          <div>
            <label htmlFor="cloud-password" className="text-xs text-zinc-500">
              {t("accountPage.password")}
            </label>
            <input
              id="cloud-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "sign-up" ? t("accountPage.passwordSignUpPlaceholder") : t("accountPage.passwordSignInPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
            />
          </div>
        ) : null}

        {mode === "sign-in" ? (
          <button
            type="button"
            onClick={() => {
              setMode("forgot-password");
              setError(null);
              setNotice(null);
            }}
            className="text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            {t("accountPage.forgotPassword")}
          </button>
        ) : null}
        {mode === "forgot-password" ? (
          <button
            type="button"
            onClick={() => {
              setMode("sign-in");
              setError(null);
              setNotice(null);
            }}
            className="text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            {t("accountPage.backToSignIn")}
          </button>
        ) : null}

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}
        {notice ? <p className="text-xs text-emerald-400">{notice}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting
            ? t("accountPage.pleaseWait")
            : mode === "sign-in"
              ? t("account.signIn")
              : mode === "sign-up"
                ? t("account.signUp")
                : t("accountPage.sendResetLink")}
        </button>
      </form>
    </div>
  );
}

function LocalSignedInView() {
  const { user, signOut } = useAuth();
  const { context } = usePlatformContext();
  const { t } = useTranslation();
  if (!user) return null;

  const projectCount = loadProjects().length;
  const bookmarkCount = context.pinnedEntities.length;

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>{t("accountPage.deviceLocalAccount")}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">{user.displayName}</h2>
        <p className="text-sm text-zinc-500">{user.email}</p>
        {user.organization ? <p className="mt-1 text-xs text-zinc-600">{user.organization}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("accountPage.projects")}</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{projectCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("accountPage.bookmarks")}</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{bookmarkCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("accountPage.memberSince")}</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{t("accountPage.localNotice")}</p>

      <div className="flex flex-wrap gap-2">
        <Link href="/my-work" className={cbaiBtnPrimary}>
          {t("accountPage.continueWorking")}
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            window.location.href = "/account";
          }}
          className={cbaiBtnSecondary}
        >
          {t("account.signOut")}
        </button>
      </div>
    </div>
  );
}

function LocalSignedOutView() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<LocalMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result =
      mode === "sign-in" ? await signIn(email, password) : await signUp(email, password, displayName, organization);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = "/my-work";
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>{t("accountPage.deviceLocalAccount")}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          {mode === "sign-in" ? t("accountPage.localSignInTitle") : t("accountPage.localCreateTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("accountPage.localSubtitle")}</p>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-in" ? "bg-teal-500/10 text-teal-300" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          {t("accountPage.signInTab")}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
          }}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-up" ? "bg-teal-500/10 text-teal-300" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          {t("accountPage.createAccountTab")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "sign-up" ? (
          <div>
            <label htmlFor="account-name" className="text-xs text-zinc-500">
              {t("accountPage.name")}
            </label>
            <input
              id="account-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("accountPage.namePlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="account-email" className="text-xs text-zinc-500">
            {t("accountPage.email")}
          </label>
          <input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("accountPage.emailPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        <div>
          <label htmlFor="account-password" className="text-xs text-zinc-500">
            {t("accountPage.password")}
          </label>
          <input
            id="account-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "sign-up" ? t("accountPage.passwordSignUpPlaceholder") : t("accountPage.passwordSignInPlaceholder")}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        {mode === "sign-up" ? (
          <div>
            <label htmlFor="account-org" className="text-xs text-zinc-500">
              {t("accountPage.organizationOptional")}
            </label>
            <input
              id="account-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder={t("accountPage.organizationPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
            />
          </div>
        ) : null}

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting ? t("accountPage.pleaseWait") : mode === "sign-in" ? t("account.signIn") : t("account.signUp")}
        </button>
      </form>

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{t("accountPage.localNotice")}</p>
    </div>
  );
}

export default function AccountForm() {
  const { isSignedIn, isCloudSignedIn, isCloudConfigured } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<AccountTab>(isCloudConfigured ? "cloud" : "local");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setTab("cloud")}
          className={`flex-1 rounded-lg border px-3 py-2 font-medium transition-colors ${tab === "cloud" ? "border-teal-500/40 bg-teal-500/10 text-teal-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
        >
          {t("accountPage.cloudAccount")} {isCloudSignedIn ? t("accountPage.cloudSignedInActive") : ""}
        </button>
        <button
          type="button"
          onClick={() => setTab("local")}
          className={`flex-1 rounded-lg border px-3 py-2 font-medium transition-colors ${tab === "local" ? "border-teal-500/40 bg-teal-500/10 text-teal-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
        >
          {t("accountPage.deviceLocalAccount")} {isSignedIn ? t("accountPage.localSignedInActive") : ""}
        </button>
      </div>

      {tab === "cloud" ? (
        isCloudSignedIn ? (
          <CloudSignedInView />
        ) : (
          <CloudSignedOutView />
        )
      ) : isSignedIn ? (
        <LocalSignedInView />
      ) : (
        <LocalSignedOutView />
      )}
    </div>
  );
}
