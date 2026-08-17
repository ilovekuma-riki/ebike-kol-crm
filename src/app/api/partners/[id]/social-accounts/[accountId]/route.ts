import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { normalizeProfileUrl, socialAccountSchema } from "@/lib/crm-validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; accountId: string }> }) {
  try {
    await requireEditor();
    const { id: partnerId, accountId } = await context.params;
    const parsed = socialAccountSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;

    const exists = await prisma.socialAccount.findFirst({ where: { id: accountId, partnerId }, select: { id: true } });
    if (!exists) return Response.json({ error: "社交账号不存在" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.socialAccount.updateMany({ where: { partnerId, id: { not: accountId } }, data: { isPrimary: false } });
      }
      await tx.socialAccount.update({
        where: { id: accountId },
        data: {
          platform: data.platform,
          handle: data.handle || null,
          profileUrl: data.profileUrl,
          normalizedUrl: normalizeProfileUrl(data.profileUrl),
          followers: data.followers ?? null,
          avgViews: data.avgViews ?? null,
          medianViews: data.medianViews ?? null,
          postingFrequency: data.postingFrequency || null,
          audienceCountry: data.audienceCountry || null,
          isPrimary: data.isPrimary,
        },
      });
    });

    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; accountId: string }> }) {
  try {
    await requireEditor();
    const { id: partnerId, accountId } = await context.params;
    const account = await prisma.socialAccount.findFirst({ where: { id: accountId, partnerId }, select: { id: true, isPrimary: true } });
    if (!account) return Response.json({ error: "社交账号不存在" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.content.updateMany({ where: { socialAccountId: accountId }, data: { socialAccountId: null } });
      await tx.socialAccount.delete({ where: { id: accountId } });
      if (account.isPrimary) {
        const next = await tx.socialAccount.findFirst({ where: { partnerId }, orderBy: { createdAt: "asc" }, select: { id: true } });
        if (next) await tx.socialAccount.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    });

    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
