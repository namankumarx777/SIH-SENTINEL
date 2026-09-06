"use client";

import { useState, Suspense, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { Toaster } from "./toast";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: ReactNode;
  user?: {
    name?: string;
    role?: string;
    initials?: string;
  } | null;
  role?: string;
}

export function AppShell({ children, user, role }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* Desktop Sidebar — hidden below lg */}
      <Suspense
        fallback={
          <aside className="hidden w-[210px] shrink-0 border-r border-border bg-surface lg:block" />
        }
      >
        <Sidebar user={user} role={role} />
      </Suspense>

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        <Suspense
          fallback={
            <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface/90 px-6 backdrop-blur" />
          }
        >
          <TopBar onMenuOpen={() => setMobileNavOpen(true)} />
        </Suspense>
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="mx-auto w-full max-w-[1240px]">
            <Suspense
              fallback={
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="h-8 w-64 rounded bg-surface-2" />
                  <div className="h-4 w-96 rounded bg-surface-2" />
                  <div className="h-64 rounded-xl border border-border bg-surface" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
