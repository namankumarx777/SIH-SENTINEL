"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type Person, type Role } from "@/lib/data";
import { Avatar } from "@/app/_components/avatar";
import { Select } from "@/app/_components/select";
import {
  IconAlertOctagon,
  IconCheck,
  IconChevronRight,
  IconLock,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconUser,
  IconX,
} from "@/app/_components/icons";

interface DepartmentInfo {
  name: string;
  head: string;
  count: number;
  description: string;
}

interface RoleInfo {
  id: Role;
  name: string;
  permissions: number;
  description: string;
  allowed: string[];
  denied: string[];
}

const DEPARTMENTS: DepartmentInfo[] = [
  {
    name: "Cyber Crime Unit",
    head: "Inspector Raj Sharma",
    count: 18,
    description: "Digital fraud, cyber extortion, and infrastructure intrusion task force.",
  },
  {
    name: "Forensic Lab",
    head: "Vikram Iyer",
    count: 9,
    description: "Bitstream preservation, hardware acquisition, and hash validation.",
  },
  {
    name: "Legal Review",
    head: "Anita Desai",
    count: 7,
    description: "Statutory charge sheet annexation, Section 65B certification, and prosecution.",
  },
  {
    name: "Economic Offences",
    head: "Priya Menon",
    count: 12,
    description: "Banking telemetry fraud, RTGS mule diversion, and corporate financial crime.",
  },
  {
    name: "Internal Audit",
    head: "Neha Verma",
    count: 4,
    description: "Continuous chain-of-custody oversight and judicial compliance inspection.",
  },
];

const ROLES: RoleInfo[] = [
  {
    id: "admin",
    name: "Organization Admin",
    permissions: 12,
    description: "Master administrative control plane over users, keys, and enclave policies.",
    allowed: ["Manage users", "Configure enclave", "Anchor ledger", "Assign roles", "Manage departments", "Audit all events"],
    denied: [],
  },
  {
    id: "investigator",
    name: "Investigator",
    permissions: 6,
    description: "Active docket creation, evidence intake, and investigation notes.",
    allowed: ["View assigned cases", "Create cases", "Upload documents", "Share evidence tokens", "Inspect hashes", "Add timeline events"],
    denied: ["Approve charge sheets", "Modify audit policy", "Manage users"],
  },
  {
    id: "reviewer",
    name: "Legal / Reviewer",
    permissions: 5,
    description: "Judicial verification, statutory review, and Section 65B sign-offs.",
    allowed: ["Review evidence", "Sign Section 65B certificates", "Approve filings", "Revoke shared tokens", "View legal docket"],
    denied: ["Acquire hardware bitstreams", "Delete evidence", "Modify roles"],
  },
  {
    id: "forensic",
    name: "Forensic Officer",
    permissions: 4,
    description: "Hardware write-blocker image acquisition, SHA-256 validation, and tamper flagging.",
    allowed: ["Acquire bitstreams", "Extract forensic images", "Verify hashes", "Flag tampering"],
    denied: ["Sign court charge sheets", "Manage users", "Authorize external shares"],
  },
  {
    id: "auditor",
    name: "Auditor",
    permissions: 3,
    description: "Read-only ledger verification and tamper-evident custody export.",
    allowed: ["View entire audit trail", "Verify blockchain quorum", "Export CSV ledger"],
    denied: ["Modify evidence", "Change cases", "Upload documents", "Manage users"],
  },
  {
    id: "external",
    name: "External Department",
    permissions: 2,
    description: "Time-bound, token-restricted read-only access to authorized exhibits.",
    allowed: ["View permitted documents", "Download authorized copies"],
    denied: ["View unassigned cases", "Upload documents", "Inspect custody keys", "Share access"],
  },
];

interface UserRecord extends Person {
  status: "active" | "invited" | "suspended";
  lastActive: string;
}

interface AdminControlCenterClientProps {
  initialPeople?: Person[];
}

