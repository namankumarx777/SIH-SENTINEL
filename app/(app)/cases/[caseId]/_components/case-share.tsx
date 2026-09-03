"use client";
import { Button } from "@/app/_components/button";
import { pushToast } from "@/app/_components/toast";
import { IconShare } from "@/app/_components/icons";
import { ShareDialog } from "./share-dialog";

export function CaseShareButton({ caseId }: { caseId: string }) {
  return (
    <ShareDialog
      trigger={
        <Button variant="primary" iconLeft={<IconShare size={13} />}>
          Share case
        </Button>
      }
      onShared={() =>
        pushToast({
          tone: "success",
          title: "Shared successfully",
          description: "Access expires in 7 days. This action has been recorded in the audit trail.",
        })
      }
    />
  );
}
