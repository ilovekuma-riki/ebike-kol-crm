import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable();
const optionalDate = z.string().trim().optional().nullable();

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "请填写 Partner 名称").max(120),
  partnerType: z.enum(["KOL", "Media", "Affiliate", "Dealer", "Photographer", "CustomerAdvocate"]),
  creatorCountry: optionalText,
  targetMarket: optionalText,
  email: z.union([z.literal(""), z.email("邮箱格式不正确")]).optional().nullable(),
  phone: optionalText,
  status: z.enum(["potential", "contacted", "replied", "negotiating", "contracting", "active", "paused", "completed", "blacklisted"]),
  ownerUserId: optionalText,
  notesText: z.string().trim().max(3000).optional().nullable(),
  platform: z.enum(["youtube", "tiktok", "instagram", "facebook", "website", "other"]).optional().nullable(),
  handle: optionalText,
  profileUrl: z.union([z.literal(""), z.url("主页链接格式不正确")]).optional().nullable(),
  followers: z.coerce.number().int().min(0).optional().nullable(),
  avgViews: z.coerce.number().int().min(0).optional().nullable(),
});

export const collaborationSchema = z.object({
  partnerId: z.string().uuid(),
  product: z.string().trim().min(1, "请填写合作产品").max(120),
  sku: optionalText,
  targetMarket: z.string().trim().min(1, "请选择市场").max(40),
  collaborationType: z.enum(["free_product", "paid", "affiliate_only", "product_exchange", "discount_purchase", "dealer", "media", "hybrid"]),
  cashCost: z.coerce.number().min(0).default(0),
  currency: z.string().trim().min(3).max(3),
  commissionRate: z.coerce.number().min(0).max(100).optional().nullable(),
  status: z.enum(["potential", "contacted", "replied", "negotiating", "contract_pending", "signed", "waiting_shipment", "shipped", "delivered", "content_production", "partially_published", "completed", "paused", "terminated"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  ownerUserId: optionalText,
  startDate: optionalDate,
  endDate: optionalDate,
  nextAction: optionalText,
  nextActionDate: optionalDate,
});

export const noteSchema = z.object({
  collaborationId: z.string().uuid().optional().nullable().or(z.literal("")),
  noteType: z.enum(["partner_profile", "email", "proposal", "shipment", "content_review", "publication", "commission", "after_sales", "internal", "other"]),
  body: z.string().trim().min(1, "请填写备注内容").max(10000),
  nextAction: z.string().trim().max(1000).optional().nullable(),
  followUpAt: optionalDate,
});

export const taskSchema = z.object({
  partnerId: z.string().uuid().optional().nullable().or(z.literal("")),
  collaborationId: z.string().uuid().optional().nullable().or(z.literal("")),
  title: z.string().trim().min(1, "请填写任务内容").max(300),
  description: z.string().trim().max(3000).optional().nullable(),
  taskType: z.enum(["follow_up", "contract", "shipment", "delivery", "content_due", "content_overdue", "one_month_review", "payment", "affiliate", "issue", "other"]),
  dueDate: z.string().trim().min(1, "请选择截止时间"),
  status: z.enum(["todo", "in_progress", "waiting_external", "done", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  ownerUserId: optionalText,
});

export const taskStatusSchema = z.object({ status: z.enum(["todo", "in_progress", "waiting_external", "done", "cancelled"]) });

export function nullableDate(value?: string | null) { return value ? new Date(value) : null; }
export function nullableId(value?: string | null) { return value || null; }
