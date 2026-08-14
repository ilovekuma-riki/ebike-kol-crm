import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { nullableId, partnerSchema } from "@/lib/crm-validation";

export async function POST(request: Request) {
  try {
    await requireEditor();
    const parsed = partnerSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
    const partner = await prisma.partner.create({
      data: {
        partnerCode: `${data.partnerType === "Media" ? "MEDIA" : "KOL"}-${suffix}`,
        name: data.name,
        canonicalName: data.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, ""),
        partnerType: data.partnerType,
        creatorCountry: data.creatorCountry || null,
        targetMarket: data.targetMarket || null,
        email: data.email || null,
        phone: data.phone || null,
        status: data.status,
        ownerUserId: nullableId(data.ownerUserId),
        notesText: data.notesText || null,
        socialAccounts: data.profileUrl ? { create: {
          platform: data.platform ?? "other",
          handle: data.handle || null,
          profileUrl: data.profileUrl,
          normalizedUrl: data.profileUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").toLowerCase(),
          followers: data.followers ?? null,
          avgViews: data.avgViews ?? null,
          isPrimary: true,
        }} : undefined,
      },
    });
    return Response.json({ id: partner.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
