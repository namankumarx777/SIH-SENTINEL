"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { IconCheck, IconChevronDown, IconSearch, IconX } from "./icons";

export interface SelectOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

type SelectSize = "sm" | "md";
type SelectVariant = "default" | "form" | "ghost";

interface SelectBaseProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  size?: SelectSize;
  variant?: SelectVariant;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Alignment of popup menu relative to the button: "left" | "right" | "auto" (default: "auto") */
  align?: "left" | "right" | "auto";
  /** Placement side of popup menu: "bottom" | "top" | "auto" (default: "auto") */
  side?: "bottom" | "top" | "auto";
  /** Optional class name for the popup menu container */
  menuClassName?: string;
  /** When true, allows the user to clear selection */
  clearable?: boolean;
  /** When true, allows the user to type to filter options. */
  searchable?: boolean;
  /** Optional name attribute for hidden form input. */
  name?: string;
  /** Accessible label override (otherwise the field needs an external <label>). */
  "aria-label"?: string;
}

type SelectProps = SelectBaseProps;

/**
 * Unified Select / dropdown component.
 *
 * Replaces native <select> with a fully custom dropdown that supports:
 * - Keyboard navigation (Up/Down/Enter/Escape/Type-ahead)
 * - Search/filter (when searchable is true)
 * - Proper ARIA combobox semantics
 * - Configurable size + variant for toolbar vs. form usage
 * - A hidden <input name=…> so it works inside <form action={serverAction}>
 */
