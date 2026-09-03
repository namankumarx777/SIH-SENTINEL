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

export const CURRENT_USER: Person = {
  id: "u-raj",
  name: "Inspector Raj Sharma",
  role: "investigator",
  department: "Cyber Crime Unit",
  initials: "RS",
  badge: "INSP-44219",
};

export const people: Person[] = [
  CURRENT_USER,
  { id: "u-anita", name: "Anita Desai", role: "reviewer", department: "Legal Review", initials: "AD", badge: "REV-1108" },
  { id: "u-vikram", name: "Vikram Iyer", role: "forensic", department: "Forensic Lab", initials: "VI", badge: "FOR-2207" },
  { id: "u-priya", name: "Priya Menon", role: "investigator", department: "Economic Offences", initials: "PM", badge: "INSP-3084" },
  { id: "u-arjun", name: "Arjun Kapoor", role: "admin", department: "Org Admin", initials: "AK", badge: "ADM-0001" },
  { id: "u-neha", name: "Neha Verma", role: "auditor", department: "Internal Audit", initials: "NV", badge: "AUD-0917" },
  { id: "u-rahul", name: "Rahul Saxena", role: "reviewer", department: "Senior Review", initials: "RX", badge: "REV-1209" },
];

export const cases: CaseRecord[] = [
  {
    id: "c-0142",
    number: "CR-2026-0142",
    title: "Cyber Fraud Investigation",
    description:
      "Coordinated phishing operation targeting cooperative banking customers. Multi-jurisdictional leads.",
    status: "active",
    classification: "confidential",
    lead: "u-raj",
    collaborators: ["u-anita", "u-vikram", "u-neha"],
    documents: 24,
    updatedAt: "2026-09-03T11:17:00Z",
    createdAt: "2026-08-21T09:00:00Z",
    jurisdiction: "Central Bureau",
  },
  {
    id: "c-0141",
    number: "CR-2026-0141",
    title: "Vehicle Theft Investigation",
    description:
      "Interstate vehicle theft ring operating across three districts. Evidence under forensic analysis.",
    status: "active",
    classification: "confidential",
    lead: "u-raj",
    collaborators: ["u-vikram", "u-anita"],
    documents: 18,
    updatedAt: "2026-09-03T08:42:00Z",
    createdAt: "2026-08-14T12:30:00Z",
    jurisdiction: "District North",
  },
  {
    id: "c-0138",
    number: "CR-2026-0138",
    title: "Financial Crime Investigation",
    description:
      "Shell company layering involving cross-border transfers. Court submissions prepared.",
    status: "under_review",
    classification: "restricted",
    lead: "u-priya",
    collaborators: ["u-rahul", "u-anita", "u-neha"],
    documents: 31,
    updatedAt: "2026-09-02T16:05:00Z",
    createdAt: "2026-07-28T10:00:00Z",
    jurisdiction: "Economic Offences Wing",
  },
  {
    id: "c-0129",
    number: "CR-2026-0129",
    title: "Narcotics Trafficking",
    description:
      "Inter-agency operation with forensic and field evidence.",
    status: "active",
    classification: "restricted",
    lead: "u-priya",
    collaborators: ["u-vikram"],
    documents: 12,
    updatedAt: "2026-09-01T14:20:00Z",
    createdAt: "2026-08-02T08:00:00Z",
    jurisdiction: "Narcotics Bureau",
  },
  {
    id: "c-0117",
    number: "CR-2026-0117",
    title: "Forensic Audit — Public Works",
    description:
      "Closed case. Retained for audit reference.",
    status: "closed",
    classification: "internal",
    lead: "u-neha",
    collaborators: ["u-anita"],
    documents: 9,
    updatedAt: "2026-08-29T11:00:00Z",
    createdAt: "2026-06-15T09:00:00Z",
    jurisdiction: "Vigilance",
  },
];

const HASH = (seed: string) => {
  const chars = "0123456789abcdef";
  let s = seed;
  let out = "";
  for (let i = 0; i < 64; i++) {
    s = (seed + s + i).split("").reduce((a, c) => a + c.charCodeAt(0), 0).toString();
    out += chars[(parseInt(s, 10) ^ i) % 16];
  }
  return out;
};

