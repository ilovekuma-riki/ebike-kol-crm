import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { collaborationSchema, nullableDate } from "@/lib/crm-validation";
import { resolveOwnerUserId } from "@/lib/owners";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const parsed = collaborationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    const ownerUserId = await resolveOwnerUserId(data.ownerUserId, data.ownerName);

    await prisma.collaboration.update({
      where: { id },
      data: {
        partnerId: data.partnerId,
        product: data.product,
        sku: data.sku || null,
        targetMarket: data.targetMarket,
        collaborationType: data.collaborationType,
        cashCost: data.cashCost,
        currency: data.currency.toUpperCase(),
        commissionRate: data.commissionRate == null ? null : data.commissionRate / 100,
        status: data.status,
        priority: data.priority,
        ownerUserId,
        startDate: nullableDate(data.startDate),
        endDate: nullableDate(data.endDate),
        nextAction: data.nextAction || null,
        nextActionDate: nullableDate(data.nextActionDate),
      },
    });

    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    await prisma.collaboration.update({
      where: { id },
      data: { archivedAt: new Date(), status: "terminated" },
    });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
