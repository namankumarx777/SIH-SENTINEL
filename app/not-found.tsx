import Link from "next/link";
import { Button } from "@/app/_components/button";
import { IconArrowLeft, IconShieldCheck } from "@/app/_components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-ink shadow-sm">
        <IconShieldCheck size={26} />
      </div>

      <div className="mt-6 font-mono text-[12px] uppercase tracking-wider text-muted">
        404 · Secure Enclave Routing
      </div>

      <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
        Record or Dossier Not Located
      </h1>

      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
        The requested evidentiary artifact, case identifier, or workspace route either does not exist or has been archived under strict custody protocols.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" iconLeft={<IconArrowLeft size={13} />}>
            Return to Operational Workspace
          </Button>
        </Link>
        <Link href="/cases">
          <Button variant="secondary">
            Browse Active Cases
          </Button>
        </Link>
      </div>
    </div>
  );
}
