"use client";
import { Button } from "@/app/_components/button";
import { Menu } from "@/app/_components/menu";
import { pushToast } from "@/app/_components/toast";
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconHistory,
  IconLink,
  IconRefresh,
  IconX,
} from "@/app/_components/icons";

export function DocumentActions({ documentId }: { documentId: string }) {
  return (
    <Menu
      trigger={<IconMore size={16} />}
      items={[
        {
          id: "preview",
          label: "Preview details",
          icon: <IconEye size={13} />,
        },
        {
          id: "verify",
          label: "Verify integrity",
          icon: <IconRefresh size={13} />,
          onClick: () =>
            pushToast({
              tone: "success",
              title: "Document verified",
              description: "Hash, signature, and anchor all match.",
            }),
        },
        {
          id: "approve",
          label: "Approve version",
          icon: <IconCheck size={13} />,
        },
        {
          id: "history",
          label: "Version history",
          icon: <IconHistory size={13} />,
        },
        {
          id: "copy",
          label: "Copy reference",
          icon: <IconCopy size={13} />,
          onClick: () =>
            pushToast({
              tone: "info",
              title: "Reference copied",
            }),
        },
        {
          id: "revoke",
          label: "Revoke access",
          icon: <IconX size={13} />,
          destructive: true,
        },
      ]}
    />
  );
}

function IconMore({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
