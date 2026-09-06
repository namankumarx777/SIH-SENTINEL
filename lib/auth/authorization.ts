import { cache } from "react";
import { getCurrentUser, AuthError, type SessionUser } from "./current-user";
import { hasOrganizationPermission, hasCasePermission, getCaseMemberRole, type Action } from "../permissions/roles";
import { db } from "../prisma";

export const requireAuthenticatedUser = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Unauthorized: Please log in", 401);
  }
  return user;
});

export const requireOrganizationMembership = cache(async (): Promise<SessionUser> => {
  const user = await requireAuthenticatedUser();
  if (!user.orgId || !user.membershipId) {
    throw new AuthError("Forbidden: Not a member of an organization", 403);
  }
  return user;
});

export const requirePlatformAdmin = cache(async (): Promise<SessionUser> => {
  const user = await requireAuthenticatedUser();
  if (user.platformRole !== "PLATFORM_ADMIN") {
    throw new AuthError("Forbidden: Platform administrator access required", 403);
  }
  return user;
});

export async function requireCaseAccess(caseId: string): Promise<{ user: SessionUser; caseRow: any; caseMember: any }> {
  const user = await requireOrganizationMembership();
  
  const caseRow = await db.orm.public.Case.where({ id: caseId }).first();
  if (!caseRow) {
    throw new AuthError("Not found", 404);
  }
  if (caseRow.organizationId !== user.orgId) {
    throw new AuthError("Forbidden: Case belongs to another organization", 403);
  }

  const caseMember = await db.orm.public.CaseMember.where({
    caseId,
    userId: user.userId,
  }).first();

  if (!caseMember) {
    throw new AuthError("Forbidden: Not a member of this case", 403);
  }

  return { user, caseRow, caseMember };
}

export async function requireDocumentAccess(documentId: string): Promise<{ user: SessionUser; documentRow: any; caseRow: any; caseMember: any | null }> {
  const user = await requireOrganizationMembership();

  const documentRow = await db.orm.public.Document.where({ id: documentId }).first();
  if (!documentRow) {
    throw new AuthError("Document not found", 404);
  }

  // Check if they are a CaseMember first
  try {
    const { caseRow, caseMember } = await requireCaseAccess(String(documentRow.caseId));
    return { user, documentRow, caseRow, caseMember };
  } catch (e) {
    // If not a CaseMember, check for a valid Share
    const now = new Date();
    // Assuming Share recipient matches user.email
    const shares = await db.orm.public.Share.where({ 
      documentId 
    }).all();
    
    const validShare = shares.find(s => 
      s.recipient === user.email && 
      new Date(String(s.expiration)) > now &&
      !s.revokedAt
    );

    if (!validShare) {
      throw new AuthError("Forbidden: Not a member of this case, and no valid share exists.", 403);
    }
    
    // They have a valid share! Fetch the case row for the return object
    const caseRow = await db.orm.public.Case.where({ id: String(documentRow.caseId) }).first();
    return { user, documentRow, caseRow, caseMember: null };
  }
}

/**
 * Checks if the user has a specific permission globally (org-wide).
 */
export async function requireOrganizationPermission(action: Action): Promise<SessionUser> {
  const user = await requireOrganizationMembership();
  if (!user.orgRole || !hasOrganizationPermission(user.orgRole, action)) {
    throw new AuthError(`Forbidden: Missing organization permission: ${action}`, 403);
  }
  return user;
}

/**
 * Checks if the user has a specific permission on a specific case.
 * It checks the case role first, and falls back to organization role.
 */
export async function requireCasePermission(caseId: string, action: Action): Promise<{ user: SessionUser; caseRow: any; caseMember: any }> {
  const { user, caseRow, caseMember } = await requireCaseAccess(caseId);

  const caseRole = getCaseMemberRole(caseMember.isLead, user.orgRole);
  
  // They either need the permission at the case level or the org level.
  const hasCasePerm = hasCasePermission(caseRole, action);
  const hasOrgPerm = user.orgRole ? hasOrganizationPermission(user.orgRole, action) : false;

  if (!hasCasePerm && !hasOrgPerm) {
    throw new AuthError(`Forbidden: Missing case permission: ${action}`, 403);
  }

  return { user, caseRow, caseMember };
}
