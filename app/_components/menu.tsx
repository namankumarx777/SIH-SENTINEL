"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { IconChevronDown } from "./icons";

interface Item {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}

interface Props {
  trigger: ReactNode;
  items: Item[];
  align?: "start" | "end";
}

export function Menu({ trigger, items, align = "end" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        ref.current?.querySelector("[data-menu-open]")?.removeAttribute("data-menu-open");
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
        aria-haspopup="menu"
        onClick={(e) => {
          e.stopPropagation();
          const el = ref.current?.querySelector("[data-menu]");
          const open = el?.hasAttribute("data-menu-open");
          if (open) {
            el?.removeAttribute("data-menu-open");
          } else {
            el?.setAttribute("data-menu-open", "");
          }
        }}
      >
        {trigger}
      </button>
      <div
        data-menu
        className={`absolute top-full z-40 mt-1.5 hidden min-w-[200px] flex-col overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-2 anim-pop ${
          align === "end" ? "right-0" : "left-0"
        } [&[data-menu-open]]:flex`}
        role="menu"
      >
        {items.map((it) => (
          <button
            key={it.id}
            role="menuitem"
            onClick={() => {
              ref.current?.querySelector("[data-menu]")?.removeAttribute("data-menu-open");
              it.onClick?.();
            }}
            className={`flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] hover:bg-surface-2 ${
              it.destructive ? "text-red" : "text-ink"
            }`}
          >
            {it.icon ? <span className="text-muted">{it.icon}</span> : null}
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChevronTrigger({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted">
      {children}
      <IconChevronDown size={12} />
    </span>
  );
}
