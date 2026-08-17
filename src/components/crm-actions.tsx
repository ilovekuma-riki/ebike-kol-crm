"use client";

import { FormEvent, ReactNode, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Plus, Trash2, X } from "lucide-react";

type Option = { id: string; name: string };
type CollaborationOption = Option & { partnerId?: string; product?: string };

export type CollaborationInitial = {
  partnerId: string;
  product: string;
  sku?: string | null;
  targetMarket: string;
  collaborationType: string;
  cashCost: string | number;
  currency: string;
  commissionRate?: string | number | null;
  status: string;
  priority: string;
  ownerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextAction?: string | null;
  nextActionDate?: string | null;
};

export type TaskInitial = {
  partnerId?: string | null;
  collaborationId?: string | null;
  title: string;
  description?: string | null;
  taskType: string;
  dueDate: string;
  status: string;
  priority: string;
  ownerName?: string | null;
};

export type SocialAccountInitial = {
  id: string;
  platform: string;
  handle?: string | null;
  profileUrl: string;
  followers?: number | null;
  avgViews?: number | null;
  medianViews?: number | null;
  postingFrequency?: string | null;
  audienceCountry?: string | null;
  isPrimary: boolean;
};

const input = "w-full rounded-[10px] border border-[#dfe3e7] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#91a4b5]";
const label = "space-y-1.5 text-[11px] font-semibold text-[#59616b]";
const subtleButton = "rounded-[10px] border border-[#dfe3e7] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#f4f6f8]";

