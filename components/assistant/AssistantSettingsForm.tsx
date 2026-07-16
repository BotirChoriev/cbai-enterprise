"use client";

import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import {
  ASSISTANT_AVATARS,
  ASSISTANT_LANGUAGES,
  DEFAULT_OPERATOR_NAME,
  WORKSPACE_ROLES,
  type WorkspaceRole,
} from "@/lib/assistant/assistant-profile";
import { countries } from "@/lib/countries";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import Avatar from "@/components/shared/Avatar";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useTranslation } from "@/lib/i18n/use-translation";

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-slate-900/80 px-3 py-2 text-sm text-zinc-200 outline-none transition-colors focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20";
const labelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function AssistantSettingsForm() {
  const { t } = useTranslation();
  const { profile, isActive, updateProfile, resetProfile } = useAssistantProfile();

  return (
    <div className="space-y-6">
      <div className={`${cbaiGlassCard} flex items-center gap-3 px-5 py-4`}>
        <span
          className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? "bg-emerald-400" : "bg-zinc-600"}`}
        />
        <p className="text-sm text-zinc-300">
          {isActive
            ? t("settingsPage.operatorReady", { name: profile.name })
            : t("settingsPage.operatorNotReady")}
        </p>
      </div>

      <section aria-labelledby="assistant-identity-heading" className={`${cbaiGlassCard} space-y-4 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-identity-heading">
          {t("settingsPage.identityHeading")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.yourName")}</span>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder={t("settingsPage.yourNamePlaceholder")}
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.operatorName")}</span>
            <input
              type="text"
              value={profile.operatorName}
              onChange={(e) => updateProfile({ operatorName: e.target.value })}
              placeholder={DEFAULT_OPERATOR_NAME}
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>{t("settingsPage.workspaceRole")}</span>
            <select
              value={profile.workspaceRole}
              onChange={(e) => updateProfile({ workspaceRole: e.target.value as WorkspaceRole })}
              className={inputClass}
            >
              {WORKSPACE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`workspaceRoles.${role}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>{t("settingsPage.avatar")}</span>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => updateProfile({ avatar })}
                aria-pressed={profile.avatar === avatar}
                title={avatar}
                className={`rounded-full transition-shadow ${
                  profile.avatar === avatar ? "ring-2 ring-teal-400/60 ring-offset-2 ring-offset-slate-950" : ""
                }`}
              >
                <Avatar name={profile.name || avatar} avatar={avatar} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="assistant-voice-heading" className={`${cbaiGlassCard} space-y-4 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-voice-heading">
          {t("settingsPage.voiceLanguageHeading")}
        </p>

        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={profile.voiceInputEnabled}
            onChange={(e) => updateProfile({ voiceInputEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
          />
          {t("settingsPage.showVoiceInput")}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.preferredLanguage")}</span>
            <select
              value={profile.preferredLanguage}
              onChange={(e) => updateProfile({ preferredLanguage: e.target.value })}
              className={inputClass}
            >
              {ASSISTANT_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code} disabled={!language.available}>
                  {language.label}
                  {language.available ? "" : t("settingsPage.languageNotAvailable")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.futureTranslationLanguage")}</span>
            <select
              value={profile.translationLanguage}
              onChange={(e) => updateProfile({ translationLanguage: e.target.value })}
              className={inputClass}
            >
              {ASSISTANT_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code} disabled={!language.available}>
                  {language.label}
                  {language.available ? "" : t("settingsPage.languageNotAvailable")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>{t("settingsPage.speechLanguage")}</span>
            <select
              value={profile.speechLanguage}
              onChange={(e) => updateProfile({ speechLanguage: e.target.value })}
              className={inputClass}
            >
              <option value="en-US">{t("settingsPage.speechEnUs")}</option>
              <option value="en-GB">{t("settingsPage.speechEnGb")}</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-zinc-600">{t("settingsPage.languageHonestyNote")}</p>
      </section>

      <section aria-labelledby="assistant-context-heading" className={`${cbaiGlassCard} space-y-4 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-context-heading">
          {t("settingsPage.contextHeading")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.country")}</span>
            <select
              value={profile.country}
              onChange={(e) => updateProfile({ country: e.target.value })}
              className={inputClass}
            >
              <option value="">{t("settingsPage.countryNotSet")}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>{t("settingsPage.organization")}</span>
            <input
              type="text"
              value={profile.organization}
              onChange={(e) => updateProfile({ organization: e.target.value })}
              placeholder={t("settingsPage.organizationPlaceholder")}
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>{t("settingsPage.timezone")}</span>
            <input
              type="text"
              value={profile.timezone}
              onChange={(e) => updateProfile({ timezone: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section
        aria-labelledby="assistant-notifications-heading"
        className={`${cbaiGlassCard} space-y-3 p-5`}
      >
        <p className={cbaiSectionEyebrow} id="assistant-notifications-heading">
          {t("settingsPage.notificationsHeading")}
        </p>
        <p className="text-xs text-zinc-600">{t("settingsPage.notificationsHonesty")}</p>
        {(
          [
            ["evidenceUpdates", "settingsPage.notifyEvidenceUpdates"],
            ["missionActivity", "settingsPage.notifyMissionActivity"],
            ["weeklySummary", "settingsPage.notifyWeeklySummary"],
          ] as const
        ).map(([key, labelKey]) => (
          <label key={key} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={profile.notifications[key]}
              onChange={(e) =>
                updateProfile({ notifications: { ...profile.notifications, [key]: e.target.checked } })
              }
              className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
            />
            {t(labelKey)}
          </label>
        ))}
      </section>

      <section aria-labelledby="assistant-theme-heading" className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-theme-heading">
          {t("settingsPage.themeHeading")}
        </p>
        <p className="text-xs text-zinc-500">{t("settingsPage.themeNote")}</p>
        <ThemeToggle />
      </section>

      <section
        aria-labelledby="assistant-accessibility-heading"
        className={`${cbaiGlassCard} space-y-3 p-5`}
      >
        <p className={cbaiSectionEyebrow} id="assistant-accessibility-heading">
          {t("settingsPage.accessibilityHeading")}
        </p>
        {(
          [
            ["reducedMotion", "settingsPage.reduceMotion"],
            ["highContrast", "settingsPage.increaseContrast"],
            ["largerText", "settingsPage.largerText"],
          ] as const
        ).map(([key, labelKey]) => (
          <label key={key} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={profile.accessibility[key]}
              onChange={(e) =>
                updateProfile({ accessibility: { ...profile.accessibility, [key]: e.target.checked } })
              }
              className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
            />
            {t(labelKey)}
          </label>
        ))}
      </section>

      <button
        type="button"
        onClick={resetProfile}
        className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {t("settingsPage.resetProfile")}
      </button>
    </div>
  );
}
