"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { LOCAL_ACCOUNT_NOTICE } from "@/lib/auth/auth-types";
import { loadProjects } from "@/lib/project/project-store";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Mode = "sign-in" | "sign-up";

function SignedInView() {
  const { user, signOut } = useAuth();
  const { context } = usePlatformContext();
  if (!user) return null;

  const projectCount = loadProjects().length;
  const bookmarkCount = context.pinnedEntities.length;

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>Account</p>
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

function SignedOutView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
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
        <p className={cbaiSectionEyebrow}>Account</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          {mode === "sign-in" ? "Sign in" : "Create a local account"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sign in to keep your own Projects, Bookmarks, and Recent Activity separate from anyone
          else using this browser.
        </p>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-in" ? "bg-cyan-500/10 text-cyan-300" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
          }}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "sign-up" ? "bg-cyan-500/10 text-cyan-300" : "text-zinc-500 hover:text-zinc-300"}`}
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
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
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
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
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
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
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
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
            />
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {isSubmitting ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="border-t border-zinc-800/80 pt-4 text-xs leading-relaxed text-zinc-600">{LOCAL_ACCOUNT_NOTICE}</p>
    </div>
  );
}

export default function AccountForm() {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <SignedInView /> : <SignedOutView />;
}
