"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconArrowLeft,
  IconUsers,
  IconPlus,
  IconShieldCheck,
  IconCheck,
} from "@/app/_components/icons";

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  badge: string;
  initials: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Props {
  organization: Organization;
  members: Member[];
  /** Aggregate count of cases in this organization — no individual case metadata is exposed. */
  caseCount: number;
  platformAdminEmail: string;
}

export function OrganizationDetailClient({
  organization,
  members: initialMembers,
  caseCount,
  platformAdminEmail,
}: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleProvisionAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/platform/organizations/${organization.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), name: adminName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to provision administrator");
        return;
      }

      setSuccessMsg(`Administrator ${adminEmail} provisioned successfully!`);
      // Add to member list locally
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userId: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: "ADMIN",
          department: "Organization Administration",
          badge: "ADM-NEW",
          initials: data.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
          createdAt: new Date().toISOString(),
        },
      ]);
      setAdminEmail("");
      setAdminName("");
      setTimeout(() => setShowAdminModal(false), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const adminCount = members.filter((m) => m.role.toUpperCase() === "ADMIN").length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-1 hover:text-ink transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>All Organizations</span>
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{organization.name}</span>
      </div>

      {/* Header Banner */}
      <header className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink text-white shadow-xs">
              <IconBuilding size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-ink">
                  {organization.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium border ${
                    organization.status === "ACTIVE"
                      ? "bg-green-bg text-green border-green/20"
                      : "bg-surface-2 text-muted border-border"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      organization.status === "ACTIVE" ? "bg-green" : "bg-muted/40"
                    }`}
                  />
                  {organization.status === "ACTIVE" ? "Active" : organization.status}
                </span>
              </div>
              <p className="mt-1 text-[13.5px] text-muted font-mono">
                Organization ID: {organization.id}
              </p>
              <div className="mt-2 text-[12.5px] text-muted">
                Created on {new Date(organization.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover shadow-xs cursor-pointer"
            >
              <IconPlus size={14} />
              <span>Provision Admin</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div>
            <div className="text-[12px] font-medium text-muted">Total Members</div>
            <div className="mt-1 text-[22px] font-semibold text-ink">{members.length}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-muted">Administrators</div>
            <div className="mt-1 text-[22px] font-semibold text-ink">{adminCount}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-muted">Cases</div>
            <div className="mt-1 text-[22px] font-semibold text-ink">{caseCount}</div>
          </div>
        </div>
      </header>

      {/* Organization Members Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUsers size={16} className="text-muted" />
            <h2 className="text-[14px] font-semibold tracking-tight text-ink uppercase tracking-[0.05em]">
              Organization Members ({members.length})
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Badge ID</th>
                <th className="px-5 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-[12px] font-semibold text-ink">
                        {member.initials || member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-semibold text-ink">{member.name}</div>
                        <div className="text-[12px] text-muted font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wider ${
                        member.role.toUpperCase() === "ADMIN"
                          ? "bg-amber/10 text-amber border border-amber/20"
                          : "bg-surface-2 text-ink border border-border"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted">
                    {member.department || "Operations"}
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] font-mono text-muted">
                    {member.badge || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-muted">
                    {new Date(member.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Provision Administrator */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !loading && setShowAdminModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-border text-ink">
                  <IconShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">Provision Organization Admin</h3>
                  <p className="text-[12.5px] text-muted">
                    Assign a new administrator to {organization.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-muted hover:text-ink transition-colors cursor-pointer text-[18px]"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red/30 bg-red-bg/60 p-3 text-[12.5px] text-red">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 rounded-lg border border-green/30 bg-green-bg/60 p-3 text-[12.5px] text-green flex items-center gap-2">
                <IconCheck size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleProvisionAdmin} className="mt-5 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Administrator Full Name</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="h-9 rounded-md border border-border bg-surface px-3 text-[13.5px] text-ink outline-none placeholder:text-subtle transition-colors focus:border-ink"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Official Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@cb.gov.in"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="h-9 rounded-md border border-border bg-surface px-3 text-[13.5px] text-ink outline-none placeholder:text-subtle transition-colors focus:border-ink"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAdminModal(false)}
                  className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-medium text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Provisioning…" : "Provision Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
