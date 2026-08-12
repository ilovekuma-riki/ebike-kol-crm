"use client";

import { FormEvent, useState } from "react";
import { Bike, LoaderCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "auth_not_configured") {
      return "线上认证尚未配置，请联系管理员完成 Supabase 环境变量设置。";
    }
    if (reason === "invalid_or_expired_link") {
      return "登录链接无效或已过期，请重新发送。";
    }
    return "";
  });
  const [sentTo, setSentTo] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const next = new URLSearchParams(location.search).get("next") || "/dashboard";

    try {
      const { error: signInError } = await createClient().auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (signInError) throw signInError;
      setSentTo(email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录邮件发送失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#111418] lg:grid-cols-[1.1fr_.9fr]">
      <section className="hidden flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-[#111418]"><Bike size={20} /></span>
          <b className="font-display text-xl">RideOps</b>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#8fa8bf]">KOL LIFECYCLE CONTROL</span>
          <h1 className="mt-5 max-w-xl font-display text-6xl font-semibold leading-[1.02]">每一次合作，<br />都应该留下可量化的里程。</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/50">EU、US、CA、BR 四站归因，从 Partner 主档到内容复投的同一个内部工作台。</p>
        </div>
        <span className="text-[10px] text-white/30">INTERNAL SYSTEM · AUTHORIZED STAFF ONLY</span>
      </section>
      <section className="grid place-items-center bg-[#fafbfc] p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <span className="mb-8 grid size-10 place-items-center rounded-xl bg-[#111418] text-white lg:hidden"><Bike size={20} /></span>
          <h2 className="font-display text-3xl font-semibold">邮箱验证登录</h2>
          <p className="mt-2 text-xs leading-5 text-[#747d86]">仅限管理员预先添加的内部邮箱。我们会发送一次性登录链接，无需密码。</p>
          {sentTo ? (
            <div className="mt-8 rounded-xl border border-[#cad7e2] bg-[#edf3f7] p-5 text-sm text-[#344b60]">
              <MailCheck className="mb-3" size={22} />
              登录邮件已发送至 <b>{sentTo}</b>，请在同一浏览器中打开邮件链接。
            </div>
          ) : (
            <>
              <label className="mt-8 block text-[11px] font-semibold">工作邮箱
                <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-[10px] border border-[#dce1e5] bg-white px-3 py-3 text-xs" placeholder="name@company.com" />
              </label>
              {error && <p className="mt-3 rounded-lg bg-[#f6e5e3] p-3 text-[11px] text-[#a2453f]">{error}</p>}
              <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#111418] py-3 text-xs font-bold text-white disabled:opacity-60">
                {loading && <LoaderCircle className="animate-spin" size={14} />} {loading ? "正在发送…" : "发送登录邮件"}
              </button>
            </>
          )}
          <p className="mt-5 text-center text-[10px] leading-5 text-[#8a929a]">未获授权的邮箱不会创建账号，也无法进入系统。</p>
        </form>
      </section>
    </main>
  );
}
