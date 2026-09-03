import type { DocumentVersion } from "@/lib/data";
import { formatDate, formatTimeOnly } from "@/lib/data";
import { IconShieldCheck } from "@/app/_components/icons";

export function VersionTimeline({
  versions,
}: {
  versions: DocumentVersion[];
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 text-[12.5px] font-medium text-muted">Version history</div>
      <ol className="relative">
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        {versions.map((v, idx) => (
          <li
            key={`${v.version}-${idx}`}
            className="relative flex items-start gap-3 pb-5 last:pb-0"
          >
            <span
              className={`mt-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                v.current ? "bg-ink" : "bg-surface-2 border border-border-strong"
              }`}
            >
              {v.current ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12.5px] text-ink">{v.version}</span>
                {v.current ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-green">
                    <IconShieldCheck size={10} /> current
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-[12.5px] text-muted">
                {v.approver
                  ? `Approved by ${approverName(v.approver)}`
                  : `Uploaded by ${uploaderName(v.uploadedBy)}`}
              </div>
              <div className="text-[11.5px] text-subtle">
                {formatDate(v.uploadedAt)} · {formatTimeOnly(v.uploadedAt)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function approverName(id: string) {
  if (id === "u-anita") return "Reviewer A. Desai";
  if (id === "u-rahul") return "Senior Reviewer R. Saxena";
  return id;
}

function uploaderName(id: string) {
  if (id === "u-raj") return "Inspector R. Sharma";
  if (id === "u-anita") return "Reviewer A. Desai";
  if (id === "u-vikram") return "Forensic V. Iyer";
  return id;
}
