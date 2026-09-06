import { requireDocumentAccess } from "@/lib/auth/authorization";
import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { documentRow, caseRow } = await requireDocumentAccess(id);
    const versions = await db.orm.public.DocumentVersion.where({ documentId: id }).all();

    return apiSuccess({
      document: {
        ...documentRow,
        versions
      },
      case: caseRow,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
