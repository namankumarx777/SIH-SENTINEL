import { NextRequest, NextResponse } from "next/server";
import { findCase, documentsForCase } from "@/lib/data";
import { getSessionUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  const caseRecord = findCase(id);
  if (!caseRecord) {
    return NextResponse.json({ error: "Case docket not found." }, { status: 404 });
  }

  // External persona cannot access restricted case dockets directly
  if (session.role === "external" && caseRecord.classification === "top_secret") {
    return NextResponse.json(
      { error: "Access Denied: Unassigned external party cannot access Top Secret case docket." },
      { status: 403 }
    );
  }

  const docs = documentsForCase(id);

  return NextResponse.json({
    id: caseRecord.id,
    number: caseRecord.number,
    title: caseRecord.title,
    status: caseRecord.status,
    classification: caseRecord.classification,
    jurisdiction: caseRecord.jurisdiction,
    lead: caseRecord.lead,
    collaborators: caseRecord.collaborators,
    documentsCount: docs.length,
    documents: docs.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      classification: d.classification,
      integrity: d.integrity,
      status: d.status,
    })),
  });
}
