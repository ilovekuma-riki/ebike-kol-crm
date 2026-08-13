import "server-only";

import { CollaborationStatus, Priority, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const currencyOrder = ["EUR", "USD", "CAD", "BRL"];

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    const decimal = value as { toNumber?: () => number };
    if (typeof decimal.toNumber === "function") return decimal.toNumber();
  }
  return Number(value ?? 0);
}

function formatDue(date: Date) {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startDue = new Date(date);
  startDue.setHours(0, 0, 0, 0);
  const diffDays = Math.round((startDue.getTime() - startToday.getTime()) / 86400000);
  if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`;
  if (diffDays === 0) return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  if (diffDays === 1) return "明天";
  return date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

function ownerName(owner?: { name: string } | null) {
  return owner?.name || "未分配";
}

function priorityLabel(priority: Priority) {
  return { low: "低", medium: "中", high: "高", urgent: "紧急" }[priority];
}

function statusLabel(status: string) {
  return {
    active: "活跃",
    completed: "已完成",
    content_production: "内容制作",
    partially_published: "部分发布",
    negotiating: "洽谈中",
    contract_pending: "待签约",
    waiting_shipment: "待发货",
    shipped: "已发货",
    delivered: "已签收",
    paused: "暂停",
    potential: "潜在",
    contacted: "已联系",
    replied: "已回复",
    follow_up: "跟进",
    contract: "合同",
    shipment: "发货",
    delivery: "签收",
    content_due: "内容到期",
    content_overdue: "内容逾期",
    one_month_review: "30日复盘",
    payment: "付款",
    affiliate: "Affiliate",
    issue: "问题",
    other: "其他",
  }[status] ?? status;
}

export async function getPartnerList() {
  const rows = await prisma.partner.findMany({
    where: { archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      socialAccounts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      collaborations: { where: { archivedAt: null }, orderBy: { updatedAt: "desc" }, take: 1 },
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      attributions: { where: { isPrimary: true, supersededAt: null }, include: { order: true } },
    },
  });

  return rows.map((p) => {
    const primary = p.socialAccounts[0];
    const latestCollab = p.collaborations[0];
    const revenueByCurrency = new Map<string, number>();
    for (const attribution of p.attributions) {
      const currency = attribution.order.currency;
      revenueByCurrency.set(currency, (revenueByCurrency.get(currency) ?? 0) + toNumber(attribution.attributedRevenue));
    }
    const [currency = latestCollab?.currency ?? "USD", revenue = 0] =
      [...revenueByCurrency.entries()].sort((a, b) => currencyOrder.indexOf(a[0]) - currencyOrder.indexOf(b[0]))[0] ?? [];
    return {
      id: p.id,
      code: p.partnerCode,
      name: p.name,
      country: p.creatorCountry ?? "-",
      market: p.targetMarket ?? "Global",
      platform: primary?.platform ?? "other",
      handle: primary?.handle ?? "-",
      followers: primary?.followers ?? 0,
      avgViews: primary?.avgViews ?? 0,
      product: latestCollab?.product ?? "-",
      orders: p.attributions.length,
      revenue,
      currency,
      score: p.scores[0]?.totalScore ? Math.round(toNumber(p.scores[0].totalScore)) : null,
      status: statusLabel(p.status),
      owner: ownerName(p.owner),
    };
  });
}

export async function getPartnerDetail(id: string) {
  const p = await prisma.partner.findFirst({
    where: { OR: [{ id }, { partnerCode: id }], archivedAt: null },
    include: {
      owner: true,
      socialAccounts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      collaborations: {
        where: { archivedAt: null },
        orderBy: { updatedAt: "desc" },
        include: { deliverables: true, workflowSteps: { orderBy: { sequence: "asc" } } },
      },
      contents: { orderBy: { publishDate: "desc" } },
      attributions: { where: { isPrimary: true, supersededAt: null }, include: { order: true } },
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      tasks: { orderBy: { dueDate: "asc" }, take: 6, include: { owner: true } },
      notes: { orderBy: { createdAt: "desc" }, take: 5, include: { author: true } },
    },
  });
  if (!p) return null;
  const primary = p.socialAccounts[0];
  const current = p.collaborations.find((c) => c.status !== "completed") ?? p.collaborations[0];
  const revenueByCurrency = new Map<string, number>();
  for (const attribution of p.attributions) {
    revenueByCurrency.set(attribution.order.currency, (revenueByCurrency.get(attribution.order.currency) ?? 0) + toNumber(attribution.attributedRevenue));
  }
  const score = p.scores[0];
  return {
    id: p.id,
    code: p.partnerCode,
    name: p.name,
    country: p.creatorCountry ?? "-",
    market: p.targetMarket ?? "Global",
    email: p.email,
    platform: primary?.platform ?? "other",
    handle: primary?.handle ?? "-",
    followers: primary?.followers ?? 0,
    avgViews: primary?.avgViews ?? 0,
    contentCount: p.contents.length,
    orders: p.attributions.length,
    revenueByCurrency: [...revenueByCurrency.entries()],
    score: score?.totalScore ? Math.round(toNumber(score.totalScore)) : null,
    hasSufficientSalesData: score?.hasSufficientSalesData ?? false,
    current: current
      ? {
          product: current.product,
          market: current.targetMarket,
          status: statusLabel(current.status),
          workflowSteps: current.workflowSteps.map((s) => ({ label: s.label, completed: s.status === "completed" })),
        }
      : null,
    collaborations: p.collaborations.map((c) => {
      const required = c.deliverables.reduce((sum, d) => sum + d.requiredQuantity, 0);
      const published = c.deliverables.reduce((sum, d) => sum + d.publishedQuantity, 0);
      return { id: c.id, product: c.product, status: statusLabel(c.status), required, published };
    }),
    scoreBreakdown: score
      ? [
          ["销售表现", score.salesScore],
          ["ROAS", score.roasScore],
          ["内容表现", score.contentScore],
          ["互动质量", score.engagementScore],
          ["可靠性", score.reliabilityScore],
        ].map(([name, value]) => ({ name: String(name), value: value == null ? null : Math.round(toNumber(value)) }))
      : [],
  };
}

export async function getDashboardData() {
  const [partnerCount, activeCollabs, overdueDeliverables, totalOrders, attributedOrders, topPartners, revenueRows, attentionTasks] = await Promise.all([
    prisma.partner.count({ where: { archivedAt: null } }),
    prisma.collaboration.count({ where: { archivedAt: null, status: { notIn: ["completed", "terminated", "paused"] } } }),
    prisma.deliverable.count({ where: { status: "overdue" } }),
    prisma.shopifyOrder.count(),
    prisma.attribution.groupBy({ by: ["shopifyOrderId"], where: { isPrimary: true, supersededAt: null } }),
    getPartnerList(),
    prisma.$queryRaw<Array<{ month: Date; market: string; revenue: unknown }>>`
      SELECT date_trunc('month', o.order_date) AS month, s.market, sum(a.attributed_revenue) AS revenue
      FROM attributions a
      JOIN shopify_orders o ON o.id = a.shopify_order_id
      JOIN stores s ON s.id = o.store_id
      WHERE a.is_primary = true AND a.superseded_at IS NULL
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `,
    prisma.task.findMany({
      where: { status: { in: ["todo", "in_progress"] } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 4,
      include: { partner: true, collaboration: true },
    }),
  ]);
  const attributedRate = totalOrders ? Math.round((attributedOrders.length / totalOrders) * 1000) / 10 : 0;
  return {
    kpis: [
      { label: "Partner 主档案", value: String(partnerCount), delta: `${topPartners.filter((p) => p.score == null).length} 个待评分`, tone: "neutral", href: "/partners" },
      { label: "活跃合作", value: String(activeCollabs), delta: "需要持续推进", tone: "blue", href: "/collaborations" },
      { label: "待交付内容", value: String(overdueDeliverables), delta: overdueDeliverables ? "存在逾期" : "暂无逾期", tone: "warn", href: "/content" },
      { label: "本月归因订单", value: String(totalOrders), delta: `归因率 ${attributedRate}%`, tone: "good", href: "/sales" },
    ],
    topPartners: topPartners.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 4),
    revenueSeries: normalizeRevenueSeries(revenueRows),
    attention: attentionTasks.map((t) => ({
      title: `${t.partner?.name ?? "未绑定 Partner"}${t.collaboration ? ` · ${t.collaboration.product}` : ""}`,
      detail: `${statusLabel(t.taskType)} · ${formatDue(t.dueDate)}`,
      tag: priorityLabel(t.priority),
      href: t.partnerId ? `/partners/${t.partnerId}` : "/tasks",
    })),
    actionCards: { activeCollabs, overdueDeliverables, attributedRate },
  };
}

function normalizeRevenueSeries(rows: Array<{ month: Date; market: string; revenue: unknown }>) {
  const map = new Map<string, Record<string, number | string>>();
  for (const row of rows) {
    const key = row.month.toISOString().slice(0, 7);
    const item = map.get(key) ?? { month: `${row.month.getUTCMonth() + 1}月`, EU: 0, US: 0, CA: 0, BR: 0 };
    item[row.market] = toNumber(row.revenue);
    map.set(key, item);
  }
  return [...map.values()];
}

export async function getPipelineColumns() {
  const columns = [
    { statuses: [CollaborationStatus.negotiating], label: "洽谈中" },
    { statuses: [CollaborationStatus.contract_pending, CollaborationStatus.signed], label: "待签约" },
    { statuses: [CollaborationStatus.waiting_shipment, CollaborationStatus.shipped, CollaborationStatus.delivered], label: "待发货" },
    { statuses: [CollaborationStatus.content_production, CollaborationStatus.partially_published], label: "内容制作" },
    { statuses: [CollaborationStatus.completed], label: "已完成" },
  ];
  return Promise.all(
    columns.map(async (column) => {
      const cards = await prisma.collaboration.findMany({
        where: { archivedAt: null, status: { in: column.statuses } },
        orderBy: [{ priority: "desc" }, { nextActionDate: "asc" }],
        include: { partner: true, owner: true },
        take: 12,
      });
      return {
        key: column.statuses.join("-"),
        label: column.label,
        cards: cards.map((card) => ({
          id: card.id,
          partnerId: card.partnerId,
          name: card.partner.name,
          product: card.product,
          market: card.targetMarket,
          due: card.nextActionDate ? formatDue(card.nextActionDate) : statusLabel(card.status),
          owner: ownerName(card.owner),
        })),
      };
    }),
  );
}

export async function getCollaborationRows() {
  const rows = await prisma.collaboration.findMany({
    where: { archivedAt: null },
    orderBy: [{ updatedAt: "desc" }],
    include: { partner: true, owner: true },
    take: 80,
  });
  return rows.map((row) => ({
    id: row.id,
    partnerId: row.partnerId,
    name: row.partner.name,
    product: row.product,
    market: row.targetMarket,
    status: statusLabel(row.status),
    due: row.nextActionDate ? formatDue(row.nextActionDate) : row.nextAction ?? "暂无下一行动",
    owner: ownerName(row.owner),
    risky: row.nextActionDate ? row.nextActionDate.getTime() < Date.now() : false,
  }));
}

export async function getTasksData() {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(startToday);
  endToday.setDate(endToday.getDate() + 1);
  const endWeek = new Date(startToday);
  endWeek.setDate(endWeek.getDate() + 7);
  const [today, overdue, doneWeek, rows] = await Promise.all([
    prisma.task.count({ where: { status: { in: ["todo", "in_progress"] }, dueDate: { gte: startToday, lt: endToday } } }),
    prisma.task.count({ where: { status: { in: ["todo", "in_progress"] }, dueDate: { lt: startToday } } }),
    prisma.task.count({ where: { status: TaskStatus.done, completedAt: { gte: startToday, lt: endWeek } } }),
    prisma.task.findMany({
      where: { status: { in: ["todo", "in_progress"] } },
      orderBy: [{ dueDate: "asc" }],
      include: { partner: true, owner: true },
      take: 40,
    }),
  ]);
  return {
    counters: { today, overdue, doneWeek },
    tasks: rows.map((t) => ({
      id: t.id,
      title: t.title,
      partner: t.partner?.name ?? "未绑定 Partner",
      type: statusLabel(t.taskType),
      due: formatDue(t.dueDate),
      owner: ownerName(t.owner),
      priority: priorityLabel(t.priority),
    })),
  };
}

export async function getSalesData() {
  const [stores, attributedOrders, totalOrders, recent] = await Promise.all([
    prisma.store.findMany({ orderBy: { storeCode: "asc" }, include: { orders: { include: { attributions: { where: { isPrimary: true, supersededAt: null } } } } } }),
    prisma.attribution.groupBy({ by: ["shopifyOrderId"], where: { isPrimary: true, supersededAt: null } }),
    prisma.shopifyOrder.count(),
    prisma.attribution.findMany({
      where: { isPrimary: true, supersededAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { partner: true, order: { include: { store: true } } },
    }),
  ]);
  const attributedRate = totalOrders ? Math.round((attributedOrders.length / totalOrders) * 1000) / 10 : 0;
  return {
    stores: stores.map((s) => {
      const attributed = s.orders.filter((o) => o.attributions.length > 0);
      const revenue = attributed.reduce((sum, order) => sum + toNumber(order.netRevenue), 0);
      return { code: s.storeCode, name: s.name, currency: s.currency, status: s.status, orders: attributed.length, revenue };
    }),
    metrics: { attributed: attributedOrders.length, unattributed: Math.max(totalOrders - attributedOrders.length, 0), attributedRate },
    recent: recent.map((a) => ({
      id: a.id,
      orderNumber: a.order.orderNumber,
      store: a.order.store.storeCode,
      partner: a.partner.name,
      code: a.order.discountCode ?? a.order.utmCampaign ?? a.order.affiliateReferral ?? "-",
      type: a.attributionType,
      revenue: toNumber(a.attributedRevenue),
      currency: a.order.currency,
    })),
  };
}

export async function getContentData() {
  const rows = await prisma.content.findMany({
    orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
    include: {
      partner: true,
      collaboration: true,
      attributions: { where: { isPrimary: true, supersededAt: null }, include: { order: true } },
    },
    take: 60,
  });
  return rows.map((c) => {
    const revenueByCurrency = new Map<string, number>();
    for (const attribution of c.attributions) {
      revenueByCurrency.set(attribution.order.currency, (revenueByCurrency.get(attribution.order.currency) ?? 0) + toNumber(attribution.attributedRevenue));
    }
    const [currency = c.collaboration?.currency ?? "USD", revenue = 0] = [...revenueByCurrency.entries()][0] ?? [];
    return {
      id: c.id,
      creator: c.partner.name,
      platform: c.platform,
      product: c.collaboration?.product ?? "-",
      date: c.publishDate ? c.publishDate.toISOString().slice(0, 10) : "-",
      views: Number(c.views),
      engagement: c.engagementRate ? `${(toNumber(c.engagementRate) * 100).toFixed(1)}%` : "-",
      orders: c.attributions.length,
      revenue,
      currency,
      rights: c.usageRights.join(" / ") || "-",
    };
  });
}
