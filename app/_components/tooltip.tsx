"use client";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface Props {
  label: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  panel?: boolean;
}

export function Tooltip({ label, children, align = "end", panel = true }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          className={`absolute top-full z-50 mt-2 whitespace-nowrap rounded-md border border-border ${
            panel ? "bg-surface px-3 py-2 text-[12.5px] shadow-1" : "bg-ink px-2 py-1 text-[11.5px] text-white shadow-1"
          } anim-fade ${align === "end" ? "right-0" : "left-0"}`}
          role="tooltip"
        >
          {panel ? (
            <span className="block text-ink">{label}</span>
          ) : (
            label
          )}
        </span>
      ) : null}
    </span>
  );
}
