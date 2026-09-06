import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import { OrganizationDetailClient } from "./_components/organization-detail-client";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const session = await requirePlatformAdmin();
  const { id } = await params;

  const org = await (db.orm.public.Organization.where({ id }) as any)
    .select("id", "name", "createdAt")
    .first();

  if (!org) {
    notFound();
  }

  // Fetch all members of this organization
  const memberRows = await db.orm.public.OrganizationMember.where({
    organizationId: org.id,
  })
    .orderBy((m: any) => m.createdAt.asc())
    .all();

  const membersWithUser = await Promise.all(
    memberRows.map(async (m: any) => {
      const user = await (db.orm.public.User.where({ id: m.userId }) as any)
        .select("id", "email", "name")
        .first();

      return {
        id: String(m.id),
        userId: String(m.userId),
        name: String(user?.name ?? "Unknown"),
        email: String(user?.email ?? "—"),
        role: String(m.role),
        department: String(m.department ?? "Operations"),
        badge: String(m.badge ?? "—"),
        initials: String(m.initials ?? user?.name?.slice(0, 2) ?? "—"),
        createdAt: String(m.createdAt),
      };
    })
  );

  // Aggregate count only — Platform Admin does not have case-level access.
  // Uses Prisma 8 .aggregate() terminal to get real DB count.
  const caseCountRes = await db.orm.public.Case.where({ organizationId: org.id }).aggregate((agg: any) => ({
    count: agg.count(),
  }));
  const caseCount = Number(caseCountRes?.count ?? 0);

  return (
    <OrganizationDetailClient
      organization={{
        id: String(org.id),
        name: String(org.name),
        status: "ACTIVE",
        createdAt: String(org.createdAt),
      }}
      members={membersWithUser}
      caseCount={caseCount}
      platformAdminEmail={session.email}
    />
  );
}
