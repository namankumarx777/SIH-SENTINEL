"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconActivity,
  IconBuilding,
  IconFile,
  IconFolder,
  IconHome,
  IconLogout,
  IconShare,
  IconSparkles,
  IconX,
} from "./icons";
import { logoutAction } from "@/lib/actions";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/cases", label: "Cases", icon: IconFolder },
  { href: "/documents", label: "Documents", icon: IconFile },
  { href: "/ai", label: "AI Assistant", icon: IconSparkles },
  { href: "/shared", label: "Shared", icon: IconShare },
  { href: "/audit", label: "Audit", icon: IconActivity },
  { href: "/admin", label: "Administration", icon: IconBuilding },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const path = usePathname() ?? "/";

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="absolute left-0 top-0 flex h-full w-[240px] flex-col border-r border-border bg-surface shadow-pop"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((it) => {
              const Icon = it.icon;
              const active =
                path === it.href ||
                (it.href !== "/dashboard" && path.startsWith(it.href + "/"));

              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onClose}
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
        </nav>

        {/* Profile footer / logout */}
        <div className="shrink-0 border-t border-border p-2 bg-surface">
          <form
            action={async () => {
              await logoutAction();
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-muted hover:bg-red-bg/50 hover:text-red transition-colors"
            >
              <IconLogout size={14} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
