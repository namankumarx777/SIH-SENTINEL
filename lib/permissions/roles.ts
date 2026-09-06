export type Action =
  // Case Actions
  | "canCreateCase"
  | "canUpdateCase"
  | "canArchiveCase"
  | "canManageCaseMembers"
  | "canViewCase"
  
  // Document Actions
  | "canUploadDocument"
  | "canEditDocument"
  | "canReviewDocument"
  | "canApproveDocument"
  | "canRejectDocument"
  | "canDownloadDocument"
  | "canShareDocument"
  | "canRevokeShare"
  | "canVerifyIntegrity"
  
  // Admin / Audit
  | "canManageUsers"
  | "canManageRoles"
  | "canViewAudit";

export const OrganizationRolePermissions: Record<string, Action[]> = {
  ADMIN: [
    "canCreateCase", "canUpdateCase", "canArchiveCase", "canManageCaseMembers", "canViewCase",
    "canUploadDocument", "canEditDocument", "canReviewDocument", "canApproveDocument", "canRejectDocument", "canDownloadDocument", "canShareDocument", "canRevokeShare", "canVerifyIntegrity",
    "canManageUsers", "canManageRoles", "canViewAudit"
  ],
  INVESTIGATOR: [
    "canCreateCase", "canUpdateCase", "canManageCaseMembers", "canViewCase",
    "canUploadDocument", "canEditDocument", "canDownloadDocument", "canShareDocument", "canVerifyIntegrity"
  ],
  REVIEWER: [
    "canViewCase",
    "canReviewDocument", "canApproveDocument", "canRejectDocument", "canDownloadDocument", "canVerifyIntegrity"
  ],
  FORENSIC: [
    "canViewCase",
    "canDownloadDocument", "canVerifyIntegrity", "canUploadDocument"
  ],
  AUDITOR: [
    "canViewCase",
    "canDownloadDocument", "canVerifyIntegrity",
    "canViewAudit"
  ]
};

export const CaseRolePermissions: Record<string, Action[]> = {
  LEAD: [
    "canUpdateCase", "canArchiveCase", "canManageCaseMembers", "canViewCase",
    "canUploadDocument", "canEditDocument", "canDownloadDocument", "canShareDocument", "canRevokeShare", "canVerifyIntegrity"
  ],
  MEMBER: [
    "canViewCase",
    "canUploadDocument", "canEditDocument", "canDownloadDocument", "canShareDocument", "canVerifyIntegrity"
  ],
  REVIEWER: [
    "canViewCase",
    "canReviewDocument", "canApproveDocument", "canRejectDocument", "canDownloadDocument", "canVerifyIntegrity"
  ],
  FORENSIC: [
    "canViewCase",
    "canDownloadDocument", "canVerifyIntegrity", "canUploadDocument"
  ],
  AUDITOR: [
    "canViewCase",
    "canDownloadDocument", "canVerifyIntegrity", "canViewAudit"
  ]
};

export type CaseMemberRole = "LEAD" | "MEMBER" | "REVIEWER" | "FORENSIC" | "AUDITOR";

export function hasOrganizationPermission(role: string, action: Action): boolean {
  return OrganizationRolePermissions[role]?.includes(action) ?? false;
}

export function hasCasePermission(role: string, action: Action): boolean {
  return CaseRolePermissions[role]?.includes(action) ?? false;
}

export function getCaseMemberRole(isLead: boolean, orgRole?: string | null): CaseMemberRole {
  if (isLead) return "LEAD";
  if (orgRole === "REVIEWER") return "REVIEWER";
  if (orgRole === "FORENSIC") return "FORENSIC";
  if (orgRole === "AUDITOR") return "AUDITOR";
  return "MEMBER";
}
