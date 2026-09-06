import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import { recordAudit } from "@/lib/repos/audit";
import { apiSuccess, apiCreated, handleApiError, validationError } from "@/lib/api-response";

export async function GET() {
  try {
    await requirePlatformAdmin();

    const organizations = await (db.orm.public.Organization.where({}) as any)
      .select("id", "name", "createdAt")
      .orderBy((row: any) => row.createdAt.desc())
      .all();

    const orgs = await Promise.all(
      organizations.map(async (org: any) => {
        const [membersRes, casesRes] = await Promise.all([
          db.orm.public.OrganizationMember.where({
            organizationId: org.id,
          }).aggregate((agg: any) => ({ c: agg.count() })),
          db.orm.public.Case.where({
            organizationId: org.id,
          }).aggregate((agg: any) => ({ c: agg.count() })),
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

    return apiSuccess({ organizations: orgs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePlatformAdmin();
    const body = await request.json();
    const { name, initialAdminEmail, initialAdminName } = body;

    const errors: Record<string, string[]> = {};
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.name = ["Organization name is required"];
    }
    if (!initialAdminEmail || typeof initialAdminEmail !== "string" || !initialAdminEmail.includes("@")) {
      errors.initialAdminEmail = ["Valid email is required"];
    }
    if (!initialAdminName || typeof initialAdminName !== "string" || initialAdminName.trim().length === 0) {
      errors.initialAdminName = ["Valid name is required"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const existingOrg = await (db.orm.public.Organization.where({ name: name.trim() }) as any)
      .select("id", "name")
      .first();
    if (existingOrg) {
      return validationError({ name: ["An organization with this name already exists"] });
    }

    const orgId = crypto.randomUUID();
    const org = await (db.orm.public.Organization.create as any)({
      id: orgId,
      name: name.trim(),
    });

    await recordAudit(session, {
      action: "ORGANIZATION_CREATED",
      resource: name.trim(),
      meta: `Platform admin: ${session.email}`,
    });

    return apiCreated({
      organization: {
        id: String(org.id),
        name: String(org.name),
        status: "ACTIVE",
        createdAt: String(org.createdAt ?? new Date().toISOString()),
      },
      initialAdminEmail: initialAdminEmail.trim(),
      initialAdminName: initialAdminName.trim(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
