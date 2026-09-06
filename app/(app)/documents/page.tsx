import { documents } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { EvidenceLibraryClient } from "./_components/evidence-library-client";

export const instant = false;

export default async function DocumentsPage() {
  const session = await getSessionUser();

  return (
    <EvidenceLibraryClient
      initialDocuments={documents}
      canUpload={session.permissions.canUpload}
    />
  );
}
