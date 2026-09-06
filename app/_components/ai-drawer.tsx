"use client";

import { useState } from "react";
import { Button } from "./button";
import {
  IconAlertOctagon,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconFile,
  IconLock,
  IconSparkles,
  IconX,
} from "./icons";

interface Props {
  caseTitle?: string;
  documentName?: string;
  trigger?: React.ReactNode;
}

type TabMode = "brief" | "entities" | "discrepancies";

export function AiDrawer({ caseTitle = "Cyber Fraud Investigation", documentName, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabMode>("brief");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">
        {trigger ?? (
          <Button variant="secondary" size="sm" iconLeft={<IconSparkles size={13} />}>
            AI Assist
          </Button>
        )}
      </span>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end anim-overlay">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Slide-over Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-[460px] flex-col border-l border-border bg-surface shadow-pop anim-slide">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-ink">
                  <IconSparkles size={14} />
                </span>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-ink">Investigative AI Assistant</h3>
                  <p className="text-[11.5px] text-muted">Contextual evidence synthesis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink transition-colors"
              >
                <IconX size={15} />
              </button>
            </div>

            {/* Scope info banner */}
            <div className="border-b border-border bg-surface-2/60 px-6 py-2.5 text-[12px] text-muted flex items-center justify-between">
              <span className="truncate max-w-[280px]">
                Target: <strong className="text-ink">{documentName ?? caseTitle}</strong>
              </span>
              <span className="font-mono text-[10.5px]">MODEL: LOCAL ENCLAVE</span>
            </div>

            {/* Tab navigation */}
            <div role="tablist" aria-label="Analysis tabs" className="flex border-b border-border px-6 pt-2">
              <button
                type="button"
                role="tab"
                id="tab-brief"
                aria-selected={tab === "brief"}
                aria-controls="tabpanel-brief"
                onClick={() => setTab("brief")}
                className={`pb-2.5 text-[12.5px] font-medium transition-colors border-b-2 mr-5 ${
                  tab === "brief"
                    ? "border-ink text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                Executive Brief
              </button>
              <button
                type="button"
                role="tab"
                id="tab-entities"
                aria-selected={tab === "entities"}
                aria-controls="tabpanel-entities"
                onClick={() => setTab("entities")}
                className={`pb-2.5 text-[12.5px] font-medium transition-colors border-b-2 mr-5 ${
                  tab === "entities"
                    ? "border-ink text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                Entity Map
              </button>
              <button
                type="button"
                role="tab"
                id="tab-discrepancies"
                aria-selected={tab === "discrepancies"}
                aria-controls="tabpanel-discrepancies"
                onClick={() => setTab("discrepancies")}
                className={`pb-2.5 text-[12.5px] font-medium transition-colors border-b-2 ${
                  tab === "discrepancies"
                    ? "border-ink text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                Discrepancies
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[13px] leading-relaxed text-ink">
              {tab === "brief" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                    <div className="font-semibold text-ink text-[13px] mb-1">
                      Case Summary & Modus Operandi
                    </div>
                    <p className="text-muted text-[12.5px] leading-normal">
                      Systematic breach of Apex Cooperative Banking RTGS settlement network between 18 Aug and 20 Aug 2026. Fraudsters utilized privileged access token (account <code>admin_core</code>) to siphon ₹4,82,50,000 across 14 mule accounts.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-ink mb-2">Key Evidentiary Milestones</div>
                    <ul className="space-y-2 text-[12.5px] text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-green mt-0.5">•</span>
                        <span>
                          <strong>Intake:</strong> FIR registered 21 Aug 2026 under IPC §420/468/471 & IT Act §66D.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green mt-0.5">•</span>
                        <span>
                          <strong>Hardware Seized:</strong> Lenovo ThinkPad P1 and iPhone 14 Pro bitstream imaged via Tableau write-blocker (Block #1493012).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red mt-0.5">•</span>
                        <span>
                          <strong>Integrity Alert:</strong> Witness Statement.pdf diverged on Question 4 (vehicle plate identification).
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopy("Investigation Summary: RTGS fraud of 4.82 Cr under CR-2026-0142.")}
                      iconLeft={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    >
                      {copied ? "Copied to Clipboard" : "Copy Brief Text"}
                    </Button>
                  </div>
                </div>
              )}

              {tab === "entities" && (
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                      Identified Persons & Suspects
                    </div>
                    <div className="space-y-1.5">
                      <EntityCard name="Manish Rawat" role="Accused A-1 · Lead Orchestrator" tag="In Custody" />
                      <EntityCard name="Saurabh Varma" role="Accused A-2 · Credential Broker" tag="Absconding" />
                      <EntityCard name="Sunita Rao" role="Key Witness · System Administrator" tag="Deposed" />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                      Vehicles of Interest
                    </div>
                    <div className="space-y-1.5">
                      <EntityCard name="DL-04-AB-9821" role="White Utility Van (Recorded in baseline)" tag="Verified" />
                      <EntityCard name="DL-14-CC-1102" role="Altered Plate in Tampered Deposition" tag="Altered" isRed />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                      Digital Forensics & Infrastructure
                    </div>
                    <div className="space-y-1.5">
                      <EntityCard name="194.165.16.42" role="C2 Reverse Proxy Server" tag="Seized" />
                      <EntityCard name="rtgs_sync.dll" role="Trojan Payload Dropper" tag="Decompiled" />
                    </div>
                  </div>
                </div>
              )}

              {tab === "discrepancies" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-red/30 bg-red-bg/40 p-4">
                    <div className="flex items-center gap-2 font-semibold text-red text-[13px]">
                      <IconAlertOctagon size={14} />
                      <span>Tamper Collision: Witness Statement</span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] text-ink leading-normal">
                      The current file for <strong>Witness Statement.pdf</strong> specifies vehicle registration <code>DL-14-CC-1102</code>. However, the blockchain anchor established on 22 Aug records <code>DL-04-AB-9821</code>.
                    </p>
                    <div className="mt-3 text-[11.5px] text-muted">
                      Recommendation: Revert to verified intake baseline or conduct judicial cross-examination.
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                    <div className="font-semibold text-ink text-[13px]">
                      Timeline Consistency Check
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">
                      No timestamp collisions detected across the remaining 23 evidence artifacts in this case.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Disclaimer */}
            <div className="border-t border-border bg-surface-2 p-4 text-[11px] leading-relaxed text-muted">
              Institutional notice: AI outputs are generated from local tamper-evident evidence digests. All deductions must be corroborated prior to court admission.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EntityCard({
  name,
  role,
  tag,
  isRed = false,
}: {
  name: string;
  role: string;
  tag: string;
  isRed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-2.5">
      <div>
        <div className="font-medium text-ink font-mono text-[12.5px]">{name}</div>
        <div className="text-[11px] text-muted">{role}</div>
      </div>
      <span
        className={`rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase ${
          isRed ? "bg-red-bg text-red" : "bg-surface-2 text-muted"
        }`}
      >
        {tag}
      </span>
    </div>
  );
}