export const documents: DocumentRecord[] = [
  {
    id: "d-001",
    caseId: "c-0142",
    name: "FIR.pdf",
    type: "FIR",
    classification: "confidential",
    status: "Verified",
    integrity: "verified",
    uploadedBy: "u-raj",
    createdAt: "2026-08-21T09:14:00Z",
    updatedAt: "2026-08-21T09:14:00Z",
    description: "First Information Report — original complaint registration.",
    signedBy: "Inspector Raj Sharma",
    anchor: "0x82ca9f1…3a1f",
    pages: 4,
    tags: ["primary", "complaint"],
    versions: [
      {
        version: "v1.0",
        uploadedBy: "u-raj",
        uploadedAt: "2026-08-21T09:14:00Z",
        approver: "u-anita",
        approvedAt: "2026-08-21T10:02:00Z",
        hash: HASH("FIR.pdf-1.0"),
        size: "318 KB",
        current: true,
        notes: "Original registration.",
      },
    ],
  },
  {
    id: "d-002",
    caseId: "c-0142",
    name: "Witness Statement.pdf",
    type: "Statement",
    classification: "confidential",
    status: "Verified",
    integrity: "mismatch",
    uploadedBy: "u-anita",
    createdAt: "2026-08-22T14:00:00Z",
    updatedAt: "2026-09-03T11:03:00Z",
    description: "Statement of complainant. Currently flagged for integrity review.",
    signedBy: "Reviewer Anita Desai",
    anchor: "0x73ab22d…44e",
    pages: 7,
    tags: ["witness", "primary"],
    versions: [
      {
        version: "v2.1",
        uploadedBy: "u-anita",
        uploadedAt: "2026-09-03T11:03:00Z",
        approver: "u-rahul",
        approvedAt: "2026-09-03T11:17:00Z",
        hash: HASH("Witness Statement.pdf-2.1"),
        size: "1.2 MB",
        current: true,
      },
      {
        version: "v2.0",
        uploadedBy: "u-anita",
        uploadedAt: "2026-09-03T10:41:00Z",
        hash: HASH("Witness Statement.pdf-2.0"),
        size: "1.2 MB",
      },
      {
        version: "v1.0",
        uploadedBy: "u-raj",
        uploadedAt: "2026-08-22T14:00:00Z",
        approver: "u-anita",
        approvedAt: "2026-08-22T16:00:00Z",
        hash: HASH("Witness Statement.pdf-1.0"),
        size: "1.1 MB",
      },
    ],
  },
  {
    id: "d-003",
    caseId: "c-0142",
    name: "Forensic Report.pdf",
    type: "Forensic",
    classification: "restricted",
    status: "Review",
    integrity: "pending",
    uploadedBy: "u-vikram",
    createdAt: "2026-08-30T09:00:00Z",
    updatedAt: "2026-09-02T15:30:00Z",
    description: "Digital forensic analysis of seized devices.",
    pages: 22,
    tags: ["forensic", "devices"],
    versions: [
      {
        version: "v1.0",
        uploadedBy: "u-vikram",
        uploadedAt: "2026-08-30T09:00:00Z",
        hash: HASH("Forensic Report.pdf-1.0"),
        size: "4.8 MB",
        current: true,
      },
    ],
  },
  {
    id: "d-004",
    caseId: "c-0142",
    name: "Charge Sheet.pdf",
    type: "Legal",
    classification: "restricted",
    status: "Verified",
    integrity: "verified",
    uploadedBy: "u-anita",
    createdAt: "2026-09-01T11:00:00Z",
    updatedAt: "2026-09-01T11:00:00Z",
    description: "Draft charge sheet for senior counsel review.",
    signedBy: "Reviewer Anita Desai",
    anchor: "0x91ab07c…71d",
    pages: 18,
    tags: ["legal", "charges"],
    versions: [
      {
        version: "v3.0",
        uploadedBy: "u-anita",
        uploadedAt: "2026-09-01T11:00:00Z",
        approver: "u-rahul",
        approvedAt: "2026-09-01T12:40:00Z",
        hash: HASH("Charge Sheet.pdf-3.0"),
        size: "2.1 MB",
        current: true,
      },
      {
        version: "v2.0",
        uploadedBy: "u-anita",
        uploadedAt: "2026-08-30T15:00:00Z",
        hash: HASH("Charge Sheet.pdf-2.0"),
        size: "2.0 MB",
      },
      {
        version: "v1.0",
        uploadedBy: "u-anita",
        uploadedAt: "2026-08-28T10:00:00Z",
        hash: HASH("Charge Sheet.pdf-1.0"),
        size: "1.9 MB",
      },
    ],
  },
  {
    id: "d-005",
    caseId: "c-0142",
    name: "Evidence Inventory.pdf",
    type: "Evidence",
    classification: "confidential",
    status: "Verified",
    integrity: "verified",
    uploadedBy: "u-vikram",
    createdAt: "2026-08-25T10:00:00Z",
    updatedAt: "2026-08-25T10:00:00Z",
    description: "Sealed evidence log with chain-of-custody references.",
    signedBy: "Forensic Officer Vikram Iyer",
    anchor: "0x44ed02a…b9c",
    pages: 6,
    tags: ["evidence"],
    versions: [
      {
        version: "v1.0",
        uploadedBy: "u-vikram",
        uploadedAt: "2026-08-25T10:00:00Z",
        approver: "u-anita",
        approvedAt: "2026-08-25T11:00:00Z",
        hash: HASH("Evidence Inventory.pdf-1.0"),
        size: "212 KB",
        current: true,
      },
    ],
  },
  {
    id: "d-006",
    caseId: "c-0141",
    name: "FIR.pdf",
    type: "FIR",
    classification: "confidential",
    status: "Verified",
    integrity: "verified",
    uploadedBy: "u-raj",
    createdAt: "2026-08-14T12:30:00Z",
    updatedAt: "2026-08-14T12:30:00Z",
    description: "Initial FIR — vehicle theft.",
    signedBy: "Inspector Raj Sharma",
    anchor: "0xa1b2c3…f00",
    pages: 3,
    tags: ["complaint"],
    versions: [
      {
        version: "v1.0",
        uploadedBy: "u-raj",
        uploadedAt: "2026-08-14T12:30:00Z",
        approver: "u-anita",
        approvedAt: "2026-08-14T13:00:00Z",
        hash: HASH("FIR-141-1.0"),
        size: "280 KB",
        current: true,
      },
    ],
  },
];

