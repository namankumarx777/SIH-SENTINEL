"use client";

import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import type { DocumentRecord, ForensicSection } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import {
  IconAlertOctagon,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconFileText,
  IconLayers,
  IconLock,
  IconMaximize,
  IconMinimize,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconX,
} from "@/app/_components/icons";

interface Props {
  doc: DocumentRecord;
}

export function PdfPreview({ doc }: Props) {
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"single" | "continuous">("single");
  const [watermark, setWatermark] = useState<boolean>(true);
  const [showDiff, setShowDiff] = useState<boolean>(doc.integrity === "mismatch");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalPages = doc.pages ?? 4;
  const isMismatch = doc.integrity === "mismatch";
  const preview = doc.previewData;
  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];

  const handleCopyHash = () => {
    if (currentVersion?.hash) {
      navigator.clipboard.writeText(currentVersion.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Text highlight engine for in-document forensic search
  const highlightText = (text: string): ReactNode => {
    if (!searchTerm.trim()) return text;
    const query = searchTerm.trim();
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="rounded-xs bg-amber-200 px-0.5 font-semibold text-ink shadow-xs"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Calculate search match count
  const searchMatchCount = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    const query = searchTerm.trim().toLowerCase();
    let count = 0;
    const checkString = (str?: string) => {
      if (!str) return;
      let pos = str.toLowerCase().indexOf(query);
      while (pos !== -1) {
        count++;
        pos = str.toLowerCase().indexOf(query, pos + query.length);
      }
    };

    checkString(preview?.summary);
    preview?.sections?.forEach((sec) => {
      checkString(sec.title);
      checkString(sec.content);
      checkString(sec.originalContent);
    });

    return count;
  }, [searchTerm, preview]);

  // Observer to update active page number on continuous scroll
  useEffect(() => {
    if (viewMode !== "continuous" || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(entry.target.getAttribute("data-page-index"));
            if (pageIndex) setCurrentPage(pageIndex);
          }
        });
      },
      { root: containerRef.current, threshold: 0.4 }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [viewMode]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Forensic Document Sheets Content
  const renderPageSheet = (pageNum: number) => {
    const isFirstPage = pageNum === 1;
    const isLastPage = pageNum === totalPages;

    return (
      <div
        key={pageNum}
        ref={(el) => {
          pageRefs.current[pageNum] = el;
        }}
        data-page-index={pageNum}
        className="relative mx-auto w-full max-w-[760px] min-h-[960px] bg-[#fcfcfc] text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.08)] border border-[#d8dce0] p-10 md:p-14 flex flex-col justify-between transition-all select-text"
        style={{
          transform: viewMode === "single" ? `scale(${zoom / 100})` : undefined,
          transformOrigin: "top center",
        }}
      >
        {/* Official Custody Security Watermark */}
        {watermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.05] select-none">
            <div className="rotate-[-35deg] text-center font-mono font-black tracking-widest text-[#000] text-[34px] leading-relaxed">
              RESTRICTED INVESTIGATIVE EVIDENCE<br />
              CENTRAL BUREAU OF INVESTIGATION<br />
              CHAIN OF CUSTODY PRESERVED · SHA-256 ANCHORED
            </div>
          </div>
        )}

        {/* Page Header Area */}
        <div>
          {isFirstPage ? (
            /* First Page Official Dossier Masthead */
            <div className="border-b-2 border-[#1a1a1a] pb-6 text-center">
              <div className="flex justify-between items-start text-left text-[11px] text-muted font-mono">
                <div>
                  <div className="font-semibold text-ink tracking-wider">GOVERNMENT OF INDIA</div>
                  <div className="text-[10.5px]">CENTRAL BUREAU OF INVESTIGATION</div>
                </div>
                <div className="text-right">
                  <div>RECORD REF: <span className="font-semibold text-ink">{preview?.documentNumber ?? doc.name.toUpperCase()}</span></div>
                  <div>SEAL ID: <span className="font-semibold text-ink">{preview?.sealId ?? "CBI-DL-SEAL-8891"}</span></div>
                </div>
              </div>

              {/* Emblem Crest SVG */}
              <div className="mt-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-surface-2 shadow-xs">
                  <IconShieldCheck size={26} className="text-ink opacity-85" />
                </div>
              </div>

              <div className="mt-3 font-serif">
                <div className="text-[11.5px] font-bold uppercase tracking-[0.25em] text-muted">
                  CONFIDENTIAL LEGAL INSTRUMENT
                </div>
                <h1 className="mt-1 text-[24px] font-bold tracking-tight text-ink uppercase">
                  {doc.name.replace(".pdf", "")}
                </h1>
                <div className="mt-0.5 text-[12px] text-muted italic">
                  {preview?.issuingAuthority ?? "Digital Evidence Management Repository"}
                </div>
              </div>

              {/* Key Metadata Table in Document */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px] border-t border-border pt-4 text-muted">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Classification</span>
                  <span className="font-semibold text-ink uppercase">{doc.classification}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Intake Officer</span>
                  <span className="font-semibold text-ink">{preview?.officerInCharge ?? doc.signedBy ?? "Inspector"}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Date of Record</span>
                  <span className="font-semibold text-ink">{preview?.incidentDate ? "21 Aug 2026" : "21 Aug 2026"}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider">Custody State</span>
                  <span className={`font-semibold ${isMismatch ? "text-red" : "text-green"}`}>
                    {isMismatch ? "INTEGRITY MISMATCH" : "VERIFIED AUTHENTIC"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Subsequent Pages Running Top Header */
            <div className="border-b border-border/80 pb-3 mb-6 flex justify-between items-center text-[10.5px] font-mono text-muted">
              <span>{preview?.documentNumber ?? doc.name.toUpperCase()} · CONFIDENTIAL EVIDENCE</span>
              <span>CUSTODY DOSSIER — PAGE {pageNum}</span>
            </div>
          )}

          {/* Tamper Diff Banner inside document */}
          {isMismatch && showDiff && isFirstPage && (
            <div className="mt-6 rounded-lg border border-red/40 bg-red-bg p-4 text-[12.5px]">
              <div className="flex items-center gap-2 font-semibold text-red">
                <IconAlertOctagon size={14} />
                <span>Forensic Tamper Detection Alert</span>
              </div>
              <p className="mt-1 text-ink">
                Cryptographic mismatch detected between file bitstream and blockchain anchor #{preview?.technicalMetadata.blockNumber ?? 1492840}.
                {preview?.technicalMetadata.tamperReason && (
                  <span className="block mt-1 font-medium text-red">{preview.technicalMetadata.tamperReason}</span>
                )}
              </p>
            </div>
          )}

          {/* Page Body Contents */}
          <div className="mt-7 font-serif text-[13.5px] leading-relaxed text-[#1a1a1a] space-y-6">
            {pageNum === 1 && (
              <>
                {/* Summary / Preamble */}
                {preview?.summary && (
                  <div className="rounded border border-border/70 bg-[#f7f8f9] p-4 text-[13px] font-sans leading-relaxed text-[#2c3238]">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted mb-1">
                      Official Intake Abstract
                    </div>
                    <p>{highlightText(preview.summary)}</p>
                  </div>
                )}

                {/* Section I */}
                {preview?.sections?.[0] ? (
                  <SectionBlock
                    section={preview.sections[0]}
                    showDiff={showDiff}
                    highlightText={highlightText}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1">
                      I. Primary Deposition & Origin Record
                    </h3>
                    <p>
                      {highlightText(
                        "This document constitutes official digital evidence registered under primary jurisdiction. All associated bitstream snapshots and metadata signatures have been encapsulated at intake."
                      )}
                    </p>
                  </div>
                )}
              </>
            )}

            {pageNum === 2 && (
              <>
                {/* Section II: Statutory Offences / Flagged Item */}
                {preview?.sections?.[1] ? (
                  <SectionBlock
                    section={preview.sections[1]}
                    showDiff={showDiff}
                    highlightText={highlightText}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1">
                      II. Statutory Citations & Legal Directives
                    </h3>
                    <p>
                      {highlightText(
                        "Investigation proceeds under applicable legal provisions of the Indian Penal Code and Information Technology Act 2000. Certified forensic extractions adhere to statutory chain of custody standards."
                      )}
                    </p>
                  </div>
                )}

                {/* Statutory Reference Box */}
                <div className="mt-6 rounded border border-border/80 bg-white p-4 font-sans text-[12px] space-y-2">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <IconLock size={12} className="text-muted" />
                    <span>Statutory Enforceability Directive (§65B Indian Evidence Act)</span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    Electronic records produced by automated cryptographic intake systems are deemed admissible as primary legal documents upon generation of certificate §65B(4), provided system hash integrity is verified against an immutable quorum ledger.
                  </p>
                </div>
              </>
            )}

            {pageNum === 3 && (
              <>
                {/* Section III: Digital Artifacts Seized */}
                {preview?.sections?.[2] ? (
                  <SectionBlock
                    section={preview.sections[2]}
                    showDiff={showDiff}
                    highlightText={highlightText}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1">
                      III. Digital Artifacts & Evidentiary Forensics
                    </h3>
                    <p>
                      {highlightText(
                        "1. Core Banking Gateway Apache Server access logs (18-20 Aug)\n2. Reverse proxy egress PCAP traces capturing outbound C2 connection to IP 194.165.16.42\n3. Memory snapshot of transaction broker host CB-RTGS-02."
                      )}
                    </p>
                  </div>
                )}

                {/* Evidence Seizure Table */}
                <div className="mt-6 overflow-hidden rounded border border-border font-sans text-[11.5px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#f0f2f4] border-b border-border text-[10.5px] font-semibold text-muted uppercase">
                      <tr>
                        <th className="py-2 px-3">Artifact ID</th>
                        <th className="py-2 px-3">Device / Host</th>
                        <th className="py-2 px-3">Acquisition Type</th>
                        <th className="py-2 px-3">Intake Digest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white text-ink">
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium">ART-901</td>
                        <td className="py-2 px-3">CB-RTGS-02</td>
                        <td className="py-2 px-3">Volatile RAM Dump</td>
                        <td className="py-2 px-3 font-mono text-[10.5px] text-muted">9b41a2...f812</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium">ART-902</td>
                        <td className="py-2 px-3">GW-APACHE-01</td>
                        <td className="py-2 px-3">Access & Error Logs</td>
                        <td className="py-2 px-3 font-mono text-[10.5px] text-muted">c8e103...41d9</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium">ART-903</td>
                        <td className="py-2 px-3">PROXY-FW-04</td>
                        <td className="py-2 px-3">Egress PCAP Packet Stream</td>
                        <td className="py-2 px-3 font-mono text-[10.5px] text-muted">71af99...e281</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {pageNum === 4 && (
              <>
                {/* Section IV: Custody Directive */}
                {preview?.sections?.[3] ? (
                  <SectionBlock
                    section={preview.sections[3]}
                    showDiff={showDiff}
                    highlightText={highlightText}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1">
                      IV. Jurisdictional Directive & Evidence Custody
                    </h3>
                    <p>
                      {highlightText(
                        "Evidence preserved in air-gapped forensic vault en-situ. In accordance with Section 65B of the Indian Evidence Act, hash integrity manifest generated at intake and signed via ECDSA token."
                      )}
                    </p>
                  </div>
                )}

                {/* Official Attestation Declaration */}
                <div className="mt-8 rounded border border-border/80 bg-surface-2/60 p-4 font-sans text-[12px] text-muted leading-relaxed">
                  <div className="font-semibold text-ink text-[12.5px] mb-1">
                    Judicial Attestation & Chain-of-Custody Certification
                  </div>
                  I hereby certify under official oath that the electronic documents and records referenced herein have been acquired and preserved in accordance with forensic guidelines. The cryptographic digest has been sealed into the judicial ledger quorum.
                </div>

                {/* Signatures & Seal Block */}
                <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-8 text-[12px] font-sans">
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Cryptographic Authority Seal
                    </div>
                    <div className="inline-flex items-center gap-2 rounded border border-border bg-white px-3 py-1.5 font-mono text-[11px] text-ink shadow-2xs">
                      <IconLock size={12} className="text-muted" />
                      <span>{preview?.sealId ?? "CBI-DL-SEAL-8891"}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      Anchored Block: <span className="font-mono text-ink font-semibold">#{preview?.technicalMetadata.blockNumber ?? 1492710}</span>
                    </div>
                    <div className="text-[10.5px] text-muted font-mono">
                      Algorithm: SHA-256 / secp256r1
                    </div>
                  </div>

                  <div className="text-right space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Certified & Signed By
                    </div>
                    <div className="font-semibold text-[13px] text-ink">
                      {preview?.officerInCharge ?? "Inspector Raj Sharma"}
                    </div>
                    <div className="text-[11.5px] text-muted">
                      {preview?.badgeNumber ?? "Badge: INSP-44219"}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-green bg-green-bg px-2 py-0.5 rounded border border-green/20">
                      <IconShieldCheck size={11} /> Digitally Signed (ECDSA-P256)
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Micro Footer on every sheet */}
        <div className="mt-12 pt-4 border-t border-dashed border-border/80 flex justify-between items-center text-[10px] text-muted font-mono select-none">
          <span>Page {pageNum} of {totalPages}</span>
          <span className="cursor-pointer hover:text-ink transition-colors" onClick={handleCopyHash} title="Click to copy hash">
            Recorded SHA-256: {doc.versions[0]?.hash.slice(0, 16)}… {copiedHash && "✓"}
          </span>
          <span>SecureCase v2.6 Enclave</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-[#eef0f2] text-ink ${isFullscreen ? "fixed inset-0 z-50 overflow-hidden" : ""}`}>
      {/* Forensic Document Viewer Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:px-4 py-2 text-[12.5px] shadow-2xs overflow-x-auto">
        {/* Left Toolbar Group: Mode & Navigation */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] sm:text-[12px] font-medium transition-all ${
                viewMode === "single"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Single Page Mode"
            >
              <IconFileText size={13} />
              <span className="hidden md:inline">Single</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("continuous")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] sm:text-[12px] font-medium transition-all ${
                viewMode === "continuous"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Continuous Scroll Mode"
            >
              <IconLayers size={13} />
              <span className="hidden md:inline">Continuous</span>
            </button>
          </div>

          <div className="h-4 w-px bg-border" />


          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => {
                const prev = Math.max(1, currentPage - 1);
                setCurrentPage(prev);
                if (viewMode === "continuous" && pageRefs.current[prev]) {
                  pageRefs.current[prev]?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="rounded p-1 hover:bg-surface-2 disabled:opacity-35 transition-colors"
              title="Previous Page"
            >
              <IconChevronLeft size={14} />
            </button>
            <span className="font-mono text-[12px] text-muted select-none">
              Page <span className="font-semibold text-ink">{currentPage}</span> of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setCurrentPage(next);
                if (viewMode === "continuous" && pageRefs.current[next]) {
                  pageRefs.current[next]?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="rounded p-1 hover:bg-surface-2 disabled:opacity-35 transition-colors"
              title="Next Page"
            >
              <IconChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Center Toolbar Group: In-Document Search Highlight */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <IconSearch size={13} className="absolute left-2.5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Find in document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7.5 w-28 sm:w-36 focus:w-44 transition-all duration-150 rounded-md border border-border bg-surface pl-8 pr-7 text-[12px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 text-muted hover:text-ink"
                title="Clear search"
              >
                <IconX size={12} />
              </button>
            )}
          </div>
          {searchTerm.trim() && (
            <span className="font-mono text-[11px] text-muted">
              {searchMatchCount} match{searchMatchCount === 1 ? "" : "es"}
            </span>
          )}
        </div>

        {/* Right Toolbar Group: Zoom, Toggles & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 text-[11.5px] text-muted">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="rounded px-1.5 py-0.5 hover:bg-surface-2 text-ink font-bold transition-colors"
              title="Zoom Out"
            >
              -
            </button>
            <span className="font-mono w-10 text-center text-ink">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              className="rounded px-1.5 py-0.5 hover:bg-surface-2 text-ink font-bold transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="ml-0.5 text-[11px] text-muted hover:text-ink underline transition-colors"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Tamper Diff toggle (if mismatch exists) */}
          {isMismatch && (
            <button
              type="button"
              onClick={() => setShowDiff((s) => !s)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                showDiff
                  ? "bg-red text-white shadow-xs"
                  : "border border-red/40 bg-red-bg text-red hover:bg-red/15"
              }`}
            >
              <IconAlertOctagon size={12} />
              <span className="hidden sm:inline">{showDiff ? "Hide Tamper Diff" : "Tamper Diff"}</span>
            </button>
          )}

          {/* Custody Watermark toggle */}
          <label className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-muted hover:text-ink select-none transition-colors">
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => setWatermark(e.target.checked)}
              className="rounded border-border accent-ink"
            />
            <span className="hidden lg:inline">Watermark</span>
          </label>

          {/* Fullscreen Focus Mode Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Focus Mode"}
          >
            {isFullscreen ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
          </button>
        </div>
      </div>

      {/* Forensic Document Viewport */}
      <div
        ref={containerRef}
        className={`relative overflow-auto p-6 md:p-10 flex justify-center ${
          isFullscreen ? "h-[calc(100vh-45px)] bg-[#1c2024]" : "min-h-[760px] max-h-[920px]"
        }`}
      >
        {viewMode === "single" ? (
          /* Single Page Mode */
          <div className="w-full flex justify-center">{renderPageSheet(currentPage)}</div>
        ) : (
          /* Continuous Scroll Mode */
          <div
            className="w-full flex flex-col items-center space-y-8"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => renderPageSheet(i + 1))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  showDiff,
  highlightText,
}: {
  section: ForensicSection;
  showDiff: boolean;
  highlightText: (text: string) => ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink border-b border-border/80 pb-1">
        {section.title}
      </h3>

      {section.isFlagged && showDiff ? (
        <div className="space-y-3 rounded-lg border border-red/35 bg-red-bg/40 p-4 font-sans text-[12.5px]">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red">
              <IconAlertOctagon size={12} /> Tampered File Content (Current):
            </span>
            <p className="mt-1 text-red font-medium leading-relaxed bg-white/70 p-2.5 rounded border border-red/20">
              {section.content}
            </p>
          </div>

          {section.originalContent && (
            <div className="border-t border-red/20 pt-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-green">
                <IconShieldCheck size={12} /> Recorded Immutable Anchor (Blockchain Block #1492840):
              </span>
              <p className="mt-1 text-green font-medium leading-relaxed bg-white/70 p-2.5 rounded border border-green/20">
                {section.originalContent}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="whitespace-pre-line leading-relaxed">
          {highlightText(section.content)}
        </p>
      )}
    </div>
  );
}
