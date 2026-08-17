import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { partnerSchema } from "@/lib/crm-validation";
import { resolveOwnerUserId } from "@/lib/owners";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const parsed = partnerSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    const ownerUserId = await resolveOwnerUserId(data.ownerUserId, data.ownerName);
    await prisma.partner.update({ where: { id }, data: {
      name: data.name,
      canonicalName: data.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, ""),
      partnerType: data.partnerType,
      creatorCountry: data.creatorCountry || null,
      targetMarket: data.targetMarket || null,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      ownerUserId,
      notesText: data.notesText || null,
    }});
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    await prisma.partner.update({ where: { id }, data: { archivedAt: new Date(), status: "paused" } });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
