import type { Role } from "@/lib/data";

export type DbRole = "ADMIN" | "INVESTIGATOR" | "REVIEWER" | "FORENSIC" | "AUDITOR";

export const DB_ROLE_TO_UI: Record<DbRole, Role> = {
  ADMIN: "admin",
  INVESTIGATOR: "investigator",
  REVIEWER: "reviewer",
  FORENSIC: "forensic",
  AUDITOR: "auditor",
};

export const UI_ROLE_TO_DB: Record<Role, DbRole | null> = {
  admin: "ADMIN",
  investigator: "INVESTIGATOR",
  reviewer: "REVIEWER",
  forensic: "FORENSIC",
  auditor: "AUDITOR",
  external: null,
};

export function dbRoleToUiRole(dbRole: string): Role {
  return DB_ROLE_TO_UI[dbRole as DbRole] ?? "external";
}

export function uiRoleToDbRole(uiRole: Role): DbRole | null {
  return UI_ROLE_TO_DB[uiRole];
}
