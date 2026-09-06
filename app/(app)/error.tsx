"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/button";
import { IconShield, IconArrowLeft } from "@/app/_components/icons";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  const isAuthError = error.message?.includes("Forbidden") || error.status === 403;

  if (isAuthError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red/30 bg-red-bg text-red shadow-sm">
          <IconShield size={26} />
        </div>

        <div className="mt-6 font-mono text-[12px] uppercase tracking-wider text-red">
          Access Restricted
        </div>

        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
          Insufficient Organization Permissions
        </h1>

        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
          You do not have permission to view organization audit logs.
          Contact an organization administrator if you require access.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" iconLeft={<IconArrowLeft size={13} />}>
              Return to Dashboard
            </Button>
          </Link>
          <Button variant="primary" onClick={() => reset()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red/30 bg-red-bg text-red shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="mt-6 font-mono text-[12px] uppercase tracking-wider text-red">
        Unexpected Error
      </div>

      <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-ink">
        Workspace Encountered an Error
      </h1>

      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
        The workspace encountered an unexpected system anomaly. All evidentiary
        files and blockchain records remain immutable and intact.
      </p>

      {error.digest && (
        <div className="mt-3 font-mono text-[11px] text-muted">
          Digest ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="secondary" iconLeft={<IconArrowLeft size={13} />}>
            Return to Dashboard
          </Button>
        </Link>
        <Button variant="primary" onClick={() => reset()}>
          Retry
        </Button>
      </div>
      <div className="mt-4 font-mono text-[11px] text-muted/60 max-w-lg break-all">
        {error.message}
      </div>
    </div>
  );
}
