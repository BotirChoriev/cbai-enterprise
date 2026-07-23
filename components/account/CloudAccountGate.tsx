"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { mayAccessTeamCollaboration } from "@/lib/canonical-contracts/trust-tiers";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnPrimary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  readonly children: ReactNode;
  /** When true (default), soft-redirect to /account after session restore if not cloud-signed-in. */
  readonly softRedirect?: boolean;
};

/**
 * Soft collaboration gate for static export (no middleware).
 * Shared org/team surfaces require a verified cloud session (DD-PC-002 / SF-2) —
 * device-local sign-in alone is never team authority.
 */
export default function CloudAccountGate({ children, softRedirect = true }: Props) {
  const { accountMode, cloudSessionRestoring, isCloudConfigured } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = mayAccessTeamCollaboration(accountMode);

  useEffect(() => {
    if (!softRedirect || cloudSessionRestoring || allowed) return;
    const next = pathname && pathname !== "/account" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/account${next}`);
  }, [softRedirect, cloudSessionRestoring, allowed, pathname, router]);

  if (cloudSessionRestoring) {
    return (
      <div className={`${cbaiGlassCard} space-y-2 p-6`} role="status">
        <p className={cbaiSectionEyebrow}>{t("accountPage.cloudGateTitle")}</p>
        <p className="text-sm text-zinc-500">{t("accountPage.cloudGateRestoring")}</p>
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  const body =
    accountMode === "device-local"
      ? t("accountPage.cloudGateLocalOnly")
      : !isCloudConfigured
        ? t("accountPage.cloudNotConfigured")
        : t("accountPage.cloudGateBody");

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-6`} role="status">
      <div>
        <p className={cbaiSectionEyebrow}>{t("accountPage.cloudGateTitle")}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">{t("accountPage.cloudGateHeading")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
      </div>
      <Link href="/account" className={`${cbaiBtnPrimary} inline-flex`}>
        {t("accountPage.cloudGateCta")}
      </Link>
    </div>
  );
}
