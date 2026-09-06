"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatTime, type DocumentRecord, type DocumentType } from "@/lib/data";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { Menu } from "@/app/_components/menu";
import { Select } from "@/app/_components/select";
import { UploadDialog } from "@/app/_components/upload-dialog";
import { ShareDialog } from "../../_components/share-dialog";
import {
  IconAlertOctagon,
  IconDownload,
  IconFile,
  IconFilter,
  IconHistory,
  IconMore,
  IconSearch,
  IconShare,
  IconShieldCheck,
  IconUpload,
} from "@/app/_components/icons";

interface Props {
  docs: DocumentRecord[];
  caseId: string;
  canUpload: boolean;
  canShare: boolean;
}

export function CaseDocumentsClient({ docs, caseId, canUpload, canShare }: Props) {
  const [q, setQ] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedIntegrity, setSelectedIntegrity] = useState<string>("all");

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (selectedType !== "all" && d.type !== selectedType) return false;
      if (selectedIntegrity !== "all" && d.integrity !== selectedIntegrity) return false;
      if (q.trim()) {
        const query = q.toLowerCase();
        const match =
          d.name.toLowerCase().includes(query) ||
          d.type.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.tags.some((t) => t.toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }, [docs, selectedType, selectedIntegrity, q]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <IconSearch size={14} className="absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search case documents, tags, types…"
              className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] outline-none placeholder:text-muted/60 text-ink"
            />
          </div>

          <Select
            size="sm"
            value={selectedType}
            onChange={setSelectedType}
            aria-label="Filter by document type"
            options={[
              { value: "all", label: "All Types" },
              { value: "FIR", label: "FIR" },
              { value: "Statement", label: "Statement" },
              { value: "Forensic", label: "Forensic" },
              { value: "Legal", label: "Legal" },
              { value: "Evidence", label: "Evidence" },
            ]}
          />

          <Select
            size="sm"
            value={selectedIntegrity}
            onChange={setSelectedIntegrity}
            aria-label="Filter by integrity state"
            options={[
              { value: "all", label: "All States" },
              { value: "verified", label: "Verified Only" },
              { value: "mismatch", label: "Mismatches" },
              { value: "pending", label: "Pending" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          {canUpload && (
            <UploadDialog
              defaultCaseId={caseId}
              trigger={
                <Button variant="primary" size="sm" iconLeft={<IconUpload size={13} />}>
                  Upload Evidence
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Refined Table-Like Row System (No-Card Rule) */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[36px_1fr_120px_100px_120px_120px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          <div />
          <div>Document Name & Digest</div>
          <div>Category</div>
          <div>Version</div>
          <div>Integrity</div>
          <div>Modified</div>
          <div />
        </div>

        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-muted">
            No evidence documents match the filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDocs.map((d) => {
              const currentVersion = d.versions.find((v) => v.current) ?? d.versions[0];
              const isMismatch = d.integrity === "mismatch";

              return (
                <div
                  key={d.id}
                  className={`group grid grid-cols-[36px_1fr_120px_100px_120px_120px_40px] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2 ${
                    isMismatch ? "bg-red-bg/20" : ""
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-muted">
                    <IconFile size={14} />
                  </span>

                  <div className="min-w-0">
                    <Link
                      href={`/cases/${caseId}/documents/${d.id}`}
                      className="truncate text-[13.5px] font-medium text-ink hover:underline block"
                    >
                      {d.name}
                    </Link>
                    <div className="truncate font-mono text-[11px] text-muted mt-0.5">
                      SHA256: {currentVersion.hash.slice(0, 16)}… · {currentVersion.size}
                    </div>
                  </div>

                  <div className="text-[12.5px] text-muted">{d.type}</div>

                  <div className="font-mono text-[12.5px] text-ink font-medium">
                    {currentVersion.version}
                  </div>

                  <div>
                    {isMismatch ? (
                      <Badge tone="danger" subtle icon={<IconAlertOctagon size={11} />}>
                        mismatch
                      </Badge>
                    ) : d.integrity === "verified" ? (
                      <Badge tone="verified" subtle icon={<IconShieldCheck size={11} />}>
                        verified
                      </Badge>
                    ) : (
                      <Badge tone="pending" subtle>
                        pending
                      </Badge>
                    )}
                  </div>

                  <div className="text-[12px] text-muted font-mono">
                    {formatTime(d.updatedAt)}
                  </div>

                  {/* Contextual Action Menu */}
                  <div className="opacity-80 group-hover:opacity-100 flex justify-end">
                    <Menu
                      trigger={
                        <button
                          type="button"
                          className="rounded p-1 text-muted hover:bg-surface-3 hover:text-ink transition-colors"
                          aria-label="Contextual Actions"
                        >
                          <IconMore size={15} />
                        </button>
                      }
                      items={[
                        {
                          id: "inspect",
                          label: "Open in Viewer",
                          icon: <IconFile size={13} />,
                          onClick: () => {
                            window.location.href = `/cases/${caseId}/documents/${d.id}`;
                          },
                        },
                        {
                          id: "proof",
                          label: "Cryptographic Proof",
                          icon: <IconShieldCheck size={13} />,
                          onClick: () => {
                            window.location.href = `/cases/${caseId}/documents/${d.id}`;
                          },
                        },
                        {
                          id: "history",
                          label: "Version Timeline",
                          icon: <IconHistory size={13} />,
                          onClick: () => {
                            window.location.href = `/cases/${caseId}/documents/${d.id}`;
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
