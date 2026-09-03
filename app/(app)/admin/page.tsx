import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { PageHeader } from "@/app/_components/page-header";
import { people } from "@/lib/data";
import { IconPlus } from "@/app/_components/icons";

const departments = [
  { name: "Cyber Crime Unit", head: "Inspector Raj Sharma", count: 18 },
  { name: "Forensic Lab", head: "Vikram Iyer", count: 9 },
  { name: "Legal Review", head: "Anita Desai", count: 7 },
  { name: "Economic Offences", head: "Priya Menon", count: 12 },
  { name: "Internal Audit", head: "Neha Verma", count: 4 },
];

const roles = [
  { id: "admin", name: "Organization Admin", permissions: 12 },
  { id: "investigator", name: "Investigator", permissions: 6 },
  { id: "reviewer", name: "Legal / Reviewer", permissions: 5 },
  { id: "forensic", name: "Forensic Officer", permissions: 4 },
  { id: "auditor", name: "Auditor", permissions: 3 },
  { id: "external", name: "External Department", permissions: 2 },
];

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Administration"
        description="Manage users, departments, roles, and organization-wide settings."
        actions={
          <Button variant="primary" iconLeft={<IconPlus size={13} />}>
            Invite user
          </Button>
        }
        meta={
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <span>{people.length} users</span>
            <span>·</span>
            <span>{departments.length} departments</span>
            <span>·</span>
            <span>{roles.length} roles</span>
          </div>
        }
      />

      <section className="mb-12">
        <div className="eyebrow mb-3">Users</div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-[1fr_200px_160px_120px_140px_120px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
            <div>Name</div>
            <div>Department</div>
            <div>Role</div>
            <div>Status</div>
            <div>Last active</div>
            <div>Badge</div>
          </div>
          {people.map((p, idx) => (
            <div
              key={p.id}
              className={`grid grid-cols-[1fr_200px_160px_120px_140px_120px] items-center gap-3 px-5 py-3.5 ${
                idx === people.length - 1 ? "" : "border-b border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Avatar person={p} size={28} />
                <span className="text-[13.5px] font-medium text-ink">{p.name}</span>
              </div>
              <div className="text-[12.5px] text-muted">{p.department}</div>
              <div className="text-[12.5px] capitalize text-ink">{p.role}</div>
              <div>
                <Badge tone="verified" subtle>
                  active
                </Badge>
              </div>
              <div className="text-[12.5px] text-muted">12 min ago</div>
              <div className="font-mono text-[12px] text-muted">{p.badge}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="eyebrow mb-3">Departments</div>
          <ul className="rounded-xl border border-border bg-surface">
            {departments.map((d, idx) => (
              <li
                key={d.name}
                className={`flex items-center justify-between px-5 py-4 ${
                  idx === departments.length - 1 ? "" : "border-b border-border"
                }`}
              >
                <div>
                  <div className="text-[13.5px] font-medium text-ink">{d.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted">Head: {d.head}</div>
                </div>
                <span className="font-mono text-[12.5px] text-muted">{d.count} members</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-3">Roles</div>
          <ul className="rounded-xl border border-border bg-surface">
            {roles.map((r, idx) => (
              <li
                key={r.id}
                className={`flex items-center justify-between px-5 py-4 ${
                  idx === roles.length - 1 ? "" : "border-b border-border"
                }`}
              >
                <div>
                  <div className="text-[13.5px] font-medium text-ink">{r.name}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-muted">{r.id}</div>
                </div>
                <span className="text-[12.5px] text-muted">{r.permissions} permissions</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="eyebrow mb-3">Organization</div>
        <div className="card p-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormRow label="Organization name" value="Central Bureau" />
            <FormRow label="Workspace tier" value="Tier 3 — Production" />
            <FormRow label="Region" value="Asia — Mumbai" />
            <FormRow label="Data residency" value="India" />
            <FormRow label="Default classification" value="Confidential" />
            <FormRow label="Audit retention" value="7 years" />
          </div>
          <div className="divider my-6" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-medium text-ink">Immutable audit chain</div>
              <div className="text-[12.5px] text-muted">
                Every event is anchored to the private ledger. Disabling is restricted to the Org Admin role.
              </div>
            </div>
            <Badge tone="verified" subtle>
              enabled
            </Badge>
          </div>
        </div>
      </section>
    </>
  );
}

function FormRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className="text-[13px] text-ink">{value}</span>
    </div>
  );
}
