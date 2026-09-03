import Link from "next/link";
import { notFound } from "next/navigation";
import { documentsForCase, findCase, formatTime } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { UploadDialog } from "@/app/_components/upload-dialog";
import { IconFilter, IconMore, IconPlus, IconSearch, IconUpload } from "@/app/_components/icons";

export default async function CaseDocuments({
  params,
}: PageProps<"/cases/[caseId]/documents">) {
  const { caseId } = await params;
  const c = findCase(caseId);
  if (!c) notFound();
  const docs = documentsForCase(caseId);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-9 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3">
          <IconSearch size={14} className="text-muted" />
          <input
            placeholder="Search within case documents"
            className="h-full w-full bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" iconLeft={<IconFilter size={13} />} size="sm">
            Type
          </Button>
          <Button variant="secondary" size="sm">
            Status
          </Button>
          <UploadDialog
            trigger={
              <Button variant="primary" iconLeft={<IconUpload size={13} />} size="sm">
                Upload
              </Button>
            }
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[40px_1fr_140px_120px_120px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-4 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div />
          <div>Name</div>
          <div>Type</div>
          <div>Version</div>
          <div>Status</div>
          <div>Updated</div>
          <div />
        </div>
        {docs.map((d, idx) => {
          const currentVersion = d.versions.find((v) => v.current) ?? d.versions[0];
          const isLast = idx === docs.length - 1;
          return (
            <Link
              key={d.id}
              href={`/cases/${caseId}/documents/${d.id}`}
              className={`group grid grid-cols-[40px_1fr_140px_120px_120px_140px_40px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 ${
                isLast ? "" : "border-b border-border"
              }`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
                <DocTypeGlyph type={d.type} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium text-ink">{d.name}</div>
                <div className="text-[11.5px] text-muted">
                  {currentVersion.size} · uploaded by {uploader(d.uploadedBy)}
                </div>
              </div>
              <div className="text-[12.5px] text-muted">{d.type}</div>
              <div className="font-mono text-[12.5px] text-ink">{currentVersion.version}</div>
              <div>
                {d.integrity === "verified" ? (
                  <Badge tone="verified" subtle>
                    verified
                  </Badge>
                ) : d.integrity === "mismatch" ? (
                  <Badge tone="danger" subtle>
                    mismatch
                  </Badge>
                ) : d.integrity === "pending" ? (
                  <Badge tone="pending" subtle>
                    pending
                  </Badge>
                ) : (
                  <Badge tone="muted" subtle>
                    revoked
                  </Badge>
                )}
              </div>
              <div className="text-[12.5px] text-muted">{formatTime(d.updatedAt)}</div>
              <span className="text-subtle group-hover:text-muted">
                <IconMore size={14} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function uploader(id: string) {
  if (id === "u-raj") return "Inspector R. Sharma";
  if (id === "u-anita") return "Reviewer A. Desai";
  if (id === "u-vikram") return "Forensic V. Iyer";
  return id;
}

function DocTypeGlyph({ type }: { type: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      {type === "Forensic" ? <path d="M9 14h6" /> : null}
      {type === "Statement" ? <path d="M9 14h6M9 17h4" /> : null}
    </svg>
  );
}
