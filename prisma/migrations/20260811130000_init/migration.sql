-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'manager', 'operator', 'viewer');

-- CreateEnum
CREATE TYPE "public"."PartnerType" AS ENUM ('KOL', 'Media', 'Affiliate', 'Dealer', 'Photographer', 'CustomerAdvocate');

-- CreateEnum
CREATE TYPE "public"."PartnerStatus" AS ENUM ('potential', 'contacted', 'replied', 'negotiating', 'contracting', 'active', 'paused', 'completed', 'blacklisted');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('youtube', 'tiktok', 'instagram', 'facebook', 'website', 'other');

-- CreateEnum
CREATE TYPE "public"."CollaborationType" AS ENUM ('free_product', 'paid', 'affiliate_only', 'product_exchange', 'discount_purchase', 'dealer', 'media', 'hybrid');

-- CreateEnum
CREATE TYPE "public"."CollaborationStatus" AS ENUM ('potential', 'contacted', 'replied', 'negotiating', 'contract_pending', 'signed', 'waiting_shipment', 'shipped', 'delivered', 'content_production', 'partially_published', 'completed', 'paused', 'terminated');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('long_video', 'short_video', 'tiktok', 'reel', 'youtube_short', 'photo', 'blog', 'article', 'raw_video', 'exclusive_video', 'other');

-- CreateEnum
CREATE TYPE "public"."DeliverableStatus" AS ENUM ('pending', 'in_progress', 'partially_published', 'completed', 'overdue', 'waived');

-- CreateEnum
CREATE TYPE "public"."WorkflowStatus" AS ENUM ('pending', 'completed', 'blocked');

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('follow_up', 'contract', 'shipment', 'delivery', 'content_due', 'content_overdue', 'one_month_review', 'payment', 'affiliate', 'issue', 'other');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."AttributionType" AS ENUM ('discount_code', 'affiliate', 'utm', 'manual');

