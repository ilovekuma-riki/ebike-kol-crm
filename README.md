# RideOps — eBike KOL 全生命周管理

RideOps 是面向跨境 eBike 团队的内部 CRM 工作台，把 Partner 主档、社交账号、多轮合作、履约内容、任务、EU/US/CA/BR Shopify 订单和销售归因统一到一个系统。

## 技术栈

- Next.js 16（满足 15+）、React 19、TypeScript、Tailwind CSS 4
- Prisma 6 + PostgreSQL / Supabase
- Supabase Auth（仅限受邀邮箱的 Magic Link）
- Recharts、TanStack Table、Zod、date-fns、SheetJS
- Vitest

## 快速开始

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

打开 `http://localhost:3000`。本地开发未配置 Supabase 时会显示同结构演示数据；任何线上环境都不会绕过登录，缺少 Supabase 配置时业务页面保持锁定。

## 项目结构

```text
prisma/             schema、migration、四站 seed
fixtures/           历史 KOL 导入验收夹具
src/app/            工作台页面与 API Routes
src/components/     应用外壳、图表、导入工作台
src/lib/import/     XLSX/CSV 解析、URL 拆分、Partner 去重
src/lib/            归因、Shopify、指标、Supabase 与 Prisma
```

## 数据库

核心表包括 `partners`、`social_accounts`、`collaborations`、`deliverables`、`contents`、`content_assets`、`workflow_steps`、`stores`、`discount_codes`、`discount_store_mappings`、`shopify_orders`、`order_items`、`attributions`、`tasks`、`kol_scores`、`creator_candidates`、`import_jobs`、`import_rows`、`sync_logs`、`partner_notes` 和 `users`。

- Partner 与 Collaboration 分离；一个 Partner 可有多平台、多轮合作。
- Content 一个 URL 一条记录。
- Shopify Order 使用 `store_id + shopify_order_id` 去重。
- Discount Code 通过 `discount_store_mappings` 与四站独立关联。
- 人工归因会停用旧 primary 记录，不会修改原始 Shopify 订单。

## Supabase 配置

1. 新建 Supabase 项目，复制 pooled `DATABASE_URL` 和 direct `DIRECT_URL`。
2. Authentication 中开启 Email / Magic Link，并由管理员预先建立内部员工账号。
3. 填写 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
4. 将生产域名及 `https://你的域名/auth/callback` 加入 Supabase Auth URL Configuration。
5. 运行 `npm run db:migrate && npm run db:seed`。

登录调用设置了 `shouldCreateUser: false`：陌生邮箱不会自动注册，只能由管理员在 Supabase Authentication → Users 中邀请或创建。生产环境未配置认证变量时会停留在登录页，不会暴露工作台。

`users.role` 支持 `admin` / `manager` / `operator` / `viewer`。Seed 创建 `manager@example.com` 内部记录；上线时将其 `auth_user_id` 关联到 Supabase Auth UUID。

## 四站 Shopify API

每个站需要自定义 App 的 Admin API token，建议 scopes：`read_orders`、`read_all_orders`、`read_customers`、`read_discounts`、`read_products`。

```env
SHOPIFY_STORE_EU="shop.myshopify.com"
SHOPIFY_ACCESS_TOKEN_EU="shpat_..."
# US / CA / BR 同样配置
```

- 手动同步：`POST /api/shopify/stores/EU/sync`，站点代码可为 EU/US/CA/BR。
- 同步使用 GraphQL 游标分页，429/5xx 指数退避重试。
- 归因优先级：Store + Discount Code → Affiliate Referral → UTM → Manual。
- API 版本由 `SHOPIFY_API_VERSION` 控制。

## Excel 导入

`/imports` 支持 CSV/XLS/XLSX，最大 20MB。导入器会忽略空行和“合作事项清单”模板文字，将多 URL 拆成 Social Account / Content / Content Asset。Partner 按 profile URL、email、handle、canonical name 顺序匹配。

`fixtures/legacy-kol-import.tsv` 是用户选择保留的历史验收数据，包含真实联系邮箱，请将仓库按内部敏感数据管理，不要公开发布该文件。

## n8n

`POST /api/webhooks/n8n/tasks` 和 `/api/webhooks/n8n/content-metrics` 要求 header `x-webhook-secret` 等于 `N8N_WEBHOOK_SECRET`。

## 质量检查与部署

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Vercel 中导入 `.env.example` 对应的环境变量，Build Command 使用 `npm run build`。定时同步可由 Vercel Cron 或 n8n 调用同一站点同步接口。

## 首版边界

- 未包含实时汇率；Global 收入按 EUR/USD/CAD/BRL 分组。
- 未包含社交平台指标自动抓取和复杂 AI 推荐。
- 实时 Shopify 同步、Supabase 登录和云端数据写入需要真实凭证。
