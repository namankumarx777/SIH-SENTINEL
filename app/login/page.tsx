"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo application — any credentials are accepted.
    // Set the default role cookie and navigate to the app.
    document.cookie = "securecase_role=investigator; path=/; max-age=604800; samesite=lax";
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between border-r border-border bg-surface p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white"
          >
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight">SecureCase</span>
        </div>

        <div className="max-w-md">
          <div className="eyebrow mb-4">Investigation workspace</div>
          <h1 className="t-display text-ink">
            Protect documents.
            <br />
            Preserve integrity.
            <br />
            Maintain accountability.
          </h1>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted">
            A secure operating environment for investigation teams. Every document
            is hashed, versioned, and traceable from intake to disposition.
          </p>

          <ul className="mt-10 space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
              <div>
                <div className="text-[13.5px] font-medium text-ink">Tamper-evident records</div>
                <div className="text-[12.5px] text-muted">Every change is hashed and anchored.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
              <div>
                <div className="text-[13.5px] font-medium text-ink">Role-aware access</div>
                <div className="text-[12.5px] text-muted">Permissions enforced for investigators, reviewers, and auditors.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
              <div>
                <div className="text-[13.5px] font-medium text-ink">Immutable audit trail</div>
                <div className="text-[12.5px] text-muted">Every action is recorded with actor and timestamp.</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="text-[11.5px] text-muted">
          Restricted access. Unauthorized use is prohibited and audited.
        </div>
      </div>

      <div className="flex items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 lg:hidden">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white"
            >
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight">SecureCase</span>
          </div>

          {/* Demo notice */}
          <div className="mt-6 lg:mt-0 rounded-lg border border-amber/30 bg-amber-bg px-4 py-3 text-[12.5px] text-amber">
            <strong>Demo environment.</strong> Any credentials are accepted. Use the role switcher inside the app to switch personas.
          </div>

          <div className="mt-6">
            <div className="eyebrow mb-3">Sign in</div>
            <h2 className="t-h1 text-ink">Welcome back.</h2>
            <p className="mt-2 text-[13.5px] text-muted">
              Use your organization credentials. Sessions are logged.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-4"
            >
              <Field label="Service ID" placeholder="insp-44219@cb.gov.in" type="email" defaultValue="raj.sharma@cb.gov.in" />
              <Field label="Password" placeholder="••••••••••" type="password" defaultValue="••••••••••••" />
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-[12.5px] text-muted">
                  <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-ink" />
                  Trust this device for 7 days
                  <span className="text-[11px] text-muted/60">(demo only)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowForgotMsg((v) => !v)}
                    className="text-[12.5px] text-muted hover:text-ink"
                  >
                    Forgot password
                  </button>
                  {showForgotMsg && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-surface p-3 shadow-pop text-[12px] text-muted z-10">
                      Password recovery is not available in this demo environment. Any credentials are accepted.
                      <button
                        type="button"
                        onClick={() => setShowForgotMsg(false)}
                        className="mt-2 block text-ink font-medium hover:underline text-[12px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-ink text-[13.5px] font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign in securely
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3 text-[11.5px] text-muted">
              <span className="h-px flex-1 bg-border" />
              <span>Demo — no real authentication</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <p className="mt-6 text-center text-[12px] text-muted">
              By signing in, you acknowledge that session activity is recorded for
              audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-border bg-surface px-3 text-[14px] text-ink outline-none placeholder:text-subtle transition-colors focus:border-ink"
      />
    </label>
  );
}
