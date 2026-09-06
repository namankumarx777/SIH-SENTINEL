import { notFound } from "next/navigation";
import { cases, documentsForCase, findCase } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { CaseDocumentsClient } from "./_components/case-documents-client";

export const instant = false;

export async function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDocumentsPage({ params }: PageProps) {
  const { caseId } = await params;
  const c = findCase(caseId);
  if (!c) notFound();

  const docs = documentsForCase(caseId);
  const session = await getSessionUser();

  return (
    <CaseDocumentsClient
      docs={docs}
      caseId={caseId}
      canUpload={session.permissions.canUpload}
      canShare={session.permissions.canShare}
    />
  );
}
