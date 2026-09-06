import { listAuditForCase, listAuditForOrg } from "@/lib/repos/audit";
import { requireDocumentAccess, requireCaseAccess } from "@/lib/auth/authorization";
import { findCaseForSession, listCasesForSession } from "@/lib/repos/cases";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { CaseDocumentsClient } from "./_components/case-documents-client";
import { db } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDocumentsPage({ params }: PageProps) {
  const { caseId } = await params;
  const session = await getSessionUser();
  const c = await findCaseForSession(caseId);
  if (!c) notFound();

  const documents = await db.orm.public.Document.where({ caseId }).all();
  for (const d of documents) {
    const versions = await db.orm.public.DocumentVersion.where({ documentId: String(d.id) }).all();
    (d as any).versions = versions;
  }

  return (
    <CaseDocumentsClient
      docs={documents as any}
      caseId={caseId}
      canUpload={session.permissions.canUpload}
      canShare={session.permissions.canShare}
    />
  );
}
