import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/prisma";
import { apiSuccess, apiCreated, handleApiError, validationError } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in to accept an invitation" } },
        { status: 401 }
      );
    }

    const invitation = await db.orm.public.Invitation.where({ token }).first();

    if (!invitation) {
      return validationError({ token: ["Invitation not found"] }, "INVITATION_NOT_FOUND");
    }

    if (invitation.acceptedAt) {
      return validationError({ token: ["Invitation has already been used"] }, "INVITATION_ALREADY_USED");
    }

    if (new Date(invitation.expiresAt) <= new Date()) {
      return validationError({ token: ["Invitation has expired"] }, "INVITATION_EXPIRED");
    }

    if (session.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "This invitation was sent to a different email address" } },
        { status: 403 }
      );
    }

    const existingMember = await db.orm.public.OrganizationMember.where({
      organizationId: invitation.organizationId,
      userId: session.userId,
    }).first();

    if (existingMember) {
      return validationError({ general: ["You are already a member of this organization"] }, "ALREADY_MEMBER");
    }

    await db.orm.public.OrganizationMember.create({
      id: crypto.randomUUID(),
      organizationId: invitation.organizationId,
      userId: session.userId,
      role: invitation.role,
      department: null,
      initials: session.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      badge: null,
    });

    await db.orm.public.Invitation.where({ id: invitation.id }).update({
      acceptedAt: new Date().toISOString(),
    });

    const org = await db.orm.public.Organization.where({ id: invitation.organizationId }).first();

    return apiSuccess({
      message: `You have joined ${org?.name || "the organization"}`,
      organization: org ? {
        id: org.id,
        name: org.name,
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
