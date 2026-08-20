import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { candidateSchema } from "@/lib/crm-validation";

export async function POST(request: Request) {
  try {
    await requireEditor();
    const parsed = candidateSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    const candidate = await prisma.creatorCandidate.create({
      data: {
        name: data.name,
        platform: data.platform,
        handle: data.handle || null,
        url: data.url,
        country: data.country || null,
        followers: data.followers ?? null,
        avgViews: data.avgViews ?? null,
        engagementRate: data.engagementRate == null ? null : data.engagementRate / 100,
        contentCategory: data.contentCategory || null,
        potentialScore: data.potentialScore ?? null,
        notes: data.notes || null,
      },
    });
    return Response.json({ id: candidate.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