function Modal({ title, description, trigger, children, open: controlledOpen, onOpenChange }: { title: string; description: string; trigger?: ReactNode; children: (close: () => void) => ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    onOpenChange?.(value);
    if (controlledOpen === undefined) setInternalOpen(value);
  };
  return <>
    {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
    {isOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-3" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="w-[min(760px,100%)] rounded-[18px] border border-[#dfe3e7] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e7eaed] p-5">
          <div><h2 className="font-display text-2xl font-semibold">{title}</h2><p className="mt-1 text-xs text-[#707982]">{description}</p></div>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-[#f0f2f4]" aria-label="关闭"><X size={17}/></button>
        </div>
        {children(() => setOpen(false))}
      </section>
    </div>}
  </>;
}

function SubmitBar({ close, busy, error, submitText = "保存" }: { close: () => void; busy: boolean; error: string; submitText?: string }) {
  return <div className="flex items-center gap-3 border-t border-[#e7eaed] px-5 py-4">
    <p className="mr-auto text-xs text-[#b64d46]" role="alert">{error}</p>
    <button type="button" onClick={close} className={subtleButton}>取消</button>
    <button disabled={busy} className="rounded-[10px] bg-[#111418] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "保存中…" : submitText}</button>
  </div>;
}

function OwnerInput({ users, defaultValue = "" }: { users: Option[]; defaultValue?: string | null }) {
  const listId = useId();
  return <label className={label}>负责人
    <input name="ownerName" list={listId} defaultValue={defaultValue ?? ""} className={input} placeholder="可选择，也可直接输入名字" />
    <datalist id={listId}>{users.map(x => <option key={x.id} value={x.name} />)}</datalist>
    <span className="block text-[9px] font-normal text-[#9299a0]">输入新名字后会自动保存为负责人</span>
  </label>;
}

async function send(url: string, method: string, data?: Record<string, unknown>) {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "操作失败");
  return result;
}

export function PartnerForm({ users, initial, partnerId }: { users: Option[]; initial?: Record<string, string | number | null>; partnerId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const edit = Boolean(partnerId);

  async function submit(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault(); setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await send(edit ? `/api/partners/${partnerId}` : "/api/partners", edit ? "PATCH" : "POST", values);
      close();
      if (edit) router.refresh(); else router.push(`/partners/${result.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "保存失败"); }
    finally { setBusy(false); }
  }

  return <Modal title={edit ? "编辑 Partner 主档" : "新建 Partner"} description="维护稳定基础信息；合作、备注和社交账号在 Partner 页面单独管理。" trigger={<button className={edit ? subtleButton : "rounded-[10px] bg-[#111418] px-4 py-2.5 text-xs font-semibold text-white"}>{edit ? <span className="flex items-center gap-2"><Pencil size={13}/>编辑主档</span> : <span className="flex items-center gap-2"><Plus size={14}/>新建 Partner</span>}</button>}>
    {close => <form onSubmit={e => submit(e, close)}>
      <div className="grid max-h-[65vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
        <label className={label}>名称 *<input name="name" required defaultValue={String(initial?.name ?? "")} className={input}/></label>
        <label className={label}>类型<select name="partnerType" defaultValue={String(initial?.partnerType ?? "KOL")} className={input}><option value="KOL">KOL</option><option value="Media">媒体</option><option value="Affiliate">联盟伙伴</option><option value="Dealer">经销商</option><option value="Photographer">摄影师</option><option value="CustomerAdvocate">用户推荐者</option></select></label>
        <label className={label}>国家/地区<input name="creatorCountry" defaultValue={String(initial?.creatorCountry ?? "")} className={input}/></label>
        <label className={label}>目标市场<input name="targetMarket" defaultValue={String(initial?.targetMarket ?? "")} placeholder="EU / US / CA / BR / Global" className={input}/></label>
        <label className={label}>邮箱<input name="email" type="email" defaultValue={String(initial?.email ?? "")} className={input}/></label>
        <label className={label}>电话<input name="phone" defaultValue={String(initial?.phone ?? "")} className={input}/></label>
        <label className={label}>状态<select name="status" defaultValue={String(initial?.status ?? "potential")} className={input}><option value="potential">潜在</option><option value="contacted">已联系</option><option value="replied">已回复</option><option value="negotiating">洽谈中</option><option value="contracting">签约中</option><option value="active">活跃</option><option value="paused">暂停</option><option value="completed">已完成</option><option value="blacklisted">黑名单</option></select></label>
        <OwnerInput users={users} defaultValue={String(initial?.ownerName ?? "")} />
        {!edit && <>
          <label className={label}>主要平台<select name="platform" className={input}><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="website">网站</option><option value="other">其他</option></select></label>
          <label className={label}>账号名称<input name="handle" placeholder="@handle" className={input}/></label>
          <label className={`${label} sm:col-span-2`}>主页链接<input name="profileUrl" type="url" placeholder="https://…" className={input}/></label>
          <label className={label}>粉丝量<input name="followers" type="number" min="0" className={input}/></label>
          <label className={label}>平均播放量<input name="avgViews" type="number" min="0" className={input}/></label>
        </>}
        <label className={`${label} sm:col-span-2`}>长期概况<textarea name="notesText" rows={3} defaultValue={String(initial?.notesText ?? "")} className={input} placeholder="例如：只接受邮件、偏好样车+佣金合作…"/></label>
      </div>
      <SubmitBar close={close} busy={busy} error={error}/>
    </form>}
  </Modal>;
}

export function ArchivePartnerButton({ partnerId }: { partnerId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button disabled={busy} onClick={async () => {
    if (!confirm("确定归档这个 Partner 吗？历史合作和销售数据会保留。")) return;
    setBusy(true);
    try { await send(`/api/partners/${partnerId}`, "DELETE"); router.push("/partners"); router.refresh(); }
    finally { setBusy(false); }
  }} className="rounded-[10px] border border-[#ead6d4] bg-white px-3 py-2.5 text-xs font-semibold text-[#a24b45] hover:bg-[#fbf1f0]"><span className="flex items-center gap-2"><Archive size={13}/>{busy ? "归档中…" : "归档"}</span></button>;
}

export function CollaborationForm({ partners, users, fixedPartnerId, collaborationId, initial }: { partners: Option[]; users: Option[]; fixedPartnerId?: string; collaborationId?: string; initial?: CollaborationInitial }) {
  const router = useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const edit = Boolean(collaborationId);
  const selectedPartnerId = fixedPartnerId ?? initial?.partnerId ?? "";
  async function submit(event:FormEvent<HTMLFormElement>,close:()=>void){
    event.preventDefault(); setBusy(true); setError("");
    const values=Object.fromEntries(new FormData(event.currentTarget));
    try { await send(edit ? `/api/collaborations/${collaborationId}` : "/api/collaborations", edit ? "PATCH" : "POST", values); close(); router.refresh(); }
    catch(e){setError(e instanceof Error?e.message:"保存失败")} finally{setBusy(false)}
  }
  return <Modal title={edit ? "编辑合作" : "新建合作"} description="每一轮合作独立维护产品、成本、负责人、状态和下一步。" trigger={<button className={edit ? "rounded-lg border border-[#dfe3e7] p-2 hover:bg-[#f4f6f8]" : "rounded-[10px] bg-[#111418] px-4 py-2.5 text-xs font-semibold text-white"}>{edit ? <Pencil size={13}/> : <span className="flex items-center gap-2"><Plus size={14}/>新建合作</span>}</button>}>
    {close=><form onSubmit={e=>submit(e,close)}><div className="grid max-h-[65vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
      <label className={label}>Partner *<select name="partnerId" required defaultValue={selectedPartnerId} className={input} disabled={Boolean(fixedPartnerId)}><option value="">请选择</option>{partners.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{fixedPartnerId&&<input type="hidden" name="partnerId" value={fixedPartnerId}/>}</label>
      <label className={label}>产品 *<input name="product" required defaultValue={initial?.product ?? ""} placeholder="GT73 Pro" className={input}/></label>
      <label className={label}>SKU<input name="sku" defaultValue={initial?.sku ?? ""} className={input}/></label>
      <label className={label}>市场 *<input name="targetMarket" required defaultValue={initial?.targetMarket ?? ""} placeholder="US" className={input}/></label>
      <label className={label}>合作形式<select name="collaborationType" defaultValue={initial?.collaborationType ?? "hybrid"} className={input}><option value="free_product">免费样车</option><option value="paid">付费</option><option value="affiliate_only">纯佣金</option><option value="product_exchange">产品置换</option><option value="discount_purchase">折扣购车</option><option value="hybrid">混合合作</option><option value="dealer">经销</option><option value="media">媒体</option></select></label>
      <label className={label}>状态<select name="status" defaultValue={initial?.status ?? "negotiating"} className={input}><option value="potential">潜在</option><option value="contacted">已联系</option><option value="replied">已回复</option><option value="negotiating">洽谈中</option><option value="contract_pending">待签约</option><option value="signed">已签约</option><option value="waiting_shipment">待发货</option><option value="shipped">已发货</option><option value="delivered">已签收</option><option value="content_production">内容制作</option><option value="partially_published">部分发布</option><option value="completed">已完成</option><option value="paused">暂停</option><option value="terminated">终止</option></select></label>
      <label className={label}>现金成本<input name="cashCost" type="number" min="0" step="0.01" defaultValue={initial?.cashCost ?? 0} className={input}/></label>
      <label className={label}>币种<input name="currency" defaultValue={initial?.currency ?? "USD"} maxLength={3} className={input}/></label>
      <label className={label}>佣金比例（%）<input name="commissionRate" type="number" min="0" max="100" step="0.01" defaultValue={initial?.commissionRate ?? ""} className={input}/></label>
      <label className={label}>优先级<select name="priority" defaultValue={initial?.priority ?? "medium"} className={input}><option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="urgent">紧急</option></select></label>
      <OwnerInput users={users} defaultValue={initial?.ownerName} />
      <label className={label}>开始日期<input name="startDate" type="date" defaultValue={initial?.startDate ?? ""} className={input}/></label>
      <label className={`${label} sm:col-span-2`}>下一步行动<input name="nextAction" defaultValue={initial?.nextAction ?? ""} placeholder="例如：发送正式报价" className={input}/></label>
      <label className={label}>下次行动日期<input name="nextActionDate" type="date" defaultValue={initial?.nextActionDate ?? ""} className={input}/></label>
      <label className={label}>预计结束日期<input name="endDate" type="date" defaultValue={initial?.endDate ?? ""} className={input}/></label>
    </div><SubmitBar close={close} busy={busy} error={error}/></form>}
  </Modal>;
}

export function ArchiveCollaborationButton({ collaborationId }: { collaborationId: string }) {
  const router=useRouter(); const [busy,setBusy]=useState(false);
  return <button disabled={busy} onClick={async()=>{if(!confirm("确定归档这次合作吗？历史数据会保留。"))return;setBusy(true);try{await send(`/api/collaborations/${collaborationId}`,"DELETE");router.refresh()}finally{setBusy(false)}}} className="rounded-lg border border-[#ead6d4] p-2 text-[#b64d46] hover:bg-[#fbf1f0]" aria-label="归档合作"><Archive size={13}/></button>;
}

export function SocialAccountForm({ partnerId, initial }: { partnerId: string; initial?: SocialAccountInitial }) {
  const router=useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const edit=Boolean(initial?.id);
  async function submit(event:FormEvent<HTMLFormElement>,close:()=>void){
    event.preventDefault(); setBusy(true); setError("");
    const fd=new FormData(event.currentTarget);
    const values:Record<string,unknown>=Object.fromEntries(fd);
    values.isPrimary=fd.get("isPrimary")==="on";
    try{await send(edit?`/api/partners/${partnerId}/social-accounts/${initial!.id}`:`/api/partners/${partnerId}/social-accounts`,edit?"PATCH":"POST",values);close();router.refresh()}
    catch(e){setError(e instanceof Error?e.message:"保存失败")}finally{setBusy(false)}
  }
  return <Modal title={edit?"编辑社交账号":"新增社交账号"} description="维护平台主页和最新账号数据。一个 Partner 可以有多个平台账号。" trigger={<button className={edit?"rounded-lg border border-[#dfe3e7] p-2 hover:bg-[#f4f6f8]":subtleButton}>{edit?<Pencil size={13}/>:<span className="flex items-center gap-2"><Plus size={13}/>新增账号</span>}</button>}>
    {close=><form onSubmit={e=>submit(e,close)}><div className="grid max-h-[65vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
      <label className={label}>平台<select name="platform" defaultValue={initial?.platform??"tiktok"} className={input}><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="website">网站</option><option value="other">其他</option></select></label>
      <label className={label}>账号名称<input name="handle" defaultValue={initial?.handle??""} placeholder="@handle" className={input}/></label>
      <label className={`${label} sm:col-span-2`}>主页链接 *<input name="profileUrl" type="url" required defaultValue={initial?.profileUrl??""} placeholder="https://…" className={input}/></label>
      <label className={label}>粉丝量<input name="followers" type="number" min="0" defaultValue={initial?.followers??""} className={input}/></label>
      <label className={label}>平均播放量<input name="avgViews" type="number" min="0" defaultValue={initial?.avgViews??""} className={input}/></label>
      <label className={label}>中位播放量<input name="medianViews" type="number" min="0" defaultValue={initial?.medianViews??""} className={input}/></label>
      <label className={label}>发布频率<input name="postingFrequency" defaultValue={initial?.postingFrequency??""} placeholder="例如：每周 3-4 条" className={input}/></label>
      <label className={label}>主要受众国家<input name="audienceCountry" defaultValue={initial?.audienceCountry??""} className={input}/></label>
      <label className="flex items-center gap-2 text-[11px] font-semibold text-[#59616b]"><input name="isPrimary" type="checkbox" defaultChecked={initial?.isPrimary??false}/>设为主要账号</label>
    </div><SubmitBar close={close} busy={busy} error={error}/></form>}
  </Modal>;
}

export function DeleteSocialAccountButton({partnerId,accountId}:{partnerId:string;accountId:string}){
  const router=useRouter();const [busy,setBusy]=useState(false);
  return <button disabled={busy} onClick={async()=>{if(!confirm("确定删除这个社交账号吗？已发布内容会保留，只解除账号关联。"))return;setBusy(true);try{await send(`/api/partners/${partnerId}/social-accounts/${accountId}`,"DELETE");router.refresh()}finally{setBusy(false)}}} className="rounded-lg border border-[#ead6d4] p-2 text-[#b64d46] hover:bg-[#fbf1f0]" aria-label="删除社交账号"><Trash2 size={13}/></button>;
}

export type NoteData={id:string;noteType:string;body:string;nextAction:string|null;followUpAt:string|null;collaborationId:string|null};
export function NoteForm({partnerId,collaborations,initial,onSaved}:{partnerId:string;collaborations:CollaborationOption[];initial?:NoteData;onSaved?:()=>void}){
  const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [open,setOpen]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>,close:()=>void){event.preventDefault();setBusy(true);setError("");const values=Object.fromEntries(new FormData(event.currentTarget));try{await send(initial?`/api/partners/${partnerId}/notes/${initial.id}`:`/api/partners/${partnerId}/notes`,initial?"PATCH":"POST",values);close();onSaved?.();router.refresh()}catch(e){setError(e instanceof Error?e.message:"保存失败")}finally{setBusy(false)}}
  return <Modal open={open} onOpenChange={setOpen} title={initial?"编辑跟进记录":"新增跟进记录"} description="记录发生了什么、关联哪次合作，以及下一步什么时候跟进。" trigger={<button className={initial?"rounded-lg border border-[#dfe3e7] p-2 hover:bg-[#f4f6f8]":"rounded-[10px] bg-[#111418] px-4 py-2.5 text-xs font-semibold text-white"}>{initial?<Pencil size={13}/>:<span className="flex items-center gap-2"><Plus size={14}/>新增记录</span>}</button>}>
    {close=><form onSubmit={e=>submit(e,close)}><div className="grid gap-4 p-5 sm:grid-cols-2">
      <label className={label}>记录类型<select name="noteType" defaultValue={initial?.noteType??"partner_profile"} className={input}><option value="partner_profile">Partner 长期备注</option><option value="email">邮件沟通</option><option value="proposal">合作报价</option><option value="shipment">样车/物流</option><option value="content_review">内容审核</option><option value="publication">内容发布</option><option value="commission">佣金结算</option><option value="after_sales">售后问题</option><option value="internal">内部备注</option><option value="other">其他</option></select></label>
      <label className={label}>关联合作<select name="collaborationId" defaultValue={initial?.collaborationId??""} className={input}><option value="">不关联具体合作</option>{collaborations.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className={`${label} sm:col-span-2`}>详细内容 *<textarea name="body" required rows={5} defaultValue={initial?.body??""} className={input}/></label>
      <label className={`${label} sm:col-span-2`}>下一步行动<input name="nextAction" defaultValue={initial?.nextAction??""} placeholder="例如：补发合作条款并确认发布时间" className={input}/></label>
      <label className={label}>下次跟进时间<input name="followUpAt" type="datetime-local" defaultValue={initial?.followUpAt?.slice(0,16)??""} className={input}/></label>
    </div><SubmitBar close={close} busy={busy} error={error}/></form>}
  </Modal>;
}

export function DeleteNoteButton({partnerId,noteId}:{partnerId:string;noteId:string}){const router=useRouter();const [busy,setBusy]=useState(false);return <button disabled={busy} onClick={async()=>{if(!confirm("确定删除这条备注吗？"))return;setBusy(true);try{await send(`/api/partners/${partnerId}/notes/${noteId}`,"DELETE");router.refresh()}finally{setBusy(false)}}} className="rounded-lg border border-[#ead6d4] p-2 text-[#b64d46] hover:bg-[#fbf1f0]" aria-label="删除备注"><Trash2 size={13}/></button>}

export function TaskForm({partners,collaborations,users,fixedPartnerId,taskId,initial}:{partners:Option[];collaborations:CollaborationOption[];users:Option[];fixedPartnerId?:string;taskId?:string;initial?:TaskInitial}){
  const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [partnerId,setPartnerId]=useState(fixedPartnerId??initial?.partnerId??"");const filtered=useMemo(()=>collaborations.filter(x=>!partnerId||x.partnerId===partnerId),[collaborations,partnerId]);const edit=Boolean(taskId);
  async function submit(event:FormEvent<HTMLFormElement>,close:()=>void){event.preventDefault();setBusy(true);setError("");const values=Object.fromEntries(new FormData(event.currentTarget));try{await send(edit?`/api/tasks/${taskId}`:"/api/tasks",edit?"PATCH":"POST",values);close();router.refresh()}catch(e){setError(e instanceof Error?e.message:"保存失败")}finally{setBusy(false)}}
  return <Modal title={edit?"编辑任务":"新建任务"} description="维护任务内容、负责人、截止时间、优先级和状态。" trigger={<button className={edit?"rounded-lg border border-[#dfe3e7] p-2 hover:bg-[#f4f6f8]":"rounded-[10px] bg-[#111418] px-4 py-2.5 text-xs font-semibold text-white"}>{edit?<Pencil size={13}/>:<span className="flex items-center gap-2"><Plus size={14}/>新建任务</span>}</button>}>
    {close=><form onSubmit={e=>submit(e,close)}><div className="grid max-h-[65vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
      <label className={`${label} sm:col-span-2`}>任务内容 *<input name="title" required defaultValue={initial?.title??""} className={input}/></label>
      <label className={label}>Partner<select name="partnerId" value={partnerId} onChange={e=>setPartnerId(e.target.value)} className={input} disabled={Boolean(fixedPartnerId)}><option value="">不关联</option>{partners.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{fixedPartnerId&&<input type="hidden" name="partnerId" value={fixedPartnerId}/>}</label>
      <label className={label}>关联合作<select name="collaborationId" defaultValue={initial?.collaborationId??""} className={input}><option value="">不关联</option>{filtered.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className={label}>任务类型<select name="taskType" defaultValue={initial?.taskType??"follow_up"} className={input}><option value="follow_up">跟进</option><option value="contract">合同</option><option value="shipment">发货</option><option value="delivery">签收</option><option value="content_due">内容交付</option><option value="content_overdue">内容逾期</option><option value="one_month_review">30日复盘</option><option value="payment">付款/结算</option><option value="affiliate">联盟</option><option value="issue">问题处理</option><option value="other">其他</option></select></label>
      <label className={label}>截止时间 *<input name="dueDate" required type="datetime-local" defaultValue={initial?.dueDate??""} className={input}/></label>
      <label className={label}>状态<select name="status" defaultValue={initial?.status??"todo"} className={input}><option value="todo">待处理</option><option value="in_progress">进行中</option><option value="waiting_external">等待对方</option><option value="done">已完成</option><option value="cancelled">已取消</option></select></label>
      <label className={label}>优先级<select name="priority" defaultValue={initial?.priority??"medium"} className={input}><option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="urgent">紧急</option></select></label>
      <OwnerInput users={users} defaultValue={initial?.ownerName}/>
      <label className={`${label} sm:col-span-2`}>补充说明<textarea name="description" rows={3} defaultValue={initial?.description??""} className={input}/></label>
    </div><SubmitBar close={close} busy={busy} error={error}/></form>}
  </Modal>
}

export function DeleteTaskButton({taskId}:{taskId:string}){const router=useRouter();const [busy,setBusy]=useState(false);return <button disabled={busy} onClick={async()=>{if(!confirm("确定删除这个任务吗？"))return;setBusy(true);try{await send(`/api/tasks/${taskId}`,"DELETE");router.refresh()}finally{setBusy(false)}}} className="rounded-lg border border-[#ead6d4] p-2 text-[#b64d46] hover:bg-[#fbf1f0]" aria-label="删除任务"><Trash2 size={13}/></button>}

export function TaskStatusSelect({taskId,status}:{taskId:string;status:string}){const router=useRouter();const [value,setValue]=useState(status);const [busy,setBusy]=useState(false);return <select aria-label="更新任务状态" value={value} disabled={busy} onChange={async e=>{const next=e.target.value;setValue(next);setBusy(true);try{await send(`/api/tasks/${taskId}`,"PATCH",{status:next});router.refresh()}catch{setValue(status)}finally{setBusy(false)}}} className="rounded-[8px] border border-[#dfe3e7] bg-white px-2 py-1.5 text-[10px]"><option value="todo">待处理</option><option value="in_progress">进行中</option><option value="waiting_external">等待对方</option><option value="done">已完成</option><option value="cancelled">已取消</option></select>}
