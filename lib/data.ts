export type Role =
  | "admin"
  | "investigator"
  | "reviewer"
  | "forensic"
  | "auditor"
  | "external";

export type CaseStatus = "active" | "under_review" | "closed" | "archived";
export type Classification = "restricted" | "confidential" | "internal" | "public";
export type DocumentType =
  | "FIR"
  | "Statement"
  | "Forensic"
  | "Legal"
  | "Evidence"
  | "Report"
  | "Filing";

export type IntegrityStatus = "verified" | "pending" | "mismatch" | "revoked";

export interface Person {
  id: string;
  name: string;
  role: Role;
  department: string;
  initials: string;
  badge: string;
}

export interface CaseRecord {
  id: string;
  number: string;
  title: string;
  description: string;
  status: CaseStatus;
  classification: Classification;
  lead: string;
  collaborators: string[];
  documents: number;
  updatedAt: string;
  createdAt: string;
  jurisdiction: string;
}

export interface DocumentVersion {
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  approver?: string;
  approvedAt?: string;
  hash: string;
  size: string;
  notes?: string;
  current?: boolean;
}

export interface ForensicSection {
  title: string;
  content: string;
  isFlagged?: boolean;
  originalContent?: string;
}

export interface ForensicPreviewData {
  documentNumber: string;
  issuingAuthority: string;
  officerInCharge: string;
  badgeNumber: string;
  incidentDate: string;
  sealId: string;
  summary: string;
  sections: ForensicSection[];
  technicalMetadata: {
    hashAlgorithm: string;
    sha256: string;
    merkleRoot: string;
    blockAnchor: string;
    blockNumber: number;
    signatureAlgorithm: string;
    keyFingerprint: string;
    tamperDetected?: boolean;
    tamperReason?: string;
    currentComputedHash?: string;
  };
}

export interface DocumentRecord {
  id: string;
  caseId: string;
  name: string;
  type: DocumentType;
  classification: Classification;
  status: "Verified" | "Review" | "Draft" | "Rejected";
  integrity: IntegrityStatus;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  description: string;
  signedBy?: string;
  anchor?: string;
  tags: string[];
  pages?: number;
  shared?: { recipient: string; expires: string; permission: string }[];
  previewData?: ForensicPreviewData;
}

export interface ActivityEvent {
  id: string;
  caseId?: string;
  documentId?: string;
  actor: string;
  action: string;
  resource: string;
  at: string;
  result: "success" | "info" | "warning" | "failure";
  meta?: string;
}

export const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 2) return "yesterday";
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

export const formatDateTime = (iso: string) =>
  iso ? new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }) : "";

export const formatDay = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

export const formatTimeOnly = (iso: string) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

export const truncateHash = (h: string, len = 6) =>
  h && h.length > 9 ? `${h.slice(0, len)}…${h.slice(-3)}` : h;
