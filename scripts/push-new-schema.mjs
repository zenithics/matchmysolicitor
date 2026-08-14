/**
 * Pre-applies new Pressed Nailzz schema objects to Neon so drizzle-kit's
 * dev-push doesn't show interactive prompts on next `pnpm dev`.
 *
 * Uses `pg` (node-postgres) — a direct dev dependency.
 * Run: node --env-file=.env scripts/push-new-schema.mjs
 */

import pg from 'pg'
const { Client } = pg

const connStr = process.env.POSTGRES_URL
if (!connStr) { console.error('POSTGRES_URL not set'); process.exit(1) }

const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
await client.connect()
console.log('Connected to Neon.')

const statements = [
  // ── enums ────────────────────────────────────────────────────────────────
  `DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_hero_split_links_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_hero_split_links_link_appearance" AS ENUM('default','outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_hero_split_image_position" AS ENUM('right','left'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_hero_split_theme" AS ENUM('light','dark'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_hero_split_links_link_type" AS ENUM('reference','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_hero_split_links_link_appearance" AS ENUM('default','outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_hero_split_image_position" AS ENUM('right','left'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_hero_split_theme" AS ENUM('light','dark'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_nail_gallery_layout" AS ENUM('masonry','grid','scroll'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_nail_gallery_layout" AS ENUM('masonry','grid','scroll'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_products_nail_shape" AS ENUM('almond','square','coffin','stiletto','oval','round','squoval'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."enum_products_finish_type" AS ENUM('glossy','matte','both'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // ── pages_blocks_hero_split_links ────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_hero_split_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "link_type" "public"."enum_pages_blocks_hero_split_links_link_type" DEFAULT 'reference',
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "public"."enum_pages_blocks_hero_split_links_link_appearance" DEFAULT 'default',
    "_uuid" varchar
  )`,

  // ── pages_blocks_hero_split ──────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_hero_split" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "badge_text" varchar,
    "headline" varchar,
    "subheadline" varchar,
    "image_id" integer,
    "image_position" "public"."enum_pages_blocks_hero_split_image_position" DEFAULT 'right',
    "theme" "public"."enum_pages_blocks_hero_split_theme" DEFAULT 'light',
    "_uuid" varchar,
    "block_name" varchar
  )`,

  // ── pages_blocks_how_it_works_steps ──────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_how_it_works_steps" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "title" varchar,
    "description" varchar,
    "icon_id" integer,
    "_uuid" varchar
  )`,

  // ── pages_blocks_how_it_works ─────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_how_it_works" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "heading" varchar DEFAULT 'How It Works',
    "subheading" varchar,
    "cta_text" varchar,
    "cta_link" varchar DEFAULT '/shop',
    "_uuid" varchar,
    "block_name" varchar
  )`,

  // ── pages_blocks_nail_gallery_images ──────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_nail_gallery_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "image_id" integer,
    "label" varchar,
    "product_link" varchar,
    "_uuid" varchar
  )`,

  // ── pages_blocks_nail_gallery ─────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "pages_blocks_nail_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "heading" varchar,
    "subheading" varchar,
    "layout" "public"."enum_pages_blocks_nail_gallery_layout" DEFAULT 'masonry',
    "cta_text" varchar,
    "cta_link" varchar DEFAULT '/shop',
    "_uuid" varchar,
    "block_name" varchar
  )`,

  // ── _pages_v versions (draft/version storage) ─────────────────────────────
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero_split_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "link_type" "public"."enum__pages_v_blocks_hero_split_links_link_type" DEFAULT 'reference',
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "public"."enum__pages_v_blocks_hero_split_links_link_appearance" DEFAULT 'default',
    "_uuid" varchar
  )`,
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero_split" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "badge_text" varchar,
    "headline" varchar,
    "subheadline" varchar,
    "image_id" integer,
    "image_position" "public"."enum__pages_v_blocks_hero_split_image_position" DEFAULT 'right',
    "theme" "public"."enum__pages_v_blocks_hero_split_theme" DEFAULT 'light',
    "_uuid" varchar,
    "block_name" varchar
  )`,
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_how_it_works_steps" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "title" varchar,
    "description" varchar,
    "icon_id" integer,
    "_uuid" varchar
  )`,
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_how_it_works" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "heading" varchar DEFAULT 'How It Works',
    "subheading" varchar,
    "cta_text" varchar,
    "cta_link" varchar DEFAULT '/shop',
    "_uuid" varchar,
    "block_name" varchar
  )`,
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_nail_gallery_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY,
    "image_id" integer,
    "label" varchar,
    "product_link" varchar,
    "_uuid" varchar
  )`,
  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_nail_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY,
    "heading" varchar,
    "subheading" varchar,
    "layout" "public"."enum__pages_v_blocks_nail_gallery_layout" DEFAULT 'masonry',
    "cta_text" varchar,
    "cta_link" varchar DEFAULT '/shop',
    "_uuid" varchar,
    "block_name" varchar
  )`,

  // ── products table alterations ────────────────────────────────────────────
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "nail_shape" "public"."enum_products_nail_shape"[]`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "finish_type" "public"."enum_products_finish_type"`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_custom_order" boolean DEFAULT false`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "care_instructions" jsonb`,
]

console.log(`Applying ${statements.length} SQL statements...`)
let ok = 0
for (const sql of statements) {
  try {
    await client.query(sql)
    process.stdout.write('.')
    ok++
  } catch (err) {
    console.error(`\nFailed on statement ${ok + 1}:\n${err.message}`)
    await client.end()
    process.exit(1)
  }
}

await client.end()
console.log(`\nAll ${ok} statements applied. Schema is ready — run pnpm dev now.`)
