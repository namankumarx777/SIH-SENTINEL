"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import Link from "next/link";
import {
  findPerson,
  formatTime,
  people,
  type CaseRecord,
  type Classification,
} from "@/lib/data";
import { createCaseAction, getPreviewCaseNumberAction } from "@/lib/actions";
import { Avatar } from "@/app/_components/avatar";
import { Select, type SelectOption } from "@/app/_components/select";
import {
  IconChevronRight,
  IconCopy,
  IconLock,
  IconPlus,
  IconSearch,
  IconX,
} from "@/app/_components/icons";

interface Props {
  initialCases: CaseRecord[];
}

export function CasesWorkspaceClient({ initialCases }: Props) {
  const [caseList] = useState<CaseRecord[]>(initialCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [leadFilter, setLeadFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // New Case Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewCaseNumber, setPreviewCaseNumber] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newJurisdiction, setNewJurisdiction] = useState("Central Bureau");
  const [newClassification, setNewClassification] = useState<Classification>("confidential");

  const [createState, createFormAction, createPending] = useActionState(
    createCaseAction,
    null
  );

  // Fetch preview case number when modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    getPreviewCaseNumberAction().then((res) => {
      if (res.success && res.data) {
        setPreviewCaseNumber(res.data.caseNumber);
      }
    });
  }, [isModalOpen]);

  // Hide modal after successful creation (data refreshes on next page load)
  const showModal = isModalOpen && !createState?.success;

  // Reload page after successful case creation to pick up new data
  useEffect(() => {
    if (createState?.success) {
      window.location.reload();
    }
  }, [createState?.success]);

  // Filtering Logic
  const filteredCases = useMemo(() => {
    return caseList.filter((c) => {
      // Search matching: case number, title, jurisdiction, or lead investigator name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const leadPerson = findPerson(c.lead);
        const matchesNumber = c.number.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesJurisdiction = c.jurisdiction.toLowerCase().includes(q);
        const matchesLead = leadPerson?.name.toLowerCase().includes(q) ?? false;
        const matchesDesc = c.description.toLowerCase().includes(q);

        if (!matchesNumber && !matchesTitle && !matchesJurisdiction && !matchesLead && !matchesDesc) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && c.status !== statusFilter) {
        return false;
      }

      // Classification filter
      if (classFilter !== "all" && c.classification !== classFilter) {
        return false;
      }

      // Lead filter
      if (leadFilter !== "all" && c.lead !== leadFilter) {
        return false;
      }

      return true;
    });
  }, [caseList, searchQuery, statusFilter, classFilter, leadFilter]);

  const activeCount = caseList.filter((c) => c.status === "active").length;
  const latestUpdated = caseList[0]?.updatedAt ? formatTime(caseList[0].updatedAt) : "recently";

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    classFilter !== "all" ||
    leadFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setClassFilter("all");
    setLeadFilter("all");
    setPage(0);
  };

  // Reset page when any filter changes
  const handleSearchChange = (v: string) => { setSearchQuery(v); setPage(0); };
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(0); };
  const handleClassFilter = (v: string) => { setClassFilter(v); setPage(0); };
  const handleLeadFilter = (v: string) => { setLeadFilter(v); setPage(0); };

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);
  const pagedCases = filteredCases.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* 1. Case Page Header (Calm, Operational Workspace Header) */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">

          <h1 className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.03em] text-ink leading-tight">
            Cases
          </h1>
          <p className="text-[14.5px] text-muted max-w-2xl font-normal leading-normal">
            Each case is an isolated workspace. Documents, evidence, and audit history are bound to the case.
          </p>

          {/* Compact Inline Metadata (Not giant cards) */}
          <div className="pt-1 flex items-center gap-2 text-[12.5px] text-muted">
            <span className="font-medium text-ink">{caseList.length} cases</span>
            <span>·</span>
            <span>{activeCount} active</span>
            <span>·</span>
            <span>last updated {latestUpdated}</span>
          </div>
        </div>

        {/* Top-Right Actions */}
        <div className="flex items-center gap-2.5 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
          >
            <IconPlus size={13} />
            <span>New case</span>
          </button>
        </div>
      </header>

      {/* 2. Search + Filter Toolbar (Dominant Search ~65%, Refined Controls) */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Dominant Search Input (60-70% width) */}
          <div className="relative flex-1 flex items-center">
            <IconSearch size={14} className="absolute left-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by case number, title, or jurisdiction"
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9.5 pr-8 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink/50 focus:bg-surface"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 p-0.5 text-muted hover:text-ink cursor-pointer"
                aria-label="Clear search"
              >
                <IconX size={13} />
              </button>
            )}
          </div>

          {/* Compact Filter Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Filter Dropdown */}
            <Select
              size="md"
              value={statusFilter}
              onChange={handleStatusFilter}
              aria-label="Filter by status"
              className="w-[165px]"
              options={[
                { value: "all", label: "Status: All" },
                { value: "active", label: "Status: Active" },
                { value: "under_review", label: "Status: Under Review" },
                { value: "closed", label: "Status: Closed" },
              ]}
            />

            {/* Classification Filter Dropdown */}
            <Select
              size="md"
              value={classFilter}
              onChange={handleClassFilter}
              aria-label="Filter by classification"
              className="w-[165px]"
              options={[
                { value: "all", label: "Classification: All" },
                { value: "confidential", label: "Confidential" },
                { value: "restricted", label: "Restricted" },
                { value: "internal", label: "Internal" },
                { value: "public", label: "Public" },
              ]}
            />

            {/* Lead Filter Dropdown */}
            <div className="hidden md:block">
              <Select
                size="md"
                value={leadFilter}
                onChange={handleLeadFilter}
                aria-label="Filter by lead investigator"
                align="right"
                className="w-[200px]"
                options={[
                  { value: "all", label: "Lead: All" },
                  ...people.map<SelectOption>((p) => ({
                    value: p.id,
                    label: p.name,
                    description: p.role,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* 3. Active Filters Tokens (Compact Removable Tags) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted mr-1">
              Active:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Query: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-red cursor-pointer"
                >
                  <IconX size={11} />
                </button>
              </span>
            )}

            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Status: {statusFilter.replace("_", " ")}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-red cursor-pointer"
                >
                  <IconX size={11} />
                </button>
              </span>
            )}

            {classFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Classification: {classFilter}
                <button
                  type="button"
                  onClick={() => setClassFilter("all")}
                  className="hover:text-red cursor-pointer"
                >
                  <IconX size={11} />
                </button>
              </span>
            )}

            {leadFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Lead: {findPerson(leadFilter)?.name ?? leadFilter}
                <button
                  type="button"
                  onClick={() => setLeadFilter("all")}
                  className="hover:text-red cursor-pointer"
                >
                  <IconX size={11} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11.5px] text-muted hover:text-ink underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 4. Cases List Container (Clean boundary, minimal chrome, high-hierarchy rows) */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {/* Desktop Table Header (Quiet uppercase styling) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_130px_190px_120px_110px_32px] items-center gap-4 border-b border-border bg-surface-2/40 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted/80">
          <div>Case</div>
          <div>Status</div>
          <div>Lead</div>
          <div className="text-right">Documents</div>
          <div className="text-right">Updated</div>
          <div />
        </div>

        {/* Case Rows */}
        {filteredCases.length === 0 ? (
          /* Empty States */
          caseList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <h3 className="text-[16px] font-semibold text-ink">No cases yet</h3>
              <p className="text-[13px] text-muted max-w-sm mx-auto">
                Create your first case to begin organizing documents, evidence, and activity in one secure workspace.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white hover:bg-ink/90 transition-colors cursor-pointer"
              >
                <IconPlus size={13} />
                <span>Create case</span>
              </button>
            </div>
          ) : (
            <div className="py-16 text-center space-y-2.5">
              <h3 className="text-[15px] font-semibold text-ink">
                No cases match &ldquo;{searchQuery || "selected filters"}&rdquo;
              </h3>
              <p className="text-[13px] text-muted">
                Try another case number, title, or jurisdiction.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink hover:underline cursor-pointer pt-1"
              >
                <span>Clear search & filters</span>
              </button>
            </div>
          )
        ) : (
          <div className="divide-y divide-border">
            {pagedCases.map((c) => {
              const lead = findPerson(c.lead);

              return (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="group block lg:grid lg:grid-cols-[1fr_130px_190px_120px_110px_32px] items-center gap-4 px-5 sm:px-6 py-4 transition-colors hover:bg-surface-2/60 cursor-pointer"
                >
                  {/* Primary Hierarchy: Case Number -> Case Title -> Jurisdiction / Classification */}
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-[11.5px] font-medium text-muted/90 tracking-tight">
                      {c.number}
                    </div>
                    <div className="text-[16px] font-semibold text-ink group-hover:text-black group-hover:underline mt-0.5 truncate">
                      {c.title}
                    </div>
                    <div className="text-[12.5px] text-muted mt-0.5 truncate">
                      <span>{c.jurisdiction}</span>
                      <span className="mx-1.5 text-muted/50">·</span>
                      <span className="capitalize">{c.classification}</span>
                    </div>
                  </div>

                  {/* Secondary: Status (Subtle dot with light semantic background) */}
                  <div className="mt-3 lg:mt-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2/80 px-2.5 py-0.5 text-[12px] font-medium text-ink">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${c.status === "active"
                            ? "bg-green"
                            : c.status === "under_review"
                              ? "bg-amber"
                              : "bg-muted"
                          }`}
                      />
                      <span className="capitalize">{c.status.replace("_", " ")}</span>
                    </span>
                  </div>

                  {/* Secondary: Lead Investigator */}
                  <div className="mt-2 lg:mt-0 flex items-center gap-2 text-[13px] text-ink min-w-0">
                    <Avatar person={lead} size={20} />
                    <span className="truncate font-medium">{lead?.name ?? "Assigned Lead"}</span>
                  </div>

                  {/* Tertiary: Document Count */}
                  <div className="mt-1 lg:mt-0 lg:text-right font-mono text-[12.5px] text-muted">
                    {c.documents} documents
                  </div>

                  {/* Tertiary: Last Updated Time */}
                  <div className="mt-0.5 lg:mt-0 text-[12px] lg:text-right font-mono text-muted">
                    {formatTime(c.updatedAt)}
                  </div>

                  {/* Contextual Action Right Arrow */}
                  <div className="hidden lg:block text-right text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Pagination Bar (Quiet, Aligned Underneath) */}
      <div className="flex items-center justify-between text-[12px] text-muted pt-1">
        <span>
          Showing {Math.min(page * PAGE_SIZE + 1, filteredCases.length)}–{Math.min((page + 1) * PAGE_SIZE, filteredCases.length)} of {filteredCases.length} cases
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11.5px] text-ink hover:bg-surface-2 transition-colors disabled:text-muted/50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-1 font-mono text-[11px] text-muted">{page + 1} / {Math.max(1, totalPages)}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11.5px] text-ink hover:bg-surface-2 transition-colors disabled:text-muted/50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* 6. New Case Focused Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs anim-overlay"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-pop anim-pop z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="text-[17px] font-semibold text-ink">New Case Workspace</h3>
                <p className="text-[12.5px] text-muted mt-0.5">
                  Initialize an isolated case docket with cryptographic chain of custody.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            <form action={createFormAction} className="space-y-4">
              {/* Case ID — auto-generated, read-only */}
              <div>
                <label className="block text-[12px] font-medium text-ink mb-1">
                  Case ID
                </label>
                <div className="relative">
                  <div className="w-full rounded-lg border border-border bg-surface-2/40 px-3 py-2 font-mono text-[13px] text-ink/70 flex items-center justify-between min-h-[36px]">
                    <span>
                      {previewCaseNumber || (
                        <span className="text-muted/50">Generating…</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {previewCaseNumber && (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(previewCaseNumber)}
                          className="rounded p-0.5 text-muted/50 hover:text-ink transition-colors cursor-pointer"
                          title="Copy case number"
                        >
                          <IconCopy size={12} />
                        </button>
                      )}
                      <IconLock size={13} className="text-muted/50" />
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted/70">
                  System generated · Cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-ink mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Telecom Billing Exfiltration Investigation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-ink/50 focus:bg-surface"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-ink mb-1">
                  Description / Modus Operandi
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Summary of statutory allegations and evidence scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-ink/50 focus:bg-surface resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1">
                    Classification
                  </label>
                  <Select
                    size="md"
                    variant="form"
                    name="classification"
                    value={newClassification}
                    onChange={(v) => setNewClassification(v as Classification)}
                    className="w-full"
                    aria-label="Classification"
                    options={[
                      { value: "confidential", label: "Confidential" },
                      { value: "restricted", label: "Restricted" },
                      { value: "internal", label: "Internal" },
                      { value: "public", label: "Public" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1">
                    Jurisdiction / Agency
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    required
                    value={newJurisdiction}
                    onChange={(e) => setNewJurisdiction(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-ink/50 focus:bg-surface"
                  />
                </div>
              </div>

              {createState?.error && (
                <p className="text-[12.5px] text-red">{createState.error}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPending || !previewCaseNumber}
                  className="rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPending ? "Creating…" : "Create case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
