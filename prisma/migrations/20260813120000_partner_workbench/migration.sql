ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'waiting_external';

CREATE TYPE "PartnerNoteType" AS ENUM (
  'partner_profile',
  'email',
  'proposal',
  'shipment',
  'content_review',
  'publication',
  'commission',
  'after_sales',
  'internal',
  'other'
);

ALTER TABLE "partner_notes"
  ADD COLUMN "collaboration_id" TEXT,
  ADD COLUMN "note_type" "PartnerNoteType" NOT NULL DEFAULT 'partner_profile',
  ADD COLUMN "next_action" TEXT,
  ADD COLUMN "follow_up_at" TIMESTAMP(3),
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "partner_notes"
  ADD CONSTRAINT "partner_notes_collaboration_id_fkey"
  FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "partner_notes_collaboration_id_idx" ON "partner_notes"("collaboration_id");
CREATE INDEX "partner_notes_follow_up_at_idx" ON "partner_notes"("follow_up_at");
