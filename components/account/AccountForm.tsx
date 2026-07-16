"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { LOCAL_ACCOUNT_NOTICE } from "@/lib/auth/auth-types";
import { loadProjects } from "@/lib/project/project-store";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type LocalMode = "sign-in" | "sign-up";
type CloudMode = "sign-in" | "sign-up" | "forgot-password";
type AccountTab = "cloud" | "local";

const CLOUD_ACCOUNT_NOTICE =
  "Cloud account — verified by a real server (Supabase). Your Projects, Bookmarks, and Reports sync across " +
  "every browser and device you sign into with this email.";

function AccountModeBadge() {
  const { accountMode } = useAuth();
  const labels: Record<typeof accountMode, string> = {
    cloud: "Cloud Account — synced across devices",
    "device-local": "Device-Local Account — this browser only",
    "signed-out": "Signed Out",
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

function CloudSignedInView() {
  const { cloudUser, cloudSignOut } = useAuth();
  if (!cloudUser) return null;

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Cloud Account</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{cloudUser.email}</h2>
        </div>
        <AccountModeBadge />
      </div>

      {!cloudUser.emailConfirmed ? (
        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Your email is not confirmed yet. Check your inbox for a confirmation link — some cloud features may be
          limited until you confirm.
        </p>
      ) : null}

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{CLOUD_ACCOUNT_NOTICE}</p>

      <div className="flex flex-wrap gap-2">
        <Link href="/my-work" className={cbaiBtnPrimary}>
          Continue Working
        </Link>
        <button
          type="button"
          onClick={async () => {
            await cloudSignOut();
          }}
          className={cbaiBtnSecondary}
        >
          Sign Out of Cloud
        </button>
      </div>
    </div>
  );
}

function CloudSignedOutView() {
  const { cloudSignIn, cloudSignUp, requestPasswordReset, isCloudConfigured } = useAuth();
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
      setNotice("If an account exists for that email, a password reset link has been sent.");
      return;
    }

    const result = mode === "sign-in" ? await cloudSignIn(email, password) : await cloudSignUp(email, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "sign-up" && !result.user.emailConfirmed) {
      setNotice("Account created. Check your email to confirm before all cloud features are available.");
      return;
    }
    window.location.href = "/my-work";
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>Cloud Account</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          {mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create a cloud account" : "Reset password"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          A real, server-verified account — sync your Projects, Bookmarks, and Reports across every device.
        </p>
      </div>

      {!isCloudConfigured ? (
        <p className="rounded-md bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500">
          Cloud accounts are not configured in this deployment yet (no Supabase project connected). You can still
          use a Device-Local Account below, or try submitting — the app will tell you plainly if it can&apos;t reach
          the cloud.
        </p>
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
            Sign In
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
            Create Account
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="cloud-email" className="text-xs text-zinc-500">
            Email
          </label>
          <input
            id="cloud-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        {mode !== "forgot-password" ? (
          <div>
            <label htmlFor="cloud-password" className="text-xs text-zinc-500">
              Password
            </label>
            <input
              id="cloud-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
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
            Forgot password?
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
            ← Back to sign in
          </button>
        ) : null}

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}
        {notice ? <p className="text-xs text-emerald-400">{notice}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign In"
              : mode === "sign-up"
                ? "Create Account"
                : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

function LocalSignedInView() {
  const { user, signOut } = useAuth();
  const { context } = usePlatformContext();
  if (!user) return null;

  const projectCount = loadProjects().length;
  const bookmarkCount = context.pinnedEntities.length;

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>Device-Local Account</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">{user.displayName}</h2>
        <p className="text-sm text-zinc-500">{user.email}</p>
        {user.organization ? <p className="mt-1 text-xs text-zinc-600">{user.organization}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Projects</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{projectCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Bookmarks</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{bookmarkCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Member since</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{LOCAL_ACCOUNT_NOTICE}</p>

      <div className="flex flex-wrap gap-2">
        <Link href="/my-work" className={cbaiBtnPrimary}>
          Continue Working
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            window.location.href = "/account";
          }}
          className={cbaiBtnSecondary}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function LocalSignedOutView() {
  const { signIn, signUp } = useAuth();
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
        <p className={cbaiSectionEyebrow}>Device-Local Account</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          {mode === "sign-in" ? "Sign in" : "Create a local account"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sign in to keep your own Projects, Bookmarks, and Recent Activity separate from anyone
          else using this browser. Stays on this device only — for cross-device sync, use a Cloud Account instead.
        </p>
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
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
          }}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-up" ? "bg-teal-500/10 text-teal-300" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "sign-up" ? (
          <div>
            <label htmlFor="account-name" className="text-xs text-zinc-500">
              Name
            </label>
            <input
              id="account-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="account-email" className="text-xs text-zinc-500">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        <div>
          <label htmlFor="account-password" className="text-xs text-zinc-500">
            Password
          </label>
          <input
            id="account-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
          />
        </div>

        {mode === "sign-up" ? (
          <div>
            <label htmlFor="account-org" className="text-xs text-zinc-500">
              Organization (optional)
            </label>
            <input
              id="account-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. a university, company, or agency"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/30"
            />
          </div>
        ) : null}

        {error ? <p className="text-xs text-amber-400">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{LOCAL_ACCOUNT_NOTICE}</p>
    </div>
  );
}

export default function AccountForm() {
  const { isSignedIn, isCloudSignedIn, isCloudConfigured } = useAuth();
  // Default to whichever tab actually works in this deployment. Previously this always opened on
  // "cloud" — in a deployment with no Supabase project connected (real, honest, and currently the
  // case in production), that put a real-looking sign-in form in front of every new visitor, with
  // the "not configured" notice easy to miss above the Email/Password fields. A user could submit
  // real credentials into a form that was never going to work. isCloudConfigured is a build-time
  // env-var check (identical on server and client — see lib/supabase/client.ts), so this is safe
  // to use directly as the initial state with no hydration risk.
  const [tab, setTab] = useState<AccountTab>(isCloudConfigured ? "cloud" : "local");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setTab("cloud")}
          className={`flex-1 rounded-lg border px-3 py-2 font-medium transition-colors ${tab === "cloud" ? "border-teal-500/40 bg-teal-500/10 text-teal-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
        >
          Cloud Account {isCloudSignedIn ? "●" : ""}
        </button>
        <button
          type="button"
          onClick={() => setTab("local")}
          className={`flex-1 rounded-lg border px-3 py-2 font-medium transition-colors ${tab === "local" ? "border-teal-500/40 bg-teal-500/10 text-teal-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
        >
          Device-Local Account {isSignedIn ? "●" : ""}
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
