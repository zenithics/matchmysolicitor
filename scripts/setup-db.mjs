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

if (process.env.DB_RESET === '1') {
  // Escape hatch for the one case the logic below cannot solve safely:
  // the database has tables but no migration history, so there is nothing to
  // diff against. `migrate:create` then emits a full create-everything
  // migration, which collides with the tables that already exist
  // ("index already exists") and the deploy dies.
  //
  // This drops every Payload table and rebuilds the schema from the current
  // config. DESTRUCTIVE — all content and users are lost. Only set DB_RESET=1
  // deliberately, on a database whose contents you are willing to lose, and
  // remove it immediately afterwards.
  console.log('\n⚠  DB_RESET=1 — rebuilding the schema from scratch. All data will be lost.')
  try {
    run('echo y | npx payload migrate:create --name initial')
  } catch (err) {
    console.warn('migrate:create exited non-zero (fine if one already exists):', err.message)
  }
  run('echo y | npx payload migrate:fresh')
  console.log('\n✓  Schema rebuilt. Remove DB_RESET now, and commit src/migrations/.')
} else if (tablesExist) {
  if (hasMigrationFiles) {
    // Committed migration files + existing DB → run incremental migrate
    // to apply any new migrations added since last deploy.
    console.log('\n▸ Running incremental migrate…')
    run('echo y | npx payload migrate')
  } else {
    // Tables exist but no migration history. We cannot generate a diff:
    // migrate:create would emit a full create-everything migration and fail
    // against the existing tables. Auto-running it here is what broke the
    // previous deploy, so refuse and explain instead of guessing.
    console.warn('\n⚠  Database has tables but no committed migrations.')
    console.warn('   Schema changes CANNOT be applied automatically in this state.')
    console.warn('   If a collection gained blocks or fields, its tables are missing')
    console.warn('   and queries against it will fail at runtime.')
    console.warn('')
    console.warn('   Fix by either:')
    console.warn('     • committing migration files to src/migrations/, or')
    console.warn('     • redeploying once with DB_RESET=1 to rebuild the schema')
    console.warn('       (destructive — drops all content).')
    console.warn('')
    console.warn('   Continuing the build with the existing schema.')
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
