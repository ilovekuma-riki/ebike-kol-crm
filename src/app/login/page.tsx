"use client";

import { FormEvent, useRef, useState } from "react";
import { Bike, CircleHelp, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PasswordMailPurpose = "first-use" | "forgot";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [mailPurpose, setMailPurpose] = useState<PasswordMailPurpose | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "auth_not_configured") return "线上认证尚未配置，请联系系统管理员检查 Supabase 环境变量。";
    if (reason === "invalid_or_expired_link") return "这个密码设置链接无效或已过期。请在下方重新申请一封邮件。";
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
      setError(message.toLowerCase().includes("invalid login credentials")
        ? "邮箱或密码不正确。如果还没设置过密码，请选择“首次登录”；如果忘记密码，请选择“忘记密码”。"
        : message);
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordMail(purpose: PasswordMailPurpose) {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setError("请先在上方填写你的工作邮箱。");
      emailRef.current?.focus();
      return;
    }
    setMailPurpose(purpose);
    setError("");
    setNotice("");
    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      if (resetError) throw resetError;
      setNotice(purpose === "first-use"
        ? "申请已提交。只有管理员已创建并授权的邮箱才会收到邮件，请检查收件箱和垃圾邮件。"
        : "申请已提交。如果这是系统中的有效账号，你会收到重设密码邮件，请只打开最新一封。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "密码设置邮件发送失败，请稍后重试");
    } finally {
      setMailPurpose(null);
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

      <section className="grid place-items-center bg-[#fafbfc] p-6 py-10">
        <div className="w-full max-w-sm">
          <form onSubmit={submit}>
            <span className="mb-8 grid size-10 place-items-center rounded-xl bg-[#111418] text-white lg:hidden"><Bike size={20} /></span>
            <h2 className="font-display text-3xl font-semibold">登录 RideOps</h2>
            <p className="mt-2 text-xs leading-5 text-[#747d86]">供已由系统管理员添加的团队成员使用。</p>

            <label className="mt-8 block text-[11px] font-semibold">工作邮箱
              <div className="relative mt-2">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9299]" />
                <input ref={emailRef} name="email" type="email" required autoComplete="email" className="w-full rounded-[10px] border border-[#dce1e5] bg-white py-3 pl-9 pr-3 text-xs outline-none focus:border-[#7f95aa] focus:ring-2 focus:ring-[#dce7f0]" placeholder="name@company.com" />
              </div>
            </label>

            <label className="mt-4 block text-[11px] font-semibold">密码
              <div className="relative mt-2">
                <LockKeyhole size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9299]" />
                <input name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" className="w-full rounded-[10px] border border-[#dce1e5] bg-white py-3 pl-9 pr-10 text-xs outline-none focus:border-[#7f95aa] focus:ring-2 focus:ring-[#dce7f0]" placeholder="输入密码" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9299] hover:text-[#344b60]" aria-label={showPassword ? "隐藏密码" : "显示密码"}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>

            {error && <p role="alert" className="mt-3 rounded-lg bg-[#f6e5e3] p-3 text-[11px] leading-5 text-[#a2453f]">{error}</p>}
            {notice && <p role="status" className="mt-3 rounded-lg bg-[#edf3f7] p-3 text-[11px] leading-5 text-[#344b60]">{notice}</p>}

            <button disabled={loading || mailPurpose !== null} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#111418] py-3 text-xs font-bold text-white disabled:opacity-60">
              {loading && <LoaderCircle className="animate-spin" size={14} />}
              {loading ? "正在登录…" : "登录"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] text-[#9aa1a8] before:h-px before:flex-1 before:bg-[#e2e6e9] after:h-px after:flex-1 after:bg-[#e2e6e9]">需要设置密码？</div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={mailPurpose !== null || loading} onClick={() => sendPasswordMail("first-use")} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-[10px] border border-[#dce1e5] bg-white px-3 text-[#344b60] hover:border-[#aebdca] disabled:opacity-50">
              {mailPurpose === "first-use" ? <LoaderCircle className="animate-spin" size={15} /> : <KeyRound size={15} />}
              <span className="text-xs font-semibold">首次登录</span><span className="text-[10px] text-[#8a929a]">设置初始密码</span>
            </button>
            <button type="button" disabled={mailPurpose !== null || loading} onClick={() => sendPasswordMail("forgot")} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-[10px] border border-[#dce1e5] bg-white px-3 text-[#344b60] hover:border-[#aebdca] disabled:opacity-50">
              {mailPurpose === "forgot" ? <LoaderCircle className="animate-spin" size={15} /> : <CircleHelp size={15} />}
              <span className="text-xs font-semibold">忘记密码</span><span className="text-[10px] text-[#8a929a]">重新设置密码</span>
            </button>
          </div>

          <aside className="mt-6 rounded-xl border border-[#dfe5e9] bg-white p-4 text-[11px] leading-5 text-[#606b75]">
            <p className="font-semibold text-[#222a31]">还没有账号？请先让管理员添加你</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>联系本系统的管理员或项目负责人。</li>
              <li>管理员在 Supabase 中邀请工作邮箱，并在 CRM 中分配权限。</li>
              <li>收到邮件后点击“首次登录”，设置密码再登录。</li>
            </ol>
            <p className="mt-2 text-[#818991]">没有收到邮件？先检查垃圾邮件；等待几分钟仍未收到，请让管理员确认邮箱拼写和邀请状态。为了账号安全，页面不会显示某个邮箱是否已经存在。</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
