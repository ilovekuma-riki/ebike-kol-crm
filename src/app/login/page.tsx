"use client";

import { FormEvent, useState } from "react";
import { Bike, LoaderCircle, Mail, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "auth_not_configured") {
      return "线上认证尚未配置，请联系管理员完成 Supabase 环境变量设置。";
    }
    if (reason === "invalid_or_expired_link") {
      return "设置密码链接无效或已过期，请重新发送。";
    }
    return "";
  });
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));
    const next = new URLSearchParams(location.search).get("next") || "/dashboard";

    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      window.location.assign(next);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "登录失败";
      setError(
        message.toLowerCase().includes("invalid login credentials")
          ? "邮箱或密码错误。首次使用或忘记密码，请点击下方“设置 / 忘记密码”。"
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    const input = document.querySelector<HTMLInputElement>('input[name="email"]');
    const email = input?.value.trim();
    if (!email) {
      setError("请先填写工作邮箱。" );
      return;
    }

    setResetLoading(true);
    setError("");
    setNotice("");

    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      if (resetError) throw resetError;
      setNotice("设置密码邮件已发送。请只打开最新一封邮件中的链接。" );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "设置密码邮件发送失败");
    } finally {
      setResetLoading(false);
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
          <h2 className="font-display text-3xl font-semibold">邮箱密码登录</h2>
          <p className="mt-2 text-xs leading-5 text-[#747d86]">仅限管理员预先添加的内部账号。</p>

          <label className="mt-8 block text-[11px] font-semibold">工作邮箱
            <div className="relative mt-2">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9299]" />
              <input name="email" type="email" required autoComplete="email" className="w-full rounded-[10px] border border-[#dce1e5] bg-white py-3 pl-9 pr-3 text-xs" placeholder="name@company.com" />
            </div>
          </label>

          <label className="mt-4 block text-[11px] font-semibold">密码
            <div className="relative mt-2">
              <LockKeyhole size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9299]" />
              <input name="password" type="password" required autoComplete="current-password" className="w-full rounded-[10px] border border-[#dce1e5] bg-white py-3 pl-9 pr-3 text-xs" placeholder="输入密码" />
            </div>
          </label>

          {error && <p className="mt-3 rounded-lg bg-[#f6e5e3] p-3 text-[11px] text-[#a2453f]">{error}</p>}
          {notice && <p className="mt-3 rounded-lg bg-[#edf3f7] p-3 text-[11px] text-[#344b60]">{notice}</p>}

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#111418] py-3 text-xs font-bold text-white disabled:opacity-60">
            {loading && <LoaderCircle className="animate-spin" size={14} />}
            {loading ? "正在登录…" : "登录"}
          </button>

          <button type="button" disabled={resetLoading} onClick={sendReset} className="mt-3 w-full py-2 text-xs font-semibold text-[#4e6b88] disabled:opacity-50">
            {resetLoading ? "正在发送…" : "首次使用 / 设置 / 忘记密码"}
          </button>

          <p className="mt-5 text-center text-[10px] leading-5 text-[#8a929a]">未获授权的邮箱无法进入系统。</p>
        </form>
      </section>
    </main>
  );
}
