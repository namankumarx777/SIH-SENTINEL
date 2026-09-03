import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function EmptyState({ title, description, action, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="t-h3 text-ink">{title}</div>
      {description ? (
        <p className="mt-2 max-w-sm text-[13.5px] text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {children}
    </div>
  );
}
