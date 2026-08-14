/**
 * Pre-build database setup script.
 *
 * Checks the actual DATABASE state (not just source files) to decide what to do:
 *
 * 1. If the DB already has Payload tables → skip migration entirely.
 *    This prevents data loss on redeployment.
 *
 * 2. If the DB is empty AND no migration files exist in the repo →
 *    generate a migration from the schema and apply it with migrate:fresh.
 *
 * 3. If the DB has a migrations table but committed migration files
 *    have new/pending entries → run incremental `payload migrate`.
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import pg from 'pg'

function run(cmd) {
  console.log(`\n▸ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

async function dbHasTables() {
  const uri = process.env.DATABASE_URI
  if (!uri) {
    console.log('⚠  DATABASE_URI not set — skipping DB check')
    return false
  }

  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()

    // Check if the payload_migrations table exists
    const migTable = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_name = 'payload_migrations'
       ) AS "exists"`
    )

    if (!migTable.rows[0].exists) {
      console.log('ℹ  No payload_migrations table found — fresh database')
      return false
    }

    // Check if any migrations have been applied
    const migCount = await client.query('SELECT count(*)::int AS cnt FROM payload_migrations')
    const count = migCount.rows[0].cnt

    if (count > 0) {
      console.log(`✓  Database already has ${count} migration(s) applied — tables exist`)
      return true
    }

    console.log('ℹ  payload_migrations table exists but is empty')
    return false
  } catch (err) {
    console.warn('⚠  DB check failed (will treat as fresh):', err.message)
    return false
  } finally {
    await client.end().catch(() => {})
  }
}

// ── Main ──────────────────────────────────────────────────────────────
const idx = readFileSync('src/migrations/index.ts', 'utf8')
const hasMigrationFiles = !idx.includes('migrations = []')
const tablesExist = await dbHasTables()

if (tablesExist) {
  if (hasMigrationFiles) {
    // Committed migration files + existing DB → run incremental migrate
    // to apply any new migrations added since last deploy.
    console.log('\n▸ Running incremental migrate…')
    run('echo y | npx payload migrate')
  } else {
    // DB already set up but no committed migration files.
    // Nothing to do — skip migration to preserve existing data.
    console.log('\n✓  Database is already set up. Skipping migration to preserve data.')
    console.log('   To apply schema changes, commit migration files to src/migrations/')
  }
} else {
  // Fresh database — generate migration and apply it.
  console.log('\n⚠  Fresh database detected — generating initial migration…')
  try {
    run('echo y | npx payload migrate:create --name initial')
  } catch (err) {
    console.warn('migrate:create exited non-zero (may be fine if no diff):', err.message)
  }

  console.log('\n▸ Running migrate:fresh (initial setup)…')
  run('echo y | npx payload migrate:fresh')
}