export function Select({
  options,
  value,
  onChange,
  size = "md",
  variant = "default",
  placeholder = "Select…",
  disabled = false,
  className = "",
  align = "auto",
  side = "auto",
  menuClassName = "",
  clearable = false,
  searchable = false,
  name,
  ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [query, setQuery] = useState("");
  const [computedAlign, setComputedAlign] = useState<"left" | "right">("left");
  const [verticalSide, setVerticalSide] = useState<"bottom" | "top">("bottom");
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(256);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const labelId = useId();

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const labelText =
        typeof o.label === "string" ? o.label.toLowerCase() : "";
      const descText =
        typeof o.description === "string" ? o.description.toLowerCase() : "";
      return labelText.includes(q) || descText.includes(q);
    });
  }, [options, query, searchable]);

  // Close on outside click.
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

  // Viewport collision, vertical auto-flip, and horizontal alignment detection
  useEffect(() => {
    if (!open || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal alignment
    if (align === "right") {
      setComputedAlign("right");
    } else if (align === "left") {
      setComputedAlign("left");
    } else {
      // "auto": check if trigger is in right half of screen or less than 320px from right edge
      if (rect.right > viewportWidth * 0.48 || viewportWidth - rect.left < 320) {
        setComputedAlign("right");
      } else {
        setComputedAlign("left");
      }
    }

    // Vertical placement (auto-flip if space below is constrained)
    const spaceBelow = viewportHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    if (side === "top") {
      setVerticalSide("top");
      setMaxMenuHeight(Math.min(320, Math.max(140, spaceAbove)));
    } else if (side === "bottom") {
      setVerticalSide("bottom");
      setMaxMenuHeight(Math.min(320, Math.max(140, spaceBelow)));
    } else {
      // auto: flip to top if space below is less than 250px and space above has more room
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setVerticalSide("top");
        setMaxMenuHeight(Math.min(300, Math.max(150, spaceAbove)));
      } else {
        setVerticalSide("bottom");
        setMaxMenuHeight(Math.min(300, Math.max(150, spaceBelow)));
      }
    }
  }, [open, align, side]);


  // Close on Escape, focus the search input on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Focus search or listbox when opened
    const t = setTimeout(() => {
      if (searchable) {
        searchRef.current?.focus();
      } else {
        listRef.current?.focus();
      }
    }, 10);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, searchable]);

  // Scroll active option into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const select = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      onChange(opt.value);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(
          Math.max(
            0,
            options.findIndex((o) => o.value === value)
          )
        );
        return;
      }
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(
          Math.max(
            0,
            options.findIndex((o) => o.value === value)
          )
        );
        return;
      }
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter" && open && activeIndex >= 0) {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) select(opt);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    } else if (/^[a-zA-Z0-9]$/.test(e.key) && !searchable) {
      // Type-ahead: focus the first option starting with the typed character.
      const ch = e.key.toLowerCase();
      const idx = options.findIndex((o) => {
        const labelText = typeof o.label === "string" ? o.label : "";
        return labelText.toLowerCase().startsWith(ch);
      });
      if (idx >= 0) {
        e.preventDefault();
        setActiveIndex(idx);
      }
    }
  };

  const variantClasses = {
    default:
      "border border-border bg-surface text-ink hover:bg-surface-2 hover:border-ink/30",
    form: "border border-border bg-surface-2/60 text-ink focus-within:border-ink/50 focus-within:bg-surface",
    ghost:
      "border border-transparent bg-surface text-muted hover:bg-surface-2 hover:text-ink hover:border-border",
  }[variant];

  const sizeClasses = {
    sm: "h-9 text-[12.5px] px-3 rounded-xl",
    md: "h-10 text-[13px] px-3.5 rounded-xl",
  }[size];

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex ${className}`}
      data-state={open ? "open" : "closed"}
    >
      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={rest["aria-label"] ? undefined : labelId}
        aria-label={rest["aria-label"]}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        onKeyDown={onKeyDown}
        className={`group inline-flex w-full items-center justify-between gap-2 font-medium outline-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses} ${sizeClasses} ${
          open ? "border-ink/50" : ""
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
          {selected?.icon ? (
            <span className="shrink-0 text-muted">{selected.icon}</span>
          ) : null}
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearable && value && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="hidden rounded p-0.5 text-muted/60 hover:text-ink group-hover:inline-flex cursor-pointer"
            >
              <IconX size={12} />
            </span>
          ) : null}
          <IconChevronDown
            size={12}
            className={`text-muted transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            activeIndex >= 0
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
          className={`absolute z-50 min-w-full w-max min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_4px_10px_-4px_rgba(0,0,0,0.04)] anim-pop ${
            verticalSide === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${
            computedAlign === "right" ? "right-0 left-auto" : "left-0 right-auto"
          } ${menuClassName}`}
          style={{ maxWidth: "min(380px, calc(100vw - 24px))" }}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <IconSearch size={13} className="shrink-0 text-muted" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search…"
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted/60"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter" && activeIndex >= 0) {
                    e.preventDefault();
                    const opt = filtered[activeIndex];
                    if (opt) select(opt);
                  }
                }}
              />
            </div>
          )}

          <div
            className="overflow-y-auto space-y-0.5 overscroll-contain"
            style={{ maxHeight: `${maxMenuHeight}px` }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-center text-[12.5px] text-muted">
                No matches
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIndex;
                return (
                  <div
                    key={opt.value}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    data-option-index={i}
                    onClick={() => select(opt)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors ${
                      isActive || isSelected ? "bg-surface-2" : "hover:bg-surface-2"
                    } ${
                      isSelected ? "text-ink font-medium" : "text-ink/85"
                    } ${
                      opt.disabled
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5 py-0.5">
                      {opt.icon ? (
                        <span className="mt-0.5 shrink-0 text-muted">{opt.icon}</span>
                      ) : null}
                      <div className="flex flex-col min-w-0 flex-1 text-left">
                        <span className="font-medium text-ink leading-snug">{opt.label}</span>
                        {opt.description ? (
                          <span className="text-[11.5px] text-muted font-normal leading-snug mt-0.5 line-clamp-2">
                            {opt.description}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {isSelected ? (
                      <IconCheck
                        size={13}
                        className="shrink-0 text-ink mt-1 ml-1.5"
                      />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

      )}
    </div>
  );
}

/**
 * Convenience: render a Select that fills its parent's width.
 */
export function FullWidthSelect(props: SelectProps) {
  return <Select {...props} className={`w-full ${props.className ?? ""}`} />;
}
