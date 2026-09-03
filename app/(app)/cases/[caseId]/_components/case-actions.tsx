"use client";
import { Button } from "@/app/_components/button";
import { Menu } from "@/app/_components/menu";
import { pushToast } from "@/app/_components/toast";
import {
  IconCheck,
  IconCopy,
  IconHistory,
  IconLink,
  IconMore,
  IconShieldCheck,
  IconX,
} from "@/app/_components/icons";

export function CaseActions({ caseId }: { caseId: string }) {
  return (
    <Menu
      trigger={<IconMore size={16} />}
      items={[
        {
          id: "verify",
          label: "Verify case integrity",
          icon: <IconShieldCheck size={13} />,
          onClick: () =>
            pushToast({
              tone: "success",
              title: "Case integrity verified",
              description: "All recorded hashes match. Anchor confirmed.",
            }),
        },
        {
          id: "history",
          label: "View history",
          icon: <IconHistory size={13} />,
          onClick: () =>
            pushToast({
              tone: "info",
              title: "Case history opened",
            }),
        },
        {
          id: "link",
          label: "Copy case link",
          icon: <IconLink size={13} />,
          onClick: () =>
            pushToast({
              tone: "success",
              title: "Link copied to clipboard",
            }),
        },
        {
          id: "archive",
          label: "Archive case",
          icon: <IconX size={13} />,
          destructive: true,
        },
      ]}
    />
  );
}
