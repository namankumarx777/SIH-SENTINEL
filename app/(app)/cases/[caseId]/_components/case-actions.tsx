"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@/app/_components/menu";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import { pushToast } from "@/app/_components/toast";
import {
  IconActivity,
  IconLink,
  IconMore,
  IconRefresh,
  IconShieldCheck,
  IconX,
} from "@/app/_components/icons";
import { archiveCaseAction } from "@/lib/actions";

export function CaseActions({ caseId }: { caseId: string }) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, startArchive] = useTransition();
  const router = useRouter();

  // ── Copy case link ──────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `/cases/${caseId}`;
    navigator.clipboard.writeText(url).then(
      () => pushToast({ tone: "success", title: "Link copied to clipboard", description: url }),
      () => pushToast({ tone: "danger", title: "Clipboard access denied", description: "Please copy the URL from the browser address bar." }),
    );
  };

  // ── Archive case ────────────────────────────────────────────────────────────
  const handleArchive = () => {
    startArchive(async () => {
      const result = await archiveCaseAction(caseId);
      setArchiveOpen(false);
      if (result.success) {
        pushToast({ tone: "success", title: "Case archived", description: result.message });
        router.push("/cases");
      } else {
        pushToast({ tone: "danger", title: "Archive failed", description: result.error });
      }
    });
  };

  return (
    <>
      <Menu
        trigger={<IconMore size={16} />}
        items={[
          {
            id: "verify",
            label: "View integrity",
            icon: <IconShieldCheck size={13} />,
            href: `/cases/${caseId}/integrity`,
          },
          {
            id: "history",
            label: "View activity",
            icon: <IconActivity size={13} />,
            href: `/cases/${caseId}/activity`,
          },
          {
            id: "link",
            label: "Copy case link",
            icon: <IconLink size={13} />,
            onClick: handleCopyLink,
          },
          {
            id: "archive",
            label: "Archive case",
            icon: <IconX size={13} />,
            destructive: true,
            onClick: () => setArchiveOpen(true),
          },
        ]}
      />

      {/* ── Archive Confirmation Dialog ── */}
      <Dialog
        open={archiveOpen}
        onClose={() => !archiving && setArchiveOpen(false)}
        title="Archive Case Workspace"
        description="This will set the case status to archived. All documents are preserved in read-only mode."
        size="sm"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => setArchiveOpen(false)} disabled={archiving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleArchive}
              disabled={archiving}
              iconLeft={archiving ? <IconRefresh size={13} className="animate-spin" /> : <IconX size={13} />}
            >
              {archiving ? "Archiving…" : "Archive Case"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-[13px]">
          <div className="rounded-lg border border-amber/30 bg-amber-bg p-3">
            <div className="font-medium text-amber text-[12.5px]">⚠ Confirm Archive</div>
            <p className="text-amber/80 text-[12px] mt-0.5">
              Archiving this case will restrict further document uploads and close the active investigation workspace.
              All existing documents remain accessible in read-only mode.
            </p>
          </div>
          <p className="text-muted text-[12px]">
            This action is recorded in the immutable audit trail under your identity and cannot be undone without administrator intervention.
          </p>
        </div>
      </Dialog>
    </>
  );
}
