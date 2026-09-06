import { readFileSync } from "node:fs";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  const key = t.slice(0, i).trim();
  let val = t.slice(i + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  process.env[key] = val;
}

const { db } = await import("../lib/prisma");

const before = (await db.orm.public.Organization.all()).length;
console.log("org count before:", before);

const created = await db.orm.public.Organization.create({
  name: "Smoke Test Org",
});
console.log("created org id:", created.id, "name:", created.name, "createdAt:", created.createdAt, "updatedAt:", created.updatedAt);

const found = await db.orm.public.Organization
  .where({ id: created.id })
  .select("id", "name")
  .all();
console.log("found:", JSON.stringify(found));

const byName = await db.orm.public.Organization.where({ name: "Smoke Test Org" }).all();
console.log("by name count:", byName.length);

await db.orm.public.Organization.where({ id: created.id }).delete();
console.log("deleted");
console.log("org count after:", (await db.orm.public.Organization.all()).length);

await (db as any).$disconnect?.();