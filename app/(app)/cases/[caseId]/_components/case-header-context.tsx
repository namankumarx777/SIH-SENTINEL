"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CaseRecord } from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { UploadDialog } from "@/app/_components/upload-dialog";
import {
  IconArrowLeft,
  IconFile,
  IconFolder,
  IconShieldCheck,
  IconUpload,
} from "@/app/_components/icons";
import { Tabs } from "@/app/_components/tabs";
import { CaseActions } from "./case-actions";
import { CaseShareButton } from "./case-share";

interface Props {
  caseRecord: CaseRecord;
  session: {
    permissions: {
      canUpload: boolean;
      canShare: boolean;
    };
  };
  basePath: string;
  tabs: {
    id: string;
    label: string;
    href: string;
    icon: ReactNode;
    count?: number;
  }[];
  children: ReactNode;
}

export function CaseHeaderContext({
  caseRecord,
  session,
  basePath,
  tabs,
  children,
}: Props) {
  const pathname = usePathname() || "";
  // Check if viewing an individual document inside the case
  const isDocumentDetail = /\/cases\/[^/]+\/documents\/[^/]+/.test(pathname);

  if (isDocumentDetail) {
    return (
      <div className="anim-fade">
        {/* Sleek, High-Density Docket Reference Bar for Document Inspection */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface px-4 py-2.5 shadow-sm text-[12.5px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`${basePath}/documents`}
              className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-ink transition-colors"
            >
              <IconArrowLeft size={13} />
              <span>Back to Case Documents</span>
            </Link>

            <span className="text-border-strong select-none">|</span>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-muted">
                {caseRecord.number}
              </span>
              <span className="font-medium text-ink truncate max-w-[240px] sm:max-w-md">
                {caseRecord.title}
              </span>
            </div>

            <Badge
              tone={
                caseRecord.status === "active"
                  ? "verified"
                  : caseRecord.status === "under_review"
                  ? "pending"
                  : "muted"
              }
              subtle
            >
              {caseRecord.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-muted">
            <div className="hidden sm:flex items-center gap-1.5">
              <span>Lead:</span>
              <span className="font-medium text-ink">Inspector Raj Sharma</span>
            </div>

            <span className="hidden sm:inline text-border-strong select-none">·</span>

            <Link
              href={basePath}
              className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors"
              title="View full case docket details"
            >
              <IconFolder size={12} />
              <span>Case Docket</span>
            </Link>
          </div>
        </div>

        {/* Child Document View */}
        <div>{children}</div>
      </div>
    );
  }

  // Standard Case Docket View (Overview, Documents list, Integrity, People, etc.)
  return (
    <div className="anim-fade">
      {/* Classification & Metadata pill bar */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Badge
          tone={
            caseRecord.status === "active"
              ? "verified"
              : caseRecord.status === "under_review"
              ? "pending"
              : "muted"
          }
          subtle
        >
          {caseRecord.status.replace("_", " ")}
        </Badge>
        <span className="text-[12.5px] text-muted">
          {caseRecord.classification.toUpperCase()} · {caseRecord.jurisdiction}
        </span>
      </div>

      {/* Case Header - un-crammed, generous Apple spacing */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-muted font-mono text-[13px]">
            <span>{caseRecord.number}</span>
          </div>
          <h1 className="mt-1 text-[30px] font-semibold tracking-tight text-ink">
            {caseRecord.title}
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-muted">
            {caseRecord.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex items-center gap-2">
              <Avatar
                person={{ name: "Inspector Raj Sharma", initials: "RS" }}
                size={22}
              />
              <div className="leading-tight">
                <span className="text-muted">Lead: </span>
                <span className="font-medium text-ink">Inspector Raj Sharma</span>
              </div>
            </div>
            <div className="leading-tight text-muted">
              Created:{" "}
              <span className="font-medium text-ink">
                {new Date(caseRecord.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="leading-tight text-muted">
              Collaborators:{" "}
              <span className="font-medium text-ink">
                {caseRecord.collaborators.length + 1} officers
              </span>
            </div>
          </div>
        </div>

        {/* Primary Actions - RBAC Adaptive */}
        <div className="flex shrink-0 items-center gap-2">
          {session.permissions.canUpload && (
            <UploadDialog
              trigger={
                <Button variant="primary" iconLeft={<IconUpload size={13} />}>
                  Upload Evidence
                </Button>
              }
            />
          )}

          {session.permissions.canShare && (
            <CaseShareButton caseId={caseRecord.id} />
          )}

          <CaseActions caseId={caseRecord.id} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8">
        <Tabs basePath={basePath} tabs={tabs} />
      </div>

      {/* Workspace Body */}
      <div className="mt-8">{children}</div>
    </div>
  );
}
