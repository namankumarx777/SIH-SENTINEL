"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cases, documents, people, type CaseRecord, type DocumentRecord } from "@/lib/data";
import { IconArrowLeft, IconCircleCheck, IconFile, IconFolder, IconSearch, IconShieldCheck, IconUser } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Result =
  | { kind: "case"; item: CaseRecord }
  | { kind: "doc"; item: DocumentRecord }
  | { kind: "person"; item: (typeof people)[number] };

export function CommandPalette({ open, onClose }: Props) {
  const [q, setQ] = useState("");

  const reset = () => setQ("");

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    const cs: Result[] = cases
      .filter(
        (c) =>
          !term ||
          c.number.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          c.jurisdiction.toLowerCase().includes(term),
      )
      .map((c) => ({ kind: "case", item: c }));

    const ds: Result[] = documents
      .filter(
        (d) =>
          !term ||
          d.name.toLowerCase().includes(term) ||
          d.type.toLowerCase().includes(term) ||
          d.tags.some((t) => t.toLowerCase().includes(term)),
      )
      .map((d) => ({ kind: "doc", item: d }));

    const ps: Result[] = people
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.department.toLowerCase().includes(term),
      )
      .map((p) => ({ kind: "person", item: p }));

    return [...cs, ...ds, ...ps].slice(0, 12);
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] anim-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-surface shadow-pop anim-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <IconSearch size={15} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cases, documents, people…"
            className="flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-subtle"
          />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <IconArrowLeft size={11} className="rotate-180" />
            ESC
          </span>
        </div>
        <div className="max-h-[420px] overflow-auto py-2">
          {results.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-muted">
              No matches for “{q}”.
            </div>
          ) : (
            results.map((r) => <ResultRow key={`${r.kind}-${r.item.id}`} r={r} onSelect={onClose} />)
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-surface-2 px-4 py-2 text-[11.5px] text-muted">
          <span>Semantic search across cases, documents, and people.</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ r, onSelect }: { r: Result; onSelect: () => void }) {
  const href =
    r.kind === "case"
      ? `/cases/${r.item.id}`
      : r.kind === "doc"
        ? `/cases/${r.item.caseId}/documents/${r.item.id}`
        : `/admin#person-${r.item.id}`;
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
        {r.kind === "case" ? (
          <IconFolder size={14} />
        ) : r.kind === "doc" ? (
          <IconFile size={14} />
        ) : (
          <IconUser size={14} />
        )}
      </span>
      <div className="flex-1">
        <div className="text-[13.5px] font-medium text-ink">
          {r.kind === "case" ? r.item.number : r.kind === "doc" ? r.item.name : r.item.name}
        </div>
        <div className="text-[12px] text-muted">
          {r.kind === "case"
            ? r.item.title
            : r.kind === "doc"
              ? `${r.item.type} · ${r.item.classification}`
              : r.item.department}
        </div>
      </div>
      {r.kind === "doc" ? (
        <span className="inline-flex items-center gap-1 text-[11.5px] text-green">
          <IconShieldCheck size={11} /> {r.item.integrity}
        </span>
      ) : null}
      {r.kind === "case" ? (
        <span className="inline-flex items-center gap-1 text-[11.5px] text-muted">
          <IconCircleCheck size={11} /> {r.item.status.replace("_", " ")}
        </span>
      ) : null}
    </Link>
  );
}
