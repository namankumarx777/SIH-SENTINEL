import Link from "next/link";
import { activity, findCase, findDocument, findPerson, formatDateTime } from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { PageHeader } from "@/app/_components/page-header";
import {
  IconCalendar,
  IconDownload,
  IconFilter,
} from "@/app/_components/icons";

export default function AuditPage() {
  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Audit"
        description="Immutable log of every action across the workspace. Records are append-only."
        actions={
          <>
            <Button variant="secondary" iconLeft={<IconCalendar size={13} />}>
              Last 30 days
            </Button>
            <Button variant="secondary" iconLeft={<IconDownload size={13} />}>
              Export
            </Button>
          </>
        }
        meta={
          <div className="flex items-center gap-2 text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 text-green">
              <span className="dot bg-green" /> Audit chain healthy
            </span>
            <span className="text-muted">·</span>
            <span className="text-muted">{activity.length} events</span>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Pill label="Action" />
        <Pill label="Case" />
        <Pill label="User" />
        <Pill label="Result" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[180px_180px_140px_140px_180px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Timestamp</div>
          <div>Actor</div>
          <div>Action</div>
          <div>Case</div>
          <div>Resource</div>
          <div>Result</div>
          <div />
        </div>
        {activity.map((a, idx) => {
          const c = a.caseId ? findCase(a.caseId) : undefined;
          const d = a.documentId ? findDocument(a.documentId) : undefined;
          const p = findPerson(a.actor);
          const isLast = idx === activity.length - 1;
          return (
            <div
              key={a.id}
              className={`grid grid-cols-[180px_180px_140px_140px_180px_140px_40px] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2 ${
                isLast ? "" : "border-b border-border"
              }`}
            >
              <div className="text-[12.5px] text-muted">{formatDateTime(a.at)}</div>
              <div className="flex items-center gap-2">
                <Avatar person={p} size={22} />
                <span className="text-[12.5px] text-ink">{p?.name}</span>
              </div>
              <div className="text-[12.5px] text-muted">{a.action}</div>
              <div className="font-mono text-[12px] text-muted">{c?.number ?? "—"}</div>
              <div className="truncate text-[12.5px] text-ink">{d?.name ?? a.resource}</div>
              <div>
                {a.result === "failure" ? (
                  <Badge tone="danger" subtle>
                    failure
                  </Badge>
                ) : a.result === "warning" ? (
                  <Badge tone="warning" subtle>
                    warning
                  </Badge>
                ) : a.result === "info" ? (
                  <Badge tone="info" subtle>
                    info
                  </Badge>
                ) : (
                  <Badge tone="verified" subtle>
                    success
                  </Badge>
                )}
              </div>
              <Link
                href={
                  a.documentId
                    ? `/cases/${a.caseId}/documents/${a.documentId}`
                    : a.caseId
                      ? `/cases/${a.caseId}`
                      : "/audit"
                }
                className="text-subtle hover:text-muted"
              >
                ↗
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
        <span>Showing {activity.length} events</span>
        <span>Anchor: 0x91ab07c…71d · Block #184,221</span>
      </div>
    </>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-[12px] text-muted hover:bg-surface-2 hover:text-ink"
    >
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
