import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function requireEditor() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== "development") throw new Error("UNAUTHORIZED");
    const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!user) throw new Error("NO_INTERNAL_USER");
    return user;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("UNAUTHORIZED");
  const user = await prisma.user.findFirst({
    where: { OR: [{ authUserId: data.user.id }, { email: data.user.email ?? "" }] },
  });
  if (!user || user.role === "viewer") throw new Error("FORBIDDEN");
  return user;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return Response.json({ error: "请先登录" }, { status: 401 });
  if (message === "FORBIDDEN") return Response.json({ error: "当前账号只有查看权限" }, { status: 403 });
  if (message === "NO_INTERNAL_USER") return Response.json({ error: "缺少内部用户，请先执行 Seed" }, { status: 503 });
  console.error(error);
  return Response.json({ error: "保存失败，请稍后重试" }, { status: 500 });
}
