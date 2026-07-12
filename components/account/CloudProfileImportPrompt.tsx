"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { fetchCloudProfile, type CloudProfile } from "@/lib/supabase/cloud-profile";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function dismissedKey(cloudUserId: string): string {
  return `cbai-profile-import-dismissed:${cloudUserId}`;
}

/**
 * "Offer import when local preferences differ, never overwrite without explicit rules" (Phase 12).
 * Fetches the real cloud profile once per cloud sign-in; if it has a real assistant name/avatar
 * that differs from this device's local Assistant profile, asks before loading it — the local
 * profile is never silently overwritten by whatever happened to sync from another device first.
 */
export default function CloudProfileImportPrompt() {
  const { cloudUser } = useAuth();
  const { profile, isActive, updateProfile } = useAssistantProfile();
  const [cloudProfile, setCloudProfile] = useState<CloudProfile | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!cloudUser) return;
    let cancelled = false;
    fetchCloudProfile(cloudUser.id).then((result) => {
      if (!cancelled) setCloudProfile(result);
    });
    return () => {
      cancelled = true;
    };
  }, [cloudUser]);

  if (!cloudUser || !cloudProfile || dismissed || applied || !isBrowser()) return null;
  if (isBrowser() && window.localStorage.getItem(dismissedKey(cloudUser.id))) return null;

  const cloudHasRealPreferences = Boolean(cloudProfile.assistantName || cloudProfile.workspaceRole);
  const differs = cloudHasRealPreferences && (!isActive || cloudProfile.assistantName !== profile.name);
  if (!differs) return null;

  function handleLoad() {
    updateProfile({
      name: cloudProfile!.assistantName || profile.name,
      workspaceRole: (cloudProfile!.workspaceRole as typeof profile.workspaceRole) || profile.workspaceRole,
      preferredLanguage: cloudProfile!.preferredLanguage || profile.preferredLanguage,
      country: cloudProfile!.country || profile.country,
      timezone: cloudProfile!.timezone || profile.timezone,
      organization: cloudProfile!.organization || profile.organization,
    });
    setApplied(true);
  }

  function handleKeepLocal() {
    if (isBrowser() && cloudUser) {
      window.localStorage.setItem(dismissedKey(cloudUser.id), new Date().toISOString());
    }
    setDismissed(true);
  }

  return (
    <div className={`${cbaiGlassCard} space-y-3 border-cyan-500/20 p-5`}>
      <p className={cbaiSectionEyebrow}>Cloud Assistant preferences found</p>
      <p className="text-sm text-zinc-300">
        Your cloud account has a saved Assistant profile ({cloudProfile.assistantName || "unnamed"}) that differs
        from this device&apos;s local one. Load the cloud version here, or keep this device&apos;s local
        preferences — either way, nothing is overwritten without your choice.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleLoad} className={cbaiBtnPrimary}>
          Load Cloud Preferences
        </button>
        <button type="button" onClick={handleKeepLocal} className={cbaiBtnSecondary}>
          Keep This Device&apos;s Preferences
        </button>
      </div>
    </div>
  );
}
