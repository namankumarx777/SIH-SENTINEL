import { cookies } from "next/headers";
import { people, type Person, type Role } from "./data";
import { ROLE_METADATA, ROLE_PERMISSIONS, type PermissionMatrix } from "./roles";

export { ROLE_METADATA, ROLE_PERMISSIONS, type PermissionMatrix };

/**
 * Async session resolver adhering to Next.js 16 Promise-based cookies()
 * ONLY import in Server Components, Layouts, or Server Actions.
 */
export async function getSessionUser(): Promise<{
  user: Person;
  role: Role;
  permissions: PermissionMatrix;
}> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("securecase_role")?.value as Role | undefined;
  const activeRole: Role =
    roleCookie && roleCookie in ROLE_PERMISSIONS ? roleCookie : "investigator";

  const targetPersonId = ROLE_METADATA[activeRole]?.defaultPersonId ?? "u-raj";
  const user = people.find((p) => p.id === targetPersonId) ?? people[0];

  return {
    user: {
      ...user,
      role: activeRole,
    },
    role: activeRole,
    permissions: ROLE_PERMISSIONS[activeRole],
  };
}
