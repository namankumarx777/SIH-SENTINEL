import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import { recordAudit } from "@/lib/repos/audit";
import { apiSuccess, handleApiError, validationError } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePlatformAdmin();
    const { id: orgId } = await params;
    const body = await request.json();
    const { email, name } = body;

    const errors: Record<string, string[]> = {};
    if (!email || typeof email !== "string" || email.trim().length === 0 || !email.includes("@")) {
      errors.email = ["Valid admin email is required"];
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.name = ["Admin name is required"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const org = await db.orm.public.Organization.where({ id: orgId }).first();
    if (!org) {
      return validationError({ organization: ["Organization not found"] }, "ORG_NOT_FOUND");
    }

    let user = await db.orm.public.User.where({ email: email.trim().toLowerCase() }).first();

    if (!user) {
      const userId = crypto.randomUUID();
      user = await db.orm.public.User.create({
        id: userId,
        authId: `pending-${crypto.randomUUID()}`,
        email: email.trim().toLowerCase(),
        name: name.trim(),
      });
    }

    const existingMember = await db.orm.public.OrganizationMember.where({
      organizationId: orgId,
      userId: user.id,
    }).first();

    if (existingMember) {
      return validationError({ user: ["User is already a member of this organization"] }, "ALREADY_MEMBER");
    }

    await db.orm.public.OrganizationMember.create({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: user.id,
      role: "ADMIN",
      department: "Organization Administration",
      initials: name.trim().split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      badge: `ADM-${Date.now().toString().slice(-5)}`,
    });

    await recordAudit(session, {
      action: "ORGANIZATION_ADMIN_PROVISIONED",
      resource: org.name,
      meta: `Admin: ${email.trim()} (${name.trim()})`,
    });

    return apiSuccess({
      message: `Organization admin provisioned successfully`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
