"use client";

import { Suspense, useState } from "react";
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
                <Topbar onMenuClick={() => setIsMobileNavOpen(true)} />
                <main className="flex-1 overflow-y-auto">
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
