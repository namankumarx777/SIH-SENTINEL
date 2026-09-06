"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Role } from "@/lib/data";
import { ContextualBreadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import { Popover } from "./popover";
import {
  IconAlertOctagon,
  IconBell,
  IconClock,
  IconCommand,
  IconSearch,
  IconShare,
  IconShieldCheck,
} from "./icons";

interface Props {
  initialRole?: Role;
  onMenuOpen?: () => void;
}

export function TopBar({ initialRole = "investigator", onMenuOpen }: Props) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>(initialRole);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notifications = [
    {
      id: "n-1",
      tone: "error",
      icon: <IconAlertOctagon size={13} className="text-red" />,
      title: "Integrity Mismatch Detected",
      description: "Witness Statement.pdf diverged from blockchain block anchor.",
      time: "12 min ago",
      href: "/cases/c-0142/documents/d-002",
    },
    {
      id: "n-2",
      tone: "warning",
      icon: <IconClock size={13} className="text-amber" />,
      title: "Statutory Review Required",
      description: "Forensic Report.pdf awaits Senior Counsel sign-off.",
      time: "48 min ago",
      href: "/cases/c-0142/documents/d-003",
    },
    {
      id: "n-3",
      tone: "info",
      icon: <IconShare size={13} className="text-blue" />,
      title: "Access Revocation Warning",
      description: "District Court external share token expires in 4 days.",
      time: "3 h ago",
      href: "/shared",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/90 px-4 sm:px-6 backdrop-blur">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* Left: Minimalist Contextual Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <ContextualBreadcrumbs />
        </div>

        {/* Right: Global Search, Notifications, User Profile & RBAC */}
        <div className="flex items-center gap-2.5">
          {/* Apple Spotlight Search (⌘K) */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="group inline-flex h-8.5 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[12px] text-muted transition-colors hover:border-ink/30 hover:text-ink w-[200px] sm:w-[240px] cursor-pointer"
          >
            <IconSearch size={13} className="shrink-0 text-muted" />
            <span className="flex-1 truncate text-left">Search cases, documents, people…</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[9.5px] text-muted">
              <IconCommand size={9} />K
            </span>
          </button>

          {/* Notifications Dropdown */}
          <Popover
            align="end"
            side="bottom"
            minWidth={360}
            panelClassName="w-[360px] sm:w-[380px] border border-border bg-surface shadow-pop rounded-xl"
            trigger={
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                aria-label="Security Notifications"
              >
                <IconBell size={15} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red" />
              </button>
            }
            header={
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">
                    Investigative Alerts
                  </span>
                  <span className="rounded-full bg-red-bg px-2 py-0.5 text-[10.5px] font-medium text-red border border-red/20">
                    1 Critical
                  </span>
                </div>
                <span className="text-[11px] text-muted font-mono">Audit Feed</span>
              </>
            }
            body={
              <div className="max-h-84 divide-y divide-border overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    className="flex items-start gap-3 p-3.5 hover:bg-surface-2 transition-colors group"
                  >
                    <span className="mt-0.5 shrink-0">{n.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-[12.5px] font-medium text-ink leading-tight group-hover:text-ink transition-colors truncate">
                          {n.title}
                        </div>
                        <span className="shrink-0 text-[10.5px] text-muted font-mono">{n.time}</span>
                      </div>
                      <div className="mt-1 text-[11.5px] text-muted leading-snug">
                        {n.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            }

          />

        </div>
      </header>

      {/* Global Apple Spotlight Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
