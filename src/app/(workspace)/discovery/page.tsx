import { PageHeader } from "@/components/page-header";
import { CandidateForm, ConvertCandidateButton } from "@/components/crm-actions";
import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/db";
import { compactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
const platformLabels: Record<string, string> = { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook", website: "网站", other: "其他" };

export default async function Discovery() {
  const candidates = await prisma.creatorCandidate.findMany({
    where: { archivedAt: null, NOT: { status: "converted" } },
    orderBy: [{ potentialScore: "desc" }, { createdAt: "desc" }],
  });
  return <div>
    <PageHeader eyebrow="CREATOR DISCOVERY" title="候选人池" description="保存尚未进入 Partner 主档的潜力创作者；确认合作价值后，可一键转为 Partner。" action={<CandidateForm/>}/>
    <div className="p-5 md:p-8">
      <div className="overflow-hidden rounded-[16px] border border-[#e1e5e8] bg-white">
        <div className="hidden grid-cols-[1.4fr_.8fr_.7fr_.7fr_.7fr_.6fr_auto] bg-[#fafbfc] px-5 py-3 text-[10px] text-[#7b838b] md:grid"><span>创作者</span><span>平台</span><span>市场</span><span>粉丝</span><span>互动率</span><span>潜力分</span><span>操作</span></div>
        {candidates.length ? candidates.map(candidate => <div className="grid gap-3 border-t border-[#edf0f2] px-5 py-4 text-xs first:border-0 md:grid-cols-[1.4fr_.8fr_.7fr_.7fr_.7fr_.6fr_auto] md:items-center" key={candidate.id}>
          <div><b>{candidate.name}</b><p className="mt-1 text-[10px] text-[#7b838b]">{candidate.handle || candidate.url}</p></div>
          <span>{platformLabels[candidate.platform] ?? candidate.platform}</span>
          <span>{candidate.country || "—"}</span>
          <span className="font-mono">{candidate.followers == null ? "—" : compactNumber(candidate.followers)}</span>
          <span>{candidate.engagementRate == null ? "—" : `${(Number(candidate.engagementRate) * 100).toFixed(1)}%`}</span>
          <span>{candidate.potentialScore == null ? "—" : <StatusPill tone="blue">{Math.round(Number(candidate.potentialScore))}</StatusPill>}</span>
          <ConvertCandidateButton candidateId={candidate.id}/>
        </div>) : <div className="p-10 text-center text-xs text-[#7b838b]">暂无候选人。点击右上角“新增候选人”开始建立候选池。</div>}
      </div>
      <p className="mt-3 text-[10px] text-[#7b838b]">转为 Partner 后，该候选人会从这里移除，并自动进入 Partner 主档。</p>
    </div>
  </div>;
}
