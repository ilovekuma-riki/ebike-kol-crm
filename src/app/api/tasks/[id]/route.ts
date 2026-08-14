import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { taskStatusSchema } from "@/lib/crm-validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const parsed = taskStatusSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "任务状态无效" }, { status: 400 });
    await prisma.task.update({ where: { id }, data: {
      status: parsed.data.status, completedAt: parsed.data.status === "done" ? new Date() : null,
    }});
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
