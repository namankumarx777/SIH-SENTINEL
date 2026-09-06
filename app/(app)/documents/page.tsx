import { listCasesForSession } from "@/lib/repos/cases";
import { getSessionUser } from "@/lib/session";
import { EvidenceLibraryClient } from "./_components/evidence-library-client";
import { db } from "@/lib/prisma";

export default async function DocumentsPage() {
  const session = await getSessionUser();
  const cases = await listCasesForSession();
  const caseIds = cases.map(c => c.id);
  
  // Fetch all documents for all cases the user is a member of
  const documents = await Promise.all(
    caseIds.map(async (caseId) => {
      const docs = await db.orm.public.Document.where({ caseId }).all();
      // Need versions too
      for (const d of docs) {
        const versions = await db.orm.public.DocumentVersion.where({ documentId: String(d.id) }).all();
        (d as any).versions = versions;
      }
      return docs;
    })
  ).then(res => res.flat());

  return (
    <EvidenceLibraryClient
      initialDocuments={documents as any}
      initialCases={cases as any}
      canUpload={session.permissions.canUpload}
    />
  );
}
