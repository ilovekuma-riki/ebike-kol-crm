import { prisma } from "@/lib/db";
import { apiError, requireEditor } from "@/lib/authz";
import { noteSchema, nullableDate, nullableId } from "@/lib/crm-validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireEditor();
    const { id } = await context.params;
    const parsed = noteSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data = parsed.data;
    if (data.collaborationId) {
      const collaboration = await prisma.collaboration.findFirst({ where: { id: data.collaborationId, partnerId: id }, select: { id: true } });
      if (!collaboration) return Response.json({ error: "所选合作不属于该 Partner" }, { status: 400 });
    }
    const note = await prisma.partnerNote.create({ data: {
      partnerId: id, collaborationId: nullableId(data.collaborationId), authorId: user.id,
      noteType: data.noteType, body: data.body, nextAction: data.nextAction || null, followUpAt: nullableDate(data.followUpAt),
    }});
    return Response.json({ id: note.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
