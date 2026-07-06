"use client";

import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { PlatformContextProvider } from "@/components/platform/context/PlatformContextProvider";
import PlatformContextHeaderSlot from "@/components/platform/context/PlatformContextHeaderSlot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <PlatformContextProvider>
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-8 lg:py-8">
                <PlatformContextHeaderSlot />
                {children}
              </div>
            </main>
          </PlatformContextProvider>
        </Suspense>
      </div>
    </div>
  );
}
