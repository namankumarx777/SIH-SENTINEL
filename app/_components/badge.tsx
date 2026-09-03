import type { ReactNode } from "react";

type Tone = "neutral" | "verified" | "pending" | "warning" | "danger" | "info" | "muted";

const toneStyles: Record<Tone, { dot: string; text: string; bg: string; border: string }> = {
  neutral: { dot: "bg-ink", text: "text-ink", bg: "bg-surface-2", border: "border-border" },
  verified: { dot: "bg-green", text: "text-green", bg: "bg-green-bg", border: "border-green/20" },
  pending: { dot: "bg-amber", text: "text-amber", bg: "bg-amber-bg", border: "border-amber/20" },
  warning: { dot: "bg-amber", text: "text-amber", bg: "bg-amber-bg", border: "border-amber/20" },
  danger: { dot: "bg-red", text: "text-red", bg: "bg-red-bg", border: "border-red/20" },
  info: { dot: "bg-blue", text: "text-blue", bg: "bg-blue-bg", border: "border-blue/20" },
  muted: { dot: "bg-muted-2", text: "text-muted", bg: "bg-surface-2", border: "border-border" },
};

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  subtle?: boolean;
}

export function StatusDot({ tone = "neutral" }: { tone?: Tone }) {
  return <span className={`dot ${toneStyles[tone].dot}`} />;
}

export function Badge({ tone = "neutral", icon, children, className = "", subtle }: Props) {
  const t = toneStyles[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none ${t.text} ${subtle ? t.bg : t.bg} ${t.border} ${className}`}
    >
      {icon ? (
        <span className="inline-flex">{icon}</span>
      ) : (
        <span className={`dot ${t.dot}`} />
      )}
      {children}
    </span>
  );
}
