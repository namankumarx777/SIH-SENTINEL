import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconArrowLeft } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  iconLeft,
  iconRight,
  loading,
  children,
  className = "",
  disabled,
  ...rest
}: Props) {
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[13px] gap-1.5",
    md: "h-9 px-3.5 text-[13.5px] gap-2",
    lg: "h-10 px-4 text-sm gap-2",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-ink text-white border-ink hover:bg-accent-hover disabled:opacity-60",
    secondary:
      "bg-surface text-ink border-border hover:bg-surface-2 disabled:opacity-50",
    ghost:
      "bg-transparent text-ink border-transparent hover:bg-surface-2 disabled:opacity-40",
    danger:
      "bg-red text-white border-red hover:opacity-90 disabled:opacity-60",
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md border font-medium transition-colors duration-150 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {iconLeft ? <span className="-ml-0.5 inline-flex">{iconLeft}</span> : null}
      <span className="truncate">{children}</span>
      {iconRight ? <span className="-mr-0.5 inline-flex">{iconRight}</span> : null}
    </button>
  );
}

export function BackButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft={<IconArrowLeft size={14} />}
      {...props}
    >
      Back
    </Button>
  );
}
