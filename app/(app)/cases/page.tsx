import { cases } from "@/lib/data";
import { CasesWorkspaceClient } from "./_components/cases-workspace-client";

export const instant = false;

export default function CasesPage() {
  const sorted = [...cases].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return <CasesWorkspaceClient initialCases={sorted} />;
}
