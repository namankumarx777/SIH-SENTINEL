import type {
  CaseStatus as UiCaseStatus,
  Classification as UiClassification,
  DocumentType as UiDocumentType,
  IntegrityStatus as UiIntegrityStatus,
  Role as UiRole,
} from "@/lib/data";
import type { DocumentRecord as UiDocumentRecord } from "@/lib/data";
import { dbRoleToUiRole } from "@/lib/constants/roles";

export function asIsoString(value: unknown): string {
  if (!value) return new Date(0).toISOString();
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

export function caseNumberToUi(caseNumber: number): string {
  const year = new Date().getFullYear();
  return `CR-${year}-${String(caseNumber).padStart(6, "0")}`;
}

type DbCaseStatus = "ACTIVE" | "UNDER_REVIEW" | "CLOSED" | "ARCHIVED";
const CASE_STATUS_TO_UI: Record<DbCaseStatus, UiCaseStatus> = {
  ACTIVE: "active",
  UNDER_REVIEW: "under_review",
  CLOSED: "closed",
  ARCHIVED: "archived",
};
const UI_CASE_STATUS_TO_DB: Record<UiCaseStatus, DbCaseStatus> = {
  active: "ACTIVE",
  under_review: "UNDER_REVIEW",
  closed: "CLOSED",
  archived: "ARCHIVED",
};

export function caseStatusToUi(status: string): UiCaseStatus {
  return CASE_STATUS_TO_UI[status as DbCaseStatus] ?? "active";
}
export function caseStatusToDb(status: UiCaseStatus): DbCaseStatus {
  return UI_CASE_STATUS_TO_DB[status];
}

type DbClassification = "RESTRICTED" | "CONFIDENTIAL" | "INTERNAL" | "PUBLIC";
const CLASSIFICATION_TO_UI: Record<DbClassification, UiClassification> = {
  RESTRICTED: "restricted",
  CONFIDENTIAL: "confidential",
  INTERNAL: "internal",
  PUBLIC: "public",
};
const UI_CLASSIFICATION_TO_DB: Record<UiClassification, DbClassification> = {
  restricted: "RESTRICTED",
  confidential: "CONFIDENTIAL",
  internal: "INTERNAL",
  public: "PUBLIC",
};

export function classificationToUi(classification: string): UiClassification {
  return CLASSIFICATION_TO_UI[classification as DbClassification] ?? "confidential";
}
export function classificationToDb(classification: UiClassification): DbClassification {
  return UI_CLASSIFICATION_TO_DB[classification];
}

type DbDocumentType = "FIR" | "STATEMENT" | "FORENSIC" | "LEGAL" | "EVIDENCE" | "REPORT" | "FILING";
const DOCUMENT_TYPE_TO_UI: Record<DbDocumentType, UiDocumentType> = {
  FIR: "FIR",
  STATEMENT: "Statement",
  FORENSIC: "Forensic",
  LEGAL: "Legal",
  EVIDENCE: "Evidence",
  REPORT: "Report",
  FILING: "Filing",
};
const UI_DOCUMENT_TYPE_TO_DB: Record<UiDocumentType, DbDocumentType> = {
  FIR: "FIR",
  Statement: "STATEMENT",
  Forensic: "FORENSIC",
  Legal: "LEGAL",
  Evidence: "EVIDENCE",
  Report: "REPORT",
  Filing: "FILING",
};

export function documentTypeToUi(type: string): UiDocumentType {
  return DOCUMENT_TYPE_TO_UI[type as DbDocumentType] ?? "Evidence";
}
export function documentTypeToDb(type: UiDocumentType): DbDocumentType {
  return UI_DOCUMENT_TYPE_TO_DB[type];
}

type DbIntegrityStatus = "VERIFIED" | "PENDING" | "MISMATCH" | "REVOKED";
export function integrityToUi(integrity: string): UiIntegrityStatus {
  return (
    {
      VERIFIED: "verified",
      PENDING: "pending",
      MISMATCH: "mismatch",
      REVOKED: "revoked",
    } as Record<DbIntegrityStatus, UiIntegrityStatus>
  )[integrity as DbIntegrityStatus] ?? "pending";
}

type UiDocumentStatus = UiDocumentRecord["status"];
const DOC_STATUS_TO_UI: Record<string, UiDocumentStatus> = {
  VERIFIED: "Verified",
  REVIEW: "Review",
  DRAFT: "Draft",
  REJECTED: "Rejected",
};
const UI_DOC_STATUS_TO_DB: Record<UiDocumentStatus, string> = {
  Verified: "VERIFIED",
  Review: "REVIEW",
  Draft: "DRAFT",
  Rejected: "REJECTED",
};

export function documentStatusToUi(status: string): UiDocumentStatus {
  return DOC_STATUS_TO_UI[status] ?? "Draft";
}
export function documentStatusToDb(status: UiDocumentStatus): string {
  return UI_DOC_STATUS_TO_DB[status];
}

type DbAuditResult = "SUCCESS" | "INFO" | "WARNING" | "FAILURE";
export function auditResultToUi(result: string): "success" | "info" | "warning" | "failure" {
  return (
    {
      SUCCESS: "success",
      INFO: "info",
      WARNING: "warning",
      FAILURE: "failure",
    } as Record<DbAuditResult, "success" | "info" | "warning" | "failure">
  )[result as DbAuditResult] ?? "info";
}

export function dbRoleToUi(role: string): UiRole {
  return dbRoleToUiRole(role);
}