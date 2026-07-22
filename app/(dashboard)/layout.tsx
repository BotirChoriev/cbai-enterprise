"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import LivingContextRibbon from "@/components/operating/LivingContextRibbon";
import MentalModelStrip from "@/components/operating/MentalModelStrip";
import AmbientTrustStrip from "@/components/operating/AmbientTrustStrip";
import FloatingIntelligencePresence from "@/components/operating/FloatingIntelligencePresence";
import OperatingContextColumn from "@/components/operating/OperatingContextColumn";
import ContinuityTimelineStrip from "@/components/operating/ContinuityTimelineStrip";
import IntelligenceAtmosphereShell from "@/components/operating/IntelligenceAtmosphereShell";
import MobileIntelligenceShell from "@/components/operating/MobileIntelligenceShell";
import LivingContextMobileToggle from "@/components/operating/LivingContextMobileToggle";
import { PlatformContextProvider } from "@/components/platform/context/PlatformContextProvider";
import { UniversalWorkspaceProvider } from "@/components/platform/context/UniversalWorkspaceProvider";
import { MissionContextProvider } from "@/components/mission/MissionContextProvider";
import { AuthProvider } from "@/components/platform/context/AuthProvider";
import VoiceOperatorProvider from "@/components/voice-operator/VoiceOperatorProvider";
import VoiceOperatorDock from "@/components/voice-operator/VoiceOperatorDock";
import OperationalObjectProvider from "@/components/operational-objects/OperationalObjectProvider";
import { EngineWorkspaceProvider } from "@/components/forward-deployed/EngineWorkspaceProvider";
import OperationalObjectComposer from "@/components/operational-objects/OperationalObjectComposer";
import CommandClarifyCard from "@/components/operational-objects/CommandClarifyCard";
import OfflineBanner from "@/components/system/OfflineBanner";
import RouteChromeFallback from "@/components/system/RouteChromeFallback";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  shouldShowAmbientTrustStrip,
  shouldShowContinuityTimeline,
  shouldShowMentalModelStrip,
  shouldShowOperatingContextColumn,
} from "@/lib/intelligence-os/progressive-disclosure";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const disclosure = useProgressiveDisclosure();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const showMentalModel = !isHome && shouldShowMentalModelStrip(pathname, disclosure);
  const showAmbientTrust = !isHome && shouldShowAmbientTrustStrip(pathname, disclosure);
  const showOperatingColumn = shouldShowOperatingContextColumn(pathname, disclosure);
  const showContinuity = shouldShowContinuityTimeline(pathname, disclosure);

  return (
    <AuthProvider>
      <div className={`cbai-platform-root flex h-screen overflow-hidden bg-[var(--cbai-shell-bg)] ${isHome ? "cbai-spatial-home-chrome" : ""}`}>
        <Sidebar />
        <div className="cbai-platform-shell flex min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={<RouteChromeFallback />}>
            <PlatformContextProvider>
              <MissionContextProvider>
                <UniversalWorkspaceProvider>
                <OperationalObjectProvider>
                <EngineWorkspaceProvider>
                <VoiceOperatorProvider>
                <OfflineBanner />
                <MobileNavDrawer open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                <Topbar onMenuClick={() => setIsMobileNavOpen(true)} spatialHome={isHome} />
                {!isHome ? <LivingContextRibbon /> : null}
                {showAmbientTrust ? <AmbientTrustStrip /> : null}
                {showMentalModel ? <MentalModelStrip /> : null}
                {!isHome && disclosure.showFloatingIntelligence ? <FloatingIntelligencePresence /> : null}
                <main className={`cbai-platform-main cbai-voice-reserved-main flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden ${isHome ? "cbai-spatial-main-scroll" : ""}`}>
                  {isHome ? (
                    <IntelligenceAtmosphereShell className="cbai-living-canvas cbai-spatial-home-atmosphere min-h-0 flex-1 overflow-visible">
                      <div className="cbai-spatial-main-canvas w-full min-w-0">{children}</div>
                    </IntelligenceAtmosphereShell>
                  ) : (
                    <MobileIntelligenceShell>
                      <IntelligenceAtmosphereShell className="cbai-operating-main relative flex min-h-0 flex-1 flex-col">
                        <div
                          className={`grid min-h-0 flex-1 grid-cols-1 ${showOperatingColumn ? "lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]" : ""}`}
                        >
                          <div className="cbai-space-enter min-w-0 px-4 py-4 lg:px-5 lg:py-5">{children}</div>
                          {showOperatingColumn ? <OperatingContextColumn className="hidden lg:flex" /> : null}
                        </div>
                        {showContinuity ? <ContinuityTimelineStrip /> : null}
                        {disclosure.showLivingContextRail ? <LivingContextMobileToggle /> : null}
                      </IntelligenceAtmosphereShell>
                    </MobileIntelligenceShell>
                  )}
                </main>
                <VoiceOperatorDock />
                <OperationalObjectComposer />
                <CommandClarifyCard />
                </VoiceOperatorProvider>
                </EngineWorkspaceProvider>
                </OperationalObjectProvider>
                </UniversalWorkspaceProvider>
              </MissionContextProvider>
            </PlatformContextProvider>
          </Suspense>
        </div>
      </div>
    </AuthProvider>
  );
}
