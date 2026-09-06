import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../prisma/contract";
import contractJson from "../prisma/contract.json" with { type: "json" };

function createDb() {
  return postgres<Contract>({
    contractJson,
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  });
}

const globalForDb = globalThis as unknown as {
  __securecaseDb?: ReturnType<typeof createDb>;
};

export const db = globalForDb.__securecaseDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__securecaseDb = db;
}