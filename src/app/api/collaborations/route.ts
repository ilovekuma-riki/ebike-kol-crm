import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { collaborationSchema, nullableDate, nullableId } from "@/lib/crm-validation";

const workflow = ["合作确认", "协议签署", "Affiliate", "折扣码", "发货", "Tracking", "签收", "开箱", "内容制作", "内容发布", "30日复盘"];

export async function POST(request: Request) {
  try {
    await requireEditor();
    const parsed = collaborationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
    const collaboration = await prisma.collaboration.create({ data: {
      collaborationCode: `COL-${suffix}`, partnerId: data.partnerId, product: data.product, sku: data.sku || null,
      targetMarket: data.targetMarket, collaborationType: data.collaborationType, cashCost: data.cashCost,
      currency: data.currency.toUpperCase(), commissionRate: data.commissionRate == null ? null : data.commissionRate / 100,
      status: data.status, priority: data.priority, ownerUserId: nullableId(data.ownerUserId),
      startDate: nullableDate(data.startDate), endDate: nullableDate(data.endDate), nextAction: data.nextAction || null,
      nextActionDate: nullableDate(data.nextActionDate),
      workflowSteps: { create: workflow.map((label, index) => ({ stepKey: `step_${index + 1}`, label, sequence: index + 1 })) },
    }});
    return Response.json({ id: collaboration.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
