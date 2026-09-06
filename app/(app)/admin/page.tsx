import { getSessionUser } from "@/lib/session";
import { listOrgPeople } from "@/lib/repos/people";
import { AdminControlCenterClient } from "./_components/admin-control-center-client";

export const instant = false;

export default async function AdminPage() {
  const session = await getSessionUser();
  const people = session.orgId ? await listOrgPeople(session.orgId) : [];
  return <AdminControlCenterClient initialPeople={people} />;
}
