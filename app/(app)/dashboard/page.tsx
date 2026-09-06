import Link from "next/link";
import {
  activity,
  cases,
  documents,
  findCase,
  findPerson,
  formatTime,
} from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { Avatar } from "@/app/_components/avatar";
import {
  IconChevronRight,
} from "@/app/_components/icons";

export const instant = false;

export default async function Dashboard() {
  const session = await getSessionUser();

  const mismatchDoc = documents.find((d) => d.integrity === "mismatch");
  const pendingReviews = documents.filter((d) => d.status === "Review");
  const activeCases = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const recentActivity = activity.slice(0, 5);

  const attentionCount =
    (mismatchDoc ? 1 : 0) + pendingReviews.length + 1;

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="space-y-9">
      {/* 1. Page Header (Apple-inspired Calm Typography) */}
      <header className="space-y-1">
        <div className="text-[11.5px] font-medium tracking-[0.08em] uppercase text-muted/70">
          Thursday · 03 September 2026
        </div>
        <h1 className="text-[36px] sm:text-[38px] font-semibold tracking-[-0.03em] text-ink leading-tight">
          Good morning, {firstName}.
        </h1>
        <p className="text-[14.5px] text-muted font-normal pt-0.5">
          {attentionCount} items require your attention.
        </p>
      </header>

      {/* 2. Attention Required (Prioritized Operational Feed) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Attention Required
          </h2>
          <Link
            href="/audit"
            className="group inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition-colors"
          >
            <span>View audit activity</span>
            <IconChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
          {/* Priority 1: Critical Security Event (Strongest Visual Treatment) */}
          {mismatchDoc && (
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-bg/25 border-l-4 border-l-red transition-colors hover:bg-red-bg/35">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-red">
                    Critical Security Event
                  </span>
                  <span className="text-muted/40">·</span>
                  <span className="text-[12px] font-medium text-red">Integrity mismatch</span>
                </div>
                <div className="text-[15.5px] font-semibold text-ink">
                  {mismatchDoc.name}
                </div>
                <p className="text-[13px] text-ink/80 leading-normal max-w-2xl">
                  The current file differs from the recorded document fingerprint in Case {findCase(mismatchDoc.caseId)?.number ?? "CR-2026-0142"}.
                </p>
                <div className="pt-0.5 flex items-center gap-3 text-[11.5px] font-mono text-muted">
                  <span>Block #1492840</span>
                  <span>·</span>
                  <span>FIPS 180-4 SHA-256 Divergence</span>
                </div>
              </div>

              <div className="shrink-0 pt-1 sm:pt-0">
                <Link
                  href={`/cases/${mismatchDoc.caseId}/documents/${mismatchDoc.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-red/90 transition-colors shadow-xs"
                >
                  <span>Investigate tamper</span>
                  <IconChevronRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* Priority 2: Pending Review (Subtle Amber Indicator) */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-surface-2/60 border-l-4 border-l-amber/60">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber">
                  Pending Review
                </span>
              </div>
              <div className="text-[15.5px] font-semibold text-ink">
                {pendingReviews[0]?.name ?? "Forensic Report.pdf"}
              </div>
              <p className="text-[13px] text-muted leading-normal max-w-2xl">
                Awaiting Legal Reviewer sign-off prior to court charge sheet annexation.
              </p>
              <div className="pt-0.5 flex items-center gap-3 text-[11.5px] font-mono text-muted">
                <span>Legal Review Directorate</span>
                <span>·</span>
                <span>Case CR-2026-0142</span>
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <Link
                href={`/cases/${pendingReviews[0]?.caseId ?? "c-0142"}/documents/${pendingReviews[0]?.id ?? "d-003"}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 hover:border-ink/30 transition-colors"
              >
                <span>Review evidence</span>
                <IconChevronRight size={13} className="text-muted" />
              </Link>
            </div>
          </div>

          {/* Priority 3: Access Expiring (Neutral Gray Styling) */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-surface-2/60 border-l-4 border-l-transparent">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-muted/60" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Access Expiring
                </span>
              </div>
              <div className="text-[15.5px] font-semibold text-ink">
                District Court external access
              </div>
              <p className="text-[13px] text-muted leading-normal max-w-2xl">
                Expires in 4 days. Time-bound judicial disclosure token revocation scheduled.
              </p>
              <div className="pt-0.5 flex items-center gap-3 text-[11.5px] font-mono text-muted">
                <span>Case CR-2026-0141</span>
                <span>·</span>
                <span>Token ID: tok-court-d82</span>
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <Link
                href="/shared"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 hover:border-ink/30 transition-colors"
              >
                <span>Manage access</span>
                <IconChevronRight size={13} className="text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Active Investigations (Professional Case Workspace Row Layout) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Active Investigations
          </h2>
          <Link
            href="/cases"
            className="group inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition-colors"
          >
            <span>All cases ({cases.length})</span>
            <IconChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_180px_110px_110px_110px_32px] items-center gap-4 border-b border-border bg-surface-2/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted/80">
            <div>Case</div>
            <div>Lead Investigator</div>
            <div>Status</div>
            <div>Evidence</div>
            <div className="text-right">Last Modified</div>
            <div />
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-border">
            {activeCases.map((c) => {
              const lead = findPerson(c.lead);
              return (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="group grid grid-cols-[1fr_180px_110px_110px_110px_32px] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/60 cursor-pointer"
                >
                  {/* Primary: Case Title + Technical Monospace ID + Scope */}
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-[11.5px] font-medium text-muted/90 tracking-tight">
                      {c.number}
                    </div>
                    <div className="truncate text-[15px] font-semibold text-ink group-hover:text-black group-hover:underline mt-0.5">
                      {c.title}
                    </div>
                    <div className="truncate text-[12px] text-muted mt-0.5">
                      {c.jurisdiction} · {c.description}
                    </div>
                  </div>

                  {/* Secondary: Lead Investigator */}
                  <div className="flex items-center gap-2 text-[13px] text-ink min-w-0">
                    <Avatar person={lead} size={22} />
                    <span className="truncate font-medium">{lead?.name ?? "Lead"}</span>
                  </div>

                  {/* Secondary: Status (Restrained dot indicator, not an oversized pill) */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium capitalize text-ink">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          c.status === "active"
                            ? "bg-green"
                            : c.status === "under_review"
                            ? "bg-amber"
                            : "bg-muted"
                        }`}
                      />
                      <span>{c.status.replace("_", " ")}</span>
                    </span>
                  </div>

                  {/* Tertiary: Evidence Count */}
                  <div className="font-mono text-[12.5px] text-muted">
                    {c.documents} artifacts
                  </div>

                  {/* Tertiary: Timestamp */}
                  <div className="text-right font-mono text-[12px] text-muted">
                    {formatTime(c.updatedAt)}
                  </div>

                  {/* Contextual Arrow on Hover */}
                  <div className="text-right text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. System Status (Quiet, Understated Trust Reassurance) */}
      <section className="space-y-2.5">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
          System Status
        </h2>

        <div className="rounded-xl border border-border bg-surface px-5 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:px-3 pt-2 sm:pt-0">
              <span className="text-[12.5px] text-muted">Document integrity</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Healthy
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:px-3 pt-2 sm:pt-0">
              <span className="text-[12.5px] text-muted">Audit ledger</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Healthy
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:px-3 pt-2 sm:pt-0">
              <span className="text-[12.5px] text-muted">Access controls</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Healthy
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:px-3 pt-2 sm:pt-0">
              <span className="text-[12.5px] text-muted">Blockchain anchoring</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real-Time Audit Activity Feed */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Recent Activity
          </h2>
          <Link
            href="/audit"
            className="group inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition-colors"
          >
            <span>Full tamper-evident ledger</span>
            <IconChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
          {recentActivity.map((event) => {
            const actor = findPerson(event.actor);
            const c = event.caseId ? findCase(event.caseId) : undefined;
            const isFailure = event.result === "failure";

            return (
              <div
                key={event.id}
                className={`flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-2/50 ${
                  isFailure ? "bg-red-bg/15" : ""
                }`}
              >
                <Avatar person={actor} size={22} />
                <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
                  <span className="font-semibold text-ink">
                    {actor?.name ?? "System Enclave"}
                  </span>{" "}
                  <span className="text-muted">{event.action.toLowerCase()}</span>{" "}
                  <span className="font-medium text-ink">{event.resource}</span>
                  {c && (
                    <span className="text-muted">
                      {" "}in <span className="font-mono text-[11.5px] text-ink">{c.number}</span>
                    </span>
                  )}
                  <div className="mt-0.5 text-[11px] text-muted/70 font-mono">
                    {formatTime(event.at)}
                    {event.meta && ` · ${event.meta}`}
                  </div>
                </div>

                {isFailure && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-red font-semibold uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-red" />
                    mismatch
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
