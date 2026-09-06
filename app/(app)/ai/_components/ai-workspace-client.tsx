"use client";

import { useState } from "react";
import Link from "next/link";
import { cases, documentsForCase, type CaseRecord } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { Select } from "@/app/_components/select";
import {
  IconAlertOctagon,
  IconCheck,
  IconCopy,
  IconFile,
  IconFolder,
  IconLock,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
} from "@/app/_components/icons";

interface Props {
  initialCases: CaseRecord[];
}

type TabMode = "brief" | "entities" | "discrepancies" | "query";

export function AiWorkspaceClient({ initialCases }: Props) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("c-0142");
  const [activeTab, setActiveTab] = useState<TabMode>("brief");
  const [copied, setCopied] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const currentCase = initialCases.find((c) => c.id === selectedCaseId) ?? initialCases[0];
  const caseDocs = documentsForCase(currentCase.id);
  const hasMismatch = caseDocs.some((d) => d.integrity === "mismatch");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setIsQuerying(true);
    setQueryAnswer(null);

    setTimeout(() => {
      setIsQuerying(false);
      const q = queryInput.toLowerCase();
      if (q.includes("vehicle") || q.includes("bay") || q.includes("dl")) {
        setQueryAnswer(
          "Grounded in Witness Statement.pdf (Question 4): Key witness Sunita Rao testified observing a utility vehicle near Loading Bay 3 at 22:45 IST. Note: The blockchain anchor records registration DL-04-AB-9821, whereas the current file was altered to DL-14-CC-1102 (Flagged for Tamper)."
        );
      } else if (q.includes("hardware") || q.includes("device") || q.includes("thinkpad") || q.includes("phone")) {
        setQueryAnswer(
          "Grounded in Forensic Report.pdf: Seized Exhibit E-01 (Lenovo ThinkPad P1 Gen 5) and Exhibit E-02 (Apple iPhone 14 Pro). Both acquired in read-only write-blocker mode and anchored to ledger Block #1493012. Payload rtgs_sync.dll broadcasted to C2 proxy IP 194.165.16.42."
        );
      } else if (q.includes("money") || q.includes("amount") || q.includes("crore") || q.includes("rtgs")) {
        setQueryAnswer(
          "Grounded in FIR.pdf: Systematic RTGS settlement diversion of ₹4,82,50,000 across 14 mule accounts using privileged account admin_core between 18 Aug and 20 Aug 2026."
        );
      } else {
        setQueryAnswer(
          `Analysis across ${caseDocs.length} evidence artifacts in ${currentCase.number}: Evidence establishes coordinated access under Section 420/468/471 IPC and Section 66D IT Act. Cryptographic integrity anchored to judicial block quorum.`
        );
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Scope Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ink">
            <IconSparkles size={16} />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Active Investigation Docket
            </div>
            <div className="font-semibold text-ink text-[14px]">
              {currentCase.number}: {currentCase.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            size="md"
            value={selectedCaseId}
            onChange={(v) => {
              setSelectedCaseId(v);
              setQueryAnswer(null);
            }}
            aria-label="Select case"
            options={initialCases.map((c) => ({
              value: c.id,
              label: c.number,
              description: c.title,
            }))}
          />

          <Link href={`/cases/${currentCase.id}`}>
            <Button variant="secondary" size="sm">
              Open Case Workspace
            </Button>
          </Link>
        </div>
      </div>

      {/* Tool Mode Tabs */}
      <div className="flex border-b border-border text-[13px]">
        {(
          [
            { id: "brief", label: "Executive Synthesis" },
            { id: "entities", label: "Entity Extraction" },
            { id: "discrepancies", label: "Deposition Discrepancies" },
            { id: "query", label: "Evidence Query Terminal" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.id
                ? "border-ink text-ink font-semibold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mode Content Views */}
      <div className="rounded-xl border border-border bg-surface p-6">
        {activeTab === "brief" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-[16px] font-semibold text-ink">
                  Executive Investigative Brief
                </h3>
                <p className="text-[12.5px] text-muted mt-0.5">
                  Automated synthesis grounded in {caseDocs.length} cryptographically anchored evidence documents.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `Case ${currentCase.number}: ${currentCase.title}\nScope: ${currentCase.description}\nEvidence Count: ${caseDocs.length} artifacts`
                  )
                }
                iconLeft={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              >
                {copied ? "Copied" : "Copy Brief"}
              </Button>
            </div>

            <div className="space-y-4 text-[13.5px] leading-relaxed text-ink">
              <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                <div className="font-semibold text-ink text-[13px] mb-1">
                  Modus Operandi & Factual Overview
                </div>
                <p className="text-muted text-[13px] leading-normal">
                  {currentCase.description} Systematic breach of cooperative RTGS banking infrastructure utilizing compromised administrative credential token <code>admin_core</code> to divert ₹4,82,50,000 across 14 designated beneficiary mule accounts.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-ink text-[13px] mb-2">Key Evidentiary Milestones</h4>
                <div className="space-y-2 text-[13px] text-muted">
                  <div className="flex items-start gap-2.5">
                    <span className="text-green font-bold">•</span>
                    <span>
                      <strong className="text-ink">Primary FIR Registration:</strong> Filed 21 Aug 2026 under Sections 420, 468, 471 IPC and Section 66D IT Act (Case {currentCase.number}).
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-green font-bold">•</span>
                    <span>
                      <strong className="text-ink">Hardware Bitstream Imaging:</strong> Lenovo ThinkPad P1 and iPhone 14 Pro imaged under Tableau write-blockers (Block #1493012).
                    </span>
                  </div>
                  {hasMismatch && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-red font-bold">•</span>
                      <span>
                        <strong className="text-red">Cryptographic Mismatch Alert:</strong> Witness Statement.pdf diverges on Question 4 regarding vehicle plate identification.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "entities" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-[16px] font-semibold text-ink">
                Extracted Entity Map
              </h3>
              <p className="text-[12.5px] text-muted mt-0.5">
                Catalogued persons of interest, vehicles, reverse proxy infrastructure, and statutory articles.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="eyebrow mb-2">Identified Persons & Suspects</div>
                <div className="space-y-2">
                  <EntityRow name="Manish Rawat" role="Accused A-1 · Lead Orchestrator" status="In Custody" />
                  <EntityRow name="Saurabh Varma" role="Accused A-2 · Credential Broker" status="Absconding" />
                  <EntityRow name="Sunita Rao" role="Key Witness · System Administrator" status="Deposed" />
                </div>
              </div>

              <div>
                <div className="eyebrow mb-2">Vehicles of Interest</div>
                <div className="space-y-2">
                  <EntityRow name="DL-04-AB-9821" role="White Utility Van (Recorded in baseline)" status="Verified" />
                  <EntityRow name="DL-14-CC-1102" role="Altered Plate in Tampered Deposition" status="Altered" isRed />
                </div>
              </div>

              <div>
                <div className="eyebrow mb-2">Digital Forensics & Telemetry</div>
                <div className="space-y-2">
                  <EntityRow name="194.165.16.42" role="Reverse Proxy C2 Node" status="Seized" />
                  <EntityRow name="rtgs_sync.dll" role="Trojan Payload Dropper" status="Decompiled" />
                  <EntityRow name="CB-RTGS-02" role="Compromised Transaction Broker" status="Preserved" />
                </div>
              </div>

              <div>
                <div className="eyebrow mb-2">Statutory Legal Provisions</div>
                <div className="space-y-2">
                  <EntityRow name="IPC Section 420" role="Cheating and Dishonestly Inducing Delivery" status="Framed" />
                  <EntityRow name="IT Act Section 66D" role="Cheating by Personation using Computer Resource" status="Framed" />
                  <EntityRow name="Evidence Act §65B" role="Statutory Electronic Custody Certification" status="Certified" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "discrepancies" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-[16px] font-semibold text-ink">
                Deposition Discrepancies & Tamper Conflicts
              </h3>
              <p className="text-[12.5px] text-muted mt-0.5">
                Automated cross-document consistency checks and cryptographic anchor comparisons.
              </p>
            </div>

            <div className="space-y-4">
              {hasMismatch ? (
                <div className="rounded-xl border border-red/40 bg-red-bg p-5 text-[13px]">
                  <div className="flex items-center gap-2 font-semibold text-red text-[14px]">
                    <IconAlertOctagon size={16} />
                    <span>Critical Deposition Divergence: Witness Statement.pdf</span>
                  </div>
                  <p className="mt-2 text-ink leading-relaxed">
                    The current file content for <strong>Witness Statement.pdf</strong> specifies vehicle registration <code>DL-14-CC-1102</code> in Question 4. However, the immutable blockchain anchor established on 22 Aug records <code>DL-04-AB-9821</code>.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Link href={`/cases/${currentCase.id}/documents/d-002`}>
                      <Button variant="danger" size="sm">
                        Inspect Tamper Diff in Viewer
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface-2 p-5 text-[13px] text-muted text-center">
                  No cryptographic or narrative discrepancies detected in {currentCase.number}.
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface-2/40 p-5 text-[13px]">
                <div className="font-semibold text-ink mb-1">
                  Chronological Telemetry Check
                </div>
                <p className="text-muted leading-relaxed">
                  All 18 gateway transaction timestamps corroborate with the bitstream acquisition image of Exhibit E-01 between 18 Aug 22:45 IST and 20 Aug 04:12 IST. No temporal contradictions identified.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "query" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-[16px] font-semibold text-ink">
                Evidence Query Terminal
              </h3>
              <p className="text-[12.5px] text-muted mt-0.5">
                Query the grounded case evidence base using natural investigative queries.
              </p>
            </div>

            <form onSubmit={handleRunQuery} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="e.g. What vehicles were observed near Loading Bay 3?"
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none text-ink placeholder:text-muted/60"
                />
                <Button type="submit" variant="primary" size="sm" disabled={isQuerying}>
                  {isQuerying ? "Querying…" : "Ask Evidence Base"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-[11.5px] text-muted">
                <span>Suggested:</span>
                <button
                  type="button"
                  onClick={() => setQueryInput("What vehicles were identified near Loading Bay 3?")}
                  className="underline hover:text-ink"
                >
                  Vehicles near Loading Bay
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setQueryInput("What hardware was seized and what are their hashes?")}
                  className="underline hover:text-ink"
                >
                  Seized Hardware & Hashes
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setQueryInput("What is the total diversion amount?")}
                  className="underline hover:text-ink"
                >
                  Total Diversion Amount
                </button>
              </div>
            </form>

            {queryAnswer && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 text-[13px] leading-relaxed text-ink space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                  Evidence-Grounded Response
                </div>
                <p>{queryAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Institutional Notice */}
      <div className="rounded-xl border border-border bg-surface-2 p-4 text-[11.5px] leading-relaxed text-muted">
        <strong>Institutional Notice:</strong> Investigative AI synthesis is executed locally within the secure enclave without external data egress. Outputs are derived strictly from immutable cryptographic hashes and signed depositions. Human investigator evaluation remains mandatory.
      </div>
    </div>
  );
}

function EntityRow({
  name,
  role,
  status,
  isRed = false,
}: {
  name: string;
  role: string;
  status: string;
  isRed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
      <div>
        <div className="font-mono text-[13px] font-medium text-ink">{name}</div>
        <div className="text-[11.5px] text-muted">{role}</div>
      </div>
      <span
        className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
          isRed ? "bg-red-bg text-red" : "bg-surface-2 text-muted"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
