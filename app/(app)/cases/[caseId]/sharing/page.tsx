import { listAuditForCase, listAuditForOrg } from "@/lib/repos/audit";
import { requireDocumentAccess, requireCaseAccess } from "@/lib/auth/authorization";
import { findCaseForSession, listCasesForSession } from "@/lib/repos/cases";
import { getSessionUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { Avatar } from "@/app/_components/avatar";
import { Badge } from "@/app/_components/badge";
import { Button } from "@/app/_components/button";
import { IconClock, IconPlus, IconShare, IconX } from "@/app/_components/icons";
import { ShareDialog } from "../_components/share-dialog";
import { db } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default async function CaseSharing({
  params,
}: PageProps) {
  const { caseId } = await params;
  const session = await getSessionUser();
  const c = await findCaseForSession(caseId);
  if (!c) notFound();

  const documents = await db.orm.public.Document.where({ caseId }).all();
  const docIds = documents.map(d => String(d.id));

  const shares = docIds.length > 0 
    ? await db.orm.public.Share.where((s) => s.documentId.in(docIds)).all()
    : [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[13px] text-muted">{shares.length} active shares</div>
        </div>
        <ShareDialog
          trigger={
            <Button variant="primary" size="sm" iconLeft={<IconPlus size={13} />}>
              New share
            </Button>
          }
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_1fr_140px_140px_120px_140px_40px] items-center gap-3 border-b border-border bg-surface-2 px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider text-muted">
          <div>Recipient</div>
          <div>Document</div>
          <div>Permission</div>
          <div>Expires</div>
          <div>Shared by</div>
          <div>At</div>
          <div />
        </div>
        {shares.map((s: any, idx: number) => {
          const doc = documents.find((d) => String(d.id) === String(s.documentId));
          const recipient = String(s.email);
          return (
            <div
              key={s.id}
              className={`grid grid-cols-[1fr_1fr_140px_140px_120px_140px_40px] items-center gap-3 px-5 py-3.5 ${
                idx === shares.length - 1 ? "" : "border-b border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Avatar person={{ name: recipient, initials: recipient.slice(0, 2) }} size={28} />
                <div className="leading-tight">
                  <div className="text-[13.5px] font-medium text-ink">{recipient}</div>
                </div>
              </div>
              <div className="text-[13px] text-ink">{doc ? String(doc.name) : "Unknown"}</div>
              <div>
                <Badge tone="info" subtle>
                  {String(s.role)}
                </Badge>
              </div>
              <div className="text-[12.5px] text-muted">
                <IconClock size={11} className="mr-1 inline-block align-middle" />
                {String(s.expiration).split("T")[0]}
              </div>
              <div className="text-[12.5px] text-muted">{String(s.createdBy)}</div>
              <div className="text-[12.5px] text-muted">{String(s.createdAt).split("T")[0]}</div>
              <button className="text-muted hover:text-red" aria-label="Revoke">
                <IconX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
