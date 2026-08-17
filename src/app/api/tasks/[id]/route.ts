import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { nullableId, taskSchema, taskStatusSchema } from "@/lib/crm-validation";
import { resolveOwnerUserId } from "@/lib/owners";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const body = await request.json();

    if (Object.keys(body).every((key) => key === "status")) {
      const parsed = taskStatusSchema.safeParse(body);
      if (!parsed.success) return Response.json({ error: "任务状态无效" }, { status: 400 });
      await prisma.task.update({ where: { id }, data: {
        status: parsed.data.status,
        completedAt: parsed.data.status === "done" ? new Date() : null,
      }});
      return Response.json({ ok: true });
    }

    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;

    if (data.collaborationId && data.partnerId) {
      const collaboration = await prisma.collaboration.findFirst({ where: { id: data.collaborationId, partnerId: data.partnerId }, select: { id: true } });
      if (!collaboration) return Response.json({ error: "所选合作不属于该 Partner" }, { status: 400 });
    }

    const ownerUserId = await resolveOwnerUserId(data.ownerUserId, data.ownerName);
    await prisma.task.update({
      where: { id },
      data: {
        partnerId: nullableId(data.partnerId),
        collaborationId: nullableId(data.collaborationId),
        title: data.title,
        description: data.description || null,
        taskType: data.taskType,
        dueDate: new Date(data.dueDate),
        status: data.status,
        priority: data.priority,
        ownerUserId,
        completedAt: data.status === "done" ? new Date() : null,
      },
    });

    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    await prisma.task.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
