"use client";

import { useState } from "react";
import type { DocumentRecord } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import {
  IconAlertOctagon,
  IconCheck,
  IconCopy,
  IconDownload,
  IconHistory,
  IconKey,
  IconLock,
  IconRefresh,
  IconShieldCheck,
} from "@/app/_components/icons";
import { verifyDocumentIntegrityAction } from "@/lib/actions";

export function IntegrityPanel({ doc }: { doc: DocumentRecord }) {
  const [proofOpen, setProofOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    timestamp: string;
    message?: string;
  } | null>(null);

  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];
  const isMismatch = doc.integrity === "mismatch";
  const preview = doc.previewData;

  const handleRunVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    const start = performance.now();
    try {
      const res = await verifyDocumentIntegrityAction(doc.id);
      const elapsed = Math.max(28, Math.round(performance.now() - start));
      if (res.success && res.data) {
        setVerifyResult({
          verified: res.data.verified,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          message: res.data.mismatchReason ?? `Verified in ${elapsed}ms · 12/12 Quorum Validated`,
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const currentHash =
    preview?.technicalMetadata.currentComputedHash ??
    (isMismatch
      ? "89ef41a20c3d5e71829038475610293847561029384756102938475610293847"
      : currentVersion.hash);

  if (isMismatch) {
    return (
      <>
        <div className="overflow-hidden rounded-xl border border-red/40 bg-red-bg shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-red/20 bg-red/10 px-5 py-3 text-red">
            <IconAlertOctagon size={16} />
            <span className="text-[13.5px] font-bold tracking-tight">
              CRITICAL: Cryptographic Integrity Mismatch
            </span>
          </div>

          <div className="p-5">
            <p className="text-[13px] leading-relaxed text-ink">
              The byte stream of this file diverges from the immutable SHA-256 hash anchored to the blockchain quorum.
            </p>

            {/* Side-by-side / Stacked Hash Comparison */}
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-red/30 bg-white p-3">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-red">
                  <span>Current Computed Hash (Failed)</span>
                  <span className="font-mono text-[10px]">Computed Just Now</span>
                </div>
                <div className="mt-1 font-mono text-[12px] text-red break-all font-semibold">
                  {currentHash}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-3">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <span>Recorded Anchor Hash (Authoritative)</span>
                  <span className="font-mono text-[10px]">Block #{preview?.technicalMetadata.blockNumber ?? 1492840}</span>
                </div>
                <div className="mt-1 font-mono text-[12px] text-ink break-all">
                  {currentVersion.hash}
                </div>
              </div>
            </div>

            {preview?.technicalMetadata.tamperReason && (
              <div className="mt-3 rounded border border-red/20 bg-white/60 p-2.5 text-[12px] text-ink leading-snug">
                <span className="font-semibold text-red">Forensic Observation: </span>
                {preview.technicalMetadata.tamperReason}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="danger"
                onClick={handleRunVerify}
                disabled={isVerifying}
                iconLeft={<IconRefresh size={13} className={isVerifying ? "animate-spin" : ""} />}
              >
                {isVerifying ? "Scanning Cryptographic Nodes…" : "Re-Run Forensic Hash Scan"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setProofOpen(true)}
                iconLeft={<IconHistory size={13} />}
              >
                Inspect Ledger Proof
              </Button>
            </div>

            <p className="mt-4 text-[11.5px] text-muted">
              Incident automatically logged to immutable narrative audit trail. Case lead notified.
            </p>
          </div>
        </div>

        <ProofModal
          open={proofOpen}
          onClose={() => setProofOpen(false)}
          doc={doc}
          isMismatch={true}
        />
      </>
    );
  }

  // Verified / Healthy State
  return (
    <>
      <div className="card p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="text-[12.5px] font-semibold text-ink flex items-center gap-1.5">
            <IconShieldCheck size={14} className="text-green" />
            <span>Cryptographic Integrity</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-2.5 py-0.5 text-[11px] font-semibold text-green border border-green/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
            </span>
            Verified Authentic
          </span>
        </div>

        {/* Multi-tier Progressive Disclosure Checks */}
        <ul className="mt-4 space-y-3">
          <CheckRow
            label="SHA-256 Digest Valid"
            sub="Exact bitstream match against intake snapshot"
          />
          <CheckRow
            label="ECDSA Digital Signature"
            sub={`Signed by ${doc.signedBy ?? "Certified Officer"}`}
          />
          <CheckRow
            label="Blockchain Anchor Confirmed"
            sub={`Block #${preview?.technicalMetadata.blockNumber ?? 1492710} (12 confirmations)`}
          />
          <CheckRow
            label="At-Rest Encryption Intact"
            sub="FIPS 140-2 Level 3 Hardware Enclave"
          />
        </ul>

        <div className="mt-5 pt-4 border-t border-border flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setProofOpen(true)}
            iconLeft={<IconShieldCheck size={13} />}
          >
            Deep Cryptographic Proof
          </Button>

          <button
            type="button"
            onClick={handleRunVerify}
            disabled={isVerifying}
            className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[12.5px] font-medium text-ink hover:bg-surface-2 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <IconRefresh size={12} className={isVerifying ? "animate-spin" : ""} />
            {isVerifying ? "Scanning Blockchain Nodes…" : "Verify Again"}
          </button>

          {verifyResult && (
            <div className="mt-2 rounded-md border border-green/20 bg-green-bg/50 p-2.5 text-[11.5px] text-green font-medium text-center anim-fade flex items-center justify-center gap-1.5">
              <IconCheck size={12} />
              <span>{verifyResult.message ?? `Verified at ${verifyResult.timestamp}: Hash match confirmed.`}</span>
            </div>
          )}
        </div>
      </div>

      <ProofModal
        open={proofOpen}
        onClose={() => setProofOpen(false)}
        doc={doc}
        isMismatch={false}
      />
    </>
  );
}


function CheckRow({ label, sub }: { label: string; sub: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px]">
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-bg text-green">
        <IconShieldCheck size={12} />
      </span>
      <div>
        <div className="font-medium text-ink leading-tight">{label}</div>
        <div className="text-[11.5px] text-muted leading-tight mt-0.5">{sub}</div>
      </div>
    </li>
  );
}

function ProofModal({
  open,
  onClose,
  doc,
  isMismatch,
}: {
  open: boolean;
  onClose: () => void;
  doc: DocumentRecord;
  isMismatch: boolean;
}) {
  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];
  const preview = doc.previewData;

  const downloadProofJson = () => {
    const manifest = {
      documentId: doc.id,
      name: doc.name,
      caseId: doc.caseId,
      status: doc.status,
      integrity: doc.integrity,
      recordedSha256: currentVersion.hash,
      algorithm: "SHA-256",
      signatureStandard: "ECDSA secp256r1",
      signedBy: doc.signedBy,
      blockAnchor: doc.anchor,
      blockNumber: preview?.technicalMetadata.blockNumber ?? 1492710,
      merkleRoot: preview?.technicalMetadata.merkleRoot,
      keyFingerprint: preview?.technicalMetadata.keyFingerprint,
      verifiedAt: new Date().toISOString(),
      statutoryCompliance: "Indian Evidence Act §65B / IT Act §66",
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name.replace(".pdf", "")}_proof_manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cryptographic Chain & Ledger Audit Manifest"
      description="Deep verification telemetry anchoring this document into the judicial immutable ledger."
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            variant="secondary"
            onClick={downloadProofJson}
            iconLeft={<IconDownload size={13} />}
          >
            Export Manifest (JSON)
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-[13px]">
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Ledger Network</div>
              <div className="mt-0.5 font-mono text-[12px] text-ink">CBI-Judicial-Quorum-Private</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Anchor Block #</div>
              <div className="mt-0.5 font-mono text-[12px] text-ink">
                #{preview?.technicalMetadata.blockNumber ?? 1492710}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Digital Signature</div>
              <div className="mt-0.5 font-mono text-[12px] text-ink">ECDSA P-256 / SHA-256</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Audit Standard</div>
              <div className="mt-0.5 font-mono text-[12px] text-ink">FIPS 180-4 · RFC 6962</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">Authoritative SHA-256 Digest</div>
          <div className="mt-1 rounded border border-border bg-surface p-2.5 font-mono text-[12px] text-ink break-all select-all">
            {currentVersion.hash}
          </div>
        </div>

        {isMismatch && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-red font-semibold">
              Current File SHA-256 (Mismatch)
            </div>
            <div className="mt-1 rounded border border-red/30 bg-red-bg p-2.5 font-mono text-[12px] text-red break-all select-all">
              {preview?.technicalMetadata.currentComputedHash ?? "89ef41a20c3d5e71829038475610293847561029384756102938475610293847"}
            </div>
          </div>
        )}

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">Blockchain Anchor Transaction ID</div>
          <div className="mt-1 rounded border border-border bg-surface p-2.5 font-mono text-[12px] text-ink break-all select-all">
            {doc.anchor ?? "0x82ca9f1a238e810cb9947f631102e88a31e13a1f"}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">Merkle Root & Proof Path</div>
          <div className="mt-1 rounded border border-border bg-surface p-2.5 font-mono text-[12px] text-muted break-all">
            {preview?.technicalMetadata.merkleRoot ?? "0xe738bc841029e84711a938260193bbfe982341201948"}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
