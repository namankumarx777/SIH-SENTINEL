import { ROLE_PERMISSIONS, type PermissionMatrix } from "./roles";
import { DB_ROLE_TO_UI, UI_ROLE_TO_DB, type DbRole } from "./constants/roles";

export { DB_ROLE_TO_UI, UI_ROLE_TO_DB } from "./constants/roles";
export type { DbRole } from "./constants/roles";

export function permissionsForDbRole(role: DbRole | null): PermissionMatrix {
  const uiRole = role ? DB_ROLE_TO_UI[role] : "external";
  return ROLE_PERMISSIONS[uiRole];
}