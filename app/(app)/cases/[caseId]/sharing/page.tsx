import { notFound } from "next/navigation";
import { findCase } from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { IconClock, IconPlus, IconShare, IconX } from "@/app/_components/icons";
import { ShareDialog } from "../_components/share-dialog";

const shares = [
  {
    id: "sh-1",
    recipient: "Forensic Department",
    document: "Witness Statement.pdf",
    permission: "View",
    expires: "2026-09-10",
    sharedBy: "u-raj",
    at: "2026-09-03T11:03:00Z",
  },
  {
    id: "sh-2",
    recipient: "External — District Court",
    document: "FIR.pdf",
    permission: "View",
    expires: "2026-09-30",
    sharedBy: "u-anita",
    at: "2026-09-01T16:00:00Z",
  },
  {
    id: "sh-3",
    recipient: "Senior Counsel",
    document: "Charge Sheet.pdf",
    permission: "View + Comment",
    expires: "2026-10-01",
    sharedBy: "u-anita",
    at: "2026-09-01T12:50:00Z",
  },
];

export default async function CaseSharing({
  params,
}: PageProps<"/cases/[caseId]/sharing">) {
  const { caseId } = await params;
  const c = findCase(caseId);
  if (!c) notFound();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[13px] text-muted">{shares.length} active shares</div>
        </div>
        <ShareDialog
          trigger={
            <Button variant="primary" size="sm" iconLeft={<IconPlus size={13} />}>
              New share
            </Button>
          }
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_1fr_140px_140px_120px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Recipient</div>
          <div>Document</div>
          <div>Permission</div>
          <div>Expires</div>
          <div>Shared by</div>
          <div>At</div>
          <div />
        </div>
        {shares.map((s, idx) => (
          <div
            key={s.id}
            className={`grid grid-cols-[1fr_1fr_140px_140px_120px_140px_40px] items-center gap-3 px-5 py-3.5 ${
              idx === shares.length - 1 ? "" : "border-b border-border"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Avatar person={{ name: s.recipient, initials: s.recipient.slice(0, 2) }} size={28} />
              <div className="leading-tight">
                <div className="text-[13.5px] font-medium text-ink">{s.recipient}</div>
              </div>
            </div>
            <div className="text-[13px] text-ink">{s.document}</div>
            <div>
              <Badge tone="info" subtle>
                {s.permission}
              </Badge>
            </div>
            <div className="text-[12.5px] text-muted">
              <IconClock size={11} className="mr-1 inline-block align-middle" />
              {s.expires}
            </div>
            <div className="text-[12.5px] text-muted">{actorName(s.sharedBy)}</div>
            <div className="text-[12.5px] text-muted">{s.at.split("T")[0]}</div>
            <button className="text-muted hover:text-red" aria-label="Revoke">
              <IconX size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function actorName(id: string) {
  if (id === "u-raj") return "Inspector R. Sharma";
  if (id === "u-anita") return "Reviewer A. Desai";
  return id;
}
