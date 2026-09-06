"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  formatTime,
  type CaseRecord,
  type DocumentRecord,
  type DocumentType,
} from "@/lib/data";
import { UploadDialog } from "@/app/_components/upload-dialog";
import { Select, type SelectOption } from "@/app/_components/select";
import {
  IconAlertOctagon,
  IconBookOpen,
  IconChat,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconFile,
  IconFilter,
  IconFolder,
  IconMore,
  IconSearch,
  IconShieldCheck,
  IconUpload,
  IconX,
} from "@/app/_components/icons";

interface Props {
  initialDocuments: DocumentRecord[];
  initialCases: CaseRecord[];
  canUpload: boolean;
}

type IntegrityFilterTab = "all" | "verified" | "attention";

function getTypeConfig(type: DocumentType) {
  switch (type) {
    case "FIR":
      return {
        label: "FIR",
        badgeBg: "bg-red-bg/80 text-red border-red/25",
        iconBg: "bg-red-bg text-red border-red/25",
        Icon: IconFile,
      };
    case "Statement":
      return {
        label: "Statement",
        badgeBg: "bg-blue-bg/80 text-blue border-blue/25",
        iconBg: "bg-blue-bg text-blue border-blue/25",
        Icon: IconChat,
      };
    case "Forensic":
      return {
        label: "Forensic",
        badgeBg: "bg-green-bg/80 text-green border-green/25",
        iconBg: "bg-green-bg text-green border-green/25",
        Icon: IconShieldCheck,
      };
    case "Legal":
      return {
        label: "Legal",
        badgeBg: "bg-amber-bg/80 text-amber border-amber/25",
        iconBg: "bg-amber-bg text-amber border-amber/25",
        Icon: IconBookOpen,
      };
    case "Evidence":
    default:
      return {
        label: "Evidence",
        badgeBg: "bg-surface-2 text-ink border-border",
        iconBg: "bg-surface-2 text-ink border-border",
        Icon: IconFolder,
      };
  }
}

