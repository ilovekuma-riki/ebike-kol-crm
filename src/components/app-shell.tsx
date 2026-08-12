"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bike, BookOpen, CheckSquare, ChevronDown, CircleDollarSign, Compass, FileUp, Handshake, LayoutDashboard, Menu, Search, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { markets } from "@/lib/demo-data";

const navigation = [
  ["/dashboard", "今日看板", LayoutDashboard], ["/partners", "Partner 主档", Users], ["/pipeline", "合作里程", Bike],
  ["/collaborations", "合作记录", Handshake], ["/content", "内容资产", BookOpen], ["/sales", "销售归因", CircleDollarSign],
  ["/tasks", "任务中心", CheckSquare], ["/discovery", "候选人", Compass], ["/imports", "数据导入", FileUp], ["/settings", "系统设置", Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const [open, setOpen] = useState(false); const [market, setMarket] = useState("Global");
  return <div className="min-h-screen bg-[#fafbfc]">
    <aside className={cn("fixed inset-y-0 left-0 z-40 w-[246px] border-r border-[#e7eaed] bg-white px-4 py-5 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="mb-8 flex items-center justify-between px-2"><Link href="/dashboard" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-[12px] bg-[#111418] text-white"><Bike size={18}/></span><span><b className="font-display text-[19px]">RideOps</b><small className="block text-[10px] uppercase tracking-[.18em] text-[#7b838c]">KOL CONTROL</small></span></Link><button className="lg:hidden" onClick={()=>setOpen(false)} aria-label="关闭菜单"><X size={20}/></button></div>
      <nav className="space-y-1">{navigation.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={cn("flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#59616b] transition-colors hover:bg-[#f4f6f8] hover:text-[#111418]", path.startsWith(href) && "bg-[#e8edf3] text-[#26384b]")}><Icon size={17}/>{label}</Link>)}</nav>
      <div className="absolute bottom-5 left-4 right-4 rounded-[14px] border border-[#e2e6e9] bg-[#fafbfc] p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-[#33755b]"/>演示数据已就绪</div><p className="text-[11px] leading-5 text-[#6d757e]">配置 Supabase 后自动切换真实数据。</p></div>
    </aside>
    {open&&<button className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={()=>setOpen(false)} aria-label="关闭遮罩"/>}
    <div className="lg:pl-[246px]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e7eaed] bg-[#fafbfc]/90 px-4 backdrop-blur-xl md:px-7"><button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="打开菜单"><Menu size={20}/></button><div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9299]" size={16}/><input className="w-full rounded-[10px] border border-[#e2e6e9] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#5b7695]" placeholder="搜索 Partner、合作、内容或订单…"/></div><div className="ml-auto flex items-center gap-2"><label className="relative"><select value={market} onChange={e=>setMarket(e.target.value)} className="appearance-none rounded-[9px] border border-[#dfe3e7] bg-white py-2 pl-3 pr-8 text-xs font-semibold">{markets.map(x=><option key={x}>{x}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" size={13}/></label><div className="hidden h-8 w-px bg-[#e2e5e8] sm:block"/><button className="hidden items-center gap-2 rounded-[9px] px-2 py-1.5 text-left sm:flex"><span className="grid size-7 place-items-center rounded-full bg-[#dbe4ed] text-[11px] font-bold text-[#31475d]">KM</span><span className="text-xs font-semibold">KOL Manager</span></button></div></header>
      <main>{children}</main>
    </div>
  </div>;
}
