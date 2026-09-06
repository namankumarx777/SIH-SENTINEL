import { getSessionUser } from "@/lib/session";
import { listCasesForSession } from "@/lib/repos/cases";
import { CasesWorkspaceClient } from "./_components/cases-workspace-client";
import { listOrgPeople } from "@/lib/repos/people";

export default async function CasesPage() {
  const session = await getSessionUser();
  const activeCases = await listCasesForSession();
  const sorted = [...activeCases].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const people = await listOrgPeople(session.orgId);

  return <CasesWorkspaceClient initialCases={sorted} initialPeople={people} />;
}
