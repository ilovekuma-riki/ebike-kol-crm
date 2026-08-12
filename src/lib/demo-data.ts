export const markets = ["Global", "EU", "US", "CA", "BR"] as const;

export const kpis = [
  { label: "Partner 主档案", value: "289", delta: "+18 本月", tone: "neutral", href: "/partners" },
  { label: "活跃合作", value: "42", delta: "7 个需推进", tone: "blue", href: "/collaborations" },
  { label: "待交付内容", value: "68", delta: "12 个已逾期", tone: "warn", href: "/content" },
  { label: "本月归因订单", value: "126", delta: "归因率 87.4%", tone: "good", href: "/sales" },
] as const;

export const revenueSeries = [
  { month: "3月", EU: 42, US: 66, CA: 18, BR: 8 },
  { month: "4月", EU: 58, US: 74, CA: 22, BR: 12 },
  { month: "5月", EU: 63, US: 91, CA: 28, BR: 16 },
  { month: "6月", EU: 76, US: 108, CA: 34, BR: 19 },
  { month: "7月", EU: 84, US: 116, CA: 39, BR: 25 },
  { month: "8月", EU: 92, US: 128, CA: 44, BR: 31 },
];

export const partners = [
  { id: "maxx", code: "KOL-000001", name: "MAXX", country: "奥地利", market: "EU", platform: "TikTok", handle: "@maxxbikez", followers: 482000, avgViews: 92000, product: "GT73 Pro", orders: 13, revenue: 28470, currency: "EUR", score: 91, status: "活跃", owner: "Mia" },
  { id: "68v-razor", code: "KOL-000002", name: "68v_razor", country: "美国", market: "US", platform: "TikTok", handle: "@68v_razor", followers: 218000, avgViews: 68000, product: "GT73 Pro", orders: 24, revenue: 52140, currency: "USD", score: 94, status: "已完成", owner: "Evan" },
  { id: "deo-on2", code: "KOL-000003", name: "Deo_on2", country: "美国", market: "US", platform: "YouTube", handle: "@deo_on2", followers: 1380, avgViews: 9700, product: "GT54 Pro", orders: 9, revenue: 18620, currency: "USD", score: 88, status: "活跃", owner: "Mia" },
  { id: "bike-cave", code: "KOL-000004", name: "The Bike Cave", country: "加拿大", market: "CA", platform: "YouTube + TikTok", handle: "@thebikecave", followers: 96100, avgViews: 31200, product: "GT73", orders: 7, revenue: 15480, currency: "CAD", score: 82, status: "内容制作", owner: "Leo" },
  { id: "electric-revolution", code: "MEDIA-000001", name: "Electric Revolution", country: "美国", market: "Global", platform: "多平台", handle: "@electricrevolution", followers: 334000, avgViews: 54000, product: "GT54 Pro", orders: 18, revenue: 39200, currency: "USD", score: 89, status: "活跃", owner: "Evan" },
];

export const attention = [
  { title: "MAXX · GT73 Pro", detail: "首条短视频距约定日期已逾期 3 天", tag: "内容逾期", level: "urgent", href: "/partners/maxx" },
  { title: "The Bike Cave · GT73", detail: "车辆已签收，等待确认开箱排期", tag: "等待内容", level: "warn", href: "/partners/bike-cave" },
  { title: "Electric Revolution", detail: "30 日效果复盘今天到期", tag: "复盘", level: "info", href: "/partners/electric-revolution" },
  { title: "Jutrux · GT73 Pro", detail: "协议发出后 6 天未回复", tag: "待跟进", level: "neutral", href: "/tasks" },
];

export const pipelineColumns = [
  { key: "negotiating", label: "洽谈中", cards: [{ name: "Jutrux", product: "GT73 Pro", market: "EU", due: "今天", owner: "Mia" }, { name: "CitizenCycle", product: "GT54 Pro", market: "US", due: "8月14日", owner: "Evan" }] },
  { key: "contract", label: "待签约", cards: [{ name: "The Inja", product: "GT73", market: "US", due: "逾期 2 天", owner: "Leo" }] },
  { key: "shipment", label: "待发货", cards: [{ name: "Chris Crossed", product: "GT53", market: "US", due: "8月16日", owner: "Mia" }, { name: "BOBO", product: "GT73 Pro", market: "US", due: "8月18日", owner: "Evan" }] },
  { key: "content", label: "内容制作", cards: [{ name: "MAXX", product: "GT73 Pro", market: "EU", due: "逾期 3 天", owner: "Mia" }, { name: "The Bike Cave", product: "GT73", market: "CA", due: "8月20日", owner: "Leo" }] },
  { key: "completed", label: "已完成", cards: [{ name: "68v_razor", product: "GT54 Pro", market: "US", due: "已归档", owner: "Evan" }] },
];

export const tasks = [
  { title: "检查 MAXX 首条内容", partner: "MAXX", type: "内容逾期", due: "今天 10:00", owner: "Mia", priority: "紧急", status: "待处理" },
  { title: "确认 The Bike Cave 开箱排期", partner: "The Bike Cave", type: "内容跟进", due: "今天 14:00", owner: "Leo", priority: "高", status: "进行中" },
  { title: "Electric Revolution 30 日复盘", partner: "Electric Revolution", type: "效果复盘", due: "今天 17:00", owner: "Evan", priority: "高", status: "待处理" },
  { title: "向 Jutrux 再次发送协议", partner: "Jutrux", type: "合同", due: "明天", owner: "Mia", priority: "中", status: "待处理" },
];

export const contents = [
  { creator: "MAXX", platform: "TikTok", product: "GT73 Pro", date: "2026-08-06", views: 128400, engagement: "8.7%", orders: 6, revenue: "€12,840", rights: "品牌自然流量" },
  { creator: "68v_razor", platform: "TikTok", product: "GT54 Pro", date: "2026-08-02", views: 286100, engagement: "11.2%", orders: 14, revenue: "$30,610", rights: "可投放" },
  { creator: "Deo_on2", platform: "YouTube", product: "GT54 Pro", date: "2026-07-28", views: 9700, engagement: "14.8%", orders: 9, revenue: "$18,620", rights: "品牌自然流量" },
  { creator: "Electric Revolution", platform: "YouTube", product: "GT73", date: "2026-07-21", views: 84200, engagement: "6.3%", orders: 11, revenue: "$24,870", rights: "含素材文件" },
];

export const stores = [
  { code: "EU", name: "欧洲站", currency: "EUR", domain: "eu-store.myshopify.com", status: "等待凭证", orders: 54, revenue: "€92,400" },
  { code: "US", name: "美国站", currency: "USD", domain: "us-store.myshopify.com", status: "等待凭证", orders: 83, revenue: "$128,600" },
  { code: "CA", name: "加拿大站", currency: "CAD", domain: "ca-store.myshopify.com", status: "等待凭证", orders: 26, revenue: "CA$44,200" },
  { code: "BR", name: "巴西站", currency: "BRL", domain: "br-store.myshopify.com", status: "等待凭证", orders: 18, revenue: "R$31,800" },
];
