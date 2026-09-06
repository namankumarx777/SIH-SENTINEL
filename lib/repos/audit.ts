import { db } from "@/lib/prisma";
import { asIsoString, auditResultToUi } from "./map";
import type { ActivityEvent } from "@/lib/data";
import type { SessionUser } from "@/lib/auth/current-user";

export type DbAuditResult = "SUCCESS" | "INFO" | "WARNING" | "FAILURE";

export interface RecordAuditInput {
  action: string;
  resource: string;
  caseId?: string | null;
  documentId?: string | null;
  meta?: string | null;
  result?: DbAuditResult;
}

export async function recordAudit(session: SessionUser, input: RecordAuditInput): Promise<void> {
  if (!session.orgId) return;
  const result = input.result ?? "SUCCESS";
  await db.orm.public.AuditLog.create({
    id: crypto.randomUUID(),
    organizationId: session.orgId,
    caseId: input.caseId ?? null,
    documentId: input.documentId ?? null,
    actorId: session.userId,
    action: input.action,
    resource: input.resource,
    meta: input.meta ?? null,
    result,
  });
}

function mapAuditRow(row: Record<string, unknown>, actorName: string | null): ActivityEvent {
  return {
    id: String(row.id),
    caseId: row.caseId ? String(row.caseId) : undefined,
    documentId: row.documentId ? String(row.documentId) : undefined,
    actor: actorName ?? String(row.actorId),
    action: String(row.action),
    resource: String(row.resource),
    at: asIsoString(row.createdAt),
    result: auditResultToUi(String(row.result)),
    meta: row.meta ? String(row.meta) : undefined,
  };
}

export async function listAuditForOrg(
  options: { limit?: number } = {},
): Promise<ActivityEvent[]> {
  const { requireOrganizationPermission } = await import("@/lib/auth/authorization");
  const session = await requireOrganizationPermission("canViewAudit");

  const rows = await db.orm.public.AuditLog.where({ organizationId: session.orgId })
    .orderBy((row) => row.createdAt.desc())
    .all();
  const limit = options.limit ?? rows.length;
  const sliced = rows.slice(0, limit);

  const actorIds = Array.from(new Set(sliced.map((r) => String(r.actorId))));
  const actorNames = new Map<string, string>();
  if (actorIds.length > 0) {
    const users = await Promise.all(
      actorIds.map((id) => db.orm.public.User.where({ id }).first())
    );
    for (const u of users) {
      if (u) actorNames.set(String(u.id), String(u.name));
    }
  }
  return sliced.map((r) => mapAuditRow(r, actorNames.get(String(r.actorId)) ?? null));
}

export async function listAuditForCase(caseId: string, limit = 200): Promise<ActivityEvent[]> {
  const { requireCaseAccess } = await import("@/lib/auth/authorization");
  await requireCaseAccess(caseId);

  const rows = await db.orm.public.AuditLog.where({ caseId })
    .orderBy((row) => row.createdAt.desc())
    .all();
  const sliced = rows.slice(0, limit);
  const actorIds = Array.from(new Set(sliced.map((r) => String(r.actorId))));
  const actorNames = new Map<string, string>();
  if (actorIds.length > 0) {
    const users = await Promise.all(
      actorIds.map((id) => db.orm.public.User.where({ id }).first())
    );
    for (const u of users) {
      if (u) actorNames.set(String(u.id), String(u.name));
    }
  }
  return sliced.map((r) => mapAuditRow(r, actorNames.get(String(r.actorId)) ?? null));
}