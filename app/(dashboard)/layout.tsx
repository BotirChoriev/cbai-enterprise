"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { PlatformContextProvider } from "@/components/platform/context/PlatformContextProvider";
import PlatformContextHeaderSlot from "@/components/platform/context/PlatformContextHeaderSlot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex h-screen overflow-hidden bg-[#050810]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <PlatformContextProvider>
            <Topbar />
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
  );
}
