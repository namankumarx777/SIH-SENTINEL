"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cases, type DocumentType } from "@/lib/data";
import { uploadDocumentAction, type ActionResult } from "@/lib/actions";
import { Dialog } from "@/app/_components/overlay";
import { Button } from "@/app/_components/button";
import { Select, type SelectOption } from "@/app/_components/select";
import {
  IconCheck,
  IconCircle,
  IconFile,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconUpload,
  IconX,
} from "@/app/_components/icons";

interface Props {
  trigger: ReactNode;
  defaultCaseId?: string;
  onUploaded?: () => void;
}

type Stage = "ready" | "securing" | "hashing" | "anchoring" | "completed";

const ACCEPTED = ".pdf,.e01,.raw,.pcap,.zip,application/pdf";
const MAX_SIZE_GB = 4;

export function UploadDialog({ trigger, defaultCaseId = "c-0142", onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("ready");
  const [caseId, setCaseId] = useState(defaultCaseId);
  const [name, setName] = useState("");
  const [type, setType] = useState<DocumentType>("Evidence");
  const [classification, setClassification] = useState("confidential");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(uploadDocumentAction, null);

  useEffect(() => {
    if (isPending) {
      setStage("securing");
      const t1 = setTimeout(() => setStage("hashing"), 400);
      const t2 = setTimeout(() => setStage("anchoring"), 800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (state?.success) {
      setStage("completed");
      onUploaded?.();
    } else if (state?.error) {
      setStage("ready");
    }
  }, [isPending, state, onUploaded]);

  const handleReset = () => {
    setStage("ready");
    setName("");
    setDescription("");
    setSelectedFile(null);
    setFileError(null);
    setIsDragOver(false);
  };

  const validateAndSetFile = (f: File) => {
    setFileError(null);
    if (f.size > MAX_SIZE_GB * 1024 ** 3) {
      setFileError(`File exceeds ${MAX_SIZE_GB} GB limit.`);
      return;
    }
    setSelectedFile(f);
    // Pre-fill name if empty
    if (!name) {
      setName(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  return (
    <>
      <span
        onClick={() => {
          handleReset();
          setOpen(true);
        }}
        className="inline-flex cursor-pointer"
      >
        {trigger}
      </span>

      <Dialog
        open={open}
        onClose={() => {
          if (stage !== "securing" && stage !== "hashing" && stage !== "anchoring") {
            setOpen(false);
          }
        }}
        title="Secure Evidence Intake"
        description="Evidence files are bitstream-hashed and anchored to the judicial blockchain ledger prior to repository commit."
        size="lg"
        footer={
          stage === "completed" ? (
            <Button
              variant="primary"
              onClick={() => {
                setOpen(false);
                handleReset();
              }}
            >
              Done
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11.5px] text-muted font-mono">
                ENCLAVE: AES-256 / SHA-256
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <SubmitButton isPending={isPending} />
              </div>
            </div>
          )
        }
      >
        {stage === "completed" ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-bg text-green">
              <IconShieldCheck size={28} />
            </div>
            <div>
              <h4 className="text-[16px] font-semibold text-ink">Evidence Cryptographically Secured</h4>
              <p className="mt-1 text-[13px] text-muted max-w-md mx-auto">
                {state?.message ?? "Bitstream hash successfully generated and anchored to blockchain block quorum."}
              </p>
            </div>
            {state?.data && (
              <div className="rounded-lg border border-border bg-surface-2 p-3 text-[12px] font-mono text-left max-w-md mx-auto">
                <div className="text-muted">ID: {state.data.id}</div>
                <div className="text-muted">Anchor: {state.data.anchor}</div>
                <div className="text-green font-semibold">Status: ✓ Anchored & Verified</div>
              </div>
            )}
          </div>
        ) : isPending || stage === "anchoring" ? (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <span className="h-10 w-10 animate-spin text-ink">
                <IconRefresh size={32} />
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-[15px] font-semibold text-ink">
                {stage === "securing" && "Securing bitstream into hardware enclave…"}
                {stage === "hashing" && "Computing FIPS 180-4 SHA-256 cryptographic digest…"}
                {stage === "anchoring" && "Anchoring hash to private judicial blockchain quorum…"}
              </div>
              <p className="text-[12px] text-muted">
                Establishing immutable chain of custody before physical write.
              </p>
            </div>

            {/* Stepped Progress Indicator */}
            <div className="max-w-xs mx-auto grid grid-cols-3 gap-2 text-[11px] text-muted">
              <div className={`p-2 rounded border ${stage === "securing" ? "border-ink font-semibold" : "border-border"}`}>
                1. Enclave
              </div>
              <div className={`p-2 rounded border ${stage === "hashing" ? "border-ink font-semibold" : "border-border"}`}>
                2. SHA-256
              </div>
              <div className={`p-2 rounded border ${stage === "anchoring" ? "border-ink font-semibold" : "border-border"}`}>
                3. Ledger
              </div>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 text-[13px]">
            {state?.error && (
              <div className="rounded-lg border border-red/40 bg-red-bg p-3 text-[12.5px] text-red font-medium">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Target Case Workspace
                </label>
                <Select
                  size="md"
                  name="caseId"
                  value={caseId}
                  onChange={setCaseId}
                  searchable
                  className="w-full"
                  aria-label="Target case workspace"
                  options={cases.map<SelectOption>((c) => ({
                    value: c.id,
                    label: c.number,
                    description: c.title,
                  }))}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Document / Artifact Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Forensic_Hash_Report.pdf"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Evidence Classification
                </label>
                <Select
                  size="md"
                  name="classification"
                  value={classification}
                  onChange={setClassification}
                  className="w-full"
                  aria-label="Evidence classification"
                  options={[
                    { value: "confidential", label: "Confidential" },
                    { value: "restricted", label: "Restricted / Top Secret" },
                    { value: "internal", label: "Internal Investigative" },
                    { value: "public", label: "Public Court Filing" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Evidence Category
                </label>
                <Select
                  size="md"
                  name="type"
                  value={type}
                  onChange={(v) => setType(v as DocumentType)}
                  className="w-full"
                  aria-label="Evidence category"
                  options={[
                    { value: "Evidence", label: "Digital Evidence Artifact" },
                    { value: "FIR", label: "First Information Report (FIR)" },
                    { value: "Statement", label: "Witness / Deposition Statement" },
                    { value: "Forensic", label: "Forensic Lab Extraction Report" },
                    { value: "Legal", label: "Legal Charge Sheet / Court Filing" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                Chain of Custody Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State the device origin, seizing officer, and seal verification numbers…"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
              />
            </div>

            {/* Drag & Drop Functional Zone */}
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label="Click or drag to upload a file"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? "border-ink bg-surface-2 ring-2 ring-ink/20"
                  : selectedFile
                  ? "border-green/50 bg-green-bg/30"
                  : "border-border bg-surface-2/40 hover:bg-surface-2"
              }`}
            >
              {selectedFile ? (
                <>
                  <IconCheck size={20} className="mx-auto text-green mb-2" />
                  <div className="text-[13px] font-medium text-ink">
                    {selectedFile.name}
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB · Click to replace
                  </div>
                </>
              ) : (
                <>
                  <IconUpload size={20} className="mx-auto text-muted mb-2" />
                  <div className="text-[13px] font-medium text-ink">
                    {isDragOver ? "Drop file here" : "Drag and drop raw evidence file here, or click to browse"}
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    Accepts PDF, .E01, .raw, PCAP, or forensic bundles up to 4 GB
                  </div>
                </>
              )}
            </div>
            {fileError && (
              <p className="text-[12px] text-red">{fileError}</p>
            )}
          </form>
        )}
      </Dialog>
    </>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
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
          <IconShieldCheck size={13} />
        )
      }
    >
      {loading ? "Anchoring…" : "Intake & Anchor"}
    </Button>
  );
}
