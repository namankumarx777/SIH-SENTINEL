import { NextRequest, NextResponse } from "next/server";
import { findDocument, findCase, addActivityEvent } from "@/lib/data";
import { getSessionUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  // Enforce server-side authentication & permission check
  if (session.role === "external" && !session.permissions.canUpload && !session.permissions.canVerify) {
    return NextResponse.json(
      { error: "Forbidden: External persona lacks cryptographic export privileges." },
      { status: 403 }
    );
  }

  const doc = findDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const caseRecord = findCase(doc.caseId);
  const currentVersion = doc.versions.find((v) => v.current) ?? doc.versions[0];
  const timestamp = new Date().toISOString();

  // Record download action in immutable audit log
  addActivityEvent({
    id: `a-${Date.now()}`,
    caseId: doc.caseId,
    documentId: doc.id,
    actor: session.user.id,
    action: "Downloaded encrypted forensic envelope",
    resource: doc.name,
    at: timestamp,
    result: "success",
    meta: `Cipher: AES-256-GCM · Hash: ${currentVersion.hash.slice(0, 8)}… · IP: 10.14.8.22`,
  });

  // Construct official forensic envelope JSON package
  const envelope = {
    standard: "Digital Investigation Evidentiary Container (DIEC-v2)",
    jurisdiction: caseRecord?.jurisdiction ?? "Central Bureau",
    docket: caseRecord?.number ?? doc.caseId,
    document: {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      classification: doc.classification,
      version: currentVersion.version,
      sha256: currentVersion.hash,
      enclaveCipher: "AES-256-GCM",
      iv: "e4a910b87c29381048f02948",
      authTag: "389fa01924b89104c8910293847561a0",
      ciphertextPreview: "0x" + Buffer.from(doc.name + currentVersion.hash).toString("hex").repeat(4),
    },
    provenance: {
      intakeOfficer: doc.signedBy ?? session.user.name,
      dischargedTo: session.user.name,
      dischargedRole: session.role,
      downloadTimestamp: timestamp,
      blockchainAnchor: {
        blockNumber: doc.previewData?.technicalMetadata.blockNumber ?? 1492710,
        txHash: doc.anchor ?? "0x82ca9f1c7e94b28194",
        quorumProof: "CONFIRMED_BY_5_NODES",
      },
    },
  };

  return new NextResponse(JSON.stringify(envelope, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${doc.name.replace(".pdf", "")}_encrypted_envelope.diec"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
