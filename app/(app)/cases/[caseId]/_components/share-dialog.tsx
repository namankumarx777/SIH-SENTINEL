"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { shareDocumentAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/app/_components/button";
import { Dialog } from "@/app/_components/overlay";
import { Select } from "@/app/_components/select";
import {
  IconAlertOctagon,
  IconCalendar,
  IconCheck,
  IconCircle,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconUser,
} from "@/app/_components/icons";

interface Props {
  trigger: ReactNode;
  onShared?: () => void;
  defaultResource?: string;
  caseId?: string;
  documentId?: string;
}

type Permission = "View" | "Download" | "Comment";
type Expiration = "24h" | "7d" | "30d" | "custom";

export function ShareDialog({
  trigger,
  onShared,
  defaultResource = "Case Evidence Bundle",
  caseId = "c-0142",
  documentId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<Permission>("View");
  const [expiration, setExpiration] = useState<Expiration>("7d");
  const [recipient, setRecipient] = useState("Forensic Lab Directorate");
  const [justification, setJustification] = useState("");

  const [state, formAction, isPending] = useActionState(shareDocumentAction, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      onShared?.();
    }
  }, [state, onShared]);

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">
        {trigger}
      </span>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Authorizing Inter-Agency Evidence Share"
        description="Grants time-bound, cryptographically signed access. Every inspection or download will be recorded in the immutable audit log."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11.5px] text-muted font-mono">
              AUDITED ACCESS ENCLAVE
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <ShareSubmitButton isPending={isPending} />
            </div>
          </div>
        }
      >
        <form action={formAction} className="space-y-5 text-[13px]">
          {state?.error && (
            <div className="rounded-lg border border-red/40 bg-red-bg p-3 text-[12.5px] text-red font-medium">
              {state.error}
            </div>
          )}

          {/* Hidden inputs for Server Action */}
          <input type="hidden" name="caseId" value={caseId} />
          {documentId && <input type="hidden" name="documentId" value={documentId} />}
          <input type="hidden" name="permission" value={permission} />
          <input type="hidden" name="expiration" value={expiration} />

          {/* Resource display */}
          <div className="rounded-lg border border-border bg-surface-2 p-3 text-[12.5px]">
            <span className="text-muted">Target Evidence: </span>
            <strong className="text-ink font-medium">{defaultResource}</strong>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              Authorized Recipient Agency
            </label>
            <Select
              size="md"
              name="recipient"
              value={recipient}
              onChange={setRecipient}
              className="w-full"
              aria-label="Authorized recipient agency"
              options={[
                {
                  value: "Forensic Lab Directorate",
                  label: "CFSL — Digital Forensic Lab Directorate",
                },
                {
                  value: "Senior Public Prosecutor",
                  label: "Special Prosecutor / Senior Counsel",
                },
                {
                  value: "District Court — Special Cyber Judge",
                  label: "District & Sessions Court — Cyber Bench",
                },
                {
                  value: "Financial Intelligence Unit",
                  label: "FIU-IND (Financial Intelligence Unit)",
                },
                {
                  value: "Interpol Liaison Office",
                  label: "Interpol Liaison Coordination Wing",
                },
              ]}
            />
          </div>

          {/* Explicit Permission Buttons */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              Explicit Access Privileges
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "View", label: "View Only", desc: "Browser watermarked stream" },
                  { id: "Download", label: "Download", desc: "Save signed bitstream copy" },
                  { id: "Comment", label: "Legal Review", desc: "Annotate and submit findings" },
                ] as const
              ).map((p) => {
                const active = permission === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPermission(p.id)}
                    className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors ${
                      active
                        ? "border-ink bg-surface-2 ring-1 ring-ink"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[12.5px] text-ink">
                      {active ? <IconCheck size={12} className="text-ink" /> : <IconCircle size={12} className="text-muted" />}
                      <span>{p.label}</span>
                    </div>
                    <span className="mt-1 text-[11px] text-muted leading-tight">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiration Timeframe */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              Access Expiration Window
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: "24h", label: "24 Hours" },
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "custom", label: "Court Term" },
                ] as const
              ).map((e) => {
                const active = expiration === e.id;
                return (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => setExpiration(e.id)}
                    className={`rounded-md border py-1.5 text-center text-[12px] font-medium transition-colors ${
                      active ? "border-ink bg-surface-2 text-ink" : "border-border bg-surface text-muted hover:bg-surface-2"
                    }`}
                  >
                    {e.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Justification */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              Mandatory Statutory Justification <span className="text-red">*</span>
            </label>
            <textarea
              name="justification"
              required
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State the specific legal provision, court order number, or forensic examination directive…"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
            />
            <div className="mt-1 text-[11px] text-muted">
              Must state legitimate law-enforcement purpose. Recorded verbatim in immutable ledger.
            </div>
          </div>

          {/* Institutional Audit Warning Banner */}
          <div className="rounded-lg border border-amber/30 bg-amber-bg p-3 text-[12px] leading-relaxed text-amber">
            <strong>Warning:</strong> This share will be cryptographically signed by your badge token and permanently recorded in the immutable audit log. Access automatically expires upon timeframe conclusion.
          </div>
        </form>
      </Dialog>
    </>
  );
}

function ShareSubmitButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus();
  const loading = isPending || pending;

  return (
    <Button
      type="submit"
      variant="primary"
      disabled={loading}
      iconLeft={
        loading ? (
          <IconRefresh size={13} className="animate-spin" />
        ) : (
          <IconLock size={13} />
        )
      }
    >
      {loading ? "Signing & Sharing…" : "Sign & Share Securely"}
    </Button>
  );
}
