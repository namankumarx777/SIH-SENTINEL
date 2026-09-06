"use client";
import type { ReactNode } from "react";
import { Popover, type PopoverItem } from "./popover";

interface Item {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
  onClick?: () => void;
  href?: string;
  shortcut?: string;
  description?: ReactNode;
  disabled?: boolean;
}

interface Props {
  trigger: ReactNode;
  items: Item[];
  align?: "start" | "end";
}

export function Menu({ trigger, items, align = "end" }: Props) {
  const popoverItems: PopoverItem[] = items.map((it) => ({
    id: it.id,
    label: it.label,
    icon: it.icon,
    description: it.description,
    destructive: it.destructive,
    disabled: it.disabled,
    onClick: it.onClick,
    href: it.href,
    shortcut: it.shortcut,
  }));

  return (
    <Popover
      trigger={trigger}
      items={popoverItems}
      align={align}
      matchTriggerWidth
      dark
    />
  );
}

export function ChevronTrigger({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted">
      {children}
    </span>
  );
}
