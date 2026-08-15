"use client";

import Link from "next/link";
import { useState } from "react";
import { Clipboard, KeyRound, RefreshCcw, ShieldCheck, Users, Workflow } from "lucide-react";
import { PageHeader, Button } from "@/components/page-header";
import { stores } from "@/lib/demo-data";
import { StatusPill } from "@/components/status-pill";

type TabKey = "shopify" | "discounts" | "members" | "automation";
type SyncState = { status: "idle" | "loading" | "success" | "error"; message?: string; orders?: number };

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "shopify", label: "Shopify 站点" },
  { key: "discounts", label: "折扣码映射" },
  { key: "members", label: "成员与权限" },
  { key: "automation", label: "自动化" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabKey>("shopify");
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});
  const [copied, setCopied] = useState("");

  async function syncStore(code: string) {
    setSyncStates((prev) => ({ ...prev, [code]: { status: "loading", message: "正在连接 Shopify…" } }));
    try {
      const response = await fetch(`/api/shopify/stores/${code}/sync`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "同步失败");
      setSyncStates((prev) => ({
        ...prev,
        [code]: { status: "success", message: `连接成功，拉取 ${data.ordersFetched ?? 0} 个近 7 日订单`, orders: data.ordersFetched ?? 0 },
      }));
    } catch (error) {
      setSyncStates((prev) => ({
        ...prev,
        [code]: { status: "error", message: error instanceof Error ? error.message : "同步失败" },
      }));
    }
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return <div>
    <PageHeader
      eyebrow="SYSTEM SETTINGS"
      title="系统设置"
      description="管理四个 Shopify 销售站、同步状态与内部权限。密钥只从服务端环境变量读取。"
    />

    <div className="p-5 md:p-8">
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e1e5e8]">
        {tabs.map((tab) => <button
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold transition ${activeTab === tab.key ? "border-[#111418] text-[#111418]" : "border-transparent text-[#7a838b] hover:text-[#111418]"}`}
          key={tab.key}
        >{tab.label}</button>)}
      </div>

      {activeTab === "shopify" && <div>
        <div className="grid gap-4 md:grid-cols-2">
          {stores.map((s) => {
            const state = syncStates[s.code] ?? { status: "idle" as const };
            const tone = state.status === "success" ? "good" : state.status === "error" ? "danger" : "warn";
            const label = state.status === "success" ? "已连接" : state.status === "error" ? "连接失败" : state.status === "loading" ? "连接中" : s.status;
            return <section className="rounded-[16px] border border-[#e1e5e8] bg-white p-5" key={s.code}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#111418] font-mono text-xs font-bold text-white">{s.code}</span>
                  <div><h2 className="text-sm font-bold">{s.name}</h2><p className="mt-1 font-mono text-[9px] text-[#858d95]">{s.domain}</p></div>
                </div>
                <StatusPill tone={tone}>{label}</StatusPill>
              </div>

              <div className="my-5 grid grid-cols-2 gap-2 rounded-[11px] bg-[#f5f7f8] p-3 text-[10px]">
                <div><span className="text-[#7b838b]">订单币种</span><b className="mt-1 block font-mono">{s.currency}</b></div>
                <div><span className="text-[#7b838b]">最近同步</span><b className="mt-1 block">{state.status === "success" ? "刚刚" : "尚未连接"}</b></div>
              </div>

              {state.message && <p className={`mb-4 rounded-lg px-3 py-2 text-[10px] ${state.status === "error" ? "bg-[#f6e4e2] text-[#9c403a]" : state.status === "success" ? "bg-[#e4f0ea] text-[#286348]" : "bg-[#eef0f2] text-[#5d6670]"}`}>{state.message}</p>}

              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-[10px] text-[#707a83]"><KeyRound size={12}/><span className="truncate">{`SHOPIFY_ACCESS_TOKEN_${s.code}`}</span></span>
                <Button secondary disabled={state.status === "loading"} onClick={() => syncStore(s.code)}>
                  <span className="flex items-center gap-2"><RefreshCcw className={state.status === "loading" ? "animate-spin" : ""} size={11}/>{state.status === "loading" ? "连接中" : "同步"}</span>
                </Button>
              </div>
            </section>;
          })}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-[#dbe2e8] bg-white p-4">
          <ShieldCheck className="text-[#53728d]" size={18}/>
          <div><b className="text-xs">密钥不会返回浏览器</b><p className="mt-1 text-[10px] leading-5 text-[#74808a]">请在 Vercel 环境变量中配置。点击“同步”后会真实调用对应站点接口，并显示成功或失败原因。</p></div>
        </div>
      </div>}

      {activeTab === "discounts" && <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[16px] border border-[#e1e5e8] bg-white p-5">
          <h2 className="text-sm font-bold">折扣码归因</h2>
          <p className="mt-2 text-xs leading-6 text-[#707982]">同一个 KOL 的折扣码可以映射到 EU / US / CA / BR 四个站点，销售归因时统一回到同一个 Partner。</p>
          <Link href="/sales" className="mt-5 inline-flex rounded-[10px] bg-[#111418] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#293039]">查看销售归因</Link>
        </section>
        <section className="rounded-[16px] border border-[#e1e5e8] bg-white p-5">
          <h2 className="text-sm font-bold">批量导入</h2>
          <p className="mt-2 text-xs leading-6 text-[#707982]">已有 Excel / CSV 的折扣码、网红资料可以从导入页清洗并写入系统。</p>
          <Link href="/imports" className="mt-5 inline-flex rounded-[10px] border border-[#dfe3e7] bg-white px-4 py-2.5 text-xs font-semibold hover:bg-[#f4f6f8]">进入数据导入</Link>
        </section>
      </div>}

      {activeTab === "members" && <div className="rounded-[16px] border border-[#e1e5e8] bg-white p-5">
        <div className="flex items-center gap-3"><Users size={18}/><div><h2 className="text-sm font-bold">成员权限规则</h2><p className="mt-1 text-xs text-[#747d86]">当前账号权限由 public.users.role 控制。</p></div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[['admin','最高权限，可管理系统'],['manager','可管理业务与团队'],['operator','可处理日常业务'],['viewer','仅查看，不可编辑']].map(([role,desc]) => <div key={role} className="rounded-xl bg-[#f5f7f8] p-4"><b className="font-mono text-xs">{role}</b><p className="mt-2 text-[10px] leading-5 text-[#747d86]">{desc}</p></div>)}
        </div>
        <p className="mt-4 text-[10px] text-[#8a929a]">成员增删和角色编辑目前仍由管理员在 Supabase 中完成，页面不会放一个无效的“保存”按钮。</p>
      </div>}

      {activeTab === "automation" && <div className="grid gap-4 md:grid-cols-2">
        {[
          ["任务自动化", "/api/webhooks/n8n/tasks"],
          ["内容数据回写", "/api/webhooks/n8n/content-metrics"],
        ].map(([label, endpoint]) => <section key={endpoint} className="rounded-[16px] border border-[#e1e5e8] bg-white p-5">
          <div className="flex items-center gap-3"><Workflow size={18}/><h2 className="text-sm font-bold">{label}</h2></div>
          <code className="mt-4 block overflow-x-auto rounded-lg bg-[#f5f7f8] p-3 text-[10px]">{endpoint}</code>
          <Button secondary className="mt-4" onClick={() => copyText(label, endpoint)}><span className="flex items-center gap-2"><Clipboard size={12}/>{copied === label ? "已复制" : "复制接口"}</span></Button>
        </section>)}
      </div>}
    </div>
  </div>;
}
