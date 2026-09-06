"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  addActivityEvent,
  addCase,
  addDocument,
  findCase,
  findDocument,
  nextCaseNumber,
  previewNextCaseNumber,
  updateCase,
  updateDocument,
  type CaseRecord,
  type Classification,
  type DocumentRecord,
  type DocumentType,
  type Role,
} from "./data";
import { getSessionUser } from "./session";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Switch the active role in the demo session cookie.
 */
export async function switchRoleAction(role: Role): Promise<ActionResult<{ role: Role }>> {
  const cookieStore = await cookies();
  cookieStore.set("securecase_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    httpOnly: false,
  });

  revalidatePath("/", "layout");
  return { success: true, message: `Active persona switched to ${role}`, data: { role } };
}

/**
 * Server Action for uploading and cryptographically anchoring evidence.
 * Consumes formData, verifies RBAC, creates document record and audit event.
 */
export async function uploadDocumentAction(
  _prevState: ActionResult<DocumentRecord> | null,
  formData: FormData
): Promise<ActionResult<DocumentRecord>> {
  const session = await getSessionUser();

  if (!session.permissions.canUpload) {
    return {
      success: false,
      error: `Permission Denied: Persona "${session.role}" is not cleared for evidence intake.`,
    };
  }

  const caseId = formData.get("caseId")?.toString();
  const name = formData.get("name")?.toString()?.trim();
  const type = (formData.get("type")?.toString() ?? "Evidence") as DocumentType;
  const classification = (formData.get("classification")?.toString() ?? "confidential") as Classification;
  const description = formData.get("description")?.toString()?.trim() || "Uploaded investigative artifact.";
  const pagesCount = parseInt(formData.get("pages")?.toString() || "1", 10);

  if (!caseId || !name) {
    return {
      success: false,
      error: "Missing required document name or target case association.",
    };
  }

  const c = findCase(caseId);
  if (!c) {
    return {
      success: false,
      error: `Case identifier "${caseId}" could not be located.`,
    };
  }

  // Simulate SHA-256 generation and private ledger anchoring
  const timestamp = new Date().toISOString();
  const hexChars = "0123456789abcdef";
  let hashSeed = "";
  for (let i = 0; i < 64; i++) {
    hashSeed += hexChars[Math.floor(Math.random() * 16)];
  }

  const blockNumber = 1493400 + Math.floor(Math.random() * 50);
  const anchorTx = `0x${hashSeed.slice(0, 40)}`;

  const newDocId = `d-${Date.now().toString().slice(-4)}`;
  const newDocument: DocumentRecord = {
    id: newDocId,
    caseId,
    name: name.endsWith(".pdf") ? name : `${name}.pdf`,
    type,
    classification,
    status: "Verified",
    integrity: "verified",
    uploadedBy: session.user.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    description,
    signedBy: session.user.name,
    anchor: anchorTx,
    pages: Math.max(1, pagesCount),
    tags: ["intake", type.toLowerCase()],
    previewData: {
      documentNumber: `${type.toUpperCase()}/2026/${newDocId.toUpperCase()}`,
      issuingAuthority: `${session.user.department} — Digital Evidence Repository`,
      officerInCharge: session.user.name,
      badgeNumber: session.user.badge,
      incidentDate: timestamp,
      sealId: `SEAL-${session.user.badge}-${Date.now().toString().slice(-4)}`,
      summary: description,
      sections: [
        {
          title: "Intake Record & Custody Certification",
          content: `Evidence intake logged by ${session.user.name} (${session.user.badge}). Secure SHA-256 hash generated and anchored directly to private judicial blockchain ledger block #${blockNumber}.`,
        },
        {
          title: "Cryptographic Chain of Origin",
          content: `All bits acquired under read-only write-blocking protocols. Origin signature verified with public key fingerprint SHA256:${hashSeed.slice(0, 32)}.`,
        },
      ],
      technicalMetadata: {
        hashAlgorithm: "SHA-256",
        sha256: hashSeed,
        merkleRoot: `0x${hashSeed.slice(10, 50)}`,
        blockAnchor: anchorTx,
        blockNumber,
        signatureAlgorithm: "ECDSA P-256 / SHA256",
        keyFingerprint: `SHA256:${hashSeed.slice(0, 40)}`,
      },
    },
    versions: [
      {
        version: "v1.0",
        uploadedBy: session.user.id,
        uploadedAt: timestamp,
        hash: hashSeed,
        size: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
        current: true,
        notes: "Original intake file anchored to ledger.",
      },
    ],
  };

  addDocument(newDocument);

  // Append immutable audit log event
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId,
    documentId: newDocId,
    actor: session.user.id,
    action: "Uploaded and anchored evidence",
    resource: newDocument.name,
    at: timestamp,
    result: "success",
    meta: `Block #${blockNumber} · Hash: ${hashSeed.slice(0, 8)}…`,
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/documents`);
  revalidatePath("/dashboard");
  revalidatePath("/audit");
  revalidatePath("/documents");

  return {
    success: true,
    message: `Document "${newDocument.name}" successfully secured, hashed, and anchored to Block #${blockNumber}.`,
    data: newDocument,
  };
}