export function AdminControlCenterClient({ initialPeople = [] }: AdminControlCenterClientProps) {
  const [userList, setUserList] = useState<UserRecord[]>(() =>
    initialPeople.map((p) => ({ ...p, status: "active" as const, lastActive: "recently" }))
  );

  // Modal / Drawer states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteDept, setInviteDept] = useState("Cyber Crime Unit");
  const [inviteRole, setInviteRole] = useState<Role>("investigator");

  // Suspend Confirmation State
  const [confirmSuspendUser, setConfirmSuspendUser] = useState<UserRecord | null>(null);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const initials = inviteName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      name: inviteName.trim(),
      role: inviteRole,
      department: inviteDept,
      initials,
      badge: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "invited",
      lastActive: "Pending acceptance",
    };

    setUserList([newUser, ...userList]);
    setInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
  };

  const handleToggleSuspend = (user: UserRecord) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          const newStatus = u.status === "suspended" ? "active" : "suspended";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    setConfirmSuspendUser(null);
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Page Header (Editorial, Calm, Institutional Control Center) */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="text-[11.5px] font-medium tracking-[0.08em] uppercase text-muted/80">
            Workspace
          </div>
          <h1 className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.03em] text-ink leading-tight">
            Administration
          </h1>
          <p className="text-[14.5px] text-muted max-w-2xl font-normal leading-normal">
            Manage users, departments, roles, and organization-wide security settings.
          </p>

          {/* Compact Inline Metadata */}
          <div className="pt-1 flex items-center gap-2 text-[12.5px] text-muted">
            <span className="font-medium text-ink">{userList.length} users</span>
            <span>·</span>
            <span>{DEPARTMENTS.length} departments</span>
            <span>·</span>
            <span>{ROLES.length} roles</span>
          </div>
        </div>

        {/* Primary Action: Invite User */}
        <div className="pt-1 sm:pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
          >
            <IconPlus size={14} />
            <span>Invite user</span>
          </button>
        </div>
      </header>

      {/* 2. Users Section (Primary Administrative Surface - Full Width Table) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Users
            </h2>
            <p className="text-[12.5px] text-muted/80 mt-0.5">
              Manage membership, roles, department access, and account status.
            </p>
          </div>
          <span className="text-[12px] font-mono text-muted">
            {userList.filter((u) => u.status === "active").length} active
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_200px_160px_110px_130px_110px_40px] items-center gap-4 border-b border-border bg-surface-2/40 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted/80">
            <div>User</div>
            <div>Department</div>
            <div>Role</div>
            <div>Status</div>
            <div>Last Active</div>
            <div>Badge</div>
            <div />
          </div>

          {/* User Rows */}
          <div className="divide-y divide-border">
            {userList.map((user) => {
              const isSuspended = user.status === "suspended";
              const isInvited = user.status === "invited";

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`group block lg:grid lg:grid-cols-[1fr_200px_160px_110px_130px_110px_40px] items-center gap-4 px-5 sm:px-6 py-4 transition-colors hover:bg-surface-2/60 cursor-pointer ${
                    isSuspended ? "bg-surface-2/30 opacity-75" : ""
                  }`}
                >
                  {/* Primary: Name (Dominant) + Avatar */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink text-[11px] font-semibold border border-border">
                      {user.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[15.5px] font-semibold text-ink group-hover:text-black group-hover:underline block truncate leading-snug">
                        {user.name}
                      </span>
                    </div>
                  </div>

                  {/* Secondary: Department */}
                  <div className="mt-2 lg:mt-0 text-[13px] text-muted truncate">
                    {user.department}
                  </div>

                  {/* Secondary: Role */}
                  <div className="mt-1 lg:mt-0 text-[13px] text-ink capitalize font-medium">
                    {user.role}
                  </div>

                  {/* Secondary: Status (Subtle semantic indicator) */}
                  <div className="mt-2 lg:mt-0">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium capitalize text-ink">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "active"
                            ? "bg-green"
                            : user.status === "invited"
                            ? "bg-amber"
                            : "bg-red"
                        }`}
                      />
                      <span>{user.status}</span>
                    </span>
                  </div>

                  {/* Tertiary: Last Active */}
                  <div className="mt-1 lg:mt-0 font-mono text-[12px] text-muted">
                    {user.lastActive}
                  </div>

                  {/* Tertiary: Badge */}
                  <div className="mt-1 lg:mt-0 font-mono text-[11.5px] text-muted">
                    {user.badge}
                  </div>

                  {/* Row Contextual Affordance */}
                  <div className="mt-2 lg:mt-0 text-right text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-bold text-[14px] leading-none tracking-widest">···</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Departments & Roles (Balanced Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Departments */}
        <section className="space-y-3">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Departments
            </h2>
            <p className="text-[12.5px] text-muted/80 mt-0.5">
              Organize investigators, reviewers, forensic teams, and auditors.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
            {DEPARTMENTS.map((d) => (
              <div
                key={d.name}
                onClick={() => setSelectedDept(d)}
                className="group flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-surface-2/60 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <div className="text-[15px] font-semibold text-ink group-hover:underline">
                    {d.name}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    Head: {d.head}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[12px] text-muted">
                    {d.count} members
                  </span>
                  <IconChevronRight
                    size={14}
                    className="text-muted/60 group-hover:text-ink transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Roles & Permissions */}
        <section className="space-y-3">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Roles & Permissions
            </h2>
            <p className="text-[12.5px] text-muted/80 mt-0.5">
              Control what each role can access across case dockets.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
            {ROLES.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className="group flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-surface-2/60 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <div className="text-[15px] font-semibold text-ink group-hover:underline">
                    {r.name}
                  </div>
                  <div className="font-mono text-[11.5px] text-muted">
                    {r.id}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[12px] text-muted">
                    {r.permissions} permissions
                  </span>
                  <IconChevronRight
                    size={14}
                    className="text-muted/60 group-hover:text-ink transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Immutable Audit Trail Configuration */}
      <section className="space-y-2.5 pt-1">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
          Audit Trail Configuration
        </h2>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <span className="text-[14px] font-semibold text-ink">
                Immutable Audit Chain
              </span>
              <span className="rounded-full bg-green/10 px-2 py-0.5 font-mono text-[10.5px] font-medium text-green">
                Active
              </span>
            </div>
            <p className="text-[12.5px] text-muted leading-relaxed max-w-2xl">
              Every investigative accession, cryptographic verification, and external disclosure is permanently anchored to the private ledger. Disabling is strictly restricted to Organization Admin.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[12px]">
            <span className="font-mono text-muted">
              Quorum: 5 nodes active
            </span>
            <Link
              href="/audit"
              className="inline-flex items-center gap-1 font-medium text-ink hover:underline cursor-pointer"
            >
              <span>View audit trail</span>
              <IconChevronRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Invite User Focused Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs anim-overlay"
            onClick={() => setInviteModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-pop anim-pop z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="text-[17px] font-semibold text-ink">Invite Team Member</h3>
                <p className="text-[12.5px] text-muted mt-0.5">
                  Send an invitation to join the organization workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-ink mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Inspector Kavita Rao"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-ink/50 focus:bg-surface"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="official.email@agency.gov.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-ink/50 focus:bg-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1">
                    Department
                  </label>
                  <Select
                    size="md"
                    value={inviteDept}
                    onChange={setInviteDept}
                    className="w-full"
                    aria-label="Department"
                    options={DEPARTMENTS.map((d) => ({
                      value: d.name,
                      label: d.name,
                      description: d.head,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1">
                    Role
                  </label>
                  <Select
                    size="md"
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v as Role)}
                    className="w-full"
                    align="right"
                    aria-label="Role"
                    options={ROLES.map((r) => ({
                      value: r.id,
                      label: r.name,
                      description: r.description,
                    }))}
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-ink px-4 py-2 text-[12.5px] font-medium text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
                >
                  Send invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. User Detail & Access Management Drawer (Progressive Disclosure) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs anim-overlay"
            onClick={() => setSelectedUser(null)}
          />

          <div className="relative h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-pop anim-slide z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink text-[14px] font-semibold border border-border">
                    {selectedUser.initials}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold text-ink leading-tight truncate">
                      {selectedUser.name}
                    </h3>
                    <div className="text-[12px] font-mono text-muted mt-0.5">
                      {selectedUser.badge}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Account Status Card */}
              <div className="rounded-xl border border-border bg-surface-2/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted">
                    Account Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold capitalize text-ink">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedUser.status === "active"
                          ? "bg-green"
                          : selectedUser.status === "invited"
                          ? "bg-amber"
                          : "bg-red"
                      }`}
                    />
                    {selectedUser.status}
                  </span>
                </div>
                <div className="text-[12px] text-muted">
                  Last active: <span className="font-mono text-ink">{selectedUser.lastActive}</span>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Organizational Access
                </div>

                <div className="rounded-xl border border-border bg-surface divide-y divide-border text-[13px]">
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Department</span>
                    <span className="font-medium text-ink">{selectedUser.department}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Assigned Role</span>
                    <span className="capitalize font-medium text-ink">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Audit Provenance</span>
                    <Link
                      href="/audit"
                      className="text-ink font-mono text-[12px] hover:underline"
                    >
                      View user actions →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-border space-y-2">
              <button
                type="button"
                onClick={() => setConfirmSuspendUser(selectedUser)}
                className={`w-full rounded-lg py-2 text-[12.5px] font-medium transition-colors cursor-pointer ${
                  selectedUser.status === "suspended"
                    ? "bg-green text-white hover:bg-green/90"
                    : "border border-red/30 bg-red-bg/30 text-red hover:bg-red-bg/60"
                }`}
              >
                {selectedUser.status === "suspended" ? "Reactivate user" : "Suspend user access"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-lg border border-border bg-surface py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Suspend User Deliberate Confirmation Modal */}
      {confirmSuspendUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs anim-overlay"
            onClick={() => setConfirmSuspendUser(null)}
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-pop anim-pop z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="text-[16px] font-semibold text-ink">
                {confirmSuspendUser.status === "suspended" ? "Reactivate User?" : `Suspend ${confirmSuspendUser.name}?`}
              </h3>
              <p className="text-[12.5px] text-muted leading-relaxed">
                {confirmSuspendUser.status === "suspended"
                  ? "They will regain immediate operational access to assigned case workspaces."
                  : "They will immediately lose access to assigned case workspaces. This action is permanently recorded in the immutable audit trail."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setConfirmSuspendUser(null)}
                className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[12px] font-medium text-ink hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleSuspend(confirmSuspendUser)}
                className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-white shadow-xs cursor-pointer ${
                  confirmSuspendUser.status === "suspended"
                    ? "bg-green hover:bg-green/90"
                    : "bg-red hover:bg-red/90"
                }`}
              >
                {confirmSuspendUser.status === "suspended" ? "Confirm reactivation" : "Suspend user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Department Detail Drawer */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs anim-overlay"
            onClick={() => setSelectedDept(null)}
          />

          <div className="relative h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-pop anim-slide z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Department
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink leading-tight mt-0.5">
                    {selectedDept.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[13px] text-muted leading-relaxed">
                  {selectedDept.description}
                </p>

                <div className="rounded-xl border border-border bg-surface divide-y divide-border text-[13px]">
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Designated Head</span>
                    <span className="font-semibold text-ink">{selectedDept.head}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-muted">Allocated Personnel</span>
                    <span className="font-mono text-ink">{selectedDept.count} members</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="w-full rounded-lg border border-border bg-surface py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Role & Permissions Matrix Drawer */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs anim-overlay"
            onClick={() => setSelectedRole(null)}
          />

          <div className="relative h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-pop anim-slide z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                    <span>{selectedRole.id}</span>
                    <span>·</span>
                    <span>{selectedRole.permissions} permissions</span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink leading-tight mt-0.5">
                    {selectedRole.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[13px] text-muted leading-relaxed">
                  {selectedRole.description}
                </p>

                {/* Permissions Matrix */}
                <div className="space-y-2">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Authorized Permissions
                  </div>
                  <div className="rounded-xl border border-border bg-surface divide-y divide-border text-[12.5px]">
                    {selectedRole.allowed.map((perm) => (
                      <div key={perm} className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-ink font-medium">{perm}</span>
                        <span className="text-green text-[13px] font-bold">✓</span>
                      </div>
                    ))}
                    {selectedRole.denied.map((perm) => (
                      <div key={perm} className="flex items-center justify-between px-3.5 py-2 bg-surface-2/20">
                        <span className="text-muted">{perm}</span>
                        <span className="text-muted/60 text-[13px] font-bold">✕</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="w-full rounded-lg border border-border bg-surface py-2 text-[12.5px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
