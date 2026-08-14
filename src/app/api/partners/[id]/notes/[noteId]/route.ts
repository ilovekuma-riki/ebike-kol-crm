import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { noteSchema, nullableDate, nullableId } from "@/lib/crm-validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; noteId: string }> }) {
  try {
    await requireEditor();
    const { id, noteId } = await context.params;
    const parsed = noteSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    if (data.collaborationId) {
      const collaboration = await prisma.collaboration.findFirst({ where: { id: data.collaborationId, partnerId: id }, select: { id: true } });
      if (!collaboration) return Response.json({ error: "所选合作不属于该 Partner" }, { status: 400 });
    }
    const result = await prisma.partnerNote.updateMany({ where: { id: noteId, partnerId: id }, data: {
      collaborationId: nullableId(data.collaborationId), noteType: data.noteType, body: data.body,
      nextAction: data.nextAction || null, followUpAt: nullableDate(data.followUpAt),
    }});
    if (!result.count) return Response.json({ error: "备注不存在" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; noteId: string }> }) {
  try {
    await requireEditor();
    const { id, noteId } = await context.params;
    const result = await prisma.partnerNote.deleteMany({ where: { id: noteId, partnerId: id } });
    if (!result.count) return Response.json({ error: "备注不存在" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