/**
 * Server Action for sharing evidence with external or inter-departmental bodies.
 * Enforces mandatory justification, explicit permissions, and time-bound revocation.
 */
export async function shareDocumentAction(
  _prevState: ActionResult<{ shareId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ shareId: string }>> {
  const session = await getSessionUser();

  if (!session.permissions.canShare) {
    return {
      success: false,
      error: `Permission Denied: Persona "${session.role}" is not authorized to grant external evidence access.`,
    };
  }

  const documentId = formData.get("documentId")?.toString();
  const caseId = formData.get("caseId")?.toString();
  const recipient = formData.get("recipient")?.toString()?.trim();
  const permission = formData.get("permission")?.toString() || "View";
  const expiration = formData.get("expiration")?.toString() || "7d";
  const justification = formData.get("justification")?.toString()?.trim();

  if (!recipient || !justification) {
    return {
      success: false,
      error: "Recipient and a mandatory justification must be provided.",
    };
  }

  if (justification.length < 8) {
    return {
      success: false,
      error: "Justification must detail the official investigative requirement (minimum 8 characters).",
    };
  }

  const doc = documentId ? findDocument(documentId) : null;
  const docName = doc?.name ?? "Case Bundle";
  const timestamp = new Date().toISOString();
  const shareId = `s-${Date.now()}`;

  // Log to immutable narrative audit trail
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId: caseId ?? doc?.caseId,
    documentId: doc?.id,
    actor: session.user.id,
    action: `Granted ${permission} access`,
    resource: `${docName} to ${recipient}`,
    at: timestamp,
    result: "success",
    meta: `Expires: ${expiration} · Reason: "${justification}"`,
  });

  if (caseId) revalidatePath(`/cases/${caseId}`);
  if (doc?.id) revalidatePath(`/cases/${caseId}/documents/${doc.id}`);
  revalidatePath("/shared");
  revalidatePath("/audit");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Secure ${permission.toLowerCase()} link dispatched to "${recipient}". Logged to immutable audit trail.`,
    data: { shareId },
  };
}

/**
 * Server Action for verifying a document's cryptographic integrity against the blockchain anchor.
 */
export async function verifyDocumentIntegrityAction(
  documentId: string
): Promise<
  ActionResult<{
    verified: boolean;
    recordedHash: string;
    computedHash: string;
    blockNumber: number;
    blockAnchor: string;
    timestamp: string;
    mismatchReason?: string;
  }>
> {
  const session = await getSessionUser();

  if (!session.permissions.canVerify) {
    return {
      success: false,
      error: `Permission Denied: Persona "${session.role}" is not cleared for cryptographic audit routines.`,
    };
  }

  const doc = findDocument(documentId);
  if (!doc) {
    return { success: false, error: "Document could not be located." };
  }

  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];
  const recordedHash = currentVersion.hash;
  const timestamp = new Date().toISOString();

  // If document is flagged as tampered (d-002 Witness Statement)
  if (doc.integrity === "mismatch") {
    const computedHash =
      doc.previewData?.technicalMetadata.currentComputedHash ??
      "89ef41a20c3d5e71829038475610293847561029384756102938475610293847";

    addActivityEvent({
      id: `a-${Date.now()}`,
      caseId: doc.caseId,
      documentId: doc.id,
      actor: session.user.id,
      action: "Ran integrity verification — MISMATCH DETECTED",
      resource: doc.name,
      at: timestamp,
      result: "failure",
      meta: `Computed: ${computedHash.slice(0, 8)}… ≠ Anchor: ${recordedHash.slice(0, 8)}…`,
    });

    revalidatePath(`/cases/${doc.caseId}/documents/${doc.id}`);
    revalidatePath("/audit");

    return {
      success: true,
      data: {
        verified: false,
        recordedHash,
        computedHash,
        blockNumber: doc.previewData?.technicalMetadata.blockNumber ?? 1492840,
        blockAnchor: doc.anchor ?? "0x73ab22d…44e",
        timestamp,
        mismatchReason:
          doc.previewData?.technicalMetadata.tamperReason ??
          "Current file byte sequence does not match recorded blockchain anchor block.",
      },
    };
  }

  // Healthy document verified
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId: doc.caseId,
    documentId: doc.id,
    actor: session.user.id,
    action: "Verified document integrity",
    resource: doc.name,
    at: timestamp,
    result: "success",
    meta: `Hash matched block #${doc.previewData?.technicalMetadata.blockNumber ?? 1492710}`,
  });

  revalidatePath(`/cases/${doc.caseId}/documents/${doc.id}`);
  revalidatePath("/audit");

  return {
    success: true,
    data: {
      verified: true,
      recordedHash,
      computedHash: recordedHash,
      blockNumber: doc.previewData?.technicalMetadata.blockNumber ?? 1492710,
      blockAnchor: doc.anchor ?? "0x82ca9f1…3a1f",
      timestamp,
    },
  };
}