export const activity: ActivityEvent[] = [
  {
    id: "a-1",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-vikram",
    action: "Downloaded",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T11:17:00Z",
    result: "success",
  },
  {
    id: "a-2",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-raj",
    action: "Shared",
    resource: "Witness Statement.pdf with Forensic Department",
    at: "2026-09-03T11:03:00Z",
    result: "success",
    meta: "Expires in 7 days",
  },
  {
    id: "a-3",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-rahul",
    action: "Approved version 2.1",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T10:44:00Z",
    result: "success",
  },
  {
    id: "a-4",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-anita",
    action: "Uploaded version 2.1",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T10:41:00Z",
    result: "success",
  },
  {
    id: "a-5",
    caseId: "c-0142",
    documentId: "d-004",
    actor: "u-rahul",
    action: "Approved",
    resource: "Charge Sheet.pdf",
    at: "2026-09-01T12:40:00Z",
    result: "success",
  },
  {
    id: "a-6",
    caseId: "c-0142",
    documentId: "d-003",
    actor: "u-vikram",
    action: "Submitted for review",
    resource: "Forensic Report.pdf",
    at: "2026-09-02T15:30:00Z",
    result: "info",
  },
  {
    id: "a-7",
    caseId: "c-0142",
    actor: "u-neha",
    action: "Verified integrity",
    resource: "FIR.pdf",
    at: "2026-08-30T11:08:00Z",
    result: "success",
  },
  {
    id: "a-8",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "system",
    action: "Integrity mismatch detected",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T11:18:00Z",
    result: "failure",
    meta: "Hash does not match recorded version.",
  },
  {
    id: "a-9",
    caseId: "c-0141",
    actor: "u-vikram",
    action: "Added",
    resource: "Vehicle identification plate sketch",
    at: "2026-09-01T09:14:00Z",
    result: "success",
  },
];

export function findCase(id: string) {
  return cases.find((c) => c.id === id || c.number === id);
}

export function documentsForCase(caseId: string) {
  return documents.filter((d) => d.caseId === caseId);
}

export function findDocument(id: string) {
  return documents.find((d) => d.id === id);
}

export function findPerson(id: string) {
  return people.find((p) => p.id === id);
}

export function activityFor(caseId?: string) {
  if (!caseId) return activity;
  return activity.filter((a) => a.caseId === caseId);
}

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date("2026-09-03T12:00:00Z");
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 2) return "yesterday";
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export const formatTimeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const truncateHash = (h: string, len = 6) =>
  `${h.slice(0, len)}…${h.slice(-3)}`;
