import Link from "next/link";
import {
  cases,
  findPerson,
  formatDate,
  formatTime,
} from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconChevronDown,
  IconChevronRight,
  IconFilter,
  IconFolder,
  IconPlus,
  IconSearch,
} from "@/app/_components/icons";
import { PageHeader } from "@/app/_components/page-header";

export default function CasesPage() {
  const sorted = [...cases].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Cases"
        description="Each case is an isolated workspace. Documents, evidence, and audit history are bound to the case."
        actions={
          <>
            <Button variant="secondary" iconLeft={<IconFilter size={13} />}>
              Filters
            </Button>
            <Button variant="primary" iconLeft={<IconPlus size={13} />}>
              New case
            </Button>
          </>
        }
        meta={
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <span>{cases.length} cases</span>
            <span>·</span>
            <span>{cases.filter((c) => c.status === "active").length} active</span>
            <span>·</span>
            <span>last updated {formatTime(cases[0].updatedAt)}</span>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3">
          <IconSearch size={14} className="text-muted" />
          <input
            placeholder="Search by case number, title, or jurisdiction"
            className="h-full w-full bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
          />
        </div>
        <div className="flex items-center gap-1 text-[12.5px]">
          <Pill label="Status" />
          <Pill label="Classification" />
          <Pill label="Lead" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[180px_1fr_120px_180px_120px_120px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Case number</div>
          <div>Title</div>
          <div>Status</div>
          <div>Lead</div>
          <div className="text-right">Documents</div>
          <div>Updated</div>
          <div />
        </div>
        {sorted.map((c, idx) => {
          const lead = findPerson(c.lead);
          const isLast = idx === sorted.length - 1;
          return (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className={`group grid grid-cols-[180px_1fr_120px_180px_120px_120px_40px] items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2 ${isLast ? "" : "border-b border-border"}`}
            >
              <div className="font-mono text-[13px] text-ink">{c.number}</div>
              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-semibold text-ink">{c.title}</div>
                <div className="mt-0.5 truncate text-[12.5px] text-muted">
                  {c.jurisdiction} · {c.classification}
                </div>
              </div>
              <div>
                <Badge
                  tone={
                    c.status === "active"
                      ? "verified"
                      : c.status === "under_review"
                        ? "pending"
                        : c.status === "closed"
                          ? "muted"
                          : "neutral"
                  }
                  subtle
                >
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="truncate text-[13.5px] text-ink">{lead?.name}</div>
              <div className="text-right text-[13.5px] text-muted">{c.documents}</div>
              <div className="text-[12.5px] text-muted">{formatTime(c.updatedAt)}</div>
              <div className="text-subtle group-hover:text-muted">
                <IconChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
        <span>Showing {sorted.length} of {cases.length}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled>
            Previous
          </Button>
          <Button variant="ghost" size="sm" disabled>
            Next
          </Button>
        </div>
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
      <IconChevronDown size={11} />
    </button>
  );
}
