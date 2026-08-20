import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { ArchiveCollaborationButton, CollaborationForm } from "@/components/crm-actions";
import { prisma } from "@/lib/db";

export const dynamic="force-dynamic";
const statusLabel:Record<string,string>={potential:"潜在",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",contract_pending:"待签约",signed:"已签约",waiting_shipment:"待发货",shipped:"已发货",delivered:"已签收",content_production:"内容制作",partially_published:"部分发布",completed:"已完成",paused:"暂停",terminated:"终止"};
const fmt=(d:Date)=>new Intl.DateTimeFormat("zh-CN",{month:"2-digit",day:"2-digit"}).format(d);
const dateOnly=(d:Date|null)=>d?d.toISOString().slice(0,10):null;

export default async function Collaborations(){
  const [rows,partners,users]=await Promise.all([
    prisma.collaboration.findMany({where:{archivedAt:null},include:{partner:true,owner:true},orderBy:{updatedAt:"desc"},take:200}),
    prisma.partner.findMany({where:{archivedAt:null},select:{id:true,name:true},orderBy:{name:"asc"}}),
    prisma.user.findMany({select:{id:true,name:true},orderBy:{name:"asc"}}),
  ]);
  const active=rows.filter(x=>!["completed","terminated"].includes(x.status)).length;
  const risk=rows.filter(x=>x.priority==="urgent"||x.issueType).length;
  const done=rows.filter(x=>x.status==="completed").length;
  return <div>
    <PageHeader eyebrow="COLLABORATION RECORDS" title="合作记录" description="集中查看、编辑或归档已有合作。新合作请从对应 Partner 详情页创建。"
/>
    <div className="p-5 md:p-8">
      <div className="mb-4 flex gap-2">{[`全部 ${rows.length}`,`进行中 ${active}`,`有风险 ${risk}`,`已完成 ${done}`].map((x,i)=><button key={x} className={`rounded-full px-4 py-2 text-[11px] font-semibold ${i===0?"bg-[#111418] text-white":"border border-[#dfe3e7] bg-white"}`}>{x}</button>)}</div>
      <div className="overflow-hidden rounded-[16px] border border-[#e1e5e8] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-[#fafbfc] text-[10px] text-[#818990]"><tr>{["Partner","产品","市场","状态","下一行动","负责人","优先级","操作"].map(x=><th className="px-5 py-3" key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr className="border-t border-[#ebedef] text-xs" key={x.id}>
        <td className="px-5 py-4"><Link href={`/partners/${x.partnerId}`} className="font-semibold hover:text-[#5b7695]">{x.partner.name}</Link><div className="mt-1 font-mono text-[9px] text-[#9aa1a8]">{x.collaborationCode}</div></td>
        <td className="px-5 py-4">{x.product}</td><td className="px-5 py-4">{x.targetMarket}</td>
        <td className="px-5 py-4"><StatusPill tone={x.status==="completed"?"good":x.status==="terminated"?"danger":"blue"}>{statusLabel[x.status]}</StatusPill></td>
        <td className="px-5 py-4 text-[#68727b]">{x.nextAction||"—"}{x.nextActionDate&&<div className="mt-1 text-[9px]">{fmt(x.nextActionDate)}</div>}</td>
        <td className="px-5 py-4">{x.owner?.name||"未分配"}</td><td className="px-5 py-4">{x.priority}</td>
        <td className="px-5 py-4"><div className="flex gap-1"><CollaborationForm partners={partners} users={users} collaborationId={x.id} initial={{partnerId:x.partnerId,product:x.product,sku:x.sku,targetMarket:x.targetMarket,collaborationType:x.collaborationType,cashCost:Number(x.cashCost),currency:x.currency,commissionRate:x.commissionRate==null?null:Number(x.commissionRate)*100,status:x.status,priority:x.priority,ownerName:x.owner?.name??null,startDate:dateOnly(x.startDate),endDate:dateOnly(x.endDate),nextAction:x.nextAction,nextActionDate:dateOnly(x.nextActionDate)}}/><ArchiveCollaborationButton collaborationId={x.id}/></div></td>
      </tr>)}</tbody></table></div>{!rows.length&&<p className="p-8 text-center text-xs text-[#7c858e]">暂无合作记录</p>}</div>
    </div>
  </div>;
}
