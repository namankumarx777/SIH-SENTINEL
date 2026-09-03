"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { IconX } from "./icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center anim-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widths[size]} rounded-xl border border-border bg-surface shadow-pop anim-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <div className="t-h3 text-ink">{title}</div>
            {description ? (
              <div className="mt-1 text-[13px] text-muted">{description}</div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <IconX size={14} />
          </button>
        </div>
        <div className="divider" />
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <>
            <div className="divider" />
            <div className="flex items-center justify-end gap-2 px-6 py-4">{footer}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, onClose, side = "right", title, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 anim-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 ${side === "right" ? "right-0" : "left-0"} h-full w-full max-w-[480px] border-l border-border bg-surface shadow-pop anim-slide`}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="t-h3">{title}</div>
            <button
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <IconX size={14} />
            </button>
          </div>
        ) : null}
        <div className="h-[calc(100%-130px)] overflow-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
