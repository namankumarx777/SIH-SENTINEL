import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import { PlatformOrganizationsClient } from "./_components/platform-organizations-client";

export const instant = false;

export default async function PlatformOrganizationsPage() {
  const session = await requirePlatformAdmin();

  const organizations = await (db.orm.public.Organization.where({}) as any)
    .select("id", "name", "createdAt")
    .orderBy((row: any) => row.createdAt.desc())
    .all();

  const orgsWithCounts = await Promise.all(
    organizations.map(async (org: any) => {
      const [membersRes, casesRes] = await Promise.all([
        db.orm.public.OrganizationMember.where({ organizationId: org.id }).aggregate((agg: any) => ({ c: agg.count() })),
        db.orm.public.Case.where({ organizationId: org.id }).aggregate((agg: any) => ({ c: agg.count() })),
      ]);
      return {
        id: String(org.id),
        name: String(org.name),
        status: "ACTIVE",
        createdAt: String(org.createdAt),
        memberCount: Number(membersRes?.c ?? 0),
        caseCount: Number(casesRes?.c ?? 0),
      };
    })
  );

  return (
    <PlatformOrganizationsClient
      organizations={orgsWithCounts}
      platformAdminEmail={session.email}
    />
  );
}
