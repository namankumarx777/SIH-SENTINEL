"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  {
    role: "Platform Admin",
    badgeRole: "Platform",
    email: "platform@securecase.gov",
    name: "Platform Administrator",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    description: "Full platform oversight & tenant onboarding",
  },
  {
    role: "Organization Admin",
    badgeRole: "Org Admin",
    email: "arjun@cb.gov.in",
    name: "Arjun Kapoor",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    description: "Tenant administration, users & permissions",
  },
  {
    role: "Lead Investigator",
    badgeRole: "Investigator",
    email: "raj@cb.gov.in",
    name: "Inspector Raj Sharma",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    description: "Directs case proceedings & evidence intake",
  },
  {
    role: "Legal Reviewer",
    badgeRole: "Reviewer",
    email: "anita@cb.gov.in",
    name: "Anita Desai",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    description: "Evaluates legal admissibility & disclosures",
  },
  {
    role: "Forensic Officer",
    badgeRole: "Forensic",
    email: "vikram@cb.gov.in",
    name: "Vikram Iyer",
    badgeColor: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300",
    description: "Chain-of-custody verification & cryptographic hashing",
  },
  {
    role: "External Auditor",
    badgeRole: "Auditor",
    email: "neha@cb.gov.in",
    name: "Neha Verma",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
    description: "Independent ledger inspection & audit logs",
  },
  {
    role: "External Partner",
    badgeRole: "External",
    email: "external@partner.gov.in",
    name: "Sanjay Mehta",
    badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
    description: "Restricted access to shared case documents",
  },
];

const DEFAULT_DEMO_PASSWORD = "Password123!";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect after successful login
    window.location.href = "/dashboard";
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEFAULT_DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_1.15fr]">
      {/* Left Panel */}
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
                <div className="text-[12.5px] text-muted">
                  Strict boundaries for Platform Admin, Org Admin, Investigator, Reviewer, Forensic, and Auditor.
                </div>
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

      {/* Right Panel — Login Form & Role Switcher */}
      <div className="flex items-center justify-center bg-bg px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 lg:hidden mb-6">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white"
            >
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight">SecureCase</span>
          </div>

          <div>
            <div className="eyebrow mb-2">Sign in</div>
            <h2 className="t-h1 text-ink">Welcome back.</h2>
            <p className="mt-1 text-[13.5px] text-muted">
              Use your organization credentials. Sessions are logged.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red/30 bg-red-bg/60 px-4 py-3 text-[13px] text-red">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Service Email</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="arjun@cb.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-[14px] text-ink outline-none placeholder:text-subtle transition-colors focus:border-ink"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Password</span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-[14px] text-ink outline-none placeholder:text-subtle transition-colors focus:border-ink"
                />
              </label>

              <button
                id="sign-in-btn"
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-ink text-[13.5px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Signing in…" : "Sign in securely"}
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="mt-8 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Quick Demo Logins (Click to autofill)
                </span>
                <span className="text-[11px] font-mono text-muted/70">
                  Password: {DEFAULT_DEMO_PASSWORD}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemo(acc.email)}
                      className={`group flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-ink bg-surface-2 ring-1 ring-ink"
                          : "border-border/80 bg-surface hover:border-ink/40 hover:bg-surface-2/60"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="text-[12.5px] font-medium text-ink truncate">
                          {acc.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border shrink-0 ${acc.badgeColor}`}
                        >
                          {acc.badgeRole}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted truncate w-full">
                        {acc.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 text-center text-[12px] text-muted">
              By signing in, you acknowledge that session activity is recorded for audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