/**
 * Server Action for Legal Review / Admin to approve or reject document version.
 */
export async function updateDocumentStatusAction(
  documentId: string,
  status: "Verified" | "Review" | "Draft" | "Rejected",
  notes?: string
): Promise<ActionResult> {
  const session = await getSessionUser();

  if (!session.permissions.canReview && !session.permissions.canAdminister) {
    return {
      success: false,
      error: `Permission Denied: Role "${session.role}" does not possess legal review approval privileges.`,
    };
  }

  const doc = findDocument(documentId);
  if (!doc) {
    return { success: false, error: "Document not found." };
  }

  updateDocument(documentId, { status });

  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId: doc.caseId,
    documentId: doc.id,
    actor: session.user.id,
    action: `Changed status to ${status}`,
    resource: doc.name,
    at: new Date().toISOString(),
    result: status === "Rejected" ? "warning" : "success",
    meta: notes ? `Note: ${notes}` : undefined,
  });

  revalidatePath(`/cases/${doc.caseId}/documents/${doc.id}`);
  revalidatePath(`/cases/${doc.caseId}/documents`);
  revalidatePath("/dashboard");
  revalidatePath("/audit");

  return { success: true, message: `Document status updated to ${status}.` };
}

/**
 * Server Action: return the next case number without committing it.
 * The frontend displays this as a read-only preview in the create modal.
 */
export async function getPreviewCaseNumberAction(): Promise<ActionResult<{ caseNumber: string }>> {
  const caseNumber = previewNextCaseNumber();
  return { success: true, data: { caseNumber } };
}

/**
 * Server Action for creating an investigation case.
 */
