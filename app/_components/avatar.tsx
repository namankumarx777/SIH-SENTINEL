import type { Person } from "@/lib/data";

interface Props {
  person?: Pick<Person, "name" | "initials"> | null;
  size?: number;
  showName?: boolean;
  subtitle?: string;
}

export function Avatar({ person, size = 28, showName, subtitle }: Props) {
  const initials = person?.initials ?? "??";
  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-full border border-border bg-surface-2 text-[11.5px] font-medium text-ink"
        style={{ width: size, height: size }}
        aria-label={person?.name}
      >
        {initials}
      </span>
      {showName && person ? (
        <span className="flex flex-col leading-tight">
          <span className="text-[13.5px] text-ink">{person.name}</span>
          {subtitle ? <span className="text-[12px] text-muted">{subtitle}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
