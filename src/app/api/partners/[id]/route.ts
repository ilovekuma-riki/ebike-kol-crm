import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { nullableId, partnerSchema } from "@/lib/crm-validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const parsed = partnerSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    await prisma.partner.update({ where: { id }, data: {
      name: data.name, canonicalName: data.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, ""),
      partnerType: data.partnerType, creatorCountry: data.creatorCountry || null,
      targetMarket: data.targetMarket || null, email: data.email || null, phone: data.phone || null,
      status: data.status, ownerUserId: nullableId(data.ownerUserId), notesText: data.notesText || null,
    }});
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