-- CreateEnum
CREATE TYPE "public"."ImportStatus" AS ENUM ('uploaded', 'analyzed', 'committing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('queued', 'running', 'completed', 'partial', 'failed');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "auth_user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'operator',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partners" (
    "id" TEXT NOT NULL,
    "partner_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "partner_type" "public"."PartnerType" NOT NULL DEFAULT 'KOL',
    "creator_country" TEXT,
    "target_market" TEXT,
    "email" TEXT,
    "secondary_email" TEXT,
    "phone" TEXT,
    "status" "public"."PartnerStatus" NOT NULL DEFAULT 'potential',
    "owner_user_id" TEXT,
    "notes" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_accounts" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "handle" TEXT,
    "profile_url" TEXT NOT NULL,
    "normalized_url" TEXT NOT NULL,
    "followers" INTEGER,
    "avg_views" INTEGER,
    "median_views" INTEGER,
    "engagement_rate" DECIMAL(7,4),
    "posting_frequency" TEXT,
    "audience_country" TEXT,
    "audience_gender" JSONB,
    "audience_age" JSONB,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "last_metrics_update" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collaborations" (
    "id" TEXT NOT NULL,
    "collaboration_code" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "sku" TEXT,
    "target_market" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "contract_date" TIMESTAMP(3),
    "collaboration_type" "public"."CollaborationType" NOT NULL,
    "cash_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bike_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "shipping_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "other_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "commission_rate" DECIMAL(7,4),
    "status" "public"."CollaborationStatus" NOT NULL DEFAULT 'negotiating',
    "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
    "owner_user_id" TEXT,
    "issue_type" TEXT,
    "issue_note" TEXT,
    "next_action" TEXT,
    "next_action_date" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deliverables" (
    "id" TEXT NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "content_type" "public"."ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "required_quantity" INTEGER NOT NULL DEFAULT 1,
    "published_quantity" INTEGER NOT NULL DEFAULT 0,
    "monthly_required_quantity" INTEGER,
    "duration_months" INTEGER,
    "brand_account_quantity" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "usage_rights" TEXT[],
    "status" "public"."DeliverableStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contents" (
    "id" TEXT NOT NULL,
    "content_code" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "deliverable_id" TEXT,
    "social_account_id" TEXT,
    "platform" "public"."Platform" NOT NULL,
    "content_type" "public"."ContentType" NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "publish_date" TIMESTAMP(3),
    "views" BIGINT NOT NULL DEFAULT 0,
    "likes" BIGINT NOT NULL DEFAULT 0,
    "comments" BIGINT NOT NULL DEFAULT 0,
    "shares" BIGINT NOT NULL DEFAULT 0,
    "engagement_rate" DECIMAL(7,4),
    "is_brand_account_content" BOOLEAN NOT NULL DEFAULT false,
    "usage_rights" TEXT[],
    "thumbnail_url" TEXT,
    "last_metrics_update" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_assets" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "content_id" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" TEXT NOT NULL,
    "store_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "shopify_domain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discount_codes" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discount_store_mappings" (
    "id" TEXT NOT NULL,
    "discount_code_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_store_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shopify_orders" (
    "id" TEXT NOT NULL,
    "shopify_order_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "customer_country" TEXT,
    "currency" TEXT NOT NULL,
    "gross_sales" DECIMAL(14,2) NOT NULL,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_sales" DECIMAL(14,2) NOT NULL,
    "refund_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_revenue" DECIMAL(14,2) NOT NULL,
    "discount_code" TEXT,
    "landing_page" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "affiliate_referral" TEXT,
    "financial_status" TEXT NOT NULL,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopify_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "shopify_order_id" TEXT NOT NULL,
    "product_title" TEXT NOT NULL,
    "variant_title" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "gross_amount" DECIMAL(14,2) NOT NULL,
    "net_amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attributions" (
    "id" TEXT NOT NULL,
    "shopify_order_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "content_id" TEXT,
    "attribution_type" "public"."AttributionType" NOT NULL,
    "confidence_score" DECIMAL(5,4) NOT NULL,
    "attributed_revenue" DECIMAL(14,2) NOT NULL,
    "match_reason" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "superseded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT,
    "collaboration_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "task_type" "public"."TaskType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
    "owner_user_id" TEXT,
    "auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "automation_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_steps" (
    "id" TEXT NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "public"."WorkflowStatus" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kol_scores" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "sales_score" DECIMAL(5,2),
    "roas_score" DECIMAL(5,2),
    "content_score" DECIMAL(5,2) NOT NULL,
    "engagement_score" DECIMAL(5,2) NOT NULL,
    "cost_efficiency_score" DECIMAL(5,2),
    "audience_fit_score" DECIMAL(5,2) NOT NULL,
    "reliability_score" DECIMAL(5,2) NOT NULL,
    "total_score" DECIMAL(5,2),
    "score_version" TEXT NOT NULL,
    "has_sufficient_sales_data" BOOLEAN NOT NULL DEFAULT false,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kol_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_notes" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "author_id" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "handle" TEXT,
    "url" TEXT NOT NULL,
    "country" TEXT,
    "followers" INTEGER,
    "avg_views" INTEGER,
    "engagement_rate" DECIMAL(7,4),
    "content_category" TEXT,
    "audience_fit" DECIMAL(5,2),
    "similarity_score" DECIMAL(5,2),
    "potential_score" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."import_jobs" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "status" "public"."ImportStatus" NOT NULL DEFAULT 'uploaded',
    "column_mapping" JSONB,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "duplicate_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "committed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."import_rows" (
    "id" TEXT NOT NULL,
    "import_job_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "source_data" JSONB NOT NULL,
    "normalized_data" JSONB,
    "warnings" JSONB,
    "errors" JSONB,
    "resolution" TEXT,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_logs" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'queued',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "orders_fetched" INTEGER NOT NULL DEFAULT 0,
    "orders_inserted" INTEGER NOT NULL DEFAULT 0,
    "orders_updated" INTEGER NOT NULL DEFAULT 0,
    "cursor" TEXT,
    "errors" JSONB,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_user_id_key" ON "public"."users"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_code_key" ON "public"."partners"("partner_code");

-- CreateIndex
CREATE INDEX "partners_canonical_name_idx" ON "public"."partners"("canonical_name");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "public"."partners"("status");

-- CreateIndex
CREATE INDEX "partners_owner_user_id_idx" ON "public"."partners"("owner_user_id");

-- CreateIndex
CREATE INDEX "social_accounts_partner_id_idx" ON "public"."social_accounts"("partner_id");

-- CreateIndex
CREATE INDEX "social_accounts_platform_handle_idx" ON "public"."social_accounts"("platform", "handle");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_normalized_url_key" ON "public"."social_accounts"("normalized_url");

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_collaboration_code_key" ON "public"."collaborations"("collaboration_code");

-- CreateIndex
CREATE INDEX "collaborations_partner_id_idx" ON "public"."collaborations"("partner_id");

-- CreateIndex
CREATE INDEX "collaborations_status_idx" ON "public"."collaborations"("status");

-- CreateIndex
CREATE INDEX "collaborations_owner_user_id_idx" ON "public"."collaborations"("owner_user_id");

-- CreateIndex
CREATE INDEX "deliverables_collaboration_id_idx" ON "public"."deliverables"("collaboration_id");

-- CreateIndex
CREATE INDEX "deliverables_status_deadline_idx" ON "public"."deliverables"("status", "deadline");

-- CreateIndex
CREATE UNIQUE INDEX "contents_content_code_key" ON "public"."contents"("content_code");

-- CreateIndex
CREATE UNIQUE INDEX "contents_url_key" ON "public"."contents"("url");

-- CreateIndex
CREATE INDEX "contents_partner_id_idx" ON "public"."contents"("partner_id");

-- CreateIndex
CREATE INDEX "contents_collaboration_id_idx" ON "public"."contents"("collaboration_id");

-- CreateIndex
CREATE INDEX "contents_publish_date_idx" ON "public"."contents"("publish_date");

-- CreateIndex
CREATE UNIQUE INDEX "content_assets_url_key" ON "public"."content_assets"("url");

-- CreateIndex
CREATE INDEX "content_assets_partner_id_idx" ON "public"."content_assets"("partner_id");

-- CreateIndex
CREATE INDEX "content_assets_collaboration_id_idx" ON "public"."content_assets"("collaboration_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_store_code_key" ON "public"."stores"("store_code");

-- CreateIndex
CREATE INDEX "discount_codes_code_idx" ON "public"."discount_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_partner_id_code_key" ON "public"."discount_codes"("partner_id", "code");

-- CreateIndex
CREATE INDEX "discount_store_mappings_store_id_idx" ON "public"."discount_store_mappings"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_store_mappings_discount_code_id_store_id_key" ON "public"."discount_store_mappings"("discount_code_id", "store_id");

-- CreateIndex
CREATE INDEX "shopify_orders_store_id_idx" ON "public"."shopify_orders"("store_id");

-- CreateIndex
CREATE INDEX "shopify_orders_order_date_idx" ON "public"."shopify_orders"("order_date");

-- CreateIndex
CREATE INDEX "shopify_orders_discount_code_idx" ON "public"."shopify_orders"("discount_code");

-- CreateIndex
CREATE UNIQUE INDEX "shopify_orders_store_id_shopify_order_id_key" ON "public"."shopify_orders"("store_id", "shopify_order_id");

-- CreateIndex
CREATE INDEX "order_items_shopify_order_id_idx" ON "public"."order_items"("shopify_order_id");

-- CreateIndex
CREATE INDEX "attributions_shopify_order_id_is_primary_idx" ON "public"."attributions"("shopify_order_id", "is_primary");

-- CreateIndex
CREATE INDEX "attributions_partner_id_idx" ON "public"."attributions"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_automation_key_key" ON "public"."tasks"("automation_key");

-- CreateIndex
CREATE INDEX "tasks_status_due_date_idx" ON "public"."tasks"("status", "due_date");

-- CreateIndex
CREATE INDEX "tasks_owner_user_id_idx" ON "public"."tasks"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_collaboration_id_step_key_key" ON "public"."workflow_steps"("collaboration_id", "step_key");

-- CreateIndex
CREATE INDEX "kol_scores_partner_id_calculated_at_idx" ON "public"."kol_scores"("partner_id", "calculated_at");

-- CreateIndex
CREATE INDEX "partner_notes_partner_id_idx" ON "public"."partner_notes"("partner_id");

-- CreateIndex
CREATE INDEX "creator_candidates_status_idx" ON "public"."creator_candidates"("status");

-- CreateIndex
CREATE INDEX "import_jobs_file_hash_idx" ON "public"."import_jobs"("file_hash");

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_import_job_id_row_number_key" ON "public"."import_rows"("import_job_id", "row_number");

-- CreateIndex
CREATE INDEX "sync_logs_store_id_started_at_idx" ON "public"."sync_logs"("store_id", "started_at");

-- AddForeignKey
ALTER TABLE "public"."partners" ADD CONSTRAINT "partners_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_accounts" ADD CONSTRAINT "social_accounts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborations" ADD CONSTRAINT "collaborations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborations" ADD CONSTRAINT "collaborations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deliverables" ADD CONSTRAINT "deliverables_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_assets" ADD CONSTRAINT "content_assets_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_assets" ADD CONSTRAINT "content_assets_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_assets" ADD CONSTRAINT "content_assets_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_codes" ADD CONSTRAINT "discount_codes_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_codes" ADD CONSTRAINT "discount_codes_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_store_mappings" ADD CONSTRAINT "discount_store_mappings_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_store_mappings" ADD CONSTRAINT "discount_store_mappings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopify_orders" ADD CONSTRAINT "shopify_orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_shopify_order_id_fkey" FOREIGN KEY ("shopify_order_id") REFERENCES "public"."shopify_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributions" ADD CONSTRAINT "attributions_shopify_order_id_fkey" FOREIGN KEY ("shopify_order_id") REFERENCES "public"."shopify_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributions" ADD CONSTRAINT "attributions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributions" ADD CONSTRAINT "attributions_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attributions" ADD CONSTRAINT "attributions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_steps" ADD CONSTRAINT "workflow_steps_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kol_scores" ADD CONSTRAINT "kol_scores_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_notes" ADD CONSTRAINT "partner_notes_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_notes" ADD CONSTRAINT "partner_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."import_rows" ADD CONSTRAINT "import_rows_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_logs" ADD CONSTRAINT "sync_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
