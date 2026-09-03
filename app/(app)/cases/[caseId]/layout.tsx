import { notFound } from "next/navigation";
import { cases, findCase } from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { UploadDialog } from "@/app/_components/upload-dialog";
import {
  IconActivity,
  IconFile,
  IconShare,
  IconShieldCheck,
  IconUpload,
  IconUsers,
} from "@/app/_components/icons";
import { Tabs } from "@/app/_components/tabs";
import { CaseActions } from "./_components/case-actions";
import { CaseShareButton } from "./_components/case-share";

export async function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

export default async function CaseLayout({
  children,
  params,
}: LayoutProps<"/cases/[caseId]">) {
  const { caseId } = await params;
  const caseRecord = findCase(caseId);
  if (!caseRecord) notFound();

  const basePath = `/cases/${caseId}`;
  const tabs = [
    { id: "overview", label: "Overview", href: basePath, icon: <IconShieldCheck size={13} /> },
    {
      id: "documents",
      label: "Documents",
      href: `${basePath}/documents`,
      icon: <IconFile size={13} />,
      count: caseRecord.documents,
    },
    {
      id: "people",
      label: "People",
      href: `${basePath}/people`,
      icon: <IconUsers size={13} />,
      count: caseRecord.collaborators.length + 1,
    },
    {
      id: "activity",
      label: "Activity",
      href: `${basePath}/activity`,
      icon: <IconActivity size={13} />,
    },
    {
      id: "sharing",
      label: "Sharing",
      href: `${basePath}/sharing`,
      icon: <IconShare size={13} />,
    },
  ];

  return (
    <div className="anim-fade">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <Badge
          tone={caseRecord.status === "active" ? "verified" : caseRecord.status === "under_review" ? "pending" : "muted"}
          subtle
        >
          {caseRecord.status.replace("_", " ")}
        </Badge>
        <span className="text-[12.5px] text-muted">
          {caseRecord.classification} · {caseRecord.jurisdiction}
        </span>
      </div>

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="t-display text-ink">{caseRecord.title}</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
            {caseRecord.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
            <div className="flex items-center gap-2.5">
              <Avatar person={caseRecord.collaborators[0] ? { name: "Inspector Raj Sharma", initials: "RS" } : undefined} size={26} />
              <div className="leading-tight">
                <div className="text-[11.5px] text-muted">Lead investigator</div>
                <div className="text-[13px] font-medium text-ink">Inspector Raj Sharma</div>
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-[11.5px] text-muted">Created</div>
              <div className="text-[13px] font-medium text-ink">
                {new Date(caseRecord.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-[11.5px] text-muted">Collaborators</div>
              <div className="text-[13px] font-medium text-ink">{caseRecord.collaborators.length + 1}</div>
            </div>
            <div className="leading-tight">
              <div className="text-[11.5px] text-muted">Documents</div>
              <div className="text-[13px] font-medium text-ink">{caseRecord.documents}</div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <UploadDialog
            trigger={
              <Button variant="secondary" iconLeft={<IconUpload size={13} />}>
                Upload
              </Button>
            }
          />
          <CaseShareButton caseId={caseRecord.id} />
          <CaseActions caseId={caseRecord.id} />
        </div>
      </div>

      <div className="mt-8">
        <Tabs basePath={basePath} tabs={tabs} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
