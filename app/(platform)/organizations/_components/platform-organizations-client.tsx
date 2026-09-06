"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconPlus,
  IconUsers,
  IconFolder,
  IconChevronRight,
  IconShieldCheck,
} from "@/app/_components/icons";


interface Organization {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  memberCount: number;
  caseCount: number;
}

interface Props {
  organizations: Organization[];
  platformAdminEmail: string;
}

export function PlatformOrganizationsClient({ organizations, platformAdminEmail }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [createdOrg, setCreatedOrg] = useState<{ id: string; name: string; adminEmail: string; adminName: string } | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch("/api/platform/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          initialAdminEmail: newAdminEmail,
          initialAdminName: newAdminName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Failed to create organization");
        return;
      }

      setCreatedOrg({
        id: data.organization.id,
        name: data.organization.name,
        adminEmail: data.initialAdminEmail,
        adminName: data.initialAdminName,
      });
      setNewOrgName("");
      setNewAdminEmail("");
      setNewAdminName("");
    } catch (err) {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProvisionAdmin = async (orgId: string, email: string, name: string) => {
    try {
      const res = await fetch(`/api/platform/organizations/${orgId}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to provision admin");
        return;
      }

      window.location.reload();
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-[11.5px] font-medium tracking-[0.08em] uppercase text-muted/80">
            Platform Administration
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink leading-tight mt-1">
            Organizations
          </h1>
          <p className="text-[14px] text-muted font-normal pt-1 max-w-xl">
            Manage tenant organizations and provision organization administrators.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 transition-colors"
        >
          <IconPlus size={14} />
          Create Organization
        </button>
      </header>

      {organizations.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <IconBuilding size={40} className="mx-auto text-muted/40" />
          <h3 className="mt-4 text-[16px] font-semibold text-ink">No organizations yet</h3>
          <p className="mt-1 text-[13.5px] text-muted max-w-sm mx-auto">
            Create your first tenant organization to get started with the platform.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            <IconPlus size={14} />
            Create Organization
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Users
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Cases
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Created
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-surface-2/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5">
                        <IconBuilding size={16} className="text-ink/60" />
                      </div>
                      <div>
                        <div className="font-medium text-[14px] text-ink">{org.name}</div>
                        <div className="text-[11.5px] text-muted font-mono">{org.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        org.status === "ACTIVE"
                          ? "bg-green/10 text-green"
                          : "bg-red/10 text-red"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          org.status === "ACTIVE" ? "bg-green" : "bg-red"
                        }`}
                      />
                      {org.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted">
                      <IconUsers size={14} />
                      {org.memberCount}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted">
                      <IconFolder size={14} />
                      {org.caseCount}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-muted">
                      {new Date(org.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/organizations/${org.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted hover:text-ink transition-colors"
                    >
                      Manage
                      <IconChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => !createLoading && setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-pop">
            {createdOrg ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-green/30 bg-green-bg text-green">
                  <IconShieldCheck size={26} />
                </div>
                <h2 className="mt-4 text-[18px] font-semibold text-ink">Organization Created</h2>
                <p className="mt-2 text-[13.5px] text-muted">
                  <strong>{createdOrg.name}</strong> has been created. Now provision the initial organization administrator.
                </p>
                <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4 text-left">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted mb-2">
                    Initial Admin
                  </div>
                  <div className="text-[13.5px] text-ink font-medium">{createdOrg.adminName}</div>
                  <div className="text-[12px] text-muted">{createdOrg.adminEmail}</div>
                </div>
                <button
                  onClick={() => handleProvisionAdmin(createdOrg.id, createdOrg.adminEmail, createdOrg.adminName)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 transition-colors"
                >
                  <IconShieldCheck size={14} />
                  Provision as Organization Admin
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedOrg(null);
                  }}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-[17px] font-semibold text-ink">Create Organization</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink transition-colors"
                    disabled={createLoading}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateOrg} className="mt-5 space-y-4">
                  {createError && (
                    <div className="rounded-lg border border-red/30 bg-red-bg/30 p-3 text-[12.5px] text-red">
                      {createError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[12px] font-medium text-muted mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Ministry of Home Affairs"
                      required
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink/50"
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted mb-3">
                      Initial Organization Administrator
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-medium text-muted mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="MHA Administrator"
                          required
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-muted mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="admin@mha.example"
                          required
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
                      disabled={createLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
                    >
                      {createLoading ? "Creating..." : "Create Organization"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
