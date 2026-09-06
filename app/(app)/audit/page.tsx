import { listAuditForOrg } from "@/lib/repos/audit";
import { AuditTimelineClient } from "./_components/audit-timeline-client";

export const instant = false;

export default async function AuditPage() {
  const events = await listAuditForOrg();
  return <AuditTimelineClient initialActivity={events} />;
}
