"use client";

import { useTransition } from "react";
import { ROLE_METADATA } from "@/lib/roles";
import { type Role } from "@/lib/data";
import { switchRoleAction } from "@/lib/actions";
import { IconCheck, IconShieldCheck, IconUser } from "./icons";

interface Props {
  currentRole: Role;
  onRoleChanged?: () => void;
}

export function RoleSwitcher({ currentRole, onRoleChanged }: Props) {
  const [isPending, startTransition] = useTransition();

  const roles: Role[] = [
    "admin",
    "investigator",
    "reviewer",
    "forensic",
    "auditor",
  ];

  const handleSelect = (role: Role) => {
    startTransition(async () => {
      await switchRoleAction(role);
      onRoleChanged?.();
    });
  };

  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
        Switch Persona (Live RBAC Demo)
      </div>
      <div className="space-y-0.5">
        {roles.map((role) => {
          const meta = ROLE_METADATA[role];
          const isSelected = currentRole === role;

          return (
            <button
              key={role}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(role)}
              className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-surface-2 ${
                isSelected ? "bg-surface-2 font-medium text-ink" : "text-muted"
              }`}
            >
              <span className={`mt-0.5 ${isSelected ? "text-ink" : "opacity-0"}`}>
                <IconCheck size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-ink font-medium">{meta.title}</div>
                <div className="truncate text-[11px] text-muted">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
