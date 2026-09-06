"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { IconLogout, IconBuilding, IconHome } from "./icons";
import { NAV_ITEMS } from "./mobile-nav";
import { logoutAction } from "@/lib/actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconFn = (props: any) => any;

interface PlatformNavSection {
  label: string;
  items: { href: string; label: string; icon: IconFn }[];
}

const PLATFORM_ADMIN_SECTIONS: PlatformNavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/platform-overview", label: "Dashboard", icon: IconHome }],
  },
  {
    label: "Tenant Management",
    items: [{ href: "/organizations", label: "Organizations", icon: IconBuilding }],
  },
];

const AVATAR_COLORS = [
  "bg-[#8B5CF6]",
  "bg-[#3B82F6]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
  "bg-[#EC4899]",
  "bg-[#6366F1]",
];

function getInitials(name?: string, fallbackInitials?: string): string {
  if (fallbackInitials) return fallbackInitials;
  if (!name) return "NK";
  const cleaned = name.replace(/^(Inspector|Senior|Reviewer|Dr\.|Officer)\s+/i, "");
  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatRole(role?: string): string {
  if (!role) return "Lead Investigator";
  const map: Record<string, string> = {
    admin: "Administrator",
    investigator: "Lead Investigator",
    reviewer: "Legal Reviewer",
    forensic: "Forensic Analyst",
    auditor: "External Auditor",
    external: "External Department",
  };
  return map[role.toLowerCase()] ?? (role.charAt(0).toUpperCase() + role.slice(1));
}

function getAvatarColor(name?: string): string {
  if (!name) return "bg-[#8B5CF6]";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface SidebarProps {
  user?: {
    name?: string;
    role?: string;
    initials?: string;
  } | null;
  role?: string;
  canViewAudit?: boolean;
  isPlatformAdmin?: boolean;
}

export function Sidebar({ user, role: propRole, canViewAudit, isPlatformAdmin }: SidebarProps = {}) {
  const path = usePathname() ?? "/";
  const [isLoggingOut, startLogout] = useTransition();

  const displayName = user?.name ?? "Naman Kumar";
  const activeRole = user?.role ?? propRole ?? "investigator";
  const displayRole = isPlatformAdmin ? "Platform Administrator" : formatRole(activeRole);
  const initials = getInitials(displayName, user?.initials);
  const avatarBg = getAvatarColor(displayName);

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction();
    });
  };

  const regularNavItems = NAV_ITEMS.filter((it) => it.href !== "/audit" || canViewAudit);

  return (
    <aside className="hidden w-[210px] shrink-0 lg:block">
      <div className="fixed inset-y-0 left-0 z-30 flex h-screen w-[210px] flex-col border-r border-border bg-surface overflow-hidden select-none">
        {/* Brand Header */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-white shadow-2xs"
          >
            S
          </span>
          <span className="text-[13.5px] font-semibold tracking-tight text-ink">
            SecureCase
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden">
          {isPlatformAdmin ? (
            /* Grouped sections for Platform Admin */
            <div className="flex flex-col gap-4">
              {PLATFORM_ADMIN_SECTIONS.map((section) => (
                <div key={section.label}>
                  <div className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted/50">
                    {section.label}
                  </div>
                  <ul className="flex flex-col gap-0.5">
                    {section.items.map((it) => {
                      const Icon = it.icon;
                      const active =
                        path === it.href ||
                        (it.href !== "/platform-overview" && path.startsWith(it.href + "/"));
                      return (
                        <li key={it.href}>
                          <Link
                            href={it.href}
                            className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                              active
                                ? "bg-surface-2 font-medium text-ink"
                                : "text-muted hover:bg-surface-2/60 hover:text-ink"
                            }`}
                          >
                            <Icon size={14} className={active ? "text-ink" : "text-muted"} />
                            <span>{it.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            /* Flat list for regular users */
            <ul className="flex flex-col gap-0.5">
              {regularNavItems.map((it) => {
                const Icon = it.icon as any;
                const active =
                  path === it.href ||
                  (it.href !== "/dashboard" && path.startsWith(it.href + "/"));
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                        active
                          ? "bg-surface-2 font-medium text-ink"
                          : "text-muted hover:bg-surface-2/60 hover:text-ink"
                      }`}
                    >
                      {Icon && <Icon size={14} className={active ? "text-ink" : "text-muted"} />}
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Profile Footer with Logout */}
        <div className="shrink-0 border-t border-border p-2 bg-surface">
          <div className="flex w-full items-center justify-between gap-2 rounded-lg p-1.5 hover:bg-surface-2/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${avatarBg} text-[11px] font-bold text-white shadow-2xs`}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-ink leading-tight">
                  {displayName}
                </div>
                <div className="truncate text-[11px] text-muted">
                  {displayRole}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-red hover:bg-red-bg/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <IconLogout size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
