import Link from "next/link";
import {
  CURRENT_USER,
  activity,
  cases,
  documents,
  documentsForCase,
  findCase,
  findDocument,
  findPerson,
  formatTime,
} from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconChevronRight,
  IconClock,
  IconFile,
  IconFolder,
  IconShieldCheck,
  IconShare,
  IconSparkles,
  IconUser,
  IconUsers,
} from "@/app/_components/icons";
import { PageHeader } from "@/app/_components/page-header";

export default function Dashboard() {
  const attentionCount =
    1 + // mismatch alert
    1 + // pending review
    1; // expiring share
  const pendingReviews = documents.filter((d) => d.status === "Review").slice(0, 3);
  const mismatchDoc = documents.find((d) => d.integrity === "mismatch");
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const recentShares = activity
    .filter((a) => a.action === "Shared")
    .slice(0, 3);
  const recentActivity = activity.slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={`${new Date("2026-09-03T12:00:00Z").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}`}
        title={
          <>
            Good morning, <span className="text-ink">{CURRENT_USER.name.split(" ")[0]}</span>.
          </>
        }
        description={`${attentionCount} items require your attention today.`}
      />

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="eyebrow">Priority</div>
          <Link href="/audit" className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">
            View audit <IconChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mismatchDoc ? (
            <PriorityAlert
              tone="danger"
              icon={<IconAlertOctagon size={14} />}
              title="Integrity mismatch"
              meta={`Case ${findCase(mismatchDoc.caseId)?.number}`}
              body={`${mismatchDoc.name} — current file differs from recorded version.`}
              href={`/cases/${mismatchDoc.caseId}/documents/${mismatchDoc.id}`}
              cta="Investigate"
            />
          ) : null}

          <PriorityAlert
            tone="warning"
            icon={<IconClock size={14} />}
            title="Pending review"
            meta={`${pendingReviews.length} document${pendingReviews.length === 1 ? "" : "s"}`}
            body={
              pendingReviews[0]
                ? `${pendingReviews[0].name} awaits reviewer approval.`
                : "No pending reviews."
            }
            href={`/cases/${pendingReviews[0]?.caseId}/documents/${pendingReviews[0]?.id}`}
            cta="Review"
          />

          <PriorityAlert
            tone="info"
            icon={<IconShare size={14} />}
            title="Expiring access"
            meta="Witness Statement.pdf"
            body="Shared access expires in 4 days. Renew or revoke."
            href="#"
            cta="Manage"
          />
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="eyebrow">Active cases</div>
          <Link href="/cases" className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">
            All cases <IconChevronRight size={12} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {recentCases.map((c, idx) => {
            const lead = findPerson(c.lead);
            const isLast = idx === recentCases.length - 1;
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className={`group flex items-center gap-6 px-6 py-5 transition-colors hover:bg-surface-2 ${isLast ? "" : "border-b border-border"}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
                  <IconFolder size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12.5px] text-muted">{c.number}</span>
                    <Badge tone={c.status === "active" ? "verified" : c.status === "under_review" ? "pending" : "muted"} subtle>
                      {c.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-1 truncate text-[15px] font-semibold text-ink">{c.title}</div>
                  <div className="mt-1.5 flex items-center gap-4 text-[12.5px] text-muted">
                    {lead ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar person={lead} size={18} />
                        {lead.name}
                      </span>
                    ) : null}
                    <span>{c.documents} documents</span>
                    <span>{c.collaborators.length} collaborators</span>
                    <span>Updated {formatTime(c.updatedAt)}</span>
                  </div>
                </div>
                <span className="text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  <IconChevronRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="eyebrow">Recent activity</div>
            <Link href="/audit" className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">
              Full audit log <IconChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <ul className="divide-y divide-border">
              {recentActivity.map((a) => {
                const actor = findPerson(a.actor);
                const caseRecord = a.caseId ? findCase(a.caseId) : undefined;
                return (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                    <Avatar person={actor} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] leading-relaxed">
                        <span className="font-medium text-ink">{actor?.name ?? "System"}</span>{" "}
                        <span className="text-muted">{a.action.toLowerCase()}</span>{" "}
                        <span className="font-medium text-ink">{a.resource}</span>
                        {caseRecord ? (
                          <>
                            {" "}
                            <span className="text-muted">in</span>{" "}
                            <Link
                              href={`/cases/${caseRecord.id}`}
                              className="font-mono text-[12.5px] text-muted hover:text-ink"
                            >
                              {caseRecord.number}
                            </Link>
                          </>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-[12px] text-muted">{formatTime(a.at)}</div>
                    </div>
                    {a.result === "failure" ? (
                      <Badge tone="danger" subtle>
                        failure
                      </Badge>
                    ) : a.result === "warning" ? (
                      <Badge tone="warning" subtle>
                        info
                      </Badge>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="eyebrow">AI assist</div>
            <span className="text-[11.5px] text-muted">Contextual</span>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-muted">
                <IconSparkles size={14} />
              </span>
              Suggestions
            </div>
            <p className="mt-2 text-[12.5px] text-muted">
              Suggested actions derived from your case context. Use as a starting point —
              documents remain the source of truth.
            </p>
            <ul className="mt-5 space-y-3">
              <AISuggestion
                title="Compare witness statements"
                body="3 statements in CR-2026-0142 may contain overlapping descriptions."
                href="/cases/c-0142"
              />
              <AISuggestion
                title="Summarize forensic report"
                body="Generate a 1-page executive summary of Forensic Report.pdf."
                href="/cases/c-0142/documents/d-003"
              />
              <AISuggestion
                title="Find documents on DL… plates"
                body="3 documents mention vehicle registrations matching DL pattern."
                href="/cases/c-0141"
              />
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="eyebrow">Recent shares</div>
          <Link href="/shared" className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">
            All shares <IconChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {recentShares.map((s, idx) => {
            const caseRec = s.caseId ? findCase(s.caseId) : undefined;
            const doc = s.documentId ? findDocument(s.documentId) : undefined;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-6 py-4 ${idx === recentShares.length - 1 ? "" : "border-b border-border"}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
                  <IconShare size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-ink">
                    {doc?.name ?? s.resource}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">
                    {findPerson(s.actor)?.name} · {caseRec?.number} · {formatTime(s.at)}
                  </div>
                </div>
                <Badge tone="info" subtle>
                  expires soon
                </Badge>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PriorityAlert({
  tone,
  icon,
  title,
  meta,
  body,
  cta,
  href,
}: {
  tone: "danger" | "warning" | "info";
  icon: React.ReactNode;
  title: string;
  meta: string;
  body: string;
  cta: string;
  href: string;
}) {
  const toneClass =
    tone === "danger"
      ? "border-red/30 bg-red-bg"
      : tone === "warning"
        ? "border-amber/30 bg-amber-bg"
        : "border-blue/30 bg-blue-bg";
  const textClass =
    tone === "danger" ? "text-red" : tone === "warning" ? "text-amber" : "text-blue";
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-1 ${toneClass}`}
    >
      <div className="flex items-center gap-2 text-[12px] font-medium">
        <span className={textClass}>{icon}</span>
        <span className={textClass}>{title}</span>
      </div>
      <div>
        <div className="font-mono text-[12px] text-muted">{meta}</div>
        <div className="mt-1.5 text-[14px] font-semibold leading-snug text-ink">{body}</div>
      </div>
      <span className={`mt-1 inline-flex items-center gap-1 text-[12.5px] font-medium ${textClass}`}>
        {cta}
        <IconChevronRight size={12} />
      </span>
    </Link>
  );
}

function AISuggestion({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group block rounded-md border border-border bg-surface-2 px-3.5 py-3 transition-colors hover:bg-surface-3"
      >
        <div className="text-[13.5px] font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-muted">{body}</div>
      </Link>
    </li>
  );
}
