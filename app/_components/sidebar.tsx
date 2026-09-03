"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconActivity,
  IconBuilding,
  IconFile,
  IconFolder,
  IconHome,
  IconShare,
  IconUsers,
} from "./icons";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/cases", label: "Cases", icon: IconFolder },
  { href: "/documents", label: "Documents", icon: IconFile },
  { href: "/shared", label: "Shared", icon: IconShare },
  { href: "/audit", label: "Audit", icon: IconActivity },
  { href: "/admin", label: "Administration", icon: IconBuilding },
];

export function Sidebar() {
  const path = usePathname() ?? "/";

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[11.5px] font-semibold text-white"
        >
          S
        </span>
        <span className="text-[14px] font-semibold tracking-tight text-ink">SecureCase</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const active = path === it.href || path.startsWith(it.href + "/");
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
                    active
                      ? "bg-surface-2 font-semibold text-ink"
                      : "text-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icon size={15} />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border px-4 py-4">
        <div className="eyebrow mb-2">Workspace</div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-[12px] font-semibold text-ink">
            CB
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-ink">Central Bureau</div>
            <div className="text-[11.5px] text-muted">Production · Tier 3</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
