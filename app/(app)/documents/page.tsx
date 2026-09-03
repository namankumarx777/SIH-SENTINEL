import Link from "next/link";
import { documents, findCase, formatTime } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconChevronRight,
  IconFilter,
  IconSearch,
  IconUpload,
} from "@/app/_components/icons";
import { PageHeader } from "@/app/_components/page-header";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="All documents across cases in your scope. Use the case filter to narrow down."
        actions={
          <>
            <Button variant="secondary" iconLeft={<IconFilter size={13} />}>
              Case
            </Button>
            <Button variant="primary" iconLeft={<IconUpload size={13} />}>
              Upload
            </Button>
          </>
        }
        meta={
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <span>{documents.length} documents</span>
            <span>·</span>
            <span>{documents.filter((d) => d.integrity === "mismatch").length} flagged</span>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3">
          <IconSearch size={14} className="text-muted" />
          <input
            placeholder="Search by name, type, or tag"
            className="h-full w-full bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_140px_140px_120px_120px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Name</div>
          <div>Type</div>
          <div>Case</div>
          <div>Status</div>
          <div>Integrity</div>
          <div>Updated</div>
          <div />
        </div>
        {documents.map((d, idx) => {
          const c = findCase(d.caseId);
          const isLast = idx === documents.length - 1;
          return (
            <Link
              key={d.id}
              href={`/cases/${d.caseId}/documents/${d.id}`}
              className={`grid grid-cols-[1fr_140px_140px_120px_120px_140px_40px] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2 ${
                isLast ? "" : "border-b border-border"
              }`}
            >
              <div className="text-[13.5px] font-medium text-ink">{d.name}</div>
              <div className="text-[12.5px] text-muted">{d.type}</div>
              <div className="font-mono text-[12.5px] text-muted">{c?.number}</div>
              <div>
                <Badge
                  tone={d.status === "Verified" ? "verified" : d.status === "Review" ? "pending" : d.status === "Rejected" ? "danger" : "muted"}
                  subtle
                >
                  {d.status.toLowerCase()}
                </Badge>
              </div>
              <div>
                {d.integrity === "verified" ? (
                  <Badge tone="verified" subtle>verified</Badge>
                ) : d.integrity === "mismatch" ? (
                  <Badge tone="danger" subtle>mismatch</Badge>
                ) : (
                  <Badge tone="pending" subtle>pending</Badge>
                )}
              </div>
              <div className="text-[12.5px] text-muted">{formatTime(d.updatedAt)}</div>
              <IconChevronRight size={14} className="text-subtle" />
            </Link>
          );
        })}
      </div>
    </>
  );
}
