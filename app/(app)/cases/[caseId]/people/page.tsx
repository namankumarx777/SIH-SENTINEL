import { notFound } from "next/navigation";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { findCase, people } from "@/lib/data";
import { IconPlus, IconUser } from "@/app/_components/icons";

export default async function CasePeople({
  params,
}: PageProps<"/cases/[caseId]/people">) {
  const { caseId } = await params;
  const c = findCase(caseId);
  if (!c) notFound();
  const team = people.filter((p) =>
    p.id === c.lead || c.collaborators.includes(p.id),
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_180px_140px_120px_120px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Name</div>
          <div>Department</div>
          <div>Role</div>
          <div>Access</div>
          <div>Added</div>
        </div>
        {team.map((p, idx) => (
          <div
            key={p.id}
            className={`grid grid-cols-[1fr_180px_140px_120px_120px] items-center gap-3 px-5 py-3.5 ${
              idx === team.length - 1 ? "" : "border-b border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar person={p} size={30} />
              <div className="leading-tight">
                <div className="text-[13.5px] font-medium text-ink">{p.name}</div>
                <div className="text-[11.5px] text-muted font-mono">{p.badge}</div>
              </div>
            </div>
            <div className="text-[12.5px] text-muted">{p.department}</div>
            <div className="text-[12.5px] capitalize text-ink">{p.role}</div>
            <div>
              <Badge tone="verified" subtle>
                full
              </Badge>
            </div>
            <div className="text-[12.5px] text-muted">21 Aug 2026</div>
          </div>
        ))}
      </div>

      <aside className="flex flex-col gap-5">
        <div className="card p-5">
          <div className="mb-3 text-[12.5px] font-medium text-muted">Add collaborator</div>
          <p className="text-[12.5px] text-muted">
            Invite an officer to this case. Permission defaults to view; can be
            elevated after acceptance.
          </p>
          <Button variant="primary" iconLeft={<IconPlus size={13} />} className="mt-4 w-full">
            Add collaborator
          </Button>
        </div>
        <div className="card p-5">
          <div className="mb-3 text-[12.5px] font-medium text-muted">Access overview</div>
          <ul className="space-y-2.5">
            <Row label="Full access" value={String(team.length)} />
            <Row label="View only" value="2" />
            <Row label="Restricted" value="0" />
            <Row label="Pending invites" value="1" />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </li>
  );
}
