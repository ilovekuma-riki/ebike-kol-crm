import Link from "next/link";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { DeleteTaskButton, TaskForm, TaskStatusSelect } from "@/components/crm-actions";
import { prisma } from "@/lib/db";

export const dynamic="force-dynamic";
const typeLabel:Record<string,string>={follow_up:"跟进",contract:"合同",shipment:"发货",delivery:"签收",content_due:"内容交付",content_overdue:"内容逾期",one_month_review:"30日复盘",payment:"付款/结算",affiliate:"联盟",issue:"问题处理",other:"其他"};
const priorityLabel:Record<string,string>={low:"低",medium:"中",high:"高",urgent:"紧急"};
const fmt=(d:Date)=>new Intl.DateTimeFormat("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(d);
const dateTimeLocal=(d:Date)=>d.toISOString().slice(0,16);

export default async function Tasks(){
  const now=new Date();const week=new Date(now.getTime()+7*864e5);
  const [tasks,partners,collaborations,users]=await Promise.all([
    prisma.task.findMany({include:{partner:true,collaboration:true,owner:true},orderBy:{dueDate:"asc"},take:200}),
    prisma.partner.findMany({where:{archivedAt:null},select:{id:true,name:true},orderBy:{name:"asc"}}),
    prisma.collaboration.findMany({where:{archivedAt:null},select:{id:true,partnerId:true,product:true,collaborationCode:true},orderBy:{updatedAt:"desc"}}),
    prisma.user.findMany({select:{id:true,name:true},orderBy:{name:"asc"}}),
  ]);
  const today=tasks.filter(t=>t.dueDate.toDateString()===now.toDateString()&&!['done','cancelled'].includes(t.status)).length;
  const overdue=tasks.filter(t=>t.dueDate<now&&!['done','cancelled'].includes(t.status)).length;
  const completed=tasks.filter(t=>t.status==='done'&&t.completedAt&&t.completedAt>new Date(now.getTime()-7*864e5)).length;
  const collaborationOptions=collaborations.map(x=>({id:x.id,partnerId:x.partnerId,name:`${x.product} · ${x.collaborationCode}`}));
  return <div>
    <PageHeader eyebrow="TASK CENTER" title="任务中心" description="自动化节点和人工跟进共用一个待办视图，阻止合作在交接处停滞。" action={<TaskForm partners={partners} collaborations={collaborationOptions} users={users}/>}/>
    <div className="p-5 md:p-8">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">{[["今天",today,Clock3],["已逾期",overdue,Circle],["本周已完成",completed,CheckCircle2]].map(([n,v,I])=>{const Icon=I as typeof Clock3;return <div key={n as string} className="rounded-[14px] border border-[#e1e5e8] bg-white p-4"><Icon size={16} className="text-[#5b7695]"/><span className="mt-5 block text-[11px] text-[#747d86]">{n as string}</span><b className="font-display text-3xl">{v as number}</b></div>})}</div>
      <div className="rounded-[16px] border border-[#e1e5e8] bg-white"><div className="flex items-center gap-2 border-b border-[#e7eaed] p-4"><b className="text-xs">全部任务</b><span className="text-[10px] text-[#7d858d]">{tasks.length} 条</span></div>
        {tasks.map(x=><div key={x.id} className="grid gap-3 border-b border-[#eceff1] p-4 last:border-0 md:grid-cols-[26px_1.5fr_.65fr_.75fr_.65fr_auto_auto] md:items-center">
          <span className={x.status==='done'?"text-[#33755b]":"text-[#a0a7ad]"}>{x.status==='done'?<CheckCircle2 size={17}/>:<Circle size={17}/>}</span>
          <div><b className={`text-xs ${x.status==='done'?"text-[#8a929a] line-through":""}`}>{x.title}</b>{x.partner?<Link href={`/partners/${x.partner.id}`} className="mt-1 block text-[10px] text-[#5b7695] hover:underline">{x.partner.name}{x.collaboration?` · ${x.collaboration.product}`:""}</Link>:<p className="mt-1 text-[10px] text-[#7c858e]">未关联 Partner</p>}</div>
          <span className="text-[11px] text-[#67717a]">{typeLabel[x.taskType]}</span>
          <span className={`font-mono text-[10px] ${x.dueDate<now&&!['done','cancelled'].includes(x.status)?"text-[#ad4741]":"text-[#68727b]"}`}>{fmt(x.dueDate)}{x.dueDate>now&&x.dueDate<week?" · 本周":""}</span>
          <span className="text-[11px]">{x.owner?.name||"未分配"}</span>
          <StatusPill tone={x.priority==="urgent"?"danger":x.priority==="high"?"warn":"neutral"}>{priorityLabel[x.priority]}</StatusPill>
          <div className="flex items-center gap-1"><TaskStatusSelect taskId={x.id} status={x.status}/><TaskForm partners={partners} collaborations={collaborationOptions} users={users} taskId={x.id} initial={{partnerId:x.partnerId,collaborationId:x.collaborationId,title:x.title,description:x.description,taskType:x.taskType,dueDate:dateTimeLocal(x.dueDate),status:x.status,priority:x.priority,ownerName:x.owner?.name??null}}/><DeleteTaskButton taskId={x.id}/></div>
        </div>)}
        {!tasks.length&&<p className="p-8 text-center text-xs text-[#7c858e]">暂无任务，点击右上角新建第一条任务。</p>}
      </div>
    </div>
  </div>;
}
