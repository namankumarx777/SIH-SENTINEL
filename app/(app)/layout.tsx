import { AppShell } from "@/app/_components/app-shell";
import { getSessionUser } from "@/lib/session";
import type { ReactNode } from "react";

export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  return (
    <AppShell
      user={session.user}
      role={session.role}
      canViewAudit={session.canViewAudit}
      isPlatformAdmin={session.isPlatformAdmin}
    >
      {children}
    </AppShell>
  );
}
