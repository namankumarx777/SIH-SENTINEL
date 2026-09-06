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
    anchor: "0x82ca9f1a238e810cb9947f631102e88a31e13a1f",
    pages: 4,
    tags: ["primary", "complaint", "cyber"],
    previewData: {
      documentNumber: "FIR/CYB/2026/0142",
      issuingAuthority: "Central Bureau of Investigation — Cyber Crime Branch",
      officerInCharge: "Inspector Raj Sharma",
      badgeNumber: "INSP-44219",
      incidentDate: "20 Aug 2026 23:40 IST",
      sealId: "CBI-DL-SEAL-8891",
      summary: "First Information Report under Sections 420, 468, 471 IPC and Section 66D IT Act regarding coordinated unauthorized access and fraudulent fund exfiltration targeting Cooperative Credit accounts.",
      sections: [
        {
          title: "I. Complainant & Incident Details",
          content: "Complainant Shri R. K. Nambiar (Chief Vigilance Officer, Apex Cooperative Bank) reported systematic breach of RTGS gateway between 18 Aug and 20 Aug 2026. Total unauthorized ledger diversion identified across 14 beneficiary mule accounts amounts to ₹4,82,50,000.",
        },
        {
          title: "II. Offense Classification & Applicable Statutes",
          content: "Offenses committed under Section 420 (Cheating), Section 468 (Forgery for purpose of cheating), Section 471 (Using as genuine a forged document) of the Indian Penal Code, read with Section 66C and 66D of Information Technology Act 2000.",
        },
        {
          title: "III. Initial Digital Artifacts Seized",
          content: "1. Core Banking Gateway Apache Server access logs (18-20 Aug)\n2. Reverse proxy egress PCAP traces capturing outbound C2 connection to IP 194.165.16.42\n3. Memory snapshot of transaction broker host CB-RTGS-02.",
        },
        {
          title: "IV. Jurisdictional Directive & Evidence Custody",
          content: "Evidence preserved in air-gapped forensic vault en-situ. In accordance with Section 65B of the Indian Evidence Act, hash integrity manifest generated at intake and signed via ECDSA token.",
        },
      ],
      technicalMetadata: {
        hashAlgorithm: "SHA-256",
        sha256: HASH("FIR.pdf-1.0"),
        merkleRoot: "0xe738bc841029e84711a938260193bbfe982341201948",
        blockAnchor: "0x82ca9f1a238e810cb9947f631102e88a31e13a1f",
        blockNumber: 1492710,
        signatureAlgorithm: "ECDSA P-256 / SHA256",
        keyFingerprint: "SHA256:4a8b91c2d3e4f5061728394a5b6c7d8e9f012345",
      },
    },
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
        notes: "Original complaint registration with judicial stamp.",
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
    description: "Statement of complainant. Flagged for cryptographic integrity mismatch against ledger anchor.",
    signedBy: "Reviewer Anita Desai",
    anchor: "0x73ab22d8f9c1e7a3b4c5d6e7f8091a2b3c4d5e6f",
    pages: 7,
    tags: ["witness", "primary", "flagged"],
    previewData: {
      documentNumber: "WS/2026/0142-01",
      issuingAuthority: "Judicial Magistrate Court — Special Deposition Unit",
      officerInCharge: "Reviewer Anita Desai",
      badgeNumber: "REV-1108",
      incidentDate: "22 Aug 2026 14:00 IST",
      sealId: "JMIC-DEL-SEAL-0912",
      summary: "Sworn testimony of Key Witness Sunita Rao (System Administrator, Cooperative Data Center) describing rogue credentials injection and covert hardware deployment.",
      sections: [
        {
          title: "Deposition Preamble",
          content: "I, Sunita Rao, aged 34, residing at Sector 14 Rohini, declare under solemn affirmation that the answers recorded herein are truthful, given without coercion or inducement in the presence of Inspector Raj Sharma and Legal Officer Anita Desai.",
        },
        {
          title: "Question 4: Vehicle observed during server room unauthorized access",
          content: "Witness response: 'On the night of 18 August at approximately 22:45 IST, I observed a silver utility vehicle parked near Loading Bay 3 with registration number DL-14-CC-1102. An individual wearing maintenance overalls exited carrying an unmarked pelican case.'",
          isFlagged: true,
          originalContent: "Witness response: 'On the night of 18 August at approximately 22:45 IST, I observed a white utility van parked near Loading Bay 3 with registration number DL-04-AB-9821. An individual wearing maintenance overalls exited carrying an unmarked pelican case.'",
        },
        {
          title: "Question 7: Account Credential Compromise Mechanism",
          content: "Witness response: 'The Domain Controller admin account admin_core was used to override hardware security module thresholds. This account credentials were only held by three authorized personnel.'",
        },
      ],
      technicalMetadata: {
        hashAlgorithm: "SHA-256",
        sha256: HASH("Witness Statement.pdf-2.1"),
        currentComputedHash: "89ef41a20c3d5e71829038475610293847561029384756102938475610293847",
        merkleRoot: "0x992318471029384711a938260193bbfe982341201948",
        blockAnchor: "0x73ab22d8f9c1e7a3b4c5d6e7f8091a2b3c4d5e6f",
        blockNumber: 1492840,
        signatureAlgorithm: "ECDSA P-256 / SHA256",
        keyFingerprint: "SHA256:73abf3d29b8e1c5d4e2f1a0b9c8d7e6f5a4b3c2d",
        tamperDetected: true,
        tamperReason: "Section II paragraph 2 (Question 4) differs from cryptographic blockchain anchor. Vehicle registration was altered from DL-04-AB-9821 to DL-14-CC-1102.",
      },
    },
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
        notes: "Revised transcript filed after preliminary corroboration.",
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
        notes: "Initial deposition audio verbatim transcript.",
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
    description: "Digital forensic analysis of seized devices and network telemetry.",
    pages: 22,
    tags: ["forensic", "devices", "telemetry"],
    previewData: {
      documentNumber: "LAB/DIG-FOR/2026/7741",
      issuingAuthority: "Central Forensic Science Laboratory (CFSL) — Cyber Forensics Division",
      officerInCharge: "Forensic Officer Vikram Iyer",
      badgeNumber: "FOR-2207",
      incidentDate: "28 Aug 2026 10:15 IST",
      sealId: "CFSL-EVI-SEAL-4402",
      summary: "Hardware write-blocker acquisition and deep bitstream analysis of Seized Exhibit E-01 (Lenovo ThinkPad P1 Gen 5) and Exhibit E-02 (Apple iPhone 14 Pro).",
      sections: [
        {
          title: "I. Evidence Intake & Chain of Custody Integrity",
          content: "Exhibits received in tamper-evident anti-static electrostatic pouches with unbroken tamper seals. Visual inspection confirmed no physical port damage. Weigh-in and physical serial numbers cross-verified against seizure memo dated 24 Aug 2026.",
        },
        {
          title: "II. Bitstream Acquisition Methodology",
          content: "Exhibit E-01 NVMe drive cloned using Tableau T8u Forensic USB 3.0 Bridge in write-blocked read-only hardware mode. Raw image verification: MD5 hash match confirmed. SHA-256 acquisition verification completed in 42 minutes.",
        },
        {
          title: "III. Artifacts Recovered & C2 Analysis",
          content: "Analysis of unallocated clusters recovered encrypted payload dropper 'rtgs_sync.dll' configured to broadcast telemetry to onion router nodes. Configuration file contained predefined target bank routing numbers matching complainant's branch ledger.",
        },
      ],
      technicalMetadata: {
        hashAlgorithm: "SHA-256",
        sha256: HASH("Forensic Report.pdf-1.0"),
        merkleRoot: "0x44fa1829038475610293847561029384756102938475",
        blockAnchor: "0x9182374619283746192837461928374619283746",
        blockNumber: 1493012,
        signatureAlgorithm: "ECDSA P-256 / SHA256",
        keyFingerprint: "SHA256:91c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
      },
    },
    versions: [
      {
        version: "v1.0",
        uploadedBy: "u-vikram",
        uploadedAt: "2026-08-30T09:00:00Z",
        hash: HASH("Forensic Report.pdf-1.0"),
        size: "4.8 MB",
        current: true,
        notes: "Full lab analysis with EnCase / FTK raw hash appendix.",
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
    description: "Final police report under Section 173 CrPC for court submission.",
    signedBy: "Reviewer Anita Desai",
    anchor: "0x91ab07c4273819e182374619283746192837461d",
    pages: 18,
    tags: ["legal", "charges", "crpc"],
    previewData: {
      documentNumber: "CRPC/173/DEL/2026/09",
      issuingAuthority: "Court of Chief Metropolitan Magistrate, Patiala House",
      officerInCharge: "Inspector Raj Sharma",
      badgeNumber: "INSP-44219",
      incidentDate: "01 Sep 2026 11:00 IST",
      sealId: "CMM-DEL-SEAL-1102",
      summary: "Final investigation charge sheet summarizing digital evidence, money trail, accused participation, and prayer for cognizance under IPC and IT Act.",
      sections: [
        {
          title: "Accused Roster & Specific Charges",
          content: "Accused A-1 (Manish Rawat, lead orchestrator) and A-2 (Saurabh Varma, credential broker) charged with criminal conspiracy to commit computer fraud.",
        },
        {
          title: "Chain of Custody Certificate Under Section 65B",
          content: "Cryptographic certificates of origin, server logs, blockchain transaction proofs, and forensic disk images annexed as Exhibits P-1 through P-24.",
        },
      ],
      technicalMetadata: {
        hashAlgorithm: "SHA-256",
        sha256: HASH("Charge Sheet.pdf-3.0"),
        merkleRoot: "0x112233445566778899aabbccddeeff0011223344",
        blockAnchor: "0x91ab07c4273819e182374619283746192837461d",
        blockNumber: 1493205,
        signatureAlgorithm: "ECDSA P-256 / SHA256",
        keyFingerprint: "SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      },
    },
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
    description: "Sealed evidence log with physical chain-of-custody barcode identifiers.",
    signedBy: "Forensic Officer Vikram Iyer",
    anchor: "0x44ed02ab9c81726354182938475610293847561c",
    pages: 6,
    tags: ["evidence", "inventory"],
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
    description: "Initial FIR — Interstate vehicle theft syndicate.",
    signedBy: "Inspector Raj Sharma",
    anchor: "0xa1b2c3d4e5f6071829384756102938475610293f00",
    pages: 3,
    tags: ["complaint", "vehicle"],
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
    id: "a-8",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "system",
    action: "Integrity mismatch detected",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T11:18:00Z",
    result: "failure",
    meta: "SHA-256 does not match recorded blockchain anchor (Block #1492840).",
  },
  {
    id: "a-1",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-vikram",
    action: "Downloaded forensic copy",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T11:17:00Z",
    result: "success",
  },
  {
    id: "a-2",
    caseId: "c-0142",
    documentId: "d-002",
    actor: "u-raj",
    action: "Shared with external agency",
    resource: "Witness Statement.pdf with Forensic Department",
    at: "2026-09-03T11:03:00Z",
    result: "success",
    meta: "Expires in 7 days · Justification: Ballistics cross-examination",
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
    action: "Uploaded revised version 2.1",
    resource: "Witness Statement.pdf",
    at: "2026-09-03T10:41:00Z",
    result: "success",
  },
  {
    id: "a-5",
    caseId: "c-0142",
    documentId: "d-004",
    actor: "u-rahul",
    action: "Approved final legal filing",
    resource: "Charge Sheet.pdf",
    at: "2026-09-01T12:40:00Z",
    result: "success",
  },
  {
    id: "a-6",
    caseId: "c-0142",
    documentId: "d-003",
    actor: "u-vikram",
    action: "Submitted for legal review",
    resource: "Forensic Report.pdf",
    at: "2026-09-02T15:30:00Z",
    result: "info",
  },
  {
    id: "a-7",
    caseId: "c-0142",
    actor: "u-neha",
    action: "Verified cryptographic chain",
    resource: "FIR.pdf",
    at: "2026-08-30T11:08:00Z",
    result: "success",
  },
  {
    id: "a-9",
    caseId: "c-0141",
    actor: "u-vikram",
    action: "Added forensic sketch",
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

// In-memory mutation helpers for Server Actions
export function addDocument(doc: DocumentRecord) {
  documents.unshift(doc);
  const c = findCase(doc.caseId);
  if (c) c.documents += 1;
}

export function updateDocument(id: string, updates: Partial<DocumentRecord>) {
  const doc = findDocument(id);
  if (doc) {
    Object.assign(doc, updates, { updatedAt: new Date().toISOString() });
  }
}

export function addActivityEvent(event: ActivityEvent) {
  activity.unshift(event);
}

export function addCase(caseRecord: CaseRecord) {
  cases.unshift(caseRecord);
}

export function updateCase(id: string, updates: Partial<CaseRecord>) {
  const c = findCase(id);
  if (c) {
    Object.assign(c, updates, { updatedAt: new Date().toISOString() });
  }
}

// --- Case Number Sequence (atomic counter) ---
// Seed from the highest existing case number in the dataset.
let _caseSequence = cases.reduce((max, c) => {
  const n = parseInt(c.number.replace("CR-", ""), 10);
  return n > max ? n : max;
}, 0);

/**
 * Atomically increment and return the next case number.
 * Format: CR-YYYY-NNNNNN (zero-padded to 6 digits).
 */
export function nextCaseNumber(): string {
  _caseSequence += 1;
  const year = new Date().getFullYear();
  const seq = String(_caseSequence).padStart(6, "0");
  return `CR-${year}-${seq}`;
}

/**
 * Preview the NEXT case number without incrementing.
 * Used by the frontend to display a read-only preview before submission.
 */
export function previewNextCaseNumber(): string {
  const next = _caseSequence + 1;
  const year = new Date().getFullYear();
  const seq = String(next).padStart(6, "0");
  return `CR-${year}-${seq}`;
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
