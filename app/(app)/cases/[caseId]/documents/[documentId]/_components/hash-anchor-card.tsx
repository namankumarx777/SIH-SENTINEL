"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconLock, IconShieldCheck } from "@/app/_components/icons";

interface Props {
  hash: string;
  blockNumber: number;
  cipher?: string;
  signatureStandard?: string;
}

export function HashAnchorCard({
  hash,
  blockNumber,
  cipher = "AES-256-GCM",
  signatureStandard = "Valid (ECDSA-P256)",
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-[13px] shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[12px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <IconLock size={12} />
          <span>Cryptographic Anchor</span>
        </div>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-mono font-medium text-muted border border-border/60">
          SHA-256
        </span>
      </div>

      <div className="group relative mt-2.5 rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-border-strong">
        <div className="font-mono text-[11.5px] text-ink break-all select-all leading-relaxed pr-6">
          {hash}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 rounded p-1 text-muted hover:bg-surface hover:text-ink transition-colors shadow-2xs"
          title="Copy SHA-256 hash"
        >
          {copied ? <IconCheck size={13} className="text-green" /> : <IconCopy size={13} />}
        </button>
        {copied && (
          <div className="mt-2 text-[11px] font-medium text-green flex items-center gap-1 anim-fade">
            <IconCheck size={11} /> Hash copied to clipboard
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2.5 text-[12px]">
        <div className="flex items-center justify-between text-muted">
          <span>Signature Status</span>
          <span className="font-medium text-green flex items-center gap-1">
            <IconShieldCheck size={11} /> {signatureStandard}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted">
          <span>Ledger Quorum</span>
          <span className="font-mono text-ink font-medium">Block #{blockNumber}</span>
        </div>
        <div className="flex items-center justify-between text-muted">
          <span>Enclave Cipher</span>
          <span className="font-mono text-ink">{cipher}</span>
        </div>
      </div>
    </div>
  );
}
