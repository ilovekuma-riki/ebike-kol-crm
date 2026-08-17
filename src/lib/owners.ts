import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

/**
 * Resolve an assignee from either an existing user id or a free-form name.
 * Free-form names are persisted as auth-less internal user records so every
 * existing owner relation, filter and report keeps working without schema drift.
 */
export async function resolveOwnerUserId(ownerUserId?: string | null, ownerName?: string | null) {
  if (ownerUserId) return ownerUserId;

  const name = ownerName?.trim();
  if (!name) return null;

  const existing = await prisma.user.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const generatedEmail = `owner-${randomUUID()}@rideops.local`;
  const user = await prisma.user.create({
    data: {
      name,
      email: generatedEmail,
      role: "operator",
    },
    select: { id: true },
  });

  return user.id;
}
