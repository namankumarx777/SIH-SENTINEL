import { db } from "@/lib/prisma";
import { asIsoString, caseStatusToUi, classificationToUi, dbRoleToUi } from "./map";
import type { Person } from "@/lib/data";

/** Fetch every active member of an organization, mapped to the UI Person shape. */
export async function listOrgPeople(orgId: string): Promise<Person[]> {
  const memberships = await db.orm.public.OrganizationMember.where({ organizationId: orgId })
    .orderBy((row) => row.createdAt.asc())
    .all();
  if (memberships.length === 0) return [];
  const userIds = Array.from(new Set(memberships.map((m) => String(m.userId))));
  const users = await db.orm.public.User
    .where((u) => u.id.in(userIds))
    .all();
  const userById = new Map(users.map((u: any) => [String(u.id), u]));
  const people: Person[] = [];
  for (const m of memberships) {
    const u = userById.get(String(m.userId));
    if (!u) continue;
    people.push({
      id: String(u.id),
      name: String(u.name),
      role: dbRoleToUi(String(m.role)),
      department: m.department ? String(m.department) : "",
      initials: m.initials ? String(m.initials) : "",
      badge: m.badge ? String(m.badge) : "",
    });
  }
  return people;
}

/** Find a single person by their application User.id, scoped to an org membership. */
export async function findPersonById(
  userId: string,
  orgId?: string,
): Promise<Person | null> {
  const membership = orgId
    ? await db.orm.public.OrganizationMember.where({ userId, organizationId: orgId }).first()
    : await db.orm.public.OrganizationMember.where({ userId }).first();
  if (!membership) return null;
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) return null;
  return {
    id: String(user.id),
    name: String(user.name),
    role: dbRoleToUi(String(membership.role)),
    department: membership.department ? String(membership.department) : "",
    initials: membership.initials ? String(membership.initials) : "",
    badge: membership.badge ? String(membership.badge) : "",
  };
}

/** Find people by a list of user IDs, returning a map id -> Person. */
export async function getPeopleByIds(
  userIds: string[],
  orgId: string,
): Promise<Map<string, Person>> {
  const out = new Map<string, Person>();
  if (userIds.length === 0) return out;
  const unique = Array.from(new Set(userIds));
  
  const memberships = await db.orm.public.OrganizationMember
    .where({ organizationId: orgId })
    .all();
  const filteredMemberships = memberships.filter(m => unique.includes(String(m.userId)));
  
  const userIdsFromMemberships = filteredMemberships.map(m => String(m.userId));
  const users = await db.orm.public.User
    .where((u) => u.id.in(userIdsFromMemberships))
    .all();
  
  const uById = new Map(users.map((u: any) => [String(u.id), u]));
  
  for (const m of filteredMemberships) {
    const u = uById.get(String(m.userId));
    if (!u) continue;
    out.set(String(m.userId), {
      id: String(u.id),
      name: String(u.name),
      role: dbRoleToUi(String(m.role)),
      department: m.department ? String(m.department) : "",
      initials: m.initials ? String(m.initials) : "",
      badge: m.badge ? String(m.badge) : "",
    });
  }
  return out;
}

/** Returns the next case number string, formatted CR-YYYY-NNNNNN, derived from the org sequence. */
export async function previewNextCaseNumber(orgId: string): Promise<string> {
  const last = await db.orm.public.Case.where({ organizationId: orgId })
    .orderBy((row) => row.caseNumber.desc())
    .first();
  const seq = last ? Number(last.caseNumber) + 1 : 1;
  return caseNumberToUi(seq);
}

export function caseNumberToUi(caseNumber: number): string {
  const year = new Date().getUTCFullYear();
  return `CR-${year}-${String(caseNumber).padStart(6, "0")}`;
}