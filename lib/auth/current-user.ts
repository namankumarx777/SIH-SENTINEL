import { cache } from "react";
import { db } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dbRoleToUiRole } from "@/lib/constants/roles";
import { type PermissionMatrix, ROLE_PERMISSIONS } from "@/lib/roles";
import type { Role } from "@/lib/data";

export type AuthProvider = "supabase";

export interface AuthIdentity {
  provider: AuthProvider;
  authId: string;
}

export interface OrganizationMembership {
  orgId: string | null;
  orgRole: string | null;
  membershipId: string | null;
  department: string | null;
  initials: string | null;
  badge: string | null;
}

export interface AuthorizationContext {
  userId: string;
  authId: string;
  email: string;
  orgId: string | null;
  orgRole: string | null;
  membershipId: string | null;
  platformRole: string | null;
  role: Role;
  permissions: PermissionMatrix;
}

export interface SessionUser {
  provider: AuthProvider;
  userId: string;
  authId: string;
  email: string;
  name: string;
  orgId: string | null;
  orgRole: string | null;
  membershipId: string | null;
  department: string | null;
  initials: string | null;
  badge: string | null;
  platformRole: string | null;
  role: Role;
  permissions: PermissionMatrix;
  user: {
    id: string;
    name: string;
    role: Role;
    department: string;
    initials: string;
    badge: string;
  };
}

export async function resolveAuthIdentity(): Promise<AuthIdentity | null> {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return { provider: "supabase", authId: user.id };
    }
  } catch {
    // fallback to getSession
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return { provider: "supabase", authId: session.user.id };
    }
  } catch {
    // no session
  }

  return null;
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const identity = await resolveAuthIdentity();
  if (!identity) return null;

  const appUser = await (db.orm.public.User.where({ authId: identity.authId }) as any)
    .select("id", "authId", "email", "name", "platformRole")
    .first();
  if (!appUser) return null;

  const platformRole = (appUser.platformRole as string | null) ?? null;

  const membership =
    (await db.orm.public.OrganizationMember.where({ userId: appUser.id })
      .orderBy((m) => m.createdAt.asc())
      .first()) ?? null;

  const orgRole = membership?.role as string | undefined;
  const uiRole: Role = orgRole ? dbRoleToUiRole(orgRole) : "external";
  
  const permissionsMatrix: PermissionMatrix = ROLE_PERMISSIONS[uiRole];

  const user = {
    id: appUser.id,
    name: appUser.name,
    role: uiRole,
    department: membership?.department ?? "",
    initials: membership?.initials ?? "",
    badge: membership?.badge ?? "",
  };

  return {
    provider: identity.provider,
    userId: appUser.id,
    authId: appUser.authId,
    email: appUser.email,
    name: appUser.name,
    orgId: membership?.organizationId ?? null,
    orgRole: orgRole ?? null,
    membershipId: membership?.id ?? null,
    department: membership?.department ?? null,
    initials: membership?.initials ?? null,
    badge: membership?.badge ?? null,
    platformRole,
    role: uiRole,
    permissions: permissionsMatrix,
    user,
  };
});

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 403,
  ) {
    super(message);
  }
}