import { notFound } from "next/navigation";
import { findCase, findDocument, formatDateTime } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconArrowLeft,
  IconCopy,
  IconDownload,
  IconFile,
  IconKey,
  IconRefresh,
  IconShare,
  IconShieldCheck,
} from "@/app/_components/icons";
import { DocumentActions } from "./_components/document-actions";
import { IntegrityPanel } from "./_components/integrity-panel";
import { PdfPreview } from "./_components/pdf-preview";
import { ShareDialog } from "../../_components/share-dialog";
import { VersionTimeline } from "./_components/version-timeline";
import Link from "next/link";

export default async function DocumentViewer({
  params,
}: PageProps<"/cases/[caseId]/documents/[documentId]">) {
  const { caseId, documentId } = await params;
  const caseRecord = findCase(caseId);
  const doc = findDocument(documentId);
  if (!caseRecord || !doc) notFound();

  const current = doc.versions.find((v) => v.current) ?? doc.versions[0];

  return (
    <div className="anim-fade">
      <Link
        href={`/cases/${caseId}/documents`}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
      >
        <IconArrowLeft size={12} /> Back to documents
      </Link>

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <IconFile size={12} />
            <span>{doc.type}</span>
            <span>·</span>
            <span>{doc.classification}</span>
          </div>
          <h1 className="mt-2 t-display text-ink">{doc.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-[12.5px] text-muted">
            <span>
              Version <span className="font-mono text-ink">{current.version}</span>
            </span>
            <span>·</span>
            <span>{current.size}</span>
            <span>·</span>
            <span>Updated {formatDateTime(doc.updatedAt)}</span>
            {doc.integrity === "verified" ? (
              <Badge tone="verified" subtle icon={<IconShieldCheck size={11} />}>
                verified
              </Badge>
            ) : doc.integrity === "mismatch" ? (
              <Badge tone="danger" subtle>
                integrity mismatch
              </Badge>
            ) : (
              <Badge tone="pending" subtle>
                pending review
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" iconLeft={<IconDownload size={13} />}>
            Download
          </Button>
          <ShareDialog
            trigger={
              <Button variant="secondary" iconLeft={<IconShare size={13} />}>
                Share
              </Button>
            }
          />
          <DocumentActions documentId={doc.id} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2 text-[11.5px] text-muted">
            <span>Document preview</span>
            <span className="font-mono">{doc.pages ?? 1} pages</span>
          </div>
          <PdfPreview doc={doc} />
        </div>

        <aside className="flex flex-col gap-5">
          <IntegrityPanel doc={doc} />

          <div className="card p-5">
            <div className="mb-4 text-[12.5px] font-medium text-muted">Document Details</div>
            <Detail label="Version" value={current.version} />
            <Detail label="Type" value={doc.type} />
            <Detail label="Classification" value={doc.classification} />
            <Detail label="Uploaded by" value={uploaderName(doc.uploadedBy)} />
            <Detail label="Uploaded on" value={formatDateTime(doc.createdAt)} />
            <Detail label="Pages" value={String(doc.pages ?? 1)} />
            <Detail label="Size" value={current.size} />
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[12.5px] font-medium text-muted">Cryptographic</div>
              <span className="text-[11px] text-muted">SHA-256</span>
            </div>
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <div className="font-mono text-[12.5px] text-ink break-all">
                {current.hash}
              </div>
            </div>
            <button className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[12.5px] text-ink hover:bg-surface-2">
              <IconCopy size={12} /> Copy hash
            </button>

            <div className="mt-5">
              <div className="text-[12.5px] font-medium text-muted">Digital signature</div>
              <div className="mt-2 flex items-center gap-2 text-[13px]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-bg text-green">
                  <IconShieldCheck size={11} />
                </span>
                <span className="text-ink">Valid</span>
                <span className="text-muted">· signed by {doc.signedBy ?? "Officer"}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[12.5px] font-medium text-muted">Blockchain anchor</div>
              <div className="mt-2 flex items-center gap-2 text-[13px]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-bg text-green">
                  <IconShieldCheck size={11} />
                </span>
                <span className="text-ink">Confirmed</span>
                <span className="text-muted">·</span>
                <span className="font-mono text-[12px] text-muted">{doc.anchor}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11.5px] text-muted">
              <IconKey size={11} /> Encrypted at rest (AES-256)
            </div>
          </div>

          <VersionTimeline versions={doc.versions} />
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className="text-[13px] capitalize text-ink">{value}</span>
    </div>
  );
}

function uploaderName(id: string) {
  if (id === "u-raj") return "Inspector R. Sharma";
  if (id === "u-anita") return "Reviewer A. Desai";
  if (id === "u-vikram") return "Forensic V. Iyer";
  return id;
}
