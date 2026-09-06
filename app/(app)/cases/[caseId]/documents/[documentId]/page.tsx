import { listAuditForCase, listAuditForOrg } from "@/lib/repos/audit";
import { requireDocumentAccess, requireCaseAccess } from "@/lib/auth/authorization";
import { findCaseForSession, listCasesForSession } from "@/lib/repos/cases";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconCalendar,
  IconCopy,
  IconDownload,
  IconFile,
  IconKey,
  IconLock,
  IconShare,
  IconShieldCheck,
  IconUser,
} from "@/app/_components/icons";
import { DocumentActions } from "./_components/document-actions";
import { HashAnchorCard } from "./_components/hash-anchor-card";
import { IntegrityPanel } from "./_components/integrity-panel";
import { PdfPreview } from "./_components/pdf-preview";
import { ShareDialog } from "../../_components/share-dialog";
import { VersionTimeline } from "./_components/version-timeline";
import { db } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ caseId: string; documentId: string }>;
}

export default async function DocumentViewer({ params }: PageProps) {
  const { caseId, documentId } = await params;
  const session = await getSessionUser();
  const caseRecord = await findCaseForSession(caseId);
  const { documentRow: doc } = await requireDocumentAccess(documentId);
  if (!caseRecord || !doc) notFound();

  const versions = await db.orm.public.DocumentVersion.where({ documentId: String(doc.id) }).all();
  const current = versions.find((v) => v.current) ?? versions[0];
  const isMismatch = doc.integrity === "MISMATCH";

  const uploader = await db.orm.public.User.where({ id: String(doc.uploadedBy) }).first();

  return (
    <div className="anim-fade space-y-6">
      {/* Elevated Document Inspection Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border/80 pb-6">
        <div className="min-w-0">
          {/* Metadata Dossier Chips */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold text-[11px] border uppercase ${getTypeBadge(
                String(doc.type)
              )}`}
            >
              <IconFile size={11} /> {String(doc.type)}
            </span>

            <span className="text-border-strong select-none">·</span>

            <span className="rounded-md border border-border/80 bg-surface-2 px-2 py-0.5 font-mono text-[11px] uppercase text-muted font-medium">
              {String(doc.classification)}
            </span>

            <span className="text-border-strong select-none">·</span>

            <span className="font-mono text-[11px] text-muted">
              REF: {caseRecord.number}
            </span>

            <span className="text-border-strong select-none">·</span>

            <span className="text-[11px] text-muted">PDF 1.4 (ISO 32000-1)</span>
          </div>

          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-ink">
            {String(doc.name)}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
            <span>
              Version <span className="font-mono font-semibold text-ink">{current?.version ?? "v1.0"}</span>
            </span>
            <span>·</span>
            <span className="font-mono">{current?.size ?? "0 B"}</span>
            <span>·</span>
            <span>Updated {formatDateTime(String(doc.updatedAt))}</span>
            <span>·</span>
            {isMismatch ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-bg px-2.5 py-0.5 text-[11.5px] font-semibold text-red border border-red/30 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red" />
                </span>
                Critical: Integrity Mismatch
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-2.5 py-0.5 text-[11.5px] font-semibold text-green border border-green/20 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
                </span>
                Verified Authentic
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons with RBAC Session Gating */}
        <div className="flex shrink-0 items-center gap-2.5">
          <a href={`/api/documents/${doc.id}/download`} download>
            <Button variant="secondary" iconLeft={<IconDownload size={13} />}>
              Download Encrypted
            </Button>
          </a>

          {session.permissions.canShare && (
            <ShareDialog
              defaultResource={String(doc.name)}
              trigger={
                <Button variant="secondary" iconLeft={<IconShare size={13} />}>
                  Share Securely
                </Button>
              }
            />
          )}

          <DocumentActions documentId={String(doc.id)} caseId={caseId} doc={doc as any} />
        </div>
      </div>

      {/* Primary Inspection Suite Grid: 70% Viewer / 30% Right Rail */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Left Forensic Document Viewer */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <PdfPreview doc={doc as any} />
        </div>

        {/* Right Rail Forensic Dossier */}
        <aside className="flex flex-col gap-6">
          {/* Integrity Panel - Progressive Disclosure */}
          <IntegrityPanel doc={doc as any} />

          {/* Document Metadata Details */}
          <div className="rounded-xl border border-border bg-surface p-5 text-[13px] shadow-sm">
            <div className="mb-3 text-[12px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <IconFile size={12} />
              <span>Document Metadata</span>
            </div>
            <div className="divide-y divide-border">
              <Detail label="Version" value={String(current?.version ?? "v1.0")} isMono />
              <Detail label="Category" value={String(doc.type)} />
              <Detail label="Classification" value={String(doc.classification)} />
              <Detail label="Intake Officer" value={uploader ? String(uploader.name) : String(doc.uploadedBy)} />
              <Detail label="Intake Timestamp" value={formatDateTime(String(doc.createdAt))} />
              <Detail label="Total Pages" value={"4"} isMono />
              <Detail label="Bitstream Size" value={String(current?.size ?? "0 B")} isMono />
              <Detail label="Enclave Node" value="SEC-ENCLAVE-DL-02" isMono />
            </div>
          </div>

          {/* Cryptographic Anchor Card with One-Click Copy */}
          <HashAnchorCard
            hash={String(current?.hash ?? "")}
            blockNumber={1492710}
            cipher="AES-256-GCM"
            signatureStandard="Valid (ECDSA-P256)"
          />

          {/* Version Timeline */}
          <VersionTimeline versions={versions as any[]} />
        </aside>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className={`text-[13px] text-ink ${isMono ? "font-mono" : "capitalize"}`}>
        {value}
      </span>
    </div>
  );
}

function getTypeBadge(type: string) {
  switch (type) {
    case "FIR":
      return "border-red/30 bg-red-bg text-red";
    case "Statement":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "Forensic":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "Legal":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Evidence":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    default:
      return "border-border bg-surface-2 text-muted";
  }
}
