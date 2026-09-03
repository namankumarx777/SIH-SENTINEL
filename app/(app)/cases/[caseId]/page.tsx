import Link from "next/link";
import { notFound } from "next/navigation";
import {
  activity,
  documentsForCase,
  findCase,
  formatDate,
  formatTime,
} from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import {
  IconActivity,
  IconArrowLeft,
  IconFile,
  IconShieldCheck,
  IconUsers,
} from "@/app/_components/icons";

export default async function CaseOverview({
  params,
}: PageProps<"/cases/[caseId]">) {
  const { caseId } = await params;
  const c = findCase(caseId);
  if (!c) notFound();
  const docs = documentsForCase(caseId);
  const recent = activity.filter((a) => a.caseId === caseId).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <div className="eyebrow mb-3">Summary</div>
        <div className="t-h2 mb-3 text-ink">{c.description}</div>
        <p className="max-w-prose text-[14.5px] leading-relaxed text-muted">
          This case is being managed with end-to-end integrity controls. All
          documents are versioned and verifiable; every access and modification is
          recorded in the immutable audit log.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-6 border-y border-border py-6">
          <Stat label="Documents" value={String(c.documents)} />
          <Stat label="Collaborators" value={String(c.collaborators.length + 1)} />
          <Stat label="Open shares" value="4" />
        </div>

        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="eyebrow">Recent documents</div>
            <Link
              href={`/cases/${caseId}/documents`}
              className="text-[12.5px] text-muted hover:text-ink"
            >
              All documents →
            </Link>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {docs.slice(0, 4).map((d) => (
              <li key={d.id}>
                <Link
                  href={`/cases/${caseId}/documents/${d.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
                    <IconFile size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">{d.name}</div>
                    <div className="text-[12px] text-muted">
                      {d.type} · {d.classification} · updated {formatTime(d.updatedAt)}
                    </div>
                  </div>
                  {d.integrity === "verified" ? (
                    <Badge tone="verified" subtle>
                      verified
                    </Badge>
                  ) : d.integrity === "mismatch" ? (
                    <Badge tone="danger" subtle>
                      mismatch
                    </Badge>
                  ) : (
                    <Badge tone="pending" subtle>
                      pending
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="flex flex-col gap-8">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2 text-[12.5px] font-medium text-muted">
            <IconShieldCheck size={13} /> Integrity
          </div>
          <ul className="space-y-3">
            <CheckRow label="File hashes match" />
            <CheckRow label="Recorded versions match" />
            <CheckRow label="Digital signatures valid" />
            <CheckRow label="Blockchain anchor confirmed" />
          </ul>
          <button className="mt-5 inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-surface text-[12.5px] font-medium text-ink hover:bg-surface-2">
            Verify again
          </button>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2 text-[12.5px] font-medium text-muted">
            <IconUsers size={13} /> People on this case
          </div>
          <ul className="space-y-3">
            {[
              { name: "Inspector Raj Sharma", role: "Lead investigator", initials: "RS" },
              { name: "Anita Desai", role: "Legal review", initials: "AD" },
              { name: "Vikram Iyer", role: "Forensic officer", initials: "VI" },
              { name: "Neha Verma", role: "Auditor", initials: "NV" },
            ].map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <Avatar person={p} size={28} />
                <div className="leading-tight">
                  <div className="text-[13px] font-medium text-ink">{p.name}</div>
                  <div className="text-[11.5px] text-muted">{p.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="eyebrow">Recent activity</div>
            <Link
              href={`/cases/${caseId}/activity`}
              className="text-[12.5px] text-muted hover:text-ink"
            >
              All activity →
            </Link>
          </div>
          <ul className="space-y-3">
            {recent.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-muted">
                  <IconActivity size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-snug">
                    <span className="font-medium text-ink">{a.action}</span>{" "}
                    <span className="text-muted">·</span>{" "}
                    <span className="font-medium text-ink">{a.resource}</span>
                  </div>
                  <div className="text-[11.5px] text-muted">{formatDate(a.at)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[28px] font-semibold leading-none tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
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
