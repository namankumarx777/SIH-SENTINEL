"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "@/app/_components/overlay";
import { Button } from "@/app/_components/button";
import {
  IconCheck,
  IconCircle,
  IconFile,
  IconShieldCheck,
  IconUpload,
  IconX,
} from "@/app/_components/icons";

interface Props {
  trigger: ReactNode;
  onUploaded?: () => void;
}

type Step = "select" | "processing" | "complete";

const STAGES = [
  { id: "upload", label: "Uploaded" },
  { id: "hash", label: "Hash generated" },
  { id: "scan", label: "Scanned" },
  { id: "index", label: "Indexing" },
  { id: "anchor", label: "Anchoring" },
];

export function UploadDialog({ trigger, onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: "FIR.pdf", size: "318 KB" },
    { name: "Witness Statement.pdf", size: "1.2 MB" },
  ]);
  const [docType, setDocType] = useState("FIR");
  const [classification, setClassification] = useState("Confidential");
  const [activeStage, setActiveStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "processing") return;
    // Initialize stage after state transition
    const init = () => setActiveStage(0);
    const timer = setTimeout(init, 10);
    const t = setInterval(() => {
      setActiveStage((s) => {
        if (s >= STAGES.length - 1) {
          clearInterval(t);
          setStep("complete");
          return s;
        }
        return s + 1;
      });
    }, 600);
    return () => {
      clearTimeout(timer);
      clearInterval(t);
    };
  }, [step]);

  function reset() {
    setStep("select");
    setActiveStage(0);
  }

  return (
    <>
      <span
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex"
      >
        {trigger}
      </span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Upload Documents"
        description="Files are encrypted, hashed, and anchored before they leave this device."
        size="lg"
        footer={
          step === "select" ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                iconLeft={<IconUpload size={13} />}
                onClick={() => setStep("processing")}
              >
                Upload {files.length} file{files.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : step === "complete" ? (
            <Button
              variant="primary"
              onClick={() => {
                setOpen(false);
                onUploaded?.();
              }}
            >
              Done
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Securing…
            </Button>
          )
        }
      >
        {step === "select" ? (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center transition-colors hover:bg-surface-3"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted">
                <IconUpload size={16} />
              </span>
              <div className="mt-3 text-[14px] font-medium text-ink">
                Drag files here
              </div>
              <div className="mt-1 text-[12.5px] text-muted">or click to browse</div>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const list = e.target.files;
                  if (!list) return;
                  setFiles(
                    Array.from(list).map((f) => ({
                      name: f.name,
                      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
                    })),
                  );
                }}
              />
            </button>

            {files.length > 0 ? (
              <div>
                <div className="eyebrow mb-2">Files</div>
                <ul className="rounded-md border border-border bg-surface">
                  {files.map((f, idx) => (
                    <li
                      key={`${f.name}-${idx}`}
                      className={`flex items-center gap-3 px-4 py-2.5 ${
                        idx === files.length - 1 ? "" : "border-b border-border"
                      }`}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-muted">
                        <IconFile size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-medium text-ink">{f.name}</div>
                      </div>
                      <div className="text-[12px] text-muted">{f.size}</div>
                      <button
                        className="text-muted hover:text-ink"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        aria-label="Remove"
                      >
                        <IconX size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Document type">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-ink outline-none"
                >
                  {["FIR", "Statement", "Forensic", "Legal", "Evidence", "Report"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Classification">
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-ink outline-none"
                >
                  {["Restricted", "Confidential", "Internal", "Public"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                placeholder="Brief description for case context"
                className="min-h-[72px] w-full rounded-md border border-border bg-surface p-3 text-[13.5px] outline-none"
              />
            </Field>
          </div>
        ) : null}

        {step === "processing" || step === "complete" ? (
          <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
            {step === "complete" ? (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-bg text-green">
                <IconShieldCheck size={20} />
              </span>
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
                <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
              </span>
            )}
            <div className="mt-4 text-[15px] font-semibold text-ink">
              {step === "complete" ? "Documents secured" : "Securing documents…"}
            </div>
            <div className="mt-1 text-[12.5px] text-muted">
              {step === "complete"
                ? "All files have been hashed and anchored to the ledger."
                : "Hashing, scanning, and anchoring are running. This usually takes under a minute."}
            </div>

            <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-1.5">
              {STAGES.map((s, idx) => {
                const done = activeStage > idx || step === "complete";
                const active = activeStage === idx && step === "processing";
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-2.5 text-left"
                  >
                    <span
                      className={
                        done
                          ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-bg text-green"
                          : active
                            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-ink"
                            : "inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-subtle"
                      }
                    >
                      {done ? <IconCheck size={11} /> : active ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" /> : <IconCircle size={11} />}
                    </span>
                    <span
                      className={`text-[13px] ${done ? "text-ink" : active ? "text-ink" : "text-muted"}`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
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
