import { redirect } from "next/navigation";
import { type Role, type Person } from "./data";
import { type PermissionMatrix, ROLE_METADATA, ROLE_PERMISSIONS } from "./roles";
import { getCurrentUser } from "./auth/current-user";

export { ROLE_METADATA, ROLE_PERMISSIONS, type PermissionMatrix };

export interface SessionResult {
  user: Person;
  role: Role;
  permissions: PermissionMatrix;
  canViewAudit: boolean;
  isPlatformAdmin: boolean;
  platformRole: string | null;
  orgId: string;
  userId: string;
}

/**
 * Resolves the authenticated application user from the database and returns
 * the UI-facing session shape. Redirects to /login when unauthenticated.
 * ONLY import in Server Components, Layouts, or Route Handlers that run in
 * the page context.
 */
export async function getSessionUser(): Promise<SessionResult> {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const canViewAudit = session.orgRole === "ADMIN" || session.orgRole === "AUDITOR";
  const isPlatformAdmin = session.platformRole === "PLATFORM_ADMIN";

  return {
    user: session.user as Person,
    role: session.role as Role,
    permissions: session.permissions,
    canViewAudit,
    isPlatformAdmin,
    platformRole: session.platformRole,
    orgId: session.orgId ?? "",
    userId: session.userId,
  };
}