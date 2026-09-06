import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!serviceRoleKey) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set - storage operations will fail");
      _supabaseAdmin = createClient(supabaseUrl, "placeholder-key-for-build", {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = { get client() { return getSupabaseAdmin(); } };

export const STORAGE_BUCKET = "documents";

export function generateStoragePath(
  orgId: string,
  caseId: string,
  documentId: string,
  version: string,
  filename: string
): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `organization/${orgId}/cases/${caseId}/documents/${documentId}/${version}_${safeFilename}`;
}

export function parseStoragePath(storagePath: string): {
  orgId: string;
  caseId: string;
  documentId: string;
  version: string;
  filename: string;
} | null {
  const parts = storagePath.split("/");
  if (parts.length < 6 || parts[0] !== "organization") {
    return null;
  }
  const orgId = parts[1];
  const caseId = parts[3];
  const documentId = parts[5];
  const versionAndFile = parts.slice(6).join("/");
  const underscoreIdx = versionAndFile.indexOf("_");
  const version = underscoreIdx > 0 ? versionAndFile.slice(0, underscoreIdx) : "v1.0";
  const filename = underscoreIdx > 0 ? versionAndFile.slice(underscoreIdx + 1) : versionAndFile;
  return { orgId, caseId, documentId, version, filename };
}
