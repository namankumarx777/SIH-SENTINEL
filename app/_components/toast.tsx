"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { IconCheck, IconAlertTriangle, IconShieldCheck, IconX } from "./icons";

type Tone = "success" | "info" | "warning" | "error" | "danger";


interface Toast {
  id: string;
  tone: Tone;
  title: string;
  description?: string;
}

let counter = 0;
const listeners = new Set<(t: Toast) => void>();

export function pushToast(t: Omit<Toast, "id">) {
  const id = `${Date.now()}-${counter++}`;
  const toast: Toast = { id, ...t };
  listeners.forEach((l) => l(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const l = (t: Toast) => {
      setToasts((s) => [...s, t]);
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4500);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => setToasts((s) => s.filter((x) => x.id !== t.id))} />
      ))}
    </div>
  );
}

const toneIcon: Record<Tone, ReactNode> = {
  success: <IconShieldCheck size={14} />,
  info: <IconCheck size={14} />,
  warning: <IconAlertTriangle size={14} />,
  error: <IconAlertTriangle size={14} />,
  danger: <IconAlertTriangle size={14} />,
};

const toneStyle: Record<Tone, string> = {
  success: "text-green",
  info: "text-blue",
  warning: "text-amber",
  error: "text-red",
  danger: "text-red",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-lg border border-border bg-surface px-3.5 py-3 shadow-pop anim-pop"
    >
      <span className={`mt-0.5 ${toneStyle[toast.tone]}`}>{toneIcon[toast.tone]}</span>
      <div className="flex-1">
        <div className="text-[13.5px] font-medium text-ink">{toast.title}</div>
        {toast.description ? (
          <div className="mt-0.5 text-[12.5px] text-muted">{toast.description}</div>
        ) : null}
      </div>
      <button
        onClick={onDismiss}
        className="text-muted hover:text-ink"
        aria-label="Dismiss"
      >
        <IconX size={12} />
      </button>
    </div>
  );
}
