"use client";
import { useState, useTransition } from "react";
import { Menu } from "@/app/_components/menu";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import { pushToast } from "@/app/_components/toast";
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconHistory,
  IconRefresh,
  IconX,
} from "@/app/_components/icons";
import type { DocumentRecord } from "@/lib/data";
import {
  verifyDocumentIntegrityAction,
  updateDocumentStatusAction,
  revokeDocumentAccessAction,
} from "@/lib/actions";
import { VersionTimeline } from "./version-timeline";

interface Props {
  documentId: string;
  caseId: string;
  doc: DocumentRecord;
}

export function DocumentActions({ documentId, caseId, doc }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [verifying, startVerify] = useTransition();
  const [approving, startApprove] = useTransition();
  const [revoking, startRevoke] = useTransition();

  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];

  // ── Verify integrity ────────────────────────────────────────────────────────
  const handleVerify = () => {
    startVerify(async () => {
      const result = await verifyDocumentIntegrityAction(documentId);
      if (!result.success) {
        pushToast({ tone: "danger", title: "Verification failed", description: result.error });
        return;
      }
      if (result.data?.verified) {
        pushToast({
          tone: "success",
          title: "Integrity Verified",
          description: `Hash matched block #${result.data.blockNumber}. No tampering detected.`,
        });
      } else {
        pushToast({
          tone: "danger",
          title: "Integrity Mismatch Detected",
          description: result.data?.mismatchReason ?? "File diverges from blockchain anchor.",
        });
      }
    });
  };

  // ── Copy reference ───────────────────────────────────────────────────────────
  const handleCopyRef = () => {
    const ref = `REF: ${doc.previewData?.documentNumber ?? documentId} | Hash: ${currentVersion.hash.slice(0, 16)}…`;
    navigator.clipboard.writeText(ref).then(
      () => pushToast({ tone: "info", title: "Reference copied to clipboard" }),
      () => pushToast({ tone: "danger", title: "Clipboard access denied", description: "Please copy manually." }),
    );
  };

  // ── Approve version ──────────────────────────────────────────────────────────
  const handleApprove = () => {
    startApprove(async () => {
      const result = await updateDocumentStatusAction(documentId, "Verified", "Approved via document action.");
      setApproveOpen(false);
      if (result.success) {
        pushToast({ tone: "success", title: "Version approved", description: result.message });
      } else {
        pushToast({ tone: "danger", title: "Approval failed", description: result.error });
      }
    });
  };

  // ── Revoke access ────────────────────────────────────────────────────────────
  const handleRevoke = () => {
    startRevoke(async () => {
      const result = await revokeDocumentAccessAction(documentId);
      setRevokeOpen(false);
      if (result.success) {
        pushToast({ tone: "success", title: "Access revoked", description: result.message });
      } else {
        pushToast({ tone: "danger", title: "Revoke failed", description: result.error });
      }
    });
  };

  return (
    <>
      <Menu
        trigger={<IconMore size={16} />}
        items={[
          {
            id: "preview",
            label: "Preview details",
            icon: <IconEye size={13} />,
            onClick: () => setPreviewOpen(true),
          },
          {
            id: "verify",
            label: verifying ? "Verifying…" : "Verify integrity",
            icon: <IconRefresh size={13} className={verifying ? "animate-spin" : ""} />,
            onClick: handleVerify,
            disabled: verifying,
          },
          {
            id: "approve",
            label: "Approve version",
            icon: <IconCheck size={13} />,
            onClick: () => setApproveOpen(true),
          },
          {
            id: "history",
            label: "Version history",
            icon: <IconHistory size={13} />,
            onClick: () => setHistoryOpen(true),
          },
          {
            id: "copy",
            label: "Copy reference",
            icon: <IconCopy size={13} />,
            onClick: handleCopyRef,
          },
          {
            id: "revoke",
            label: "Revoke access",
            icon: <IconX size={13} />,
            destructive: true,
            onClick: () => setRevokeOpen(true),
          },
        ]}
      />

      {/* ── Preview Details Dialog ── */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Document Details"
        description="Full metadata and cryptographic summary for this evidence artifact."
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-[13px]">
          <Row label="Document Name" value={doc.name} />
          <Row label="Type" value={doc.type} />
          <Row label="Classification" value={doc.classification} />
          <Row label="Status" value={doc.status} />
          <Row label="Integrity" value={doc.integrity} />
          <Row label="Current Version" value={currentVersion.version} mono />
          <Row label="File Size" value={currentVersion.size} mono />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted mb-1">SHA-256 Digest</div>
            <div className="rounded border border-border bg-surface-2 p-2 font-mono text-[11.5px] text-ink break-all select-all">
              {currentVersion.hash}
            </div>
          </div>
          {doc.anchor && <Row label="Blockchain Anchor" value={doc.anchor} mono />}
          <Row
            label="Reference"
            value={doc.previewData?.documentNumber ?? documentId}
            mono
          />
        </div>
      </Dialog>

      {/* ── Version History Dialog ── */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Version History"
        description="Complete version timeline with cryptographic hashes and upload records."
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        <VersionTimeline versions={doc.versions} />
      </Dialog>

      {/* ── Approve Version Confirmation Dialog ── */}
      <Dialog
        open={approveOpen}
        onClose={() => !approving && setApproveOpen(false)}
        title="Approve Document Version"
        description="This will mark the current version as officially verified. This action is logged in the immutable audit trail."
        size="sm"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => setApproveOpen(false)} disabled={approving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={approving}
              iconLeft={approving ? <IconRefresh size={13} className="animate-spin" /> : <IconCheck size={13} />}
            >
              {approving ? "Approving…" : "Confirm Approval"}
            </Button>
          </div>
        }
      >
        <div className="space-y-2 text-[13px]">
          <p className="text-muted">You are approving:</p>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="font-medium text-ink">{doc.name}</div>
            <div className="text-muted mt-0.5 font-mono text-[12px]">
              Version {currentVersion.version} · {currentVersion.size}
            </div>
          </div>
          <p className="text-[12px] text-muted">
            This action requires legal review authority. An audit event will be recorded under your badge.
          </p>
        </div>
      </Dialog>

      {/* ── Revoke Access Confirmation Dialog ── */}
      <Dialog
        open={revokeOpen}
        onClose={() => !revoking && setRevokeOpen(false)}
        title="Revoke All External Access"
        description="This will immediately invalidate all active share tokens for this document."
        size="sm"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => setRevokeOpen(false)} disabled={revoking}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRevoke}
              disabled={revoking}
              iconLeft={revoking ? <IconRefresh size={13} className="animate-spin" /> : <IconX size={13} />}
            >
              {revoking ? "Revoking…" : "Revoke Access"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-[13px]">
          <div className="rounded-lg border border-red/30 bg-red-bg p-3">
            <div className="font-medium text-red text-[12.5px]">⚠ Destructive Action</div>
            <p className="text-red/80 text-[12px] mt-0.5">
              All external parties who received a share link will immediately lose access to{" "}
              <strong>{doc.name}</strong>. This cannot be undone without re-sharing.
            </p>
          </div>
          <p className="text-muted text-[12px]">
            This action is recorded in the immutable audit trail under your identity.
          </p>
        </div>
      </Dialog>
    </>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className={`text-[13px] text-ink capitalize ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function IconMore({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
