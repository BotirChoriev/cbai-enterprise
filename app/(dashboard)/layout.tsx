"use client";

import { Suspense, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import GlobalMissionContextBar from "@/components/operating/GlobalMissionContextBar";
import MentalModelStrip from "@/components/operating/MentalModelStrip";
import AmbientTrustStrip from "@/components/operating/AmbientTrustStrip";
import AmbientIntelligenceHint from "@/components/operating/AmbientIntelligenceHint";
import LivingContextRail from "@/components/operating/LivingContextRail";
import ContinuityTimelineStrip from "@/components/operating/ContinuityTimelineStrip";
import IntelligenceAtmosphereShell from "@/components/operating/IntelligenceAtmosphereShell";
import MobileIntelligenceShell from "@/components/operating/MobileIntelligenceShell";
import LivingContextMobileToggle from "@/components/operating/LivingContextMobileToggle";
import { PlatformContextProvider } from "@/components/platform/context/PlatformContextProvider";
import { MissionContextProvider } from "@/components/mission/MissionContextProvider";
import { AuthProvider } from "@/components/platform/context/AuthProvider";
import OfflineBanner from "@/components/system/OfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRafRef = useRef<number | null>(null);

  function handleMainScroll(event: React.UIEvent<HTMLElement>) {
    if (!isHome) return;
    const target = event.currentTarget;
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      setIsScrolled(target.scrollTop > 24);
      scrollRafRef.current = null;
    });
  }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={null}>
            <PlatformContextProvider>
              <MissionContextProvider>
                <OfflineBanner />
                <MobileNavDrawer open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                <Topbar onMenuClick={() => setIsMobileNavOpen(true)} transparent={isHome && !isScrolled} />
                <GlobalMissionContextBar />
                <AmbientTrustStrip />
                <MentalModelStrip />
                <AmbientIntelligenceHint />
                <main className="flex min-h-0 flex-1 flex-col overflow-y-auto" onScroll={handleMainScroll}>
                  {isHome ? (
                    <IntelligenceAtmosphereShell className="cbai-living-canvas min-h-0 flex-1">
                      {children}
                    </IntelligenceAtmosphereShell>
                  ) : (
                    <MobileIntelligenceShell>
                      <IntelligenceAtmosphereShell className="cbai-operating-main flex min-h-0 flex-1 flex-col">
                        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
                          <div className="cbai-space-enter overflow-y-auto px-4 py-4 lg:px-5 lg:py-5">{children}</div>
                          <LivingContextRail className="hidden lg:flex" />
                        </div>
                        <ContinuityTimelineStrip />
                        <LivingContextMobileToggle />
                      </IntelligenceAtmosphereShell>
                    </MobileIntelligenceShell>
                  )}
                </main>
              </MissionContextProvider>
            </PlatformContextProvider>
          </Suspense>
        </div>
      </div>
    </AuthProvider>
  );
}
