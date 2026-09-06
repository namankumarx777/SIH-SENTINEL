import { NextRequest, NextResponse } from "next/server";
import { findDocument } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { verifyDocumentIntegrityAction } from "@/lib/actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  if (!session.permissions.canVerify) {
    return NextResponse.json(
      { error: "Forbidden: Role does not possess verification authorization." },
      { status: 403 }
    );
  }

  const doc = findDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const result = await verifyDocumentIntegrityAction(id);
  return NextResponse.json(result);
}
