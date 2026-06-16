import type { ReactNode } from "react";

import { MobileNav } from "@/components/app/mobile-nav";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export function AppShell({
  user,
  children
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-app-bg text-ink">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar name={user.name} email={user.email} image={user.image} />
          <MobileNav />
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