export async function createCaseAction(
  _prevState: ActionResult<{ caseId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ caseId: string }>> {
  const session = await getSessionUser();

  if (!session.permissions.canUpload && !session.permissions.canAdminister) {
    return {
      success: false,
      error: `Permission Denied: Role "${session.role}" cannot initiate case proceedings.`,
    };
  }

  const title = formData.get("title")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim();
  const classification = (formData.get("classification")?.toString() ?? "confidential") as Classification;
  const jurisdiction = formData.get("jurisdiction")?.toString()?.trim() || "Central Bureau";

  if (!title || !description) {
    return { success: false, error: "Title and description are required." };
  }

  const caseNumber = nextCaseNumber();
  const caseId = `c-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const newCase: CaseRecord = {
    id: caseId,
    number: caseNumber,
    title,
    description,
    status: "active",
    classification,
    lead: session.user.id,
    collaborators: ["u-anita", "u-vikram"],
    documents: 0,
    updatedAt: timestamp,
    createdAt: timestamp,
    jurisdiction,
  };

  addCase(newCase);

  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId,
    actor: session.user.id,
    action: "Initiated case workspace",
    resource: `${caseNumber} (${title})`,
    at: timestamp,
    result: "success",
    meta: `Jurisdiction: ${jurisdiction}`,
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Case ${caseNumber} initiated under ${jurisdiction}.`,
    data: { caseId },
  };
}

/**
 * Server Action: Archive a case — sets status to "archived" and logs the event.
 */
export async function archiveCaseAction(caseId: string): Promise<ActionResult> {
  const session = await getSessionUser();

  if (!session.permissions.canAdminister && !session.permissions.canUpload) {
    return {
      success: false,
      error: `Permission Denied: Role "${session.role}" cannot archive case workspaces.`,
    };
  }

  const c = findCase(caseId);
  if (!c) {
    return { success: false, error: "Case not found." };
  }

  if (c.status === "archived") {
    return { success: false, error: "This case is already archived." };
  }

  updateCase(caseId, { status: "archived" });

  const timestamp = new Date().toISOString();
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId,
    actor: session.user.id,
    action: "Archived case workspace",
    resource: `${c.number} (${c.title})`,
    at: timestamp,
    result: "warning",
    meta: "Case archived — documents preserved; access restricted to read-only.",
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  revalidatePath("/dashboard");
  revalidatePath("/audit");

  return {
    success: true,
    message: `Case ${c.number} has been archived. All documents are preserved in read-only mode.`,
  };
}

/**
 * Server Action: Revoke all external access to a document.
 */
export async function revokeDocumentAccessAction(documentId: string): Promise<ActionResult> {
  const session = await getSessionUser();

  if (!session.permissions.canShare && !session.permissions.canAdminister) {
    return {
      success: false,
      error: `Permission Denied: Role "${session.role}" cannot revoke document access.`,
    };
  }

  const doc = findDocument(documentId);
  if (!doc) {
    return { success: false, error: "Document not found." };
  }

  // Clear all shared access records
  updateDocument(documentId, { shared: [] });

  const timestamp = new Date().toISOString();
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId: doc.caseId,
    documentId: doc.id,
    actor: session.user.id,
    action: "Revoked all external access",
    resource: doc.name,
    at: timestamp,
    result: "warning",
    meta: "All share tokens invalidated. External parties no longer have access.",
  });

  revalidatePath(`/cases/${doc.caseId}/documents/${doc.id}`);
  revalidatePath("/shared");
  revalidatePath("/audit");

  return {
    success: true,
    message: `All external access to "${doc.name}" has been revoked. Audit event recorded.`,
  };
}

/**
 * Server Action: Logout — clears the session cookie and redirects to /login.
 * This is a demo app: only the role cookie is cleared.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("securecase_role");
  // Note: redirect() must be called outside try/catch in Next.js
  const { redirect } = await import("next/navigation");
  redirect("/login");
}
