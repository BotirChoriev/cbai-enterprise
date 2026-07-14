"use client";

import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import {
  ASSISTANT_AVATARS,
  ASSISTANT_LANGUAGES,
  DEFAULT_OPERATOR_NAME,
  WORKSPACE_ROLES,
  WORKSPACE_ROLE_LABELS,
  type WorkspaceRole,
} from "@/lib/assistant/assistant-profile";
import { countries } from "@/lib/countries";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import Avatar from "@/components/shared/Avatar";
import ThemeToggle from "@/components/shared/ThemeToggle";

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-slate-900/80 px-3 py-2 text-sm text-zinc-200 outline-none transition-colors focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20";
const labelClass = "text-xs font-medium uppercase tracking-wider text-zinc-500";

export default function AssistantSettingsForm() {
  const { profile, isActive, updateProfile, resetProfile } = useAssistantProfile();

  return (
    <div className="space-y-6">
      <div className={`${cbaiGlassCard} flex items-center gap-3 px-5 py-4`}>
        <span
          className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? "bg-emerald-400" : "bg-zinc-600"}`}
        />
        <p className="text-sm text-zinc-300">
          {isActive
            ? `Your CBAI Personal Operator is ready — saved to this browser as "${profile.name}."`
            : "Your CBAI Personal Operator is not set up yet — add your name below to activate it."}
        </p>
      </div>

      <section aria-labelledby="assistant-identity-heading" className={`${cbaiGlassCard} space-y-4 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-identity-heading">
          Personal Operator Identity
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>Your Name</span>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder="e.g. Botir"
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>Operator Name</span>
            <input
              type="text"
              value={profile.operatorName}
              onChange={(e) => updateProfile({ operatorName: e.target.value })}
              placeholder={DEFAULT_OPERATOR_NAME}
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>Workspace Role</span>
            <select
              value={profile.workspaceRole}
              onChange={(e) => updateProfile({ workspaceRole: e.target.value as WorkspaceRole })}
              className={inputClass}
            >
              {WORKSPACE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {WORKSPACE_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-1.5">
          <span className={labelClass}>Avatar</span>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => updateProfile({ avatar })}
                aria-pressed={profile.avatar === avatar}
                title={`${avatar} avatar`}
                className={`rounded-full transition-shadow ${
                  profile.avatar === avatar ? "ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-950" : ""
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
          Voice &amp; Language
        </p>

        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={profile.voiceInputEnabled}
            onChange={(e) => updateProfile({ voiceInputEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
          />
          Show voice input in the Command Center
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>Preferred Language</span>
            <select
              value={profile.preferredLanguage}
              onChange={(e) => updateProfile({ preferredLanguage: e.target.value })}
              className={inputClass}
            >
              {ASSISTANT_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code} disabled={!language.available}>
                  {language.label}
                  {language.available ? "" : " (not available yet)"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>Future Translation Language</span>
            <select
              value={profile.translationLanguage}
              onChange={(e) => updateProfile({ translationLanguage: e.target.value })}
              className={inputClass}
            >
              {ASSISTANT_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code} disabled={!language.available}>
                  {language.label}
                  {language.available ? "" : " (not available yet)"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>Speech Language (voice recognition)</span>
            <select
              value={profile.speechLanguage}
              onChange={(e) => updateProfile({ speechLanguage: e.target.value })}
              className={inputClass}
            >
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (United Kingdom)</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-zinc-600">
          English, Oʻzbek, Русский, and Türkçe are fully implemented in this platform&apos;s
          interface today. The other language options above are saved preferences, honestly
          marked unavailable rather than silently doing nothing. Voice recognition (speech-to-text)
          currently supports English only, regardless of your interface language.
        </p>
      </section>

      <section aria-labelledby="assistant-context-heading" className={`${cbaiGlassCard} space-y-4 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-context-heading">
          Context
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>Country</span>
            <select
              value={profile.country}
              onChange={(e) => updateProfile({ country: e.target.value })}
              className={inputClass}
            >
              <option value="">Not set</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClass}>Organization</span>
            <input
              type="text"
              value={profile.organization}
              onChange={(e) => updateProfile({ organization: e.target.value })}
              placeholder="Optional"
              className={inputClass}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={labelClass}>Timezone</span>
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
          Notification Preferences
        </p>
        <p className="text-xs text-zinc-600">
          Preferences are saved, but no notification delivery is connected to this platform yet —
          nothing will be sent until it is.
        </p>
        {(
          [
            ["evidenceUpdates", "Evidence updates"],
            ["missionActivity", "Mission activity"],
            ["weeklySummary", "Weekly summary"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={profile.notifications[key]}
              onChange={(e) =>
                updateProfile({ notifications: { ...profile.notifications, [key]: e.target.checked } })
              }
              className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
            />
            {label}
          </label>
        ))}
      </section>

      <section aria-labelledby="assistant-theme-heading" className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow} id="assistant-theme-heading">
          Interface Theme
        </p>
        <p className="text-xs text-zinc-500">
          System follows your device&apos;s real light/dark preference. Light and Deep are an explicit
          override, saved to this profile.
        </p>
        <ThemeToggle />
      </section>

      <section
        aria-labelledby="assistant-accessibility-heading"
        className={`${cbaiGlassCard} space-y-3 p-5`}
      >
        <p className={cbaiSectionEyebrow} id="assistant-accessibility-heading">
          Accessibility Settings
        </p>
        {(
          [
            ["reducedMotion", "Reduce motion"],
            ["highContrast", "Increase contrast"],
            ["largerText", "Larger text"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={profile.accessibility[key]}
              onChange={(e) =>
                updateProfile({ accessibility: { ...profile.accessibility, [key]: e.target.checked } })
              }
              className="h-4 w-4 rounded border-zinc-700 bg-slate-900"
            />
            {label}
          </label>
        ))}
      </section>

      <button
        type="button"
        onClick={resetProfile}
        className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        Reset Personal Operator on this browser
      </button>
    </div>
  );
}
