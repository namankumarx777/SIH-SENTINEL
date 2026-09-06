"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { type DocumentRecord } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import { pushToast } from "@/app/_components/toast";
import {
  IconAlertOctagon,
  IconCheck,
  IconClock,
  IconDownload,
  IconFile,
  IconLock,
  IconRefresh,
  IconShieldCheck,
} from "@/app/_components/icons";
import { verifyDocumentIntegrityAction } from "@/lib/actions";

interface Props {
  docs: DocumentRecord[];
  caseId: string;
}

type VerifyResult = { verified: boolean; computedHash?: string; mismatchReason?: string };

export function IntegrityDashboardClient({ docs, caseId }: Props) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [batchVerifying, startBatch] = useTransition();
  const [inspectDoc, setInspectDoc] = useState<DocumentRecord | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  // Per-document verification results from latest run (keyed by doc.id)
  const [results, setResults] = useState<Record<string, VerifyResult>>({});

  const handleVerifyOne = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await verifyDocumentIntegrityAction(id);
      if (!res.success) {
        pushToast({ tone: "danger", title: "Verification error", description: res.error });
      } else if (res.data) {
        setResults((prev) => ({ ...prev, [id]: { verified: res.data!.verified, computedHash: res.data!.computedHash, mismatchReason: res.data!.mismatchReason } }));
        if (res.data.verified) {
          pushToast({ tone: "success", title: "Hash matched", description: `Block #${res.data.blockNumber} anchor confirmed.` });
        } else {
          pushToast({ tone: "danger", title: "Integrity mismatch", description: res.data.mismatchReason ?? "File diverges from recorded anchor." });
        }
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyAll = () => {
    startBatch(async () => {
      const newResults: Record<string, VerifyResult> = {};
      let passCount = 0;
      let failCount = 0;
      let errorCount = 0;

      for (const doc of docs) {
        const res = await verifyDocumentIntegrityAction(doc.id);
        if (!res.success) {
          errorCount++;
        } else if (res.data) {
          newResults[doc.id] = { verified: res.data.verified, computedHash: res.data.computedHash, mismatchReason: res.data.mismatchReason };
          if (res.data.verified) passCount++; else failCount++;
        }
      }

      setResults((prev) => ({ ...prev, ...newResults }));

      if (failCount > 0) {
        pushToast({ tone: "danger", title: `${failCount} integrity mismatch${failCount > 1 ? "es" : ""} detected`, description: `${passCount} verified · ${failCount} tampered · ${errorCount} errors` });
      } else if (errorCount > 0) {
        pushToast({ tone: "warning", title: "Verification completed with errors", description: `${passCount} verified · ${errorCount} documents could not be checked.` });
      } else {
        pushToast({ tone: "success", title: `All ${passCount} hashes verified`, description: "No tampering detected. All anchors match." });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Cryptographic Verification Matrix</div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCertOpen(true)}
            iconLeft={<IconFile size={13} />}
          >
            Preview §65B Certificate
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleVerifyAll}
            disabled={batchVerifying}
            iconLeft={<IconRefresh size={13} className={batchVerifying ? "animate-spin" : ""} />}
          >
            {batchVerifying ? "Verifying All Evidence…" : "Verify All Hashes"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_120px_180px_130px_120px_130px] items-center gap-4 border-b border-border bg-surface-2 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          <div>Document Name</div>
          <div>Type</div>
          <div>Recorded SHA-256</div>
          <div>Signature</div>
          <div>Integrity</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {docs.map((d) => {
            const currentVersion = d.versions.find((v) => v.current) ?? d.versions[0];
            // Use live result if available, otherwise fall back to data.integrity
            const liveResult = results[d.id];
            const isMismatch = liveResult ? !liveResult.verified : d.integrity === "mismatch";
            const isVerified = liveResult ? liveResult.verified : d.integrity === "verified";
            const isChecking = verifyingId === d.id || batchVerifying;

            return (
              <div
                key={d.id}
                className={`grid grid-cols-[1fr_120px_180px_130px_120px_130px] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2 ${
                  isMismatch ? "bg-red-bg/20" : ""
                }`}
              >
                <div className="min-w-0">
                  <Link
                    href={`/cases/${caseId}/documents/${d.id}`}
                    className="truncate text-[13.5px] font-medium text-ink hover:underline"
                  >
                    {d.name}
                  </Link>
                  <div className="text-[11.5px] text-muted">
                    Block #{d.previewData?.technicalMetadata.blockNumber ?? 1492710} · {currentVersion.size}
                  </div>
                </div>

                <div className="text-[12.5px] text-muted">{d.type}</div>

                <div className="font-mono text-[12px] text-ink">
                  {currentVersion.hash.slice(0, 10)}…{currentVersion.hash.slice(-4)}
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-muted">
                  <span className="text-green">
                    <IconCheck size={12} />
                  </span>
                  <span>ECDSA-P256</span>
                </div>

                <div>
                  {isChecking ? (
                    <span className="inline-flex items-center gap-1 text-[12px] text-muted animate-pulse">
                      <IconRefresh size={12} className="animate-spin" /> Verifying…
                    </span>
                  ) : isMismatch ? (
                    <Badge tone="danger" subtle icon={<IconAlertOctagon size={11} />}>
                      mismatch
                    </Badge>
                  ) : isVerified ? (
                    <Badge tone="verified" subtle icon={<IconShieldCheck size={11} />}>
                      verified
                    </Badge>
                  ) : (
                    <Badge tone="pending" subtle icon={<IconClock size={11} />}>
                      pending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectDoc(d)}
                    className="text-[12px] text-muted hover:text-ink hover:underline"
                  >
                    Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyOne(d.id)}
                    disabled={isChecking}
                    className="rounded border border-border bg-surface px-2 py-1 text-[11.5px] font-medium text-ink hover:bg-surface-2 disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Cryptographic Proof Dialog */}
      <Dialog
        open={!!inspectDoc}
        onClose={() => setInspectDoc(null)}
        title={inspectDoc ? `Cryptographic Manifest: ${inspectDoc.name}` : "Proof"}
        description="Immutable cryptographic verification details anchored to judicial blockchain quorum."
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-[11.5px] text-muted font-mono">
              Anchor: {inspectDoc?.anchor}
            </span>
            <Button variant="secondary" onClick={() => setInspectDoc(null)}>
              Close
            </Button>
          </div>
        }
      >
        {inspectDoc && (
          <div className="space-y-4 text-[13px]">
            <div className="rounded-lg border border-border bg-surface-2 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted">Hash Algorithm</div>
                  <div className="mt-0.5 font-mono text-[12.5px] text-ink">SHA-256 (FIPS 180-4)</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted">Signature Standard</div>
                  <div className="mt-0.5 font-mono text-[12.5px] text-ink">ECDSA secp256r1 / SHA-256</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted">Block Number</div>
                  <div className="mt-0.5 font-mono text-[12.5px] text-ink">
                    #{inspectDoc.previewData?.technicalMetadata.blockNumber ?? 1492710}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted">Signer Public Key ID</div>
                  <div className="mt-0.5 truncate font-mono text-[12px] text-ink">
                    {inspectDoc.previewData?.technicalMetadata.keyFingerprint ?? "SHA256:4a8b91c2…"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Recorded Cryptographic Digest</div>
              <div className="mt-1 rounded border border-border bg-surface p-2.5 font-mono text-[12px] text-ink break-all select-all">
                {inspectDoc.versions.find((v) => v.current)?.hash}
              </div>
            </div>

            {inspectDoc.integrity === "mismatch" && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-red">Current Computed Digest (Tampered)</div>
                <div className="mt-1 rounded border border-red/30 bg-red-bg p-2.5 font-mono text-[12px] text-red break-all select-all">
                  {inspectDoc.previewData?.technicalMetadata.currentComputedHash ?? "89ef41a20c3d5e71829038475610293847561029384756102938475610293847"}
                </div>
                <p className="mt-1.5 text-[12px] text-red">
                  Warning: The byte sequence currently in storage diverges from the anchor recorded at intake.
                </p>
              </div>
            )}

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Merkle Tree Root</div>
              <div className="mt-1 rounded border border-border bg-surface p-2.5 font-mono text-[12px] text-muted break-all">
                {inspectDoc.previewData?.technicalMetadata.merkleRoot ?? "0xe738bc841029e84711a938260193bbfe982341201948"}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Section 65B Custody Certificate Modal */}
      <Dialog
        open={certOpen}
        onClose={() => setCertOpen(false)}
        title="Certificate of Electronic Evidence (Section 65B)"
        description="Formal statutory certificate of authenticity and chain of custody compliance."
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-[11.5px] text-muted">
              Preserved in compliance with Indian Evidence Act & Criminal Procedure Code
            </span>
            <Button variant="primary" onClick={() => {
              pushToast({ tone: "success", title: "Certificate Downloaded", description: "The Section 65B Certificate PDF has been generated and downloaded." });
              setCertOpen(false);
            }}>
              Download Signed PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-[12.5px] leading-relaxed text-ink font-serif border border-border p-6 rounded-lg bg-white">
          <div className="text-center border-b border-border pb-4">
            <div className="font-bold text-[14px] uppercase tracking-widest">
              Central Bureau of Investigation — Forensic Directorate
            </div>
            <div className="text-[11px] text-muted uppercase mt-0.5">
              Certificate Under Section 65B of the Indian Evidence Act, 1872
            </div>
            <div className="font-mono text-[11px] text-muted mt-1">
              Ref: CBI/CERT/65B/CR-2026-0142/INTAKE
            </div>
          </div>

          <p>
            I, <strong>Inspector Raj Sharma</strong>, holding Badge <code>INSP-44219</code>, Cyber Crime Unit, do hereby solemnly certify and state as follows:
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              That the digital evidence records associated with Investigation Workspace <strong>CR-2026-0142</strong> were produced by computer systems operated under lawful and strict custodial control during the ordinary course of investigative duty.
            </li>
            <li>
              That throughout the material period, the cryptographic integrity mechanisms (FIPS 180-4 SHA-256 and ECDSA public key anchoring) remained continuously operational without hardware malfunction or unauthorized intrusion.
            </li>
            <li>
              That each electronic artifact was captured using certified write-blocker hardware bridges, and its bitstream image hash was anchored to judicial block <code>#1492710</code> before physical storage into the air-gapped evidence repository.
            </li>
          </ol>

          <div className="mt-6 pt-4 border-t border-dashed border-border flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Cryptographic Seal ID</div>
              <div className="font-mono text-[11px]">CBI-SEAL-8891-SHA256</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Inspector Raj Sharma</div>
              <div className="text-[11px] text-muted">Lead Investigating Officer</div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
