import { db } from "@/lib/prisma";
import { requireCasePermission, requireOrganizationMembership, requireCaseAccess, requireOrganizationPermission } from "@/lib/auth/authorization";
import { type SessionUser } from "@/lib/auth/current-user";
import { asIsoString, caseStatusToUi, classificationToDb, classificationToUi, caseStatusToDb } from "./map";
import type { CaseRecord, Classification } from "@/lib/data";
import { caseNumberToUi, getPeopleByIds } from "./people";
import { recordAudit } from "./audit";

export async function listCasesForSession(): Promise<CaseRecord[]> {
  const session = await requireOrganizationMembership();
  let caseRows;

  if (session.orgRole === "ADMIN") {
    caseRows = await db.orm.public.Case.where({ organizationId: session.orgId })
      .orderBy((row) => row.updatedAt.desc())
      .all();
  } else {
    const memberships = await db.orm.public.CaseMember.where({ userId: session.userId }).all();
    const caseIds = Array.from(new Set(memberships.map((m) => String(m.caseId))));
    if (caseIds.length === 0) return [];
    
    caseRows = (await db.orm.public.Case
      .where((c) => c.id.in(caseIds))
      .all())
      .filter((c) => c.organizationId === session.orgId)
      .sort((a, b) => new Date(String(b.updatedAt)).getTime() - new Date(String(a.updatedAt)).getTime());
  }

  return await mapManyCases(caseRows, session);
}

export async function findCaseForSession(caseId: string): Promise<CaseRecord> {
  const { caseRow, user } = await requireCaseAccess(caseId);
  const arr = await mapManyCases([caseRow], user);
  return arr[0];
}

async function mapManyCases(
  rows: any[],
  session: SessionUser,
): Promise<CaseRecord[]> {
  if (rows.length === 0) return [];
  const caseIds = rows.map((r) => String(r.id));
  
  const allDocs = await db.orm.public.Document
    .where((d) => d.caseId.in(caseIds))
    .all();
  
  const counts = new Map<string, number>();
  for (const doc of allDocs) {
    const cid = String(doc.caseId);
    counts.set(cid, (counts.get(cid) ?? 0) + 1);
  }
  
  const members = await db.orm.public.CaseMember.where((m) => m.caseId.in(caseIds)).all();
  const caseMembersByCase = new Map<string, { lead: string | null; collaborators: string[] }>();
  for (const id of caseIds) caseMembersByCase.set(id, { lead: null, collaborators: [] });
  for (const m of members) {
    const cid = String(m.caseId);
    const entry = caseMembersByCase.get(cid);
    if (!entry) continue;
    const userId = String(m.userId);
    if (m.isLead) entry.lead = userId;
    entry.collaborators.push(userId);
  }

  const allUserIds = new Set<string>();
  for (const v of caseMembersByCase.values()) {
    if (v.lead) allUserIds.add(v.lead);
    for (const c of v.collaborators) allUserIds.add(c);
  }
  const people = session.orgId
    ? await getPeopleByIds(Array.from(allUserIds), session.orgId)
    : new Map();

  const out: CaseRecord[] = [];
  for (const row of rows) {
    const id = String(row.id);
    const entry = caseMembersByCase.get(id) ?? { lead: null, collaborators: [] };
    const leadPerson = entry.lead ? people.get(entry.lead) ?? null : null;
    out.push({
      id,
      number: caseNumberToUi(Number(row.caseNumber)),
      title: String(row.title),
      description: String(row.description),
      status: caseStatusToUi(String(row.status)),
      classification: classificationToUi(String(row.classification)),
      jurisdiction: String(row.jurisdiction),
      lead: leadPerson?.id ?? String(row.organizationId),
      collaborators: entry.collaborators,
      documents: counts.get(id) ?? 0,
      createdAt: asIsoString(row.createdAt),
      updatedAt: asIsoString(row.updatedAt),
    });
  }
  return out;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  classification: Classification;
  jurisdiction: string;
}

export async function createCaseForSession(
  input: CreateCaseInput,
): Promise<{ caseRecord: CaseRecord; rawCaseId: string }> {
  const session = await requireOrganizationMembership();
  
  await requireOrganizationPermission("canCreateCase");

  const newId = crypto.randomUUID();
  const created = await db.orm.public.Case.create({
    id: newId,
    // Prisma will auto-generate caseNumber due to autoincrement in postgres sequence
    title: input.title,
    description: input.description,
    status: "ACTIVE",
    classification: classificationToDb(input.classification),
    jurisdiction: input.jurisdiction || "Central Bureau",
    organizationId: String(session.orgId),
  });
  const caseNumber = Number(created.caseNumber);

  await db.orm.public.CaseMember.create({
    id: crypto.randomUUID(),
    caseId: newId,
    userId: session.userId,
    isLead: true, // The creator is the lead
  });

  await recordAudit(session, {
    action: "Initiated case workspace",
    resource: `${caseNumberToUi(caseNumber)} (${input.title})`,
    caseId: newId,
    meta: `Jurisdiction: ${input.jurisdiction || "Central Bureau"}`,
  });

  const record = await findCaseForSession(newId);
  return { caseRecord: record, rawCaseId: newId };
}

export async function archiveCaseForSession(
  caseId: string,
): Promise<CaseRecord> {
  const { user, caseRow } = await requireCasePermission(caseId, "canArchiveCase");
  
  if (String(caseRow.status) === "ARCHIVED") {
    throw new Error("This case is already archived.");
  }
  
  const now = new Date().toISOString();
  await db.orm.public.Case.where({ id: caseId }).update({
    status: caseStatusToDb("archived"),
    updatedAt: now,
  });
  
  await recordAudit(user, {
    action: "Archived case workspace",
    resource: `${caseNumberToUi(Number(caseRow.caseNumber))} (${String(caseRow.title)})`,
    caseId,
    result: "WARNING",
    meta: "Case archived — documents preserved; access restricted to read-only.",
  });
  
  return await findCaseForSession(caseId);
}
