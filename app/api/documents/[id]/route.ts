import { NextRequest, NextResponse } from "next/server";
import { findDocument } from "@/lib/data";
import { getSessionUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  const doc = findDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  // External persona can only see specifically shared documents
  if (session.role === "external" && doc.classification === "top_secret") {
    return NextResponse.json(
      { error: "Access Denied: Top Secret document requires Section 65B security clearance." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    id: doc.id,
    caseId: doc.caseId,
    name: doc.name,
    type: doc.type,
    classification: doc.classification,
    status: doc.status,
    integrity: doc.integrity,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    versionsCount: doc.versions.length,
    currentVersion: doc.versions.find((v) => v.current) ?? doc.versions[0],
    blockchainAnchor: doc.anchor,
  });
}
