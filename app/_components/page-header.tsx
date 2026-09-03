import type { ReactNode } from "react";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, meta }: Props) {
  return (
    <div className="mb-8">
      {eyebrow ? <div className="eyebrow mb-2">{eyebrow}</div> : null}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="t-display text-ink">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
