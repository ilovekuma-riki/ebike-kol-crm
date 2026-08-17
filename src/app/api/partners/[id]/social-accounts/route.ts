import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { normalizeProfileUrl, socialAccountSchema } from "@/lib/crm-validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id: partnerId } = await context.params;
    const parsed = socialAccountSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;

    const partner = await prisma.partner.findFirst({ where: { id: partnerId, archivedAt: null }, select: { id: true } });
    if (!partner) return Response.json({ error: "Partner 不存在" }, { status: 404 });

    const account = await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.socialAccount.updateMany({ where: { partnerId }, data: { isPrimary: false } });
      }
      return tx.socialAccount.create({
        data: {
          partnerId,
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
        select: { id: true },
      });
    });

    return Response.json(account, { status: 201 });
  } catch (error) { return apiError(error); }
}
