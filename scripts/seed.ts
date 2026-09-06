import "dotenv/config";
import { db } from "../lib/prisma";

// Seeded authIds for development. In production, these would be real Supabase auth.users.id.
export const DEV_USERS = {
  raj: "auth-raj-1111",
  anita: "auth-anita-2222",
  vikram: "auth-vikram-3333",
  priya: "auth-priya-4444",
  arjun: "auth-arjun-5555",
  neha: "auth-neha-6666",
  rahul: "auth-rahul-7777",
  platform: "auth-platform-0000",
  external: "auth-external-8888",
};

async function main() {
  console.log("Seeding database...");

  // 1. Organization
  const org = await db.orm.public.Organization.create({
    name: "Delhi Cyber Crime Division",
  });
  console.log(`Created Organization: ${org.name}`);

  // 2. Users
  const usersToCreate = [
    { authId: DEV_USERS.raj, email: "raj@cb.gov.in", name: "Inspector Raj Sharma", role: "INVESTIGATOR", department: "Cyber Crime Unit", badge: "INSP-44219", initials: "RS" },
    { authId: DEV_USERS.anita, email: "anita@cb.gov.in", name: "Anita Desai", role: "REVIEWER", department: "Legal Review", badge: "REV-1108", initials: "AD" },
    { authId: DEV_USERS.vikram, email: "vikram@cb.gov.in", name: "Vikram Iyer", role: "FORENSIC", department: "Forensic Lab", badge: "FOR-2207", initials: "VI" },
    { authId: DEV_USERS.priya, email: "priya@cb.gov.in", name: "Priya Menon", role: "INVESTIGATOR", department: "Economic Offences", badge: "INSP-3084", initials: "PM" },
    { authId: DEV_USERS.arjun, email: "arjun@cb.gov.in", name: "Arjun Kapoor", role: "ADMIN", department: "Org Admin", badge: "ADM-0001", initials: "AK" },
    { authId: DEV_USERS.neha, email: "neha@cb.gov.in", name: "Neha Verma", role: "AUDITOR", department: "Internal Audit", badge: "AUD-0917", initials: "NV" },
    { authId: DEV_USERS.rahul, email: "rahul@cb.gov.in", name: "Rahul Saxena", role: "REVIEWER", department: "Senior Review", badge: "REV-1209", initials: "RX" },
  ];

  const dbUsers: Record<string, any> = {};

  // Platform Admin (not part of any organization)
  const platformAdmin = await db.orm.public.User.create({
    authId: DEV_USERS.platform,
    email: "platform@securecase.gov",
    name: "Platform Administrator",
    platformRole: "PLATFORM_ADMIN",
  });
  dbUsers[DEV_USERS.platform] = platformAdmin;
  console.log(`Created Platform Admin: ${platformAdmin.name} (PLATFORM_ADMIN)`);

  // External User (not part of any organization)
  const externalUser = await db.orm.public.User.create({
    authId: DEV_USERS.external,
    email: "external@partner.gov.in",
    name: "Sanjay Mehta",
  });
  dbUsers[DEV_USERS.external] = externalUser;
  console.log(`Created External User: ${externalUser.name} (external)`);

  for (const u of usersToCreate) {
    const user = await db.orm.public.User.create({
      authId: u.authId,
      email: u.email,
      name: u.name,
    });
    dbUsers[u.authId] = user;

    await db.orm.public.OrganizationMember.create({
      organizationId: org.id,
      userId: user.id,
      role: u.role as any,
      department: u.department,
      badge: u.badge,
      initials: u.initials,
    });
    console.log(`Created User & OrgMember: ${u.name} (${u.role})`);
  }

  // 3. Cases
  const case1 = await db.orm.public.Case.create({
    title: "Cyber Fraud Investigation",
    description: "Coordinated phishing operation targeting cooperative banking customers.",
    jurisdiction: "Central Bureau",
    organizationId: org.id,
    classification: "CONFIDENTIAL",
    status: "ACTIVE",
  });
  console.log(`Created Case: CR-2026-${String(case1.caseNumber).padStart(6, "0")}`);

  const case2 = await db.orm.public.Case.create({
    title: "Vehicle Theft Investigation",
    description: "Interstate vehicle theft ring operating across three districts.",
    jurisdiction: "District North",
    organizationId: org.id,
    classification: "CONFIDENTIAL",
    status: "ACTIVE",
  });
  console.log(`Created Case: CR-2026-${String(case2.caseNumber).padStart(6, "0")}`);

  // Case Members
  // Case 1: Raj (LEAD), Anita, Vikram, Neha
  const case1Members = [
    { user: dbUsers[DEV_USERS.raj], isLead: true },
    { user: dbUsers[DEV_USERS.anita], isLead: false },
    { user: dbUsers[DEV_USERS.vikram], isLead: false },
    { user: dbUsers[DEV_USERS.neha], isLead: false },
  ];

  for (const m of case1Members) {
    await db.orm.public.CaseMember.create({
      caseId: case1.id,
      userId: m.user.id,
      isLead: m.isLead,
    });
  }

  // 4. Documents & Versions
  const doc = await db.orm.public.Document.create({
    caseId: case1.id,
    name: "FIR.pdf",
    type: "FIR",
    description: "First Information Report",
    classification: "CONFIDENTIAL",
    tags: ["primary", "complaint", "cyber"],
  });
  console.log(`Created Document: ${doc.name}`);

  await db.orm.public.DocumentVersion.create({
    documentId: doc.id,
    version: "v1.0",
    uploadedById: dbUsers[DEV_USERS.raj].id,
    hash: "0x82ca9f1a238e810cb9947f631102e88a31e13a1f",
    size: "318 KB",
    storagePath: `organization/${org.id}/cases/${case1.id}/documents/${doc.id}/v1.0.pdf`,
    notes: "Original complaint registration",
    current: true,
  });

  // 5. Audit Log
  await db.orm.public.AuditLog.create({
    organizationId: org.id,
    caseId: case1.id,
    actorId: dbUsers[DEV_USERS.raj].id,
    action: "CASE_CREATED",
    resource: case1.title,
    result: "SUCCESS",
  });

  console.log("Seeding complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
