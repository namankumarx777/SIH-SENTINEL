"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseRecord, DocumentRecord, Person } from "@/lib/data";
import {
  IconActivity,
  IconAlertOctagon,
  IconArrowLeft,
  IconChevronRight,
  IconCommand,
  IconFile,
  IconFolder,
  IconLock,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconUpload,
  IconUser,
} from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

type PaletteItem =
  | { kind: "action"; title: string; subtitle: string; href: string; icon: React.ReactNode }
  | { kind: "case"; item: CaseRecord }
  | { kind: "doc"; item: DocumentRecord }
  | { kind: "person"; item: Person };

export function CommandPalette({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const casesList: CaseRecord[] = [
    { id: "c-0141", number: "CR-2026-0141", title: "Highway Evidence Collection", description: "Vehicle identification and witness statements", status: "active", classification: "confidential", lead: "u-raj", collaborators: [], documents: 8, createdAt: "2026-08-15T10:00:00Z", updatedAt: "2026-09-01T14:30:00Z", jurisdiction: "Central Bureau" },
    { id: "c-0142", number: "CR-2026-0142", title: "Digital Integrity Review", description: "Blockchain anchored document verification", status: "active", classification: "restricted", lead: "u-arjun", collaborators: [], documents: 12, createdAt: "2026-08-20T09:00:00Z", updatedAt: "2026-09-05T16:45:00Z", jurisdiction: "Cyber Division" },
  ];
  const docsList: DocumentRecord[] = [
    { id: "d-001", caseId: "c-0141", name: "Witness Statement - Singh.pdf", type: "Statement", classification: "confidential", status: "Verified", integrity: "verified", versions: [], createdAt: "2026-08-16T11:00:00Z", updatedAt: "2026-08-16T11:00:00Z", uploadedBy: "u-raj", description: "Witness statement regarding vehicle DL-14", tags: ["witness", "vehicle"], pages: 3 },
    { id: "d-002", caseId: "c-0142", name: "Witness Statement.pdf", type: "Statement", classification: "restricted", status: "Review", integrity: "mismatch", versions: [], createdAt: "2026-08-21T10:00:00Z", updatedAt: "2026-09-02T09:15:00Z", uploadedBy: "u-anita", description: "Statement mentioning altered registration DL-14-CC-1102", tags: ["evidence", "vehicle", "tamper"], pages: 5 },
    { id: "d-003", caseId: "c-0141", name: "Vehicle Registration.pdf", type: "Evidence", classification: "confidential", status: "Verified", integrity: "verified", versions: [], createdAt: "2026-08-17T14:00:00Z", updatedAt: "2026-08-17T14:00:00Z", uploadedBy: "u-vikram", description: "Vehicle registration extract", tags: ["vehicle", "registration"], pages: 2 },
    { id: "d-004", caseId: "c-0142", name: "Chain of Custody.pdf", type: "Forensic", classification: "restricted", status: "Verified", integrity: "pending", versions: [], createdAt: "2026-08-22T08:00:00Z", updatedAt: "2026-08-25T12:00:00Z", uploadedBy: "u-vikram", description: "Digital chain of custody log", tags: ["forensic", "chain-of-custody"], pages: 8 },
  ];
  const peopleList: Person[] = [
    { id: "u-raj", name: "Rajesh Kumar", role: "investigator", department: "Investigations", initials: "RK", badge: "INV-2019-044" },
    { id: "u-anita", name: "Anita Sharma", role: "reviewer", department: "Legal", initials: "AS", badge: "REV-2020-012" },
    { id: "u-vikram", name: "Vikram Singh", role: "forensic", department: "Forensics", initials: "VS", badge: "FOR-2018-007" },
    { id: "u-neha", name: "Neha Gupta", role: "auditor", department: "Compliance", initials: "NG", badge: "AUD-2021-033" },
  ];

  useEffect(() => {
    if (open) {
      setQ("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const quickActions: PaletteItem[] = [
    {
      kind: "action",
      title: "View Critical Integrity Mismatch",
      subtitle: "Investigate Witness Statement.pdf flag on CR-2026-0142",
      href: "/cases/c-0142/documents/d-002",
      icon: <IconAlertOctagon size={14} className="text-red" />,
    },
    {
      kind: "action",
      title: "Case CR-2026-0142 Integrity Manifest",
      subtitle: "Inspect Merkle tree & blockchain anchor block #1493412",
      href: "/cases/c-0142/integrity",
      icon: <IconShieldCheck size={14} className="text-green" />,
    },
    {
      kind: "action",
      title: "Open Full Immutable Audit Timeline",
      subtitle: "Filterable narrative history across all cases",
      href: "/audit",
      icon: <IconActivity size={14} className="text-muted" />,
    },
    {
      kind: "action",
      title: "Review Time-Bound External Shares",
      subtitle: "Manage 4 active court & lab share authorizations",
      href: "/shared",
      icon: <IconLock size={14} className="text-muted" />,
    },
  ];

  const filteredItems = useMemo<PaletteItem[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return quickActions;

    // Special semantic queries
    if (term.includes("vehicle") || term.includes("dl-14") || term.includes("car")) {
      const matchDocs = docsList.filter((d) => d.id === "d-002" || d.caseId === "c-0141");
      const matchCase = casesList.filter((c) => c.id === "c-0141");
      return [
        {
          kind: "action",
          title: "Semantic Match: Vehicle DL-14 / Evidence Excerpt",
          subtitle: "Witness Statement.pdf mentions altered registration DL-14-CC-1102",
          href: "/cases/c-0142/documents/d-002",
          icon: <IconSparkles size={14} className="text-amber" />,
        },
        ...matchDocs.map((d) => ({ kind: "doc" as const, item: d })),
        ...matchCase.map((c) => ({ kind: "case" as const, item: c })),
      ];
    }

    if (term.includes("mismatch") || term.includes("tamper") || term.includes("fail")) {
      const tampered = docsList.filter((d) => d.integrity === "mismatch");
      return [
        {
          kind: "action",
          title: "Integrity Discrepancy Analysis",
          subtitle: "Current file differs from blockchain anchor",
          href: "/cases/c-0142/documents/d-002",
          icon: <IconAlertOctagon size={14} className="text-red" />,
        },
        ...tampered.map((d) => ({ kind: "doc" as const, item: d })),
      ];
    }

    if (term.includes("review") || term.includes("pending")) {
      const pending = docsList.filter((d) => d.status === "Review" || d.integrity === "pending");
      return pending.map((d) => ({ kind: "doc" as const, item: d }));
    }

    // Standard multi-entity search
    const cs: PaletteItem[] = casesList
      .filter(
        (c) =>
          c.number.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          c.jurisdiction.toLowerCase().includes(term)
      )
      .map((c) => ({ kind: "case", item: c }));

    const ds: PaletteItem[] = docsList
      .filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.type.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term) ||
          d.tags.some((t) => t.toLowerCase().includes(term))
      )
      .map((d) => ({ kind: "doc", item: d }));

    const ps: PaletteItem[] = peopleList
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.department.toLowerCase().includes(term) ||
          p.badge.toLowerCase().includes(term)
      )
      .map((p) => ({ kind: "person", item: p }));

    return [...cs, ...ds, ...ps].slice(0, 10);
  }, [q]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (!selected) return;

      onClose();
      if (selected.kind === "action") {
        router.push(selected.href);
      } else if (selected.kind === "case") {
        router.push(`/cases/${selected.item.id}`);
      } else if (selected.kind === "doc") {
        router.push(`/cases/${selected.item.caseId}/documents/${selected.item.id}`);
      } else if (selected.kind === "person") {
        router.push(`/admin`);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 anim-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[4px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        className="relative w-full max-w-[620px] overflow-hidden rounded-2xl border border-border bg-surface shadow-pop anim-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Spotlight Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <IconSearch size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            id="cmd-palette-input"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={filteredItems.length > 0}
            aria-controls="cmd-palette-listbox"
            aria-activedescendant={filteredItems.length > 0 ? `cmd-item-${selectedIndex}` : undefined}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, evidence, people, or ask Spotlight…"
            className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted/60 text-ink"
          />
          <span className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ESC
          </span>
        </div>

        {/* Search Results / Suggestions */}
        <div id="cmd-palette-listbox" role="listbox" aria-label="Search results" className="max-h-[380px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-muted">
              No evidence or records found matching “{q}”.
            </div>
          ) : (
            <div className="space-y-1">
              {!q && (
                <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Suggested Actions
                </div>
              )}

              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                if (item.kind === "action") {
                  return (
                    <Link
                      key={item.title}
                      id={`cmd-item-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isSelected ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-medium text-ink leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11.5px] text-muted leading-tight mt-0.5 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <IconChevronRight size={13} className="text-muted/60" />
                    </Link>
                  );
                }

                if (item.kind === "case") {
                  return (
                    <Link
                      key={item.item.id}
                      href={`/cases/${item.item.id}`}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isSelected ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2"
                      }`}
                    >
                      <IconFolder size={16} className="text-muted shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11.5px] text-muted">{item.item.number}</span>
                          <span className="text-[13.5px] font-medium text-ink truncate">{item.item.title}</span>
                        </div>
                        <div className="text-[11.5px] text-muted leading-tight mt-0.5 truncate">
                          {item.item.jurisdiction} · {item.item.documents} documents
                        </div>
                      </div>
                      <IconChevronRight size={13} className="text-muted/60" />
                    </Link>
                  );
                }

                if (item.kind === "doc") {
                  return (
                    <Link
                      key={item.item.id}
                      href={`/cases/${item.item.caseId}/documents/${item.item.id}`}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isSelected ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2"
                      }`}
                    >
                      <IconFile size={16} className="text-muted shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-medium text-ink leading-tight truncate">
                          {item.item.name}
                        </div>
                        <div className="text-[11.5px] text-muted leading-tight mt-0.5 truncate">
                          {item.item.type} · Case {item.item.caseId.toUpperCase()} · {item.item.integrity}
                        </div>
                      </div>
                      <IconChevronRight size={13} className="text-muted/60" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.item.id}
                    href="/admin"
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isSelected ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2"
                    }`}
                  >
                    <IconUser size={16} className="text-muted shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium text-ink leading-tight truncate">
                        {item.item.name}
                      </div>
                      <div className="text-[11.5px] text-muted leading-tight mt-0.5">
                        {item.item.department} · {item.item.badge}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2/60 px-4 py-2.5 text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="font-mono">SecureCase Spotlight</span>
        </div>
      </div>
    </div>
  );
}
