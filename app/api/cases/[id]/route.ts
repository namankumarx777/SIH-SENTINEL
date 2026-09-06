import { requireCaseAccess } from "@/lib/auth/authorization";
import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { caseRow } = await requireCaseAccess(id);
    
    const documents = await db.orm.public.Document.where({ caseId: id }).all();

    return apiSuccess({
      case: caseRow,
      documents
    });
  } catch (error) {
    return handleApiError(error);
  }
}
