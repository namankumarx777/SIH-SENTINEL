import type { DocumentRecord } from "@/lib/data";
import { Button } from "@/app/_components/button";
import {
  IconAlertOctagon,
  IconHistory,
  IconRefresh,
  IconShieldCheck,
} from "@/app/_components/icons";

export function IntegrityPanel({ doc }: { doc: DocumentRecord }) {
  if (doc.integrity === "mismatch") {
    return (
      <div className="overflow-hidden rounded-xl border border-red/30 bg-red-bg">
        <div className="flex items-center gap-2 border-b border-red/20 px-5 py-3 text-red">
          <IconAlertOctagon size={14} />
          <span className="text-[13.5px] font-semibold">Integrity mismatch</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] leading-relaxed text-ink">
            This file does not match the recorded version.
          </p>

          <div className="mt-4 space-y-3">
            <HashRow label="Recorded hash" value={doc.versions.find((v) => v.current)?.hash ?? ""} tone="red" />
            <HashRow label="Current hash" value="73abf3d29b8e1c5d…22d" tone="muted" />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="danger" iconLeft={<IconAlertOctagon size={13} />}>
              Investigate
            </Button>
            <Button variant="secondary" iconLeft={<IconHistory size={13} />}>
              View version history
            </Button>
          </div>

          <p className="mt-4 text-[11.5px] text-muted">
            This mismatch is automatically recorded in the audit trail. The case
            administrator has been notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] font-medium text-muted">Document Integrity</div>
        <span className="inline-flex items-center gap-1 text-[11.5px] text-green">
          <span className="dot bg-green" /> healthy
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        <CheckRow label="File hash matches" />
        <CheckRow label="Recorded version matches" />
        <CheckRow label="Signature valid" />
        <CheckRow label="Blockchain anchor confirmed" />
      </ul>
      <button className="mt-5 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[12.5px] font-medium text-ink hover:bg-surface-2">
        <IconRefresh size={12} /> Verify again
      </button>
    </div>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[13px]">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-bg text-green">
        <IconShieldCheck size={11} />
      </span>
      <span className="text-ink">{label}</span>
    </li>
  );
}

function HashRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "muted";
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div
        className={`mt-1 font-mono text-[12px] ${
          tone === "red" ? "text-red" : "text-ink"
        } break-all`}
      >
        {value}
      </div>
    </div>
  );
}
