import Link from "next/link";
import { notFound } from "next/navigation";
import { cases, documentsForCase, findCase } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconAlertOctagon,
  IconCheck,
  IconDownload,
  IconFile,
  IconLock,
  IconRefresh,
  IconShieldCheck,
} from "@/app/_components/icons";
import { IntegrityDashboardClient } from "./_components/integrity-dashboard-client";

export async function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

export default async function CaseIntegrityPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = findCase(caseId);
  if (!caseRecord) notFound();

  const docs = documentsForCase(caseId);
  const mismatchDocs = docs.filter((d) => d.integrity === "mismatch");
  const verifiedDocs = docs.filter((d) => d.integrity === "verified");

  return (
    <div className="space-y-8">
      {/* Top Ledger Status Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="eyebrow">Cryptographic Proof & Ledger Status</div>
          <h2 className="mt-1 text-[20px] font-semibold text-ink">
            Case Integrity Manifest
          </h2>
          <p className="mt-1 text-[13.5px] text-muted">
            All evidence artifacts in {caseRecord.number} are cryptographically hashed via SHA-256 and anchored to the institutional private ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<IconDownload size={13} />}
          >
            Export Custody Certificate
          </Button>
        </div>
      </div>

      {/* Mismatch Alert Banner if any document is tampered */}
      {mismatchDocs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-red/30 bg-red-bg p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-red">
              <IconAlertOctagon size={18} />
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-red">
                Critical Integrity Alert: Cryptographic Mismatch Detected
              </div>
              <p className="mt-1 text-[13px] text-ink">
                {mismatchDocs.length} evidence artifact{mismatchDocs.length === 1 ? "" : "s"} in this case failed hash verification against the recorded blockchain anchor.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mismatchDocs.map((d) => (
                  <Link
                    key={d.id}
                    href={`/cases/${caseId}/documents/${d.id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-red/30 bg-white px-3 py-1.5 text-[12.5px] font-medium text-red hover:bg-red-bg"
                  >
                    <span>Investigate {d.name}</span>
                    <span className="text-[11px] font-mono">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid - No-Card whitespace design */}
      <div className="grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="eyebrow">Anchored Evidence</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-[24px] font-semibold text-ink">
              {docs.length}
            </span>
            <span className="text-[12.5px] text-muted">artifacts</span>
          </div>
          <div className="mt-1 text-[11.5px] text-muted">
            100% bound to ledger
          </div>
        </div>

        <div>
          <div className="eyebrow">Integrity State</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-[24px] font-semibold text-ink">
              {verifiedDocs.length}/{docs.length}
            </span>
            <Badge
              tone={mismatchDocs.length > 0 ? "danger" : "verified"}
              subtle
            >
              {mismatchDocs.length > 0 ? "Flagged" : "Healthy"}
            </Badge>
          </div>
          <div className="mt-1 text-[11.5px] text-muted">
            {mismatchDocs.length} mismatch, {docs.length - verifiedDocs.length - mismatchDocs.length} pending
          </div>
        </div>

        <div>
          <div className="eyebrow">Ledger Anchor Block</div>
          <div className="mt-1.5 font-mono text-[20px] font-semibold text-ink">
            #1,493,412
          </div>
          <div className="mt-1 text-[11.5px] text-muted">
            Finality: Confirmed (12 validators)
          </div>
        </div>

        <div>
          <div className="eyebrow">Merkle Root</div>
          <div className="mt-1.5 truncate font-mono text-[13.5px] text-ink">
            0xe738bc84…201948
          </div>
          <div className="mt-1 text-[11.5px] text-muted">
            Alg: ECDSA-P256 / SHA-256
          </div>
        </div>
      </div>

      {/* Interactive Verification Matrix */}
      <IntegrityDashboardClient docs={docs} caseId={caseId} />
    </div>
  );
}
