import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/prisma";
import {
  IconBuilding,
  IconShieldCheck,
  IconPlus,
  IconChevronRight,
} from "@/app/_components/icons";

export const instant = false;

export default async function PlatformOverviewPage() {
  await requirePlatformAdmin();

  // Real aggregate counts using Prisma 8's native .aggregate((agg) => ({ ... })) terminal.
  const [totalOrgsRes, totalMembersRes, totalAdminsRes] = await Promise.all([
    db.orm.public.Organization.where({}).aggregate((agg: any) => ({ c: agg.count() })),
    db.orm.public.OrganizationMember.where({}).aggregate((agg: any) => ({ c: agg.count() })),
    db.orm.public.OrganizationMember.where({ role: "ADMIN" }).aggregate((agg: any) => ({ c: agg.count() })),
  ]);

  const totalOrgs = Number(totalOrgsRes?.c ?? 0);
  const totalMembers = Number(totalMembersRes?.c ?? 0);
  const totalAdmins = Number(totalAdminsRes?.c ?? 0);

  // Recent organizations (last 5) for quick overview.
  // Explicitly selecting table columns ensures compatibility with database schema.
  const recentOrgRows = await (db.orm.public.Organization.where({}) as any)
    .select("id", "name", "createdAt")
    .orderBy((row: any) => row.createdAt.desc())
    .all();

  const recentOrgs = recentOrgRows.slice(0, 5).map((org: any) => ({
    id: String(org.id),
    name: String(org.name),
    status: "ACTIVE",
    createdAt: String(org.createdAt),
  }));

  const metrics = [
    {
      label: "Organizations",
      value: totalOrgs,
      sub: `${totalOrgs} active`,
      href: "/organizations",
    },
    {
      label: "Members",
      value: totalMembers,
      sub: "across all organizations",
      href: "/organizations",
    },
    {
      label: "Administrators",
      value: totalAdmins,
      sub: "organization admins",
      href: "/organizations",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-1">
        <div className="text-[11.5px] font-medium tracking-[0.08em] uppercase text-muted/70">
          Platform Administration
        </div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink leading-tight">
          Platform overview
        </h1>
        <p className="text-[14px] text-muted font-normal pt-0.5">
          Manage organizations and organization administrators.
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group rounded-xl border border-border bg-surface px-5 py-4 hover:bg-surface-2/50 transition-colors"
          >
            <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
              {m.label}
            </div>
            <div className="mt-2 text-[30px] font-semibold tracking-tight text-ink leading-none">
              {m.value}
            </div>
            <div className="mt-1 text-[12px] text-muted">{m.sub}</div>
          </Link>
        ))}
      </div>

      {/* Recent Organizations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Recent Organizations
          </h2>
          <Link
            href="/organizations"
            className="group inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition-colors"
          >
            <span>View all</span>
            <IconChevronRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {recentOrgs.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <IconBuilding size={32} className="mx-auto text-muted/30" />
            <h3 className="mt-3 text-[15px] font-semibold text-ink">No organizations yet</h3>
            <p className="mt-1 text-[13px] text-muted max-w-xs mx-auto">
              Create your first organization to begin provisioning SecureCase.
            </p>
            <Link
              href="/organizations"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              <IconPlus size={13} />
              Create Organization
            </Link>
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
                    Created
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrgs.map((org: any) => (
                  <tr key={org.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink/5">
                          <IconBuilding size={14} className="text-ink/50" />
                        </div>
                        <div>
                          <div className="font-medium text-[13.5px] text-ink">{org.name}</div>
                          <div className="text-[11px] text-muted font-mono">
                            {org.id.slice(0, 8)}&hellip;
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-green-bg text-green border border-green/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green" />
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12.5px] text-muted">
                        {new Date(org.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
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
      </section>

      {/* Platform Security Note */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink/5">
            <IconShieldCheck size={15} className="text-ink/60" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-ink">Platform security boundary</div>
            <div className="text-[12px] text-muted mt-0.5 leading-relaxed">
              Platform Admins manage organization onboarding but do not have automatic access to
              customer case documents or evidence. Customer data access requires explicit
              case-level authorization within an organization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}