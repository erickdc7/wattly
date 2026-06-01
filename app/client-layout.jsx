"use client";

import { TenantProvider } from "@/context/TenantContext";
import { MobileHeader, DesktopSidebar } from "@/components/Sidebar";

export function ClientLayout({ children }) {
  return (
    <TenantProvider>
      <div className="font-['Inter'] bg-[#f3f4f5] text-[#191c1d] min-h-screen flex flex-col">
        <MobileHeader />
        <div className="flex flex-1">
          <DesktopSidebar />
          <main className="flex-1 bg-[#f3f4f5] p-4 lg:p-10 flex flex-col min-w-0">
            <div className="max-w-7xl mx-auto flex-1 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
