"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const confirmation = String(data.get("confirmation"));

    if (password !== confirmation) {
      setError("两次输入的密码不一致，请重新输入。");
      return;
    }

    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("密码设置成功，请返回登录。" );
  }

  return <main className="grid min-h-screen place-items-center bg-[#fafbfc] p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">设置新密码</h1>
      <p className="mt-2 text-xs leading-5 text-[#747d86]">请输入至少 8 位的新密码。保存后即可使用邮箱和新密码登录。</p>
      <label className="mt-6 block text-xs font-semibold">新密码
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-2 w-full rounded-lg border p-3 text-sm" placeholder="至少 8 位" />
      </label>
      <label className="mt-4 block text-xs font-semibold">再次输入新密码
        <input name="confirmation" type="password" minLength={8} required autoComplete="new-password" className="mt-2 w-full rounded-lg border p-3 text-sm" placeholder="再次输入" />
      </label>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-3 text-xs text-green-700">{message}</p>}
      <button disabled={loading || Boolean(message)} className="mt-5 w-full rounded-lg bg-[#111418] py-3 text-sm text-white disabled:opacity-60">{loading ? "正在保存…" : "保存新密码"}</button>
      {message && <Link href="/login" className="mt-3 block w-full rounded-lg border py-3 text-center text-sm font-semibold text-[#344b60]">返回登录</Link>}
    </form>
  </main>;
}
