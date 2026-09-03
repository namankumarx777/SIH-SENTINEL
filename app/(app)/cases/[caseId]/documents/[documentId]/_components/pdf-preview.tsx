import type { DocumentRecord } from "@/lib/data";

export function PdfPreview({ doc }: { doc: DocumentRecord }) {
  return (
    <div className="relative h-[640px] overflow-hidden bg-white">
      <div className="absolute inset-0 mx-auto max-w-[640px] px-12 py-10">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{doc.type}</div>
        <div className="mt-1 text-[18px] font-semibold text-ink">{doc.name.replace(".pdf", "")}</div>
        <div className="mt-1 text-[11px] text-muted">
          Central Bureau · {doc.classification} · Case CR-2026-0142
        </div>

        <div className="mt-7 space-y-3 text-[12px] leading-relaxed text-ink">
          <p>
            This document forms part of an active investigation. All entries are
            authenticated, versioned, and cryptographically anchored at the time of
            recording.
          </p>
          <p>
            Any modification after the recorded version will be detected through the
            integrity verification routine. Modification history is preserved and
            cannot be overwritten.
          </p>
          <p>
            For the purposes of evidence preservation, the document hash recorded at
            the time of intake is the authoritative reference. Current file integrity
            is compared against this record on every access.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] text-muted">
          <Field label="Reference" value={`${doc.name.replace(".pdf", "").toUpperCase()}/2026`} />
          <Field label="Recorded on" value="21 Aug 2026, 09:14 IST" />
          <Field label="Hash algorithm" value="SHA-256" />
          <Field label="Anchor network" value="CB-Private-Ledger" />
        </div>

        <div className="mt-8 rounded border border-dashed border-border p-3 text-[11px] text-muted">
          Excerpt — this is a representation of the document content for preview
          purposes. The source file is stored encrypted and is bound to the recorded
          hash. Inline text is illustrative.
        </div>

        <div className="mt-10 flex items-center justify-between text-[10px] text-subtle">
          <span>Page 1 of {doc.pages ?? 1}</span>
          <span>Recorded hash: {shortHash(doc.versions.find((v) => v.current)?.hash ?? "")}</span>
        </div>
      </div>
    </div>
  );
}

function shortHash(h: string) {
  return `${h.slice(0, 6)}…${h.slice(-3)}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-[11px] text-ink">{value}</div>
    </div>
  );
}
