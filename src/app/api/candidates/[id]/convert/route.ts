import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { normalizeProfileUrl } from "@/lib/crm-validation";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await params;
    const candidate = await prisma.creatorCandidate.findFirst({ where: { id, archivedAt: null } });
    if (!candidate) return Response.json({ error: "候选人不存在或已转为 Partner" }, { status: 404 });

    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
    const partner = await prisma.$transaction(async tx => {
      const created = await tx.partner.create({
        data: {
          partnerCode: `KOL-${suffix}`,
          name: candidate.name,
          canonicalName: `${candidate.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "")}-${suffix.toLowerCase()}`,
          partnerType: "KOL",
          creatorCountry: candidate.country,
          targetMarket: candidate.country,
          status: "potential",
          notesText: candidate.notes,
          socialAccounts: { create: {
            platform: candidate.platform,
            handle: candidate.handle,
            profileUrl: candidate.url,
            normalizedUrl: normalizeProfileUrl(candidate.url),
            followers: candidate.followers,
            avgViews: candidate.avgViews,
            engagementRate: candidate.engagementRate,
            isPrimary: true,
          } },
        },
      });
      await tx.creatorCandidate.update({ where: { id }, data: { status: "converted", archivedAt: new Date() } });
      return created;
    });
    return Response.json({ id: partner.id });
  } catch (error) { return apiError(error); }
}
