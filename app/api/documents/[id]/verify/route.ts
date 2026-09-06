import { requireDocumentAccess, requireCasePermission } from "@/lib/auth/authorization";
import { recordAudit } from "@/lib/repos/audit";
import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, documentRow, caseRow } = await requireDocumentAccess(id);
    await requireCasePermission(String(caseRow.id), "canVerifyIntegrity");

    await db.orm.public.Document.where({ id }).update({
      integrity: "VERIFIED"
    });

    await recordAudit(user, {
      caseId: documentRow.caseId,
      documentId: documentRow.id,
      action: "Initiated document signature validation",
      resource: String(documentRow.name),
      result: "SUCCESS",
    });

    return apiSuccess({ verified: true });
  } catch (error) {
    return handleApiError(error);
  }
}
