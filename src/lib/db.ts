import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);

    // Vercel can expose very little CPU to a function. Prisma v6 derives its
    // default pool size from available CPUs, which can result in a pool of 1.
    // RideOps pages intentionally run several independent reads in parallel,
    // so give each warm function instance a small, bounded pool instead.
    url.searchParams.set("connection_limit", "5");
    url.searchParams.set("pool_timeout", "20");
    url.searchParams.set("connect_timeout", "10");

    return url.toString();
  } catch {
    return rawUrl;
  }
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    runtimeDatabaseUrl
      ? {
          datasourceUrl: runtimeDatabaseUrl,
        }
      : undefined,
  );

// Reuse a single client in every warm runtime, including production. This
// prevents duplicate Prisma pools when Next.js loads the module more than once.
globalForPrisma.prisma = prisma;
