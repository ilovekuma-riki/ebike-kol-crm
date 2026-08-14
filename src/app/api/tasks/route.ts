import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { nullableId, taskSchema } from "@/lib/crm-validation";

export async function POST(request: Request) {
  try {
    await requireEditor();
    const parsed = taskSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    if (data.collaborationId && data.partnerId) {
      const collaboration = await prisma.collaboration.findFirst({ where: { id: data.collaborationId, partnerId: data.partnerId }, select: { id: true } });
      if (!collaboration) return Response.json({ error: "所选合作不属于该 Partner" }, { status: 400 });
    }
    const task = await prisma.task.create({ data: {
      partnerId: nullableId(data.partnerId), collaborationId: nullableId(data.collaborationId), title: data.title,
      description: data.description || null, taskType: data.taskType, dueDate: new Date(data.dueDate), status: data.status,
      priority: data.priority, ownerUserId: nullableId(data.ownerUserId), completedAt: data.status === "done" ? new Date() : null,
    }});
    return Response.json({ id: task.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
