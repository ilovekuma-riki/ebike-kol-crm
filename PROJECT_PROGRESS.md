# RideOps 项目进度

更新日期：2026-08-13

## 当前状态

- GitHub：已发布到私有仓库 <https://github.com/ilovekuma-riki/ebike-kol-crm>，默认分支为 `main`。
- Vercel：已部署生产版本至 <https://ebike-kol-crm.vercel.app>。
- 访问控制：已实现 Supabase 邮箱 Magic Link；只有管理员预先添加的邮箱可登录，线上环境禁止无认证绕过。
- 数据模式：已接入真实 Supabase PostgreSQL；当前业务数据为写入真实库的四站 Seed 数据，Shopify 凭证仍待配置。
- Supabase：项目 `rideops-ebike-kol-crm`（新加坡区）已创建，migration 与 seed 已完成。
- Auth：管理员 `3055667084@qq.com` 已邀请并关联业务 `users` 记录；公开注册已关闭。
- Phase 2：Partners 列表、Partner 详情、Dashboard KPI、Pipeline、Tasks、Sales、Content 已改为通过 Prisma 查询真实数据库；Collaborations 列表也已同步接入 DB。

## 已完成

- Dashboard、Partner、合作 Pipeline、内容库、任务、销售归因、Discovery、导入与 Settings 的 MVP 页面。
- EU、US、CA、BR 四站模型、同步接口、独立日志与 `store_id + shopify_order_id` 幂等规则。
- Store + Discount Code、Affiliate、UTM、Manual 的归因优先级与历史保留逻辑。
- Prisma schema、migration、seed、CSV/XLSX 分析/提交服务及历史复杂数据夹具。
- 四站订单模拟数据、Global 分币种展示、ROAS/CAC 与 KOL 评分服务。
- Vercel 生产构建和 `/dashboard` 可用性验证。
- 邮箱 Magic Link 登录页、PKCE 回调、受保护路由和线上 fail-closed（缺配置即锁定）。
- 新增 `src/lib/queries.ts` 作为 server-only 数据访问层；运营页面标记为动态渲染，避免构建期预渲染时连接数据库。

## 上线前必须完成

1. 分别配置 EU、US、CA、BR 四站 Shopify 域名与 Admin API token，再逐站执行首次同步。
2. 设置高强度 `N8N_WEBHOOK_SECRET`，并验证所有生产 API 的角色权限。

## 验收清单

- [x] 私有访问设计：线上没有 Supabase 配置时拒绝进入业务页面。
- [x] 邮箱 Magic Link：不允许登录动作自动创建用户。
- [x] 四站订单主键隔离与折扣码按 Store 映射。
- [x] 导入分析与确认写入分离，重复提交幂等。
- [ ] 使用真实 Supabase 邮箱完成端到端登录测试：邀请已发送；Vercel 新部署当前受平台构建队列异常阻塞，主域名仍运行旧版。
- [ ] Phase 2 页面运行时验收：代码已完成；当前本机 Postgres pooler `aws-0-ap-southeast-1.pooler.supabase.com:6543` 不可达，待网络/连接串恢复后逐页验证真实数据渲染。
- [ ] 使用四站真实 Shopify token 完成分页、限流、退款与增量同步测试。
- [ ] 为 API Route 增加完整角色级授权测试。
- [ ] 对历史联系人数据制定团队访问和保留策略。

## 安全约定

- `.env*`、Vercel 项目元数据、依赖和构建产物均被 Git 忽略。
- `fixtures/legacy-kol-import.tsv` 包含真实联系邮箱，因此 GitHub 仓库不得改为 Public。
- GitHub 私有仓库控制源码可见性；线上页面访问由 Supabase Auth 独立控制，两者缺一不可。
