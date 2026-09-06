import { requireDocumentAccess } from "@/lib/auth/authorization";
import { recordAudit } from "@/lib/repos/audit";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/storage-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, documentRow, caseRow } = await requireDocumentAccess(id);

    const currentVersion = await db.orm.public.DocumentVersion.where({ documentId: id, current: true }).first() 
      ?? await db.orm.public.DocumentVersion.where({ documentId: id }).orderBy((r) => r.uploadedAt.desc()).first();

    if (!currentVersion?.storagePath) {
      return new NextResponse("Document file not found in storage", { status: 404 });
    }

    await recordAudit(user, {
      caseId: documentRow.caseId,
      documentId: documentRow.id,
      action: "Downloaded document",
      resource: String(documentRow.name),
      meta: currentVersion ? `Hash: ${String(currentVersion.hash).slice(0, 10)}…` : "",
      result: "SUCCESS",
    });

    const { data: fileData, error: downloadError } = await supabaseAdmin.client.storage
      .from(STORAGE_BUCKET)
      .download(currentVersion.storagePath);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return new NextResponse("Failed to retrieve document from storage", { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = fileData.type || "application/octet-stream";
    const fileName = String(documentRow.name).replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
