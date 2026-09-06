import { NextResponse } from "next/server";
import { requireOrganizationPermission } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import { recordAudit } from "@/lib/repos/audit";
import { apiSuccess, apiCreated, handleApiError, validationError } from "@/lib/api-response";

const VALID_ORG_ROLES = ["INVESTIGATOR", "REVIEWER", "FORENSIC", "AUDITOR"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await requireOrganizationPermission("canManageUsers");
    const { orgId } = await params;

    if (session.orgId !== orgId) {
      return apiSuccess({ invitations: [], message: "Access denied" }, "FORBIDDEN" as any);
    }

    const invitations = await db.orm.public.Invitation.where({
      organizationId: orgId,
    }).all();

    const pending = invitations.filter((inv) => !inv.acceptedAt && new Date(inv.expiresAt) > new Date());
    const expired = invitations.filter((inv) => !inv.acceptedAt && new Date(inv.expiresAt) <= new Date());
    const accepted = invitations.filter((inv) => inv.acceptedAt);

    return apiSuccess({
      pending: pending.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      expired: expired.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      accepted: accepted.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        acceptedAt: inv.acceptedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await requireOrganizationPermission("canManageUsers");
    const { orgId } = await params;

    if (session.orgId !== orgId) {
      return handleApiError({ code: "FORBIDDEN", message: "Access denied", status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    const errors: Record<string, string[]> = {};
    if (!email || typeof email !== "string" || email.trim().length === 0 || !email.includes("@")) {
      errors.email = ["Valid email is required"];
    }
    if (!role || !VALID_ORG_ROLES.includes(role)) {
      errors.role = ["Valid organization role is required"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    if (role === "ADMIN") {
      return validationError({ role: ["Cannot invite as admin. Use platform admin console to provision org admins."] });
    }

    const emailLower = email.trim().toLowerCase();
    const existingUser = await db.orm.public.User.where({ email: emailLower }).first();
    if (existingUser) {
      const existingMember = await db.orm.public.OrganizationMember.where({
        organizationId: orgId,
        userId: existingUser.id,
      }).first();
      if (existingMember) {
        return validationError({ email: ["User is already a member of this organization"] });
      }
    }

    const existingPending = await db.orm.public.Invitation.where({
      organizationId: orgId,
      email: emailLower,
    }).all();
    const hasPending = existingPending.some(
      (inv) => !inv.acceptedAt && new Date(inv.expiresAt) > new Date()
    );
    if (hasPending) {
      return validationError({ email: ["An invitation is already pending for this email"] });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await db.orm.public.Invitation.create({
      id: crypto.randomUUID(),
      organizationId: orgId,
      email: emailLower,
      role: role as any,
      token,
      expiresAt: expiresAt.toISOString(),
      createdById: session.userId,
    });

    await recordAudit(session, {
      action: "USER_INVITED",
      resource: emailLower,
      meta: `Role: ${role}, Organization: ${orgId}`,
    });

    return apiCreated({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        token: invitation.token,
        inviteUrl: `/invite/${invitation.token}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
