"use client";

import { Suspense, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import { PlatformContextProvider } from "@/components/platform/context/PlatformContextProvider";
import { AssistantProfileProvider } from "@/components/platform/context/AssistantProfileProvider";
import { AuthProvider } from "@/components/platform/context/AuthProvider";
import PlatformContextHeaderSlot from "@/components/platform/context/PlatformContextHeaderSlot";
import OfflineBanner from "@/components/system/OfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // Topbar renders transparent on Home so it doesn't compete with the arrival hero. Topbar and
  // <main> are non-overlapping flex siblings (verified: header's bottom edge meets main's top
  // edge exactly, no stacking), so this isn't fixing a rendering bug — it's a deliberate cue that
  // the arrival moment has ended once the user scrolls into the real workspace below it, the same
  // "transparent at the top, solid once scrolled" pattern most premium landing pages use. Tracked
  // here (the one place with both <main> and <Topbar> as siblings) from a real scroll offset.
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
      <AssistantProfileProvider>
        <div className="flex h-screen overflow-hidden bg-[#050810]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Suspense fallback={null}>
              <PlatformContextProvider>
                <OfflineBanner />
                <MobileNavDrawer open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                <Topbar onMenuClick={() => setIsMobileNavOpen(true)} transparent={isHome && !isScrolled} />
                <main className="flex-1 overflow-y-auto" onScroll={handleMainScroll}>
                  <div
                    className={
                      isHome
                        ? "mx-auto max-w-7xl"
                        : "mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-8 lg:py-8"
                    }
                  >
                    {!isHome ? <PlatformContextHeaderSlot /> : null}
                    {children}
                  </div>
                </main>
              </PlatformContextProvider>
            </Suspense>
          </div>
        </div>
      </AssistantProfileProvider>
    </AuthProvider>
  );
}
