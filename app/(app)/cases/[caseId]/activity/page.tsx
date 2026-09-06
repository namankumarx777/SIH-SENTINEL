import { listAuditForCase } from "@/lib/repos/audit";
import { findCaseForSession } from "@/lib/repos/cases";
import { notFound } from "next/navigation";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { formatTime, type ActivityEvent } from "@/lib/data";
import { IconActivity, IconFilter } from "@/app/_components/icons";
import { Button } from "@/app/_components/button";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default async function CaseActivity({ params }: PageProps) {
  const { caseId } = await params;
  const c = await findCaseForSession(caseId);
  if (!c) notFound();
  const events = await listAuditForCase(caseId);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-[13px] text-muted">{events.length} events</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" iconLeft={<IconFilter size={12} />}>
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            Export
          </Button>
        </div>
      </div>

      <ol className="relative">
        <span className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />
        {events.map((e: ActivityEvent) => {
          const resultTone =
            e.result === "failure"
              ? "danger"
              : e.result === "warning"
                ? "warning"
                : e.result === "info"
                  ? "info"
                  : "verified";
          return (
            <li
              key={e.id}
              className="relative flex items-start gap-4 pb-7 last:pb-0"
            >
              <span className="z-10 mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted">
                <IconActivity size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11.5px] text-muted">
                  <span>{formatTime(e.at)}</span>
                  {e.meta ? <span>· {e.meta}</span> : null}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar person={{ name: e.actor, initials: getInitials(e.actor) }} size={22} />
                  <div className="text-[13.5px] leading-snug">
                    <span className="font-medium text-ink">{e.actor}</span>{" "}
                    <span className="text-muted">{e.action.toLowerCase()}</span>{" "}
                    <span className="font-medium text-ink">{e.resource}</span>
                  </div>
                </div>
              </div>
              <Badge tone={resultTone} subtle>
                {e.result}
              </Badge>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
