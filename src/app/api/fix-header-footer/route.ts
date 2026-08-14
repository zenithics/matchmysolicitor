import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-vercel-postgres'

/**
 * One-shot endpoint: GET /api/fix-header-footer
 * DELETE THIS FILE once admin is confirmed working.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const log: string[] = []

    const statements = [
      // enums
      `DO $$ BEGIN CREATE TYPE "public"."enum_header_nav_items_left_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "public"."enum_header_nav_items_right_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "public"."enum_footer_column1_links_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "public"."enum_footer_column2_links_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "public"."enum_footer_column3_links_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      // header
      `CREATE TABLE IF NOT EXISTS "header" ("id" serial PRIMARY KEY NOT NULL, "announcement_bar" varchar, "updated_at" timestamp(3) with time zone, "created_at" timestamp(3) with time zone);`,
      `CREATE TABLE IF NOT EXISTS "header_nav_items_left" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_header_nav_items_left_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL);`,
      `CREATE INDEX IF NOT EXISTS "header_nav_items_left_order_idx" ON "header_nav_items_left" ("_order");`,
      `CREATE INDEX IF NOT EXISTS "header_nav_items_left_parent_id_idx" ON "header_nav_items_left" ("_parent_id");`,
      `DO $$ BEGIN ALTER TABLE "header_nav_items_left" ADD CONSTRAINT "header_nav_items_left_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "header"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "header_nav_items_right" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_header_nav_items_right_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL);`,
      `CREATE INDEX IF NOT EXISTS "header_nav_items_right_order_idx" ON "header_nav_items_right" ("_order");`,
      `CREATE INDEX IF NOT EXISTS "header_nav_items_right_parent_id_idx" ON "header_nav_items_right" ("_parent_id");`,
      `DO $$ BEGIN ALTER TABLE "header_nav_items_right" ADD CONSTRAINT "header_nav_items_right_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "header"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "header_rels" ("id" serial PRIMARY KEY NOT NULL, "order" integer, "parent_id" integer NOT NULL, "path" varchar NOT NULL, "pages_id" integer, "posts_id" integer);`,
      `CREATE INDEX IF NOT EXISTS "header_rels_order_idx" ON "header_rels" ("order");`,
      `CREATE INDEX IF NOT EXISTS "header_rels_parent_idx" ON "header_rels" ("parent_id");`,
      `CREATE INDEX IF NOT EXISTS "header_rels_path_idx" ON "header_rels" ("path");`,
      `CREATE INDEX IF NOT EXISTS "header_rels_pages_id_idx" ON "header_rels" ("pages_id");`,
      `CREATE INDEX IF NOT EXISTS "header_rels_posts_id_idx" ON "header_rels" ("posts_id");`,
      `DO $$ BEGIN ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "header"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      // footer
      `CREATE TABLE IF NOT EXISTS "footer" ("id" serial PRIMARY KEY NOT NULL, "newsletter_heading" varchar, "newsletter_subtext" varchar, "brand_name" varchar, "brand_tagline" varchar, "contact_email" varchar, "contact_hours" varchar, "instagram_url" varchar, "tiktok_url" varchar, "pinterest_url" varchar, "facebook_url" varchar, "column1_heading" varchar, "column2_heading" varchar, "column3_heading" varchar, "copyright_text" varchar, "made_with_text" varchar, "updated_at" timestamp(3) with time zone, "created_at" timestamp(3) with time zone);`,
      `CREATE TABLE IF NOT EXISTS "footer_column1_links" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_footer_column1_links_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL);`,
      `CREATE INDEX IF NOT EXISTS "footer_column1_links_order_idx" ON "footer_column1_links" ("_order");`,
      `CREATE INDEX IF NOT EXISTS "footer_column1_links_parent_id_idx" ON "footer_column1_links" ("_parent_id");`,
      `DO $$ BEGIN ALTER TABLE "footer_column1_links" ADD CONSTRAINT "footer_column1_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "footer"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "footer_column2_links" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_footer_column2_links_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL);`,
      `CREATE INDEX IF NOT EXISTS "footer_column2_links_order_idx" ON "footer_column2_links" ("_order");`,
      `CREATE INDEX IF NOT EXISTS "footer_column2_links_parent_id_idx" ON "footer_column2_links" ("_parent_id");`,
      `DO $$ BEGIN ALTER TABLE "footer_column2_links" ADD CONSTRAINT "footer_column2_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "footer"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "footer_column3_links" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_footer_column3_links_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL);`,
      `CREATE INDEX IF NOT EXISTS "footer_column3_links_order_idx" ON "footer_column3_links" ("_order");`,
      `CREATE INDEX IF NOT EXISTS "footer_column3_links_parent_id_idx" ON "footer_column3_links" ("_parent_id");`,
      `DO $$ BEGIN ALTER TABLE "footer_column3_links" ADD CONSTRAINT "footer_column3_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "footer"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "footer_rels" ("id" serial PRIMARY KEY NOT NULL, "order" integer, "parent_id" integer NOT NULL, "path" varchar NOT NULL, "pages_id" integer, "posts_id" integer);`,
      `CREATE INDEX IF NOT EXISTS "footer_rels_order_idx" ON "footer_rels" ("order");`,
      `CREATE INDEX IF NOT EXISTS "footer_rels_parent_idx" ON "footer_rels" ("parent_id");`,
      `CREATE INDEX IF NOT EXISTS "footer_rels_path_idx" ON "footer_rels" ("path");`,
      `CREATE INDEX IF NOT EXISTS "footer_rels_pages_id_idx" ON "footer_rels" ("pages_id");`,
      `CREATE INDEX IF NOT EXISTS "footer_rels_posts_id_idx" ON "footer_rels" ("posts_id");`,
      `DO $$ BEGIN ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "footer"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    ]

    for (const s of statements) {
      try {
        await db.execute(sql.raw(s))
        log.push(`OK: ${s.substring(0, 50)}`)
      } catch (err: any) {
        log.push(`ERR: ${s.substring(0, 50)} → ${err.message}`)
      }
    }

    // Ensure initial rows
    try {
      const hr = await db.execute(sql`SELECT id FROM header LIMIT 1`)
      if (!hr.rows?.length) {
        await db.execute(sql`INSERT INTO header (announcement_bar, updated_at, created_at) VALUES ('Free UK shipping on orders over £30', NOW(), NOW())`)
        log.push('INSERTED header row')
      } else {
        log.push(`header row exists id=${hr.rows[0].id}`)
      }
    } catch (err: any) { log.push(`header row ERR: ${err.message}`) }

    try {
      const fr = await db.execute(sql`SELECT id FROM footer LIMIT 1`)
      if (!fr.rows?.length) {
        await db.execute(sql`INSERT INTO footer (brand_name, updated_at, created_at) VALUES ('Your Brand', NOW(), NOW())`)
        log.push('INSERTED footer row')
      } else {
        log.push(`footer row exists id=${fr.rows[0].id}`)
      }
    } catch (err: any) { log.push(`footer row ERR: ${err.message}`) }

    // Verify via Payload API
    let headerOk = false, footerOk = false
    try { await payload.findGlobal({ slug: 'header' }); headerOk = true; log.push('VERIFY header OK') } catch (err: any) { log.push(`VERIFY header FAIL: ${err.message.substring(0, 150)}`) }
    try { await payload.findGlobal({ slug: 'footer' }); footerOk = true; log.push('VERIFY footer OK') } catch (err: any) { log.push(`VERIFY footer FAIL: ${err.message.substring(0, 150)}`) }

    return NextResponse.json({ success: headerOk && footerOk, headerOk, footerOk, log })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
