import { listAuditForCase, listAuditForOrg } from "@/lib/repos/audit";
import { requireDocumentAccess, requireCaseAccess } from "@/lib/auth/authorization";
import { findCaseForSession, listCasesForSession } from "@/lib/repos/cases";
import { type ReactNode } from "react";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import {
  IconActivity,
  IconFile,
  IconShare,
  IconShieldCheck,
  IconUsers,
} from "@/app/_components/icons";
import { CaseHeaderContext } from "./_components/case-header-context";


interface LayoutProps {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}

export default async function CaseLayout({
  children,
  params,
}: LayoutProps) {
  const { caseId } = await params;
  const session = await getSessionUser();
  const caseRecord = await findCaseForSession(caseId);
  if (!caseRecord) notFound();

  const basePath = `/cases/${caseId}`;

  const tabs = [
    {
      id: "documents",
      label: "Documents",
      href: `${basePath}/documents`,
      icon: <IconFile size={13} />,
      count: caseRecord.documents,
    },
    { id: "overview", label: "Overview", href: basePath, icon: <IconShieldCheck size={13} /> },
    {
      id: "integrity",
      label: "Integrity",
      href: `${basePath}/integrity`,
      icon: <IconShieldCheck size={13} />,
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
    <CaseHeaderContext
      caseRecord={caseRecord}
      session={session}
      basePath={basePath}
      tabs={tabs}
    >
      {children}
    </CaseHeaderContext>
  );
}
