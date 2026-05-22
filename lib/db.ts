import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { join } from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.TURSO_DATABASE_URL ?? `file:${join(process.cwd(), "dev.db")}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
  return new PrismaClient({ adapter, log: ["error"] } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
