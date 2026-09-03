"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import {
  IconCalendar,
  IconCheck,
  IconCircle,
  IconLock,
  IconUser,
} from "@/app/_components/icons";

interface Props {
  trigger: ReactNode;
  onShared?: () => void;
  defaultResource?: string;
}

type Permission = "view" | "download" | "edit";
type Expiration = "24h" | "7d" | "30d" | "custom";

export function ShareDialog({ trigger, onShared, defaultResource = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<Permission>("view");
  const [expiration, setExpiration] = useState<Expiration>("7d");
  const [recipient, setRecipient] = useState("Forensic Department");
  const [reason, setReason] = useState("Investigation requirement");

  const expiresLabel: Record<Expiration, string> = {
    "24h": "24 hours",
    "7d": "7 days",
    "30d": "30 days",
    custom: "custom",
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex">
        {trigger}
      </span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Share Document"
        description="Choose recipient, permission, and expiration. Sharing is recorded in the audit trail."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              iconLeft={<IconLock size={13} />}
              onClick={() => {
                setOpen(false);
                onShared?.();
              }}
            >
              Share securely
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Recipient">
            <Select value={recipient} onChange={setRecipient} options={["Forensic Department", "Legal Review Board", "External Department — District Court", "Senior Counsel"]} />
          </Field>

          <Field label="Permission">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "view", label: "View", desc: "Read only" },
                  { id: "download", label: "Download", desc: "Save copies" },
                  { id: "edit", label: "Edit", desc: "Modify + sign" },
                ] as const
              ).map((p) => {
                const active = permission === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPermission(p.id)}
                    className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-ink bg-surface-2"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <span className={`mt-0.5 inline-flex ${active ? "text-ink" : "text-muted"}`}>
                      {active ? <IconCheck size={13} /> : <IconCircle size={13} />}
                    </span>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-ink">{p.label}</div>
                      <div className="text-[11.5px] text-muted">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Expiration">
            <div className="flex flex-wrap gap-2">
              {(["24h", "7d", "30d", "custom"] as Expiration[]).map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setExpiration(e)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors ${
                    expiration === e
                      ? "border-ink bg-surface-2 text-ink"
                      : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <IconCalendar size={12} />
                  {expiresLabel[e]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Reason">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] w-full rounded-md border border-border bg-surface p-3 text-[13.5px] text-ink outline-none transition-colors focus:border-ink"
            />
          </Field>

          <div className="rounded-md border border-border bg-surface-2 px-3.5 py-3 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-2 text-ink">
              <IconUser size={12} /> {recipient}
            </span>
            <span className="mx-2 text-subtle">·</span>
            <span>{permission} access</span>
            <span className="mx-2 text-subtle">·</span>
            <span>expires in {expiresLabel[expiration]}</span>
            <div className="mt-2">This share will be recorded in the audit trail.</div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3">
      <IconUser size={13} className="text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full bg-transparent text-[13.5px] text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
