import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Delta migration: adds the CMS-editable Enquiry Forms collection, the Lead Delivery
// global and the enquiry-wizard `form` relationship. Written as an idempotent delta
// (not a generated baseline) because the live database was created by Payload's
// dev push before any migration files existed.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_enquiry_forms_steps_questions_type" AS ENUM('select', 'cards', 'buttons', 'text', 'email', 'tel', 'textarea', 'checkbox');
CREATE TYPE "public"."enum_enquiry_forms_steps_questions_map_to" AS ENUM('fullName', 'email', 'phone', 'partyType', 'situation', 'region', 'tenure', 'salary', 'legalExpensesInsurance', 'details', 'consent', 'extra');
CREATE TABLE IF NOT EXISTS "enquiry_forms_steps_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar,
  	"show_when" varchar
  );
CREATE TABLE IF NOT EXISTS "enquiry_forms_steps_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_enquiry_forms_steps_questions_type" DEFAULT 'select' NOT NULL,
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"help_text" varchar,
  	"required" boolean DEFAULT false,
  	"max_length" numeric,
  	"advance_on_select" boolean,
  	"map_to" "enum_enquiry_forms_steps_questions_map_to" DEFAULT 'extra',
  	"depends_on" varchar,
  	"show_when_values" varchar
  );
CREATE TABLE IF NOT EXISTS "enquiry_forms_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"heading" varchar
  );
CREATE TABLE IF NOT EXISTS "enquiry_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Enquiry Wizard' NOT NULL,
  	"consent_text" varchar DEFAULT 'I agree to be contacted about my enquiry. My details will not be sold to multiple firms.' NOT NULL,
  	"continue_label" varchar DEFAULT 'Continue →',
  	"submit_label" varchar DEFAULT 'Submit my enquiry',
  	"success_heading" varchar DEFAULT 'Enquiry received',
  	"success_message" varchar DEFAULT 'Thank you. We are reviewing your enquiry and a specialist will contact you within one working day.',
  	"error_message" varchar DEFAULT 'Sorry, something went wrong sending your enquiry. Please call us or try again.',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
CREATE TABLE IF NOT EXISTS "lead_delivery_webhooks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"enabled" boolean DEFAULT true
  );
CREATE TABLE IF NOT EXISTS "lead_delivery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"webhooks_enabled" boolean DEFAULT true,
  	"webhook_secret" varchar,
  	"notify_emails" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
ALTER TABLE "pages_blocks_enquiry_wizard" ADD COLUMN IF NOT EXISTS "form_id" integer;
ALTER TABLE "_pages_v_blocks_enquiry_wizard" ADD COLUMN IF NOT EXISTS "form_id" integer;
ALTER TABLE "page_templates_blocks_enquiry_wizard" ADD COLUMN IF NOT EXISTS "form_id" integer;
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "extra_answers" jsonb;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "enquiry_forms_id" integer;
ALTER TABLE "pages_blocks_enquiry_wizard" ADD CONSTRAINT "pages_blocks_enquiry_wizard_form_id_enquiry_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."enquiry_forms"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_v_blocks_enquiry_wizard" ADD CONSTRAINT "_pages_v_blocks_enquiry_wizard_form_id_enquiry_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."enquiry_forms"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "page_templates_blocks_enquiry_wizard" ADD CONSTRAINT "page_templates_blocks_enquiry_wizard_form_id_enquiry_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."enquiry_forms"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "enquiry_forms_steps_questions_options" ADD CONSTRAINT "enquiry_forms_steps_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiry_forms_steps_questions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "enquiry_forms_steps_questions" ADD CONSTRAINT "enquiry_forms_steps_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiry_forms_steps"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "enquiry_forms_steps" ADD CONSTRAINT "enquiry_forms_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiry_forms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_forms_fk" FOREIGN KEY ("enquiry_forms_id") REFERENCES "public"."enquiry_forms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lead_delivery_webhooks" ADD CONSTRAINT "lead_delivery_webhooks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_delivery"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX IF NOT EXISTS "pages_blocks_enquiry_wizard_form_idx" ON "pages_blocks_enquiry_wizard" USING btree ("form_id");
CREATE INDEX IF NOT EXISTS "_pages_v_blocks_enquiry_wizard_form_idx" ON "_pages_v_blocks_enquiry_wizard" USING btree ("form_id");
CREATE INDEX IF NOT EXISTS "page_templates_blocks_enquiry_wizard_form_idx" ON "page_templates_blocks_enquiry_wizard" USING btree ("form_id");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_questions_options_order_idx" ON "enquiry_forms_steps_questions_options" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_questions_options_parent_id_idx" ON "enquiry_forms_steps_questions_options" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_questions_order_idx" ON "enquiry_forms_steps_questions" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_questions_parent_id_idx" ON "enquiry_forms_steps_questions" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_order_idx" ON "enquiry_forms_steps" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "enquiry_forms_steps_parent_id_idx" ON "enquiry_forms_steps" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "enquiry_forms_updated_at_idx" ON "enquiry_forms" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "enquiry_forms_created_at_idx" ON "enquiry_forms" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_enquiry_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_forms_id");
CREATE INDEX IF NOT EXISTS "lead_delivery_webhooks_order_idx" ON "lead_delivery_webhooks" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "lead_delivery_webhooks_parent_id_idx" ON "lead_delivery_webhooks" USING btree ("_parent_id");
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "enquiry_forms_steps_questions_options" CASCADE;
  DROP TABLE IF EXISTS "enquiry_forms_steps_questions" CASCADE;
  DROP TABLE IF EXISTS "enquiry_forms_steps" CASCADE;
  DROP TABLE IF EXISTS "enquiry_forms" CASCADE;
  DROP TABLE IF EXISTS "lead_delivery_webhooks" CASCADE;
  DROP TABLE IF EXISTS "lead_delivery" CASCADE;
  ALTER TABLE "pages_blocks_enquiry_wizard" DROP COLUMN IF EXISTS "form_id";
  ALTER TABLE "_pages_v_blocks_enquiry_wizard" DROP COLUMN IF EXISTS "form_id";
  ALTER TABLE "page_templates_blocks_enquiry_wizard" DROP COLUMN IF EXISTS "form_id";
  ALTER TABLE "enquiries" DROP COLUMN IF EXISTS "extra_answers";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "enquiry_forms_id";
  DROP TYPE IF EXISTS "public"."enum_enquiry_forms_steps_questions_type";
  DROP TYPE IF EXISTS "public"."enum_enquiry_forms_steps_questions_map_to";
`)
}
