"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  count?: number | string;
}

interface Props {
  basePath: string;
  tabs: Tab[];
}

export function Tabs({ basePath, tabs }: Props) {
  const path = usePathname() ?? "";
  return (
    <div className="flex items-center gap-0 border-b border-border">
      {tabs.map((t) => {
        const active =
          path === t.href ||
          (t.href !== basePath && path.startsWith(t.href + "/")) ||
          (t.href === basePath && path === basePath);
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-[13.5px] transition-colors ${
              active ? "font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.icon ? <span className="text-muted">{t.icon}</span> : null}
            {t.label}
            {typeof t.count === "number" || (typeof t.count === "string" && t.count) ? (
              <span
                className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium ${
                  active ? "bg-surface-2 text-ink" : "bg-surface-2 text-muted"
                }`}
              >
                {t.count}
              </span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-2 bottom-[-1px] h-0.5 rounded-full bg-ink" />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
