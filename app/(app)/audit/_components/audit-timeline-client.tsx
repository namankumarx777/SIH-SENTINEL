"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  activity,
  findCase,
  findDocument,
  findPerson,
  formatDateTime,
  formatTime,
  type ActivityEvent,
} from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import {
  IconAlertOctagon,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconFile,
  IconSearch,
  IconShieldCheck,
  IconX,
} from "@/app/_components/icons";

interface Props {
  initialActivity: ActivityEvent[];
}

type FilterCategory = "all" | "integrity" | "share" | "upload" | "failures";

export function AuditTimelineClient({ initialActivity }: Props) {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return initialActivity.filter((item) => {
      // Filter Category
      if (filterCategory === "failures") {
        if (item.result !== "failure") return false;
      } else if (filterCategory === "integrity") {
        const a = item.action.toLowerCase();
        if (!a.includes("integrity") && !a.includes("verif") && !a.includes("mismatch")) return false;
      } else if (filterCategory === "share") {
        const a = item.action.toLowerCase();
        if (!a.includes("share") && !a.includes("access") && !a.includes("disclos")) return false;
      } else if (filterCategory === "upload") {
        const a = item.action.toLowerCase();
        if (!a.includes("upload") && !a.includes("intake") && !a.includes("added") && !a.includes("accession")) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = findPerson(item.actor);
        const c = item.caseId ? findCase(item.caseId) : undefined;
        const matchesActor = (p?.name ?? item.actor).toLowerCase().includes(q);
        const matchesAction = item.action.toLowerCase().includes(q);
        const matchesResource = item.resource.toLowerCase().includes(q);
        const matchesCase = (c?.number ?? item.caseId ?? "").toLowerCase().includes(q);
        const matchesMeta = (item.meta ?? "").toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);

        if (!matchesActor && !matchesAction && !matchesResource && !matchesCase && !matchesMeta && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [initialActivity, filterCategory, searchQuery]);

  // Group events by date (e.g., "03 SEPTEMBER 2026")
  const groupedEvents = useMemo(() => {
    const groups: { [dateKey: string]: ActivityEvent[] } = {};

    filteredEvents.forEach((ev) => {
      const date = new Date(ev.at);
      const dateKey = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).toUpperCase();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(ev);
    });

    return groups;
  }, [filteredEvents]);

  // Export CSV
  const handleExportCsv = () => {
    const header = "EventID,Timestamp,Actor,Role,Action,Resource,CaseID,Result,Metadata\n";
    const rows = filteredEvents
      .map((item) => {
        const p = findPerson(item.actor);
        const c = item.caseId ? findCase(item.caseId)?.number ?? item.caseId : "";
        return `"${item.id}","${item.at}","${p?.name ?? item.actor}","${p?.role ?? "System"}","${item.action}","${item.resource}","${c}","${item.result}","${item.meta ?? ""}"`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securecase_audit_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const failureCount = initialActivity.filter((e) => e.result === "failure").length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Restrained, Editorial, Calm) */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="text-[11.5px] font-medium tracking-[0.08em] uppercase text-muted/80">
            Immutable Custody Trail
          </div>
          <h1 className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.03em] text-ink leading-tight">
            Audit Timeline
          </h1>
          <p className="text-[14.5px] text-muted max-w-2xl font-normal leading-normal">
            Chronological, append-only narrative record of every investigative accession, cryptographic verification, and external disclosure across the workspace.
          </p>

          {/* Compact System Trust Status Line */}
          <div className="pt-1 flex items-center gap-2 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1.5 font-medium text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              Blockchain Quorum Healthy
            </span>
            <span>·</span>
            <span className="text-ink font-medium">{initialActivity.length} recorded events</span>
            {failureCount > 0 && (
              <>
                <span>·</span>
                <span className="text-red font-medium">
                  {failureCount} failure logged
                </span>
              </>
            )}
          </div>
        </div>

        {/* Secondary Action: Export Ledger */}
        <div className="pt-1 sm:pt-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <IconDownload size={13} className="text-muted" />
            <span>Export Ledger</span>
          </button>
        </div>
      </header>

      {/* 2. Filter Bar & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border pb-4">
        {/* Segmented Category Filter Pills */}
        <div className="inline-flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "All Events" },
              { id: "integrity", label: "Integrity" },
              { id: "share", label: "Access & Shares" },
              { id: "upload", label: "Evidence" },
              { id: "failures", label: "Failures" },
            ] as const
          ).map((tab) => {
            const active = filterCategory === tab.id;
            const isFailuresTab = tab.id === "failures";

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                  active
                    ? isFailuresTab
                      ? "bg-red text-white shadow-2xs"
                      : "bg-ink text-white shadow-2xs"
                    : "border border-border bg-surface text-muted hover:text-ink hover:bg-surface-2"
                }`}
              >
                <span>{tab.label}</span>
                {isFailuresTab && failureCount > 0 && !active && (
                  <span className="ml-1.5 rounded-full bg-red/10 px-1.5 py-0.2 text-[10px] font-bold text-red">
                    {failureCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Search Input */}
        <div className="relative w-full md:w-64">
          <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit events…"
            className="h-9 w-full rounded-lg border border-border bg-surface pl-8.5 pr-7 text-[12.5px] text-ink outline-none placeholder:text-muted/60 focus:border-ink/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
            >
              <IconX size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Continuous Audit Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center space-y-2.5">
          <h3 className="text-[15px] font-semibold text-ink">No audit records match your search</h3>
          <p className="text-[13px] text-muted">
            Try adjusting your category filters or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterCategory("all");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink hover:underline cursor-pointer pt-1"
          >
            <span>Reset filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([dateLabel, events]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date Group Header */}
              <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-xs py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                {dateLabel}
              </div>

              {/* Continuous Timeline Rail Container */}
              <div className="relative pl-6 sm:pl-8 space-y-3">
                {/* Vertical Continuous Line Rail */}
                <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-px bg-border pointer-events-none" />

                {events.map((event) => {
                  const actor = findPerson(event.actor);
                  const caseRecord = event.caseId ? findCase(event.caseId) : undefined;
                  const isFailure = event.result === "failure";
                  const isSystem = event.actor === "system";

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`group relative rounded-xl border transition-all cursor-pointer ${
                        isFailure
                          ? "border-red/40 bg-red-bg/25 border-l-4 border-l-red hover:bg-red-bg/35"
                          : "border-border bg-surface border-l-4 border-l-transparent hover:bg-surface-2/60 hover:border-ink/20"
                      }`}
                    >
                      {/* Timeline Node Icon (positioned over the vertical rail) */}
                      <span
                        className={`absolute -left-6 sm:-left-8 top-5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-bg transition-transform group-hover:scale-110 ${
                          isFailure ? "bg-red" : "bg-border group-hover:bg-ink"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>

                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Event Content Hierarchy */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Actor Icon / Avatar */}
                          {isSystem ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red/30 bg-red-bg text-red mt-0.5 shadow-2xs">
                              <IconAlertOctagon size={15} />
                            </span>
                          ) : (
                            <div className="mt-0.5 shrink-0">
                              <Avatar person={actor} size={28} />
                            </div>
                          )}

                          {/* Event Narrative (Semantic readable sentence) */}
                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Eyebrow Label on Critical Tamper Event */}
                            {isFailure && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-red">
                                  Critical Security Event
                                </span>
                                <span className="text-muted/40">·</span>
                                <span className="text-[11.5px] font-medium text-red">
                                  Integrity Mismatch
                                </span>
                              </div>
                            )}

                            {/* Narrative Sentence */}
                            <div className="text-[14px] text-ink leading-relaxed">
                              <strong className="font-semibold text-ink">
                                {actor?.name ?? "System Enclave"}
                              </strong>{" "}
                              <span className="text-muted/90 font-normal">
                                {event.action.toLowerCase()}
                              </span>{" "}
                              {event.documentId && caseRecord ? (
                                <Link
                                  href={`/cases/${caseRecord.id}/documents/${event.documentId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-semibold text-ink underline hover:text-black"
                                >
                                  {event.resource}
                                </Link>
                              ) : (
                                <strong className="font-semibold text-ink">
                                  {event.resource}
                                </strong>
                              )}
                              {caseRecord && (
                                <span className="text-muted font-normal">
                                  {" "}in{" "}
                                  <Link
                                    href={`/cases/${caseRecord.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-mono text-[12px] font-medium text-ink hover:underline"
                                  >
                                    {caseRecord.number}
                                  </Link>
                                </span>
                              )}
                            </div>

                            {/* Secondary Technical Reason / Context */}
                            {event.meta && (
                              <div className="text-[12px] font-mono text-muted/90 pt-0.5">
                                ↳ {event.meta}
                              </div>
                            )}

                            {/* Primary Action Button for Critical Mismatch */}
                            {isFailure && (
                              <div className="pt-2">
                                <Link
                                  href={`/cases/${event.caseId ?? "c-0142"}/documents/${event.documentId ?? "d-002"}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-red px-3 py-1.5 text-[12px] font-medium text-white hover:bg-red/90 transition-colors shadow-2xs"
                                >
                                  <span>Investigate Tamper</span>
                                  <IconChevronRight size={12} />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Timestamp & Subtle Status Result */}
                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1 shrink-0 text-left sm:text-right pl-11 sm:pl-0 pt-0.5">
                          {/* Relative Time (Primary) */}
                          <div className="text-[12.5px] font-medium text-ink font-mono">
                            {formatTime(event.at)}
                          </div>

                          {/* Absolute Time (Secondary) */}
                          <div className="text-[11px] font-mono text-muted/80">
                            {new Date(event.at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} IST
                          </div>

                          {/* Subtle Status Indicator */}
                          <div className="pt-1">
                            {isFailure ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-red uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-red" />
                                mismatch
                              </span>
                            ) : event.result === "warning" ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-amber">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                                review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-green">
                                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                                verified
                              </span>
                            )}
                          </div>

                          {/* Event Monospace ID */}
                          <div className="hidden sm:block font-mono text-[10px] text-muted/60 pt-0.5">
                            {event.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Event Detail Slide-Over Drawer (Progressive Disclosure) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs anim-overlay"
            onClick={() => setSelectedEvent(null)}
          />

          <div className="relative h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-pop anim-slide z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted">
                      {selectedEvent.id}
                    </span>
                    <span className="text-muted/40">·</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Audit Event
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-ink leading-tight">
                    {selectedEvent.action}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`rounded-xl border p-3.5 ${
                  selectedEvent.result === "failure"
                    ? "border-red/40 bg-red-bg/30 text-red"
                    : "border-border bg-surface-2/40 text-ink"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium uppercase tracking-wider">
                    Verification Status
                  </span>
                  <span className="font-mono text-[12px] font-semibold uppercase">
                    {selectedEvent.result}
                  </span>
                </div>
                <div className="mt-1 text-[12.5px] font-mono">
                  {formatDateTime(selectedEvent.at)}
                </div>
              </div>

              {/* Semantic Event Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Custody Parameters
                </div>

                <div className="rounded-xl border border-border bg-surface divide-y divide-border text-[12.5px]">
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Actor</span>
                    <span className="font-semibold text-ink">
                      {findPerson(selectedEvent.actor)?.name ?? selectedEvent.actor}
                    </span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Target Resource</span>
                    <span className="font-medium text-ink">{selectedEvent.resource}</span>
                  </div>
                  {selectedEvent.caseId && (
                    <div className="flex justify-between px-3.5 py-2.5">
                      <span className="text-muted">Bound Case</span>
                      <span className="font-mono text-ink font-medium">
                        {findCase(selectedEvent.caseId)?.number ?? selectedEvent.caseId}
                      </span>
                    </div>
                  )}
                  {selectedEvent.meta && (
                    <div className="px-3.5 py-2.5">
                      <div className="text-muted text-[11px] uppercase mb-0.5">Recorded Context</div>
                      <div className="font-mono text-muted text-[12px]">{selectedEvent.meta}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cryptographic Immutability Anchor */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Blockchain Proof
                </div>

                <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 text-[12px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted">Blockchain Quorum</span>
                    <span className="text-green font-medium">✓ Confirmed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Ledger Anchor</span>
                    <span className="text-ink font-medium">Block #1492840</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-muted text-[10.5px] uppercase">Transaction Hash</div>
                    <div className="text-muted break-all mt-0.5 text-[11px]">
                      0x8fa201b8e49c9a01f73b882104dc98a1204859a721d092
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedEvent.result === "failure" && (
                <Link
                  href={`/cases/${selectedEvent.caseId ?? "c-0142"}/documents/${selectedEvent.documentId ?? "d-002"}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red px-4 py-2 text-[12.5px] font-medium text-white hover:bg-red/90 transition-colors shadow-xs"
                >
                  <span>Investigate Tamper</span>
                  <IconChevronRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
