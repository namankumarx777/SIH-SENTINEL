import { activity } from "@/lib/data";
import { AuditTimelineClient } from "./_components/audit-timeline-client";

export const instant = false;

export default function AuditPage() {
  return <AuditTimelineClient initialActivity={activity} />;
}
