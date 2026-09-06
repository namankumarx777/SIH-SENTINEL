"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconChevronRight } from "./icons";

export function ContextualBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/dashboard") {
    return (
      <div className="flex items-center gap-1 text-[13px] text-muted">
        <span className="font-medium text-ink">Dashboard</span>
      </div>
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;

    if (seg === "cases") {
      crumbs.push({ label: "Cases", href: "/cases" });
    } else if (seg.startsWith("c-") || seg.length > 20) {
      crumbs.push({ label: seg, href: currentPath });
    } else if (seg === "documents") {
      crumbs.push({ label: "Documents", href: currentPath });
    } else if (seg.startsWith("d-") || seg.length > 20) {
      crumbs.push({ label: seg, href: currentPath });
    } else if (seg === "integrity") {
      crumbs.push({ label: "Integrity", href: currentPath });
    } else if (seg === "people") {
      crumbs.push({ label: "People", href: currentPath });
    } else if (seg === "activity") {
      crumbs.push({ label: "Activity", href: currentPath });
    } else if (seg === "sharing" || seg === "shared") {
      crumbs.push({ label: "Shared", href: currentPath });
    } else if (seg === "audit") {
      crumbs.push({ label: "Audit", href: "/audit" });
    } else if (seg === "ai") {
      crumbs.push({ label: "AI Assistant", href: "/ai" });
    } else if (seg === "admin") {
      crumbs.push({ label: "Administration", href: "/admin" });
    }
  }

  if (crumbs.length === 0) {
    return (
      <div className="flex items-center gap-1 text-[13px] text-muted">
        <span className="font-medium text-ink">SecureCase</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[12.5px]">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {idx > 0 && <IconChevronRight size={11} className="text-muted/60" />}
            {isLast ? (
              <span className="font-medium text-ink truncate max-w-[200px] sm:max-w-none">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted hover:text-ink transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