export function EvidenceLibraryClient({ initialDocuments, initialCases, canUpload }: Props) {
  const [docList, setDocList] = useState<DocumentRecord[]>(initialDocuments);
  const findCase = (id: string) => initialCases.find(c => c.id === id);
  const [searchQuery, setSearchQuery] = useState("");
  const [integrityTab, setIntegrityTab] = useState<IntegrityFilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Quick Detail Drawer State
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  // Copy hash with instant feedback
  const handleCopyHash = (e: React.MouseEvent, hash: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 1600);
  };

  // Filter logic
  const filteredDocuments = useMemo(() => {
    return docList.filter((d) => {
      const currentVersion = d.versions.find((v) => v.current) ?? d.versions[0];
      const c = findCase(d.caseId);

      // Search matching: name, case number/id, type, hash, or uploader
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesCase = (c?.number ?? d.caseId).toLowerCase().includes(q);
        const matchesType = d.type.toLowerCase().includes(q);
        const matchesHash = currentVersion.hash.toLowerCase().includes(q);
        const matchesUploader = (d.uploadedBy ?? "").toLowerCase().includes(q);

        if (!matchesName && !matchesCase && !matchesType && !matchesHash && !matchesUploader) {
          return false;
        }
      }

      // Integrity-first tab
      if (integrityTab === "verified") {
        if (d.integrity !== "verified") return false;
      } else if (integrityTab === "attention") {
        if (d.integrity !== "mismatch" && d.integrity !== "pending") return false;
      }

      // Category / Type filter
      if (categoryFilter !== "all" && d.type !== categoryFilter) {
        return false;
      }

      // Case filter
      if (caseFilter !== "all" && d.caseId !== caseFilter) {
        return false;
      }

      return true;
    });
  }, [docList, searchQuery, integrityTab, categoryFilter, caseFilter]);

  const mismatchCount = docList.filter((d) => d.integrity === "mismatch").length;
  const verifiedCount = docList.filter((d) => d.integrity === "verified").length;
  const pendingCount = docList.filter((d) => d.integrity === "pending").length;

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    integrityTab !== "all" ||
    categoryFilter !== "all" ||
    caseFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setIntegrityTab("all");
    setCategoryFilter("all");
    setCaseFilter("all");
    setPage(0);
  };

  const handleSearchChange = (v: string) => { setSearchQuery(v); setPage(0); };
  const handleIntegrityTab = (v: IntegrityFilterTab) => { setIntegrityTab(v); setPage(0); };
  const handleCategoryFilter = (v: string) => { setCategoryFilter(v); setPage(0); };
  const handleCaseFilter = (v: string) => { setCaseFilter(v); setPage(0); };

  const totalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE);
  const pagedDocuments = filteredDocuments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Editorial, Calm, Evidence-Centric) */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.03em] text-ink leading-tight">
              Evidence Library
            </h1>
            <p className="text-[14.5px] text-muted max-w-2xl font-normal leading-normal">
              Global cross-case digital evidence catalog. All artifacts are cryptographically hashed and anchored.
            </p>
          </div>

          {/* Primary Action: Upload Evidence */}
          {canUpload && (
            <div className="pt-1 sm:pt-2 shrink-0">
              <UploadDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
                  >
                    <IconUpload size={14} />
                    <span>Upload Evidence</span>
                  </button>
                }
              />
            </div>
          )}
        </div>

        {/* Operational Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-xl border border-border bg-surface p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11.5px] text-muted">
              <span>Total Artifacts</span>
              <IconFile size={13} className="text-muted/70" />
            </div>
            <div className="text-[20px] font-semibold text-ink tracking-tight font-mono">
              {docList.length}
            </div>
            <div className="text-[11px] text-muted">
              Chain-anchored records
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11.5px] text-muted">
              <span>Verified Integrity</span>
              <IconShieldCheck size={13} className="text-green" />
            </div>
            <div className="text-[20px] font-semibold text-green tracking-tight font-mono">
              {verifiedCount}
            </div>
            <div className="text-[11px] text-green/80 font-medium">
              100% quorum match
            </div>
          </div>

          <div
            onClick={() => setIntegrityTab(mismatchCount > 0 ? "attention" : "all")}
            className={`rounded-xl border p-3 shadow-2xs space-y-1 transition-all cursor-pointer ${mismatchCount > 0
                ? "border-red/30 bg-red-bg/30 hover:bg-red-bg/50 hover:border-red/50"
                : "border-border bg-surface hover:bg-surface-2"
              }`}
            title={mismatchCount > 0 ? "Click to isolate mismatch" : undefined}
          >
            <div className="flex items-center justify-between text-[11.5px]">
              <span className={mismatchCount > 0 ? "text-red font-medium" : "text-muted"}>
                Integrity Flagged
              </span>
              <IconAlertOctagon size={13} className={mismatchCount > 0 ? "text-red animate-pulse" : "text-muted/70"} />
            </div>
            <div className={`text-[20px] font-semibold tracking-tight font-mono ${mismatchCount > 0 ? "text-red" : "text-ink"}`}>
              {mismatchCount}
            </div>
            <div className={`text-[11px] ${mismatchCount > 0 ? "text-red font-medium" : "text-muted"}`}>
              {mismatchCount > 0 ? "Attention required" : "No tampered records"}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11.5px] text-muted">
              <span>Active Dockets</span>
              <IconFolder size={13} className="text-muted/70" />
            </div>
            <div className="text-[20px] font-semibold text-ink tracking-tight font-mono">
              {initialCases.length}
            </div>
            <div className="text-[11px] text-muted">
              Bound forensic cases
            </div>
          </div>
        </div>
      </header>

      {/* 2. Toolbar (Search-First, Fast Integrity Tabs, Secondary Filters) */}
      <div className="space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Dominant Search Input (60-70% width) */}
          <div className="relative flex-1 max-w-xl flex items-center">
            <IconSearch size={14} className="absolute left-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search evidence by name, hash, or case..."
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

          {/* Integrity Tabs + Filter Selects */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Fast Integrity-First Selector */}
            <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleIntegrityTab("all")}
                className={`relative px-4 py-2 text-[12.5px] font-medium transition-colors cursor-pointer ${integrityTab === "all" ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleIntegrityTab("verified")}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer ${integrityTab === "verified"
                    ? "bg-surface-2 text-green shadow-2xs font-semibold"
                    : "text-muted hover:text-ink"
                  }`}
              >
                Verified
              </button>
              <button
                type="button"
                onClick={() => handleIntegrityTab("attention")}
                className={`relative rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer ${integrityTab === "attention"
                    ? "bg-red-bg text-red font-semibold shadow-2xs"
                    : "text-muted hover:text-red"
                  }`}
              >
                Attention
                {mismatchCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-red px-1.5 py-0.2 font-mono text-[9.5px] font-bold text-white">
                    {mismatchCount + pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Category Filter */}
            <Select
              size="sm"
              value={categoryFilter}
              onChange={handleCategoryFilter}
              aria-label="Filter by evidence category"
              align="right"
              className="min-w-[110px]"
              options={[
                { value: "all", label: "Type: All", icon: <IconFilter size={13} /> },
                { value: "FIR", label: "FIR", description: "First Info Report", icon: <IconFile size={13} className="text-red" /> },
                { value: "Statement", label: "Statement", description: "Witness Testimony", icon: <IconChat size={13} className="text-blue" /> },
                { value: "Forensic", label: "Forensic", description: "Lab Analysis", icon: <IconShieldCheck size={13} className="text-green" /> },
                { value: "Legal", label: "Legal", description: "Charge Sheet", icon: <IconBookOpen size={13} className="text-amber" /> },
                { value: "Evidence", label: "Evidence", description: "Physical Log", icon: <IconFolder size={13} className="text-ink" /> },
              ]}
            />

            {/* Case Filter */}
            <Select
              size="sm"
              value={caseFilter}
              onChange={handleCaseFilter}
              aria-label="Filter by case workspace"
              align="right"
              className="min-w-[115px]"
              options={[
                { value: "all", label: "Case: All", icon: <IconFolder size={13} /> },
                ...initialCases.map<SelectOption>((c) => ({
                  value: c.id,
                  label: c.number,
                  description: c.title,
                  icon: <IconFolder size={13} className="text-muted" />,
                })),
              ]}
            />
          </div>
        </div>

        {/* Removable Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted mr-1">
              Active:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Query: &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")} className="hover:text-red">
                  <IconX size={11} />
                </button>
              </span>
            )}

            {integrityTab !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Integrity: {integrityTab}
                <button type="button" onClick={() => setIntegrityTab("all")} className="hover:text-red">
                  <IconX size={11} />
                </button>
              </span>
            )}

            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Type: {categoryFilter}
                <button type="button" onClick={() => setCategoryFilter("all")} className="hover:text-red">
                  <IconX size={11} />
                </button>
              </span>
            )}

            {caseFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink">
                Case: {findCase(caseFilter)?.number ?? caseFilter}
                <button type="button" onClick={() => setCaseFilter("all")} className="hover:text-red">
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

      {/* 3. Document List Container (Subtle Boundary, High-Hierarchy Rows) */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-1">
        {/* Desktop Table Header (Quiet Uppercase) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_130px_110px_110px_130px_110px_70px] items-center gap-4 border-b border-border bg-surface-2/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted/80">
          <div>Document</div>
          <div>Case</div>
          <div>Type</div>
          <div>Status</div>
          <div>Integrity</div>
          <div className="text-right">Modified</div>
          <div />
        </div>

        {/* Document Rows */}
        {filteredDocuments.length === 0 ? (
          /* Empty States */
          <div className="py-16 text-center space-y-2.5">
            <h3 className="text-[15px] font-semibold text-ink">No documents match your search.</h3>
            <p className="text-[13px] text-muted">
              Try another document name, case ID, or hash.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink hover:underline cursor-pointer pt-1"
            >
              <span>Clear search & filters</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pagedDocuments.map((d) => {
              const c = findCase(d.caseId);
              const currentVersion = d.versions.find((v) => v.current) ?? d.versions[0];
              const isMismatch = d.integrity === "mismatch";
              const isPending = d.integrity === "pending";
              const isCopied = copiedHashId === d.id;
              const typeCfg = getTypeConfig(d.type);
              const TypeIcon = typeCfg.Icon;

              return (
                <div
                  key={d.id}
                  className={`group relative block lg:grid lg:grid-cols-[1fr_130px_110px_110px_130px_110px_70px] items-center gap-4 px-5 sm:px-6 py-4 transition-all hover:bg-surface-2/60 cursor-pointer ${isMismatch
                      ? "bg-red-bg/25 border-l-[3px] border-l-red hover:bg-red-bg/35"
                      : "border-l-[3px] border-l-transparent hover:border-l-ink/30"
                    }`}
                >
                  {/* Primary: Document Glyph + Document Name + SHA-256 Digest */}
                  <div className="min-w-0 pr-2 flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs mt-0.5 transition-transform group-hover:scale-105 ${typeCfg.iconBg}`}>
                      <TypeIcon size={16} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/cases/${d.caseId}/documents/${d.id}`}
                        className="truncate text-[15px] font-semibold text-ink group-hover:text-black group-hover:underline block leading-snug tracking-tight"
                      >
                        {d.name}
                      </Link>

                      {/* Technical Digest Metadata with Copy Pill */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] font-mono text-muted">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2/80 px-2 py-0.5 border border-border/70 text-ink/80 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted/60" />
                          <span className="text-muted font-sans font-medium text-[10.5px]">SHA-256</span>
                          <span className="font-mono">{currentVersion.hash.slice(0, 16)}…</span>
                        </span>

                        <span className="text-muted/60">·</span>
                        <span className="text-muted font-medium">{currentVersion.size}</span>

                        <button
                          type="button"
                          onClick={(e) => handleCopyHash(e, currentVersion.hash, d.id)}
                          title="Copy full SHA-256 hash"
                          className="opacity-0 group-hover:opacity-100 transition-all hover:text-ink hover:bg-surface rounded px-1.5 py-0.5 text-[11px] cursor-pointer inline-flex items-center gap-1 text-muted border border-transparent hover:border-border shadow-2xs"
                        >
                          {isCopied ? (
                            <span className="text-green flex items-center gap-1 font-sans font-medium">
                              <IconCheck size={11} /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-sans font-medium">
                              <IconCopy size={11} /> Copy
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Secondary: Case ID Docket Badge */}
                  <div className="mt-2 lg:mt-0">
                    <Link
                      href={`/cases/${d.caseId}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface-2/50 px-2 py-1 font-mono text-[11.5px] font-medium text-ink/80 hover:bg-surface hover:text-ink hover:border-ink/40 transition-all shadow-2xs group/case"
                      title="Open Case Workspace"
                    >
                      <IconFolder size={11} className="text-muted group-hover/case:text-ink" />
                      <span className="truncate">{c?.number ?? d.caseId}</span>
                    </Link>
                  </div>

                  {/* Secondary: Category / Type Badge */}
                  <div className="mt-1 lg:mt-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium border shadow-2xs ${typeCfg.badgeBg}`}>
                      {d.type}
                    </span>
                  </div>

                  {/* Secondary: Workflow Status */}
                  <div className="mt-2 lg:mt-0">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2/80 px-2.5 py-1 text-[12px] font-medium text-ink border border-border/50">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${d.status === "Verified"
                            ? "bg-green"
                            : d.status === "Review"
                              ? "bg-amber"
                              : "bg-muted"
                          }`}
                      />
                      <span>{d.status}</span>
                    </span>
                  </div>

                  {/* Secondary: INTEGRITY (Cryptographic verification state) */}
                  <div className="mt-1 lg:mt-0">
                    {isMismatch ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-bg px-2.5 py-1 text-[11.5px] font-semibold text-red border border-red/30 shadow-2xs animate-pulse">
                        <IconAlertOctagon size={12} className="shrink-0" />
                        <span>Mismatch</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-bg px-2.5 py-1 text-[11.5px] font-medium text-amber border border-amber/30 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-2.5 py-1 text-[11.5px] font-semibold text-green border border-green/25 shadow-2xs">
                        <IconShieldCheck size={12} className="shrink-0" />
                        <span>Anchored</span>
                      </span>
                    )}
                  </div>

                  {/* Tertiary: Modified Timestamp */}
                  <div className="mt-1 lg:mt-0 lg:text-right font-mono text-[12px] text-muted">
                    {formatTime(d.updatedAt)}
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="mt-2 lg:mt-0 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(d)}
                      title="Inspect Cryptographic Provenance"
                      className="h-7 w-7 rounded-lg border border-border/70 bg-surface text-muted opacity-0 group-hover:opacity-100 hover:text-ink hover:bg-surface-2 hover:border-ink/30 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <IconMore size={13} />
                    </button>

                    <Link
                      href={`/cases/${d.caseId}/documents/${d.id}`}
                      title="Open Document"
                      className="h-7 w-7 rounded-lg border border-border/70 bg-surface text-muted opacity-0 group-hover:opacity-100 hover:text-ink hover:bg-surface-2 hover:border-ink/30 transition-all flex items-center justify-center shadow-2xs"
                    >
                      <IconChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination / Record Count Footer */}
      <div className="flex items-center justify-between text-[12px] text-muted pt-2 border-t border-border mt-6">
        <span>
          Showing {Math.min(page * PAGE_SIZE + 1, filteredDocuments.length)}–{Math.min((page + 1) * PAGE_SIZE, filteredDocuments.length)} of {filteredDocuments.length} evidence artifacts
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

      {/* 5. Document Provenance Detail Drawer (Progressive Disclosure) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs anim-overlay"
            onClick={() => setSelectedDoc(null)}
          />

          <div className="relative h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-pop anim-slide z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted">
                      {findCase(selectedDoc.caseId)?.number}
                    </span>
                    <span className="text-muted/40">·</span>
                    <span className="text-[12px] text-muted">{selectedDoc.type}</span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink leading-tight truncate">
                    {selectedDoc.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Status & Integrity Overview */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-2/40 p-3.5">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Workflow Status
                  </div>
                  <div className="mt-1 text-[13.5px] font-medium text-ink flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${selectedDoc.status === "Verified"
                          ? "bg-green"
                          : selectedDoc.status === "Review"
                            ? "bg-amber"
                            : "bg-muted"
                        }`}
                    />
                    <span>{selectedDoc.status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Cryptographic Integrity
                  </div>
                  <div className="mt-1 text-[13.5px] font-medium flex items-center gap-1.5">
                    {selectedDoc.integrity === "mismatch" ? (
                      <span className="text-red flex items-center gap-1">
                        <IconAlertOctagon size={13} /> Mismatch
                      </span>
                    ) : selectedDoc.integrity === "pending" ? (
                      <span className="text-amber flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber" /> Pending
                      </span>
                    ) : (
                      <span className="text-green flex items-center gap-1">
                        <IconShieldCheck size={13} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Metadata */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Document Provenance
                </div>

                <div className="rounded-xl border border-border bg-surface divide-y divide-border text-[12.5px]">
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Case Docket</span>
                    <span className="font-mono text-ink font-medium">
                      {findCase(selectedDoc.caseId)?.number} — {findCase(selectedDoc.caseId)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Classification</span>
                    <span className="capitalize text-ink">{selectedDoc.classification}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Uploaded By</span>
                    <span className="text-ink">{selectedDoc.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Last Modified</span>
                    <span className="font-mono text-muted">{formatTime(selectedDoc.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Details (Progressive Disclosure) */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Anchoring Details
                </div>

                <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 text-[12px] font-mono">
                  <div>
                    <div className="text-muted text-[11px] uppercase">SHA-256 Digest</div>
                    <div className="text-ink break-all select-all mt-0.5">
                      {selectedDoc.versions[0]?.hash}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="text-muted">Digital Signature</span>
                    <span className="text-green font-medium">Valid (RSA-PSS 4096)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">Blockchain Anchor</span>
                    <span className="text-ink font-medium">Block #1492840</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Close
              </button>

              <Link
                href={`/cases/${selectedDoc.caseId}/documents/${selectedDoc.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs"
              >
                <span>Open in workspace</span>
                <IconChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
