"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/button";
import { IconAlertOctagon, IconRefresh, IconShieldCheck } from "@/app/_components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors to console in dev
    console.error("SecureCase Enclave Handled Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red/30 bg-red-bg text-red shadow-sm">
        <IconAlertOctagon size={26} />
      </div>

      <div className="mt-6 font-mono text-[12px] uppercase tracking-wider text-red">
        Enclave Exception Caught
      </div>

      <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
        Cryptographic or Access Verification Interrupted
      </h1>

      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
        The workspace encountered an unexpected system anomaly. All evidentiary files and blockchain records remain immutable and intact.
      </p>

      {error.digest && (
        <div className="mt-3 font-mono text-[11px] text-muted">
          Digest ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => reset()}
          iconLeft={<IconRefresh size={13} />}
        >
          Retry Enclave Routine
        </Button>
        <Link href="/dashboard">
          <Button variant="secondary">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
