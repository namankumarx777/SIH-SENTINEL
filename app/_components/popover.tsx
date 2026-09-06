"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export interface PopoverItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  shortcut?: string;
}

type PopoverAlign = "start" | "center" | "end";
type PopoverSide = "bottom" | "top";

interface PopoverProps {
  trigger: ReactElement | ReactNode;
  children?: ReactNode;
  items?: PopoverItem[];
  align?: PopoverAlign;
  side?: PopoverSide;
  /** Minimum width of the popover panel. */
  minWidth?: number;
  /** When true, panel width matches the trigger element width. */
  matchTriggerWidth?: boolean;
  /** When true, panel uses dark theme (for menus/popovers). */
  dark?: boolean;
  /** Class name for the panel. */
  panelClassName?: string;
  /** Class name for the trigger wrapper. */
  className?: string;
  /** When true, the popover stays open when an item is clicked (useful for confirmation flows). */
  stayOpenOnSelect?: boolean;
  /** Render the popover with a complex body (children) instead of a list of items. */
  body?: ReactNode;
  /** Optional header rendered above the items/body. */
  header?: ReactNode;
}

/**
 * Unified Popover component for menus, notifications, and contextual actions.
 *
 * - Controlled open/close with proper outside-click and Escape handling
 * - Correct ARIA (button aria-haspopup + aria-expanded, menu/menuitem roles)
 * - Animated open/close, alignment, and side options
 * - Auto-attaches onClick to the trigger element
 */
export function Popover({
  trigger,
  children,
  items,
  align = "end",
  side = "bottom",
  minWidth = 220,
  panelClassName = "",
  className = "",
  stayOpenOnSelect = false,
  matchTriggerWidth = false,
  dark = false,
  body,
  header,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape; restore focus to the previously focused trigger element.
  useEffect(() => {
    if (open) {
      // Remember which element was focused before opening.
      const previouslyFocused = document.activeElement as HTMLElement | null;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          previouslyFocused?.focus();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const close = () => setOpen(false);

  // Inject onClick + ARIA into the trigger if it's a valid element.
  const triggerNode = isValidElement(trigger) ? (
    cloneElement(
      trigger as ReactElement<{
        onClick?: (e: React.MouseEvent) => void;
        "aria-haspopup"?: boolean;
        "aria-expanded"?: boolean;
        "aria-controls"?: string;
      }>,
      {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen((s) => !s);
          const orig = (trigger as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props
            .onClick;
          orig?.(e);
        },
        "aria-haspopup": true,
        "aria-expanded": open,
        "aria-controls": panelId,
      }
    )
  ) : (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setOpen((s) => !s);
      }}
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={panelId}
      className="inline-flex cursor-pointer"
    >
      {trigger}
    </span>
  );

  const alignmentClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  const sideClass = side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5";

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex ${className}`}
      data-state={open ? "open" : "closed"}
    >
      {triggerNode}
      {open && (
        <div
          id={panelId}
          role={items ? "menu" : "dialog"}
          className={`absolute z-40 ${sideClass} ${
            matchTriggerWidth ? "left-0 w-full" : alignmentClass
          } overflow-hidden rounded-xl border ${
            dark
              ? "border-white/10 bg-[#18181a] shadow-pop"
              : "border-border bg-surface shadow-pop"
          } anim-pop ${panelClassName}`}
          style={matchTriggerWidth ? { width: "100%" } : { minWidth }}
        >
          {header && (
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              {header}
            </div>
          )}
          {body ? (
            body
          ) : items ? (
            <div className="py-1" role="none">
              {items.map((it) => {
                const inner = (
                  <>
                    {it.icon ? (
                      <span
                        className={`shrink-0 ${dark ? "text-neutral-400" : it.destructive ? "text-red" : "text-muted"}`}
                      >
                        {it.icon}
                      </span>
                    ) : null}
                    <span className="flex-1 truncate text-left">
                      <span className="font-medium">{it.label}</span>
                      {it.description ? (
                        <span className={`ml-1.5 text-[11.5px] ${dark ? "text-neutral-500" : "text-muted"}`}>
                          {it.description}
                        </span>
                      ) : null}
                    </span>
                    {it.shortcut ? (
                      <span className={`ml-auto rounded border px-1.5 py-0.5 font-mono text-[10.5px] ${dark ? "border-white/10 bg-white/[0.06] text-neutral-400" : "border-border bg-surface-2 text-muted"}`}>
                        {it.shortcut}
                      </span>
                    ) : null}
                  </>
                );

                if (it.href && !it.disabled) {
                  return (
                    <a
                      key={it.id}
                      href={it.href}
                      role="menuitem"
                      onClick={() => !stayOpenOnSelect && close()}
                      className={`flex items-center gap-2.5 px-3 py-2 text-[13.5px] outline-none transition-colors ${
                        dark
                          ? "text-neutral-200 hover:bg-white/[0.08] hover:text-white"
                          : "text-ink hover:bg-surface-2"
                      } ${it.destructive ? (dark ? "text-red-400" : "text-red") : ""}`}
                    >
                      {inner}
                    </a>
                  );
                }

                return (
                  <button
                    key={it.id}
                    type="button"
                    role="menuitem"
                    disabled={it.disabled}
                    onClick={() => {
                      it.onClick?.();
                      if (!stayOpenOnSelect) close();
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] outline-none transition-colors ${
                      dark
                        ? "text-neutral-200 hover:bg-white/[0.08] hover:text-white disabled:text-neutral-500"
                        : "text-ink hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                    } ${
                      it.destructive
                        ? dark
                          ? "text-red-400 hover:text-red-300"
                          : "text-red"
                        : ""
                    }`}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
