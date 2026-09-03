import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { PageHeader } from "@/app/_components/page-header";
import { IconChevronRight, IconClock, IconShare } from "@/app/_components/icons";

const shares = [
  {
    id: "s-1",
    document: "Witness Statement.pdf",
    case: "CR-2026-0142",
    recipient: "Forensic Department",
    sharedBy: "u-raj",
    permission: "View",
    expires: "2026-09-10",
  },
  {
    id: "s-2",
    document: "FIR.pdf",
    case: "CR-2026-0141",
    recipient: "External — District Court",
    sharedBy: "u-anita",
    permission: "View",
    expires: "2026-09-30",
  },
  {
    id: "s-3",
    document: "Charge Sheet.pdf",
    case: "CR-2026-0142",
    recipient: "Senior Counsel",
    sharedBy: "u-anita",
    permission: "View + Comment",
    expires: "2026-10-01",
  },
  {
    id: "s-4",
    document: "Forensic Report.pdf",
    case: "CR-2026-0142",
    recipient: "Forensic Lab",
    sharedBy: "u-vikram",
    permission: "View",
    expires: "2026-09-08",
  },
];

export default function SharedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sharing"
        title="Shared with others"
        description="Documents you or your team have shared externally. Each share is recorded and time-bound."
        meta={
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <span>{shares.length} active</span>
            <span>·</span>
            <span>2 expiring within 7 days</span>
          </div>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_140px_1fr_140px_140px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Document</div>
          <div>Case</div>
          <div>Recipient</div>
          <div>Permission</div>
          <div>Shared by</div>
          <div>Expires</div>
          <div />
        </div>
        {shares.map((s, idx) => {
          const expSoon = new Date(s.expires).getTime() - new Date("2026-09-03").getTime() < 7 * 86400000;
          return (
            <div
              key={s.id}
              className={`grid grid-cols-[1fr_140px_1fr_140px_140px_140px_40px] items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2 ${
                idx === shares.length - 1 ? "" : "border-b border-border"
              }`}
            >
              <div className="text-[13.5px] font-medium text-ink">{s.document}</div>
              <div className="font-mono text-[12.5px] text-muted">{s.case}</div>
              <div className="flex items-center gap-2.5">
                <Avatar person={{ name: s.recipient, initials: s.recipient.slice(0, 2) }} size={24} />
                <span className="text-[13px] text-ink">{s.recipient}</span>
              </div>
              <div>
                <Badge tone="info" subtle>
                  {s.permission}
                </Badge>
              </div>
              <div className="text-[12.5px] text-muted">{actorName(s.sharedBy)}</div>
              <div className={`flex items-center gap-1 text-[12.5px] ${expSoon ? "text-amber" : "text-muted"}`}>
                <IconClock size={11} />
                {s.expires}
              </div>
              <IconChevronRight size={14} className="text-subtle" />
            </div>
          );
        })}
      </div>
    </>
  );
}

function actorName(id: string) {
  if (id === "u-raj") return "Inspector R. Sharma";
  if (id === "u-anita") return "Reviewer A. Desai";
  if (id === "u-vikram") return "Forensic V. Iyer";
  return id;
}
