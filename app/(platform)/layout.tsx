import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { AppShell } from "@/app/_components/app-shell";
import type { ReactNode } from "react";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const session = await requirePlatformAdmin();

  return (
    <AppShell
      user={{
        name: session.name,
        role: "platform-admin",
        initials: session.initials ?? session.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
      }}
      role="platform-admin"
      isPlatformAdmin={true}
    >
      {children}
    </AppShell>
  );
}
