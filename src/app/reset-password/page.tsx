"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));

    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("密码设置成功，请返回登录。" );
  }

  return <main className="grid min-h-screen place-items-center bg-[#fafbfc] p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">设置新密码</h1>
      <p className="mt-2 text-xs text-[#747d86]">设置后即可使用邮箱和密码登录。</p>
      <input name="password" type="password" minLength={6} required className="mt-6 w-full rounded-lg border p-3 text-sm" placeholder="新密码" />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-3 text-xs text-green-700">{message}</p>}
      <button className="mt-5 w-full rounded-lg bg-[#111418] py-3 text-sm text-white">保存密码</button>
    </form>
  </main>;
}
