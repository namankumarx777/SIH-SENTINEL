import type { CaseRecord, DocumentRecord, Classification, Person } from "@/lib/data";
import type { Action } from "@/lib/permissions/roles";

export interface CreateCaseInput {
  title: string;
  description: string;
  classification: Classification;
  jurisdiction: string;
}

export interface CaseRepository {
  listForSession(userId: string, orgId: string | null, orgRole: string | null): Promise<CaseRecord[]>;
  findById(caseId: string): Promise<CaseRecord | null>;
  create(input: CreateCaseInput, orgId: string, userId: string): Promise<{ caseRecord: CaseRecord; rawCaseId: string }>;
  archive(caseId: string, userId: string): Promise<CaseRecord>;
}

export interface DocumentRepository {
  findById(documentId: string): Promise<DocumentRecord | null>;
  listByCaseId(caseId: string): Promise<DocumentRecord[]>;
  getShare(documentId: string, recipientEmail: string): Promise<{ recipient: string; expiration: Date } | null>;
}

export interface PersonRepository {
  getPeopleByIds(userIds: string[], orgId: string): Promise<Map<string, Person>>;
}

export interface AuditRepository {
  record(
    user: { userId: string; name: string; role: string },
    params: {
      action: string;
      resource: string;
      caseId?: string;
      documentId?: string;
      result?: "SUCCESS" | "INFO" | "WARNING" | "FAILURE";
      meta?: string;
    }
  ): Promise<void>;
}

export interface AuthorizationChecker {
  hasOrganizationPermission(role: string, action: Action): boolean;
  hasCasePermission(role: string, action: Action): boolean;
}
