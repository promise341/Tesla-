import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` across module reloads in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const dbUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const prisma =
  global.prisma ??
  (dbUrl
    ? new PrismaClient({ datasources: { db: { url: dbUrl } } })
    : new PrismaClient());

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;

