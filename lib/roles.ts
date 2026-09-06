import { type Role } from "./data";

export interface PermissionMatrix {
  canUpload: boolean;
  canShare: boolean;
  canReview: boolean;
  canVerify: boolean;
  canAdminister: boolean;
  canExportAudit: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, PermissionMatrix> = {
  admin: {
    canUpload: true,
    canShare: true,
    canReview: true,
    canVerify: true,
    canAdminister: true,
    canExportAudit: true,
  },
  investigator: {
    canUpload: true,
    canShare: true,
    canReview: false,
    canVerify: true,
    canAdminister: false,
    canExportAudit: true,
  },
  reviewer: {
    canUpload: false,
    canShare: false,
    canReview: true,
    canVerify: true,
    canAdminister: false,
    canExportAudit: true,
  },
  forensic: {
    canUpload: true,
    canShare: false,
    canReview: false,
    canVerify: true,
    canAdminister: false,
    canExportAudit: true,
  },
  auditor: {
    canUpload: false,
    canShare: false,
    canReview: false,
    canVerify: true,
    canAdminister: false,
    canExportAudit: true,
  },
  external: {
    canUpload: false,
    canShare: false,
    canReview: false,
    canVerify: false,
    canAdminister: false,
    canExportAudit: false,
  },
};

export const ROLE_METADATA: Record<
  Role,
  { title: string; description: string; defaultPersonId: string }
> = {
  admin: {
    title: "Organization Admin",
    description: "Full system administration, governance, and user access management",
    defaultPersonId: "u-arjun",
  },
  investigator: {
    title: "Lead Investigator",
    description: "Directs case proceedings, evidence collection, and agency sharing",
    defaultPersonId: "u-raj",
  },
  reviewer: {
    title: "Legal / Review Officer",
    description: "Evaluates legal admissibility, approves filings, and validates disclosures",
    defaultPersonId: "u-anita",
  },
  forensic: {
    title: "Forensic Officer",
    description: "Hardware acquisition, cryptographic hashing, and chain-of-custody verification",
    defaultPersonId: "u-vikram",
  },
  auditor: {
    title: "External Auditor",
    description: "Independent oversight, immutable audit trail inspection, and ledger verification",
    defaultPersonId: "u-neha",
  },
  external: {
    title: "External Department",
    description: "Time-bound restricted access to specifically shared legal evidence",
    defaultPersonId: "u-anita",
  },
};
