#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Zenithics CMS - One-Command Site Deployment
# Creates: GitHub repo + Neon DB + Vercel project + Blob storage + deploys
# ============================================================================

echo ""
echo "🚀 Zenithics CMS - New Site Deployment"
echo "======================================="
echo ""

# --- Check & install dependencies ---
echo "🔍 Checking dependencies..."

for cmd in curl python3 openssl git; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Required tool '$cmd' is not installed. Please install it and re-run."
    exit 1
  fi
done

echo "✅ All dependencies ready"
echo ""

# --- Load credentials ---
# Supports both Codespace secrets (env vars) and .env.deploy file fallback
ENV_FILE="$HOME/.env.deploy"
if [ -f "$ENV_FILE" ]; then
  echo "📄 Loading credentials from $ENV_FILE"
  source "$ENV_FILE"
else
  echo "📄 No .env.deploy file found — checking environment variables (Codespace secrets)"
fi

# Resolve GitHub token: GH_DEPLOY_TOKEN takes priority over GITHUB_TOKEN
# (Codespaces auto-sets GITHUB_TOKEN but it's repo-scoped and can't create new repos)
if [ -n "${GH_DEPLOY_TOKEN:-}" ]; then
  GITHUB_TOKEN="$GH_DEPLOY_TOKEN"
  echo "   Using GH_DEPLOY_TOKEN for GitHub API"
elif [ -z "${GITHUB_TOKEN:-}" ]; then
  echo ""
  echo "❌ No GitHub token found."
  echo ""
  echo "   Create a Classic PAT at: https://github.com/settings/tokens/new?scopes=repo,workflow"
  echo "   Then set it: export GITHUB_TOKEN=ghp_your_token_here"
  echo "   Or add GH_DEPLOY_TOKEN as a Codespace secret."
  exit 1
fi

# Validate required vars
MISSING_VARS=()
for var in GITHUB_TOKEN NEON_API_KEY NEON_ORG_ID VERCEL_TOKEN VERCEL_TEAM_ID; do
  if [ -z "${!var:-}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo ""
  echo "❌ Missing credentials: ${MISSING_VARS[*]}"
  echo ""
  echo "Set them as Codespace secrets (recommended):"
  echo "  → github.com/settings/codespaces → New secret"
  echo "  → Scope to zenithics/zenithics-starter"
  echo ""
  echo "Or create ~/.env.deploy with the missing variables."
  exit 1
fi
echo "✅ All credentials loaded"

# --- Collect project info ---
read -rp "Project slug (lowercase, hyphens, e.g. acme-plumbing): " PROJECT_SLUG
read -rp "Client display name (e.g. Acme Plumbing Ltd): " CLIENT_NAME
read -rp "Use ecommerce add-on? (y/n): " USE_ECOM
read -rp "Is this a multi-site project? (y/n): " USE_MULTISITE

# Sanitise slug
PROJECT_SLUG=$(echo "$PROJECT_SLUG" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')

# --- Multi-site configuration ---
MULTISITE_TENANTS=()
MULTISITE_GLOBAL="n"
MULTISITE_KNOWN_SLUGS=""
MULTISITE_DOMAIN_MAP=""

if [ "$USE_MULTISITE" = "y" ] || [ "$USE_MULTISITE" = "Y" ]; then
  echo ""
  echo "🌐 Multi-Site Configuration"
  echo "==========================="
  echo ""
  read -rp "How many regional/sub-sites? (e.g. 3): " TENANT_COUNT
  read -rp "Include a global landing site with region selector popup? (y/n): " MULTISITE_GLOBAL

  if [ "$MULTISITE_GLOBAL" = "y" ] || [ "$MULTISITE_GLOBAL" = "Y" ]; then
    echo ""
    echo "   ℹ️  A 'Global' tenant will be created automatically as the landing page."
    MULTISITE_TENANTS+=("Global|global||en|true")
    MULTISITE_KNOWN_SLUGS="'global'"
  fi

  for i in $(seq 1 "$TENANT_COUNT"); do
    echo ""
    echo "--- Site $i of $TENANT_COUNT ---"
    read -rp "Site name (e.g. United Kingdom): " T_NAME
    read -rp "Slug (e.g. en-gb): " T_SLUG
    read -rp "Locale (e.g. en-GB): " T_LOCALE
    read -rp "Custom domain (optional, press Enter to skip): " T_DOMAIN

    T_SLUG=$(echo "$T_SLUG" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
    MULTISITE_TENANTS+=("$T_NAME|$T_SLUG|$T_DOMAIN|$T_LOCALE|false")

    if [ -n "$MULTISITE_KNOWN_SLUGS" ]; then
      MULTISITE_KNOWN_SLUGS="$MULTISITE_KNOWN_SLUGS, '$T_SLUG'"
    else
      MULTISITE_KNOWN_SLUGS="'$T_SLUG'"
    fi

    if [ -n "$T_DOMAIN" ]; then
      if [ -n "$MULTISITE_DOMAIN_MAP" ]; then
        MULTISITE_DOMAIN_MAP="$MULTISITE_DOMAIN_MAP, '$T_DOMAIN': '$T_SLUG'"
      else
        MULTISITE_DOMAIN_MAP="'$T_DOMAIN': '$T_SLUG'"
      fi
    fi
  done

  echo ""
  echo "📋 Tenants configured:"
  for t in "${MULTISITE_TENANTS[@]}"; do
    IFS='|' read -r name slug domain locale is_global <<< "$t"
    if [ -n "$domain" ]; then
      echo "   • $name ($slug) → $domain [$locale]"
    else
      echo "   • $name ($slug) [$locale]"
    fi
  done
fi

echo ""
echo "📋 Configuration:"
echo "   Slug:       $PROJECT_SLUG"
echo "   Client:     $CLIENT_NAME"
echo "   Ecommerce:  $USE_ECOM"
echo "   Multi-site: $USE_MULTISITE"
echo ""
read -rp "Continue? (y/n): " CONFIRM
[ "$CONFIRM" != "y" ] && echo "Cancelled." && exit 0

# Generate secrets
PAYLOAD_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 16)

# ============================================================================
# STEP 1: Create GitHub repo from template
# ============================================================================
echo ""
echo "📦 Step 1/5: Creating GitHub repo..."

# Use GitHub REST API to generate a repo from the template (no gh CLI needed)
REPO_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.github.com/repos/zenithics/zenithics-starter/generate" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{
    \"owner\": \"zenithics\",
    \"name\": \"$PROJECT_SLUG\",
    \"description\": \"$CLIENT_NAME - Zenithics CMS\",
    \"private\": false,
    \"include_all_branches\": false
  }")

# Split response body and HTTP status code
REPO_HTTP_CODE=$(echo "$REPO_RESPONSE" | tail -1)
REPO_BODY=$(echo "$REPO_RESPONSE" | sed '$d')

if [ "$REPO_HTTP_CODE" != "201" ]; then
  echo "❌ GitHub repo creation failed (HTTP $REPO_HTTP_CODE):"
  echo "$REPO_BODY" | python3 -m json.tool 2>/dev/null || echo "$REPO_BODY"
  echo ""
  if echo "$REPO_BODY" | grep -q "Not Found"; then
    echo "   Likely cause: your token doesn't have access to the zenithics org."
    echo "   Go to: https://github.com/settings/tokens → click your token"
    echo "   → scroll to 'Organization access' → click 'Authorize' next to zenithics"
  fi
  exit 1
fi

echo "   ✅ Repo created: https://github.com/zenithics/$PROJECT_SLUG"

# Clone the new repo
echo "   Cloning repo..."
# Short pause to let GitHub finish generating (template repos can take a moment)
sleep 3
git clone "https://x-access-token:***@github.com/zenithics/$PROJECT_SLUG.git"
echo "   ✅ Repo cloned"

# ============================================================================
# STEP 2: Create Neon database
# ============================================================================
echo ""
echo "🗄️  Step 2/5: Creating Neon database..."

echo "   Calling Neon API (org: $NEON_ORG_ID)..."
NEON_RESPONSE=$(curl -s --max-time 30 -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"project\": {
      \"name\": \"$PROJECT_SLUG\",
      \"org_id\": \"$NEON_ORG_ID\",
      \"pg_version\": 16,
      \"region_id\": \"aws-eu-west-2\"
    }
  }")
echo "   Neon API responded."

# Extract connection string (|| true prevents set -e from killing the script on parse failure)
NEON_HOST=$(echo "$NEON_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['connection_uris'][0]['connection_uri'])" 2>/dev/null || true)

if [ -z "$NEON_HOST" ]; then
  echo "❌ Neon creation failed. Response:"
  echo "$NEON_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NEON_RESPONSE"
  exit 1
fi

# Two connection strings, deliberately different — do not unify them:
#   DATABASE_URI  → Neon's DIRECT endpoint. Used by scripts/setup-db.mjs for migrations,
#                   which must not go through PgBouncer.
#   POSTGRES_URL  → Neon's POOLED (-pooler) endpoint. Used by the Payload adapter at runtime.
#                   On the direct endpoint, serverless concurrency exhausts Neon's connection
#                   limit and routes fail intermittently with "Couldn't connect to compute node"
#                   — random 500s on different pages each request, and occasional build failures.
DATABASE_URI="${NEON_HOST}?sslmode=require"
POSTGRES_URL=$(python3 -c "
import sys
from urllib.parse import urlsplit, urlunsplit
u = urlsplit(sys.argv[1])
host = u.hostname or ''
if '-pooler.' not in host:
    head, _, tail = host.partition('.')
    host = f'{head}-pooler.{tail}' if tail else f'{head}-pooler'
netloc = f'{u.username}:{u.password}@{host}' + (f':{u.port}' if u.port else '')
print(urlunsplit((u.scheme, netloc, u.path, u.query, u.fragment)))
" "$DATABASE_URI")
echo "   ✅ Database created: $PROJECT_SLUG (eu-west-2)"
echo "      runtime → pooled endpoint, migrations → direct endpoint"

# ============================================================================
# STEP 3: Create Vercel project
# ============================================================================
echo ""
echo "🔺 Step 3/5: Creating Vercel project..."

VERCEL_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects?teamId=$VERCEL_TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_SLUG\",
    \"framework\": \"nextjs\",
    \"gitRepository\": {
      \"repo\": \"zenithics/$PROJECT_SLUG\",
      \"type\": \"github\"
    },
    \"buildCommand\": \"pnpm run deploy\",
    \"installCommand\": \"pnpm install\"
  }")

VERCEL_PROJECT_ID=$(echo "$VERCEL_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || true)

if [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "❌ Vercel project creation failed. Response:"
  echo "$VERCEL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$VERCEL_RESPONSE"
  exit 1
fi

SITE_URL="https://$PROJECT_SLUG.vercel.app"
echo "   ✅ Vercel project created: $SITE_URL"

# ============================================================================
# STEP 4: Create Vercel Blob store + set env vars
# ============================================================================
echo ""
echo "📎 Step 4/5: Creating Blob storage & setting env vars..."

# Create Blob store.
# The store MUST be PUBLIC. Payload's vercelBlobStorage plugin uploads with access: 'public',
# so a private store rejects every upload and POST /api/media returns a bare
# {"errors":[{"message":"Something went wrong."}]} 500 — even for a 1x1 PNG, which makes it
# look like an image-processing bug. Access mode is IMMUTABLE after creation: the only fix
# is to delete the store and create a new one, so it is checked below before we go further.
BLOB_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v1/blob/stores?teamId=$VERCEL_TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${PROJECT_SLUG}-media\",
    \"projectId\": \"$VERCEL_PROJECT_ID\",
    \"access\": \"public\"
  }" 2>/dev/null)

BLOB_TOKEN=$(echo "$BLOB_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('clientToken', d.get('token','')))" 2>/dev/null || true)
BLOB_STORE_ID=$(echo "$BLOB_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('store',d); print(s.get('id',''))" 2>/dev/null || true)

# Set environment variables
set_env_var() {
  local key=$1
  local value=$2
  curl -s -X POST "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"type\": \"encrypted\",
      \"target\": [\"production\", \"preview\", \"development\"]
    }" > /dev/null 2>&1
}

set_env_var "POSTGRES_URL" "$POSTGRES_URL"   # pooled — runtime
set_env_var "DATABASE_URI" "$DATABASE_URI"   # direct — migrations
set_env_var "PAYLOAD_SECRET" "$PAYLOAD_SECRET"
set_env_var "CRON_SECRET" "$CRON_SECRET"
set_env_var "NEXT_PUBLIC_SERVER_URL" "$SITE_URL"

if [ -n "$BLOB_TOKEN" ]; then
  set_env_var "BLOB_READ_WRITE_TOKEN" "$BLOB_TOKEN"
  echo "   ✅ Blob storage created & linked"

  # Verify the store really is public — the API silently ignores an unknown "access" field,
  # and a private store breaks every media upload with an unhelpful 500.
  BLOB_ACCESS=$(curl -s "https://api.vercel.com/v1/storage/stores?teamId=$VERCEL_TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" 2>/dev/null | python3 -c "
import sys, json
want_id, want_name = sys.argv[1], sys.argv[2]
try:
    stores = json.load(sys.stdin).get('stores', [])
except Exception:
    sys.exit(0)
for s in stores:
    if (want_id and s.get('id') == want_id) or s.get('name') == want_name:
        print(s.get('access', ''))
        break
" "$BLOB_STORE_ID" "${PROJECT_SLUG}-media" 2>/dev/null || true)

  if [ "$BLOB_ACCESS" = "public" ]; then
    echo "   ✅ Blob store access verified: public"
  else
    echo ""
    echo "   ❌ BLOB STORE IS NOT PUBLIC (access: ${BLOB_ACCESS:-unknown})"
    echo "      Every media upload will fail with a 500 until this is fixed, and"
    echo "      access mode CANNOT be changed after creation."
    echo "      Fix (2 minutes): Vercel → this project → Storage → disconnect and delete"
    echo "      '${PROJECT_SLUG}-media', then Create Store → Blob → set access to Public,"
    echo "      connect it to the project with prefix BLOB, and redeploy."
    echo "      Disconnect the old store BEFORE creating the new one, or the two"
    echo "      BLOB_READ_WRITE_TOKEN values clash."
    echo ""
  fi
else
  echo ""
  echo "   ❌ BLOB STORE CREATION FAILED — media uploads will NOT work until fixed!"
  echo "   ╔══════════════════════════════════════════════════════════════╗"
  echo "   ║  Manual fix required (30 seconds):                         ║"
  echo "   ║  1. Go to vercel.com → this project → Storage tab          ║"
  echo "   ║  2. Click 'Connect Store' → 'Blob'                        ║"
  echo "   ║  3. Create a new store (any name)                          ║"
  echo "   ║  4. It auto-sets BLOB_READ_WRITE_TOKEN                    ║"
  echo "   ║  5. Redeploy after connecting                              ║"
  echo "   ╚══════════════════════════════════════════════════════════════╝"
  echo ""
fi

echo "   ✅ Environment variables set (5 vars)"

# ============================================================================
# STEP 5: Trigger deployment
# ============================================================================
echo ""
echo "🚀 Step 5/5: Triggering deployment..."

# Create a deployment hook or trigger via Vercel API
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$VERCEL_TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_SLUG\",
    \"project\": \"$VERCEL_PROJECT_ID\",
    \"gitSource\": {
      \"type\": \"github\",
      \"org\": \"zenithics\",
      \"repo\": \"$PROJECT_SLUG\",
      \"ref\": \"main\"
    },
    \"target\": \"production\"
  }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))" 2>/dev/null || true)

echo "   ✅ Deployment triggered"
echo ""

# ============================================================================
# STEP 6 (Optional): Apply ecommerce add-on
# ============================================================================
if [ "$USE_ECOM" = "y" ] || [ "$USE_ECOM" = "Y" ]; then
  echo "🛒 Applying ecommerce add-on..."
  cd "$PROJECT_SLUG"

  # Clone ecom addon to temp
  git clone --depth 1 "https://x-access-token:***@github.com/zenithics/zenithics-ecom-addon.git" /tmp/ecom-addon

  # Copy ecom files (addon repo has files at root, target project uses src/)
  mkdir -p src/collections src/blocks src/globals src/components src/stripe src/seed src/hooks src/utilities
  cp -r /tmp/ecom-addon/collections/* src/collections/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/blocks/* src/blocks/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/globals/* src/globals/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/components/* src/components/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/stripe/* src/stripe/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/seed/* src/seed/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/hooks/* src/hooks/ 2>/dev/null || true
  cp -r /tmp/ecom-addon/utilities/* src/utilities/ 2>/dev/null || true
  # Copy app routes (shop, cart, checkout, account, api, sitemaps)
  cp -r /tmp/ecom-addon/app/ src/app-ecom-temp/ 2>/dev/null || true
  if [ -d "src/app-ecom-temp" ]; then
    cp -r src/app-ecom-temp/* src/app/ 2>/dev/null || true
    rm -rf src/app-ecom-temp
  fi
  cp /tmp/ecom-addon/CLAUDE-ECOMMERCE.md . 2>/dev/null || true
  cp /tmp/ecom-addon/INSTALL.md ECOM-INSTALL.md 2>/dev/null || true

  # Install ecom npm dependencies
  echo "   📦 Installing ecommerce dependencies..."
  pnpm add stripe @stripe/react-stripe-js @stripe/stripe-js 2>/dev/null || true

  # Prompt user to run Claude Code for config integration
  echo ""
  echo "   📋 Ecom files copied. Now run Claude Code to wire them into the CMS:"
  echo ""
  echo '   claude "Follow ECOM-INSTALL.md to integrate all ecommerce collections,'
  echo '   globals (ShopSettings AND AISettings), blocks, and routes into'
  echo '   payload.config.ts, RenderBlocks.tsx, providers, and app routes.'
  echo '   The ecom files and npm packages are already in the project.'
  echo '   Skip Steps 1 and 2 (already done). Start from Step 3."'
  echo ""
  echo "   After Claude Code finishes, run migrations:"
  echo "   export POSTGRES_URL=\"<connection string from Vercel env vars or Neon dashboard>\""
  echo "   pnpm payload migrate:create && pnpm payload migrate"
  echo ""

  # Add Stripe env var placeholders
  set_env_var "STRIPE_SECRET_KEY" "sk_test_placeholder"
  set_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_test_placeholder"
  set_env_var "STRIPE_WEBHOOK_SECRET" "whsec_placeholder"

  git add -A
  git commit -m "feat: add ecommerce add-on files"
  git push origin main

  cd ..
  rm -rf /tmp/ecom-addon
  echo "   ✅ Ecommerce add-on applied (Stripe keys need updating)"
fi

# ============================================================================
# STEP 7 (Optional): Apply multi-site add-on
# ============================================================================
if [ "$USE_MULTISITE" = "y" ] || [ "$USE_MULTISITE" = "Y" ]; then
  echo "🌐 Applying multi-site add-on..."
  cd "$PROJECT_SLUG"

  # Clone multisite addon to temp
  git clone --depth 1 "https://x-access-token:***@github.com/zenithics/zenithics-multisite-addon.git" /tmp/multisite-addon

  # Install multisite plugin dependency
  echo "   📦 Installing multi-tenant plugin..."
  pnpm add @payloadcms/plugin-multi-tenant 2>/dev/null || true

  # Copy addon files into project
  cp /tmp/multisite-addon/collections/Tenants.ts src/collections/
  mkdir -p src/globals
  cp /tmp/multisite-addon/globals/SiteNavigation.ts src/globals/
  cp /tmp/multisite-addon/multisite-plugin.ts src/
  cp /tmp/multisite-addon/middleware.ts src/
  cp /tmp/multisite-addon/components/TenantProvider.tsx src/components/
  cp /tmp/multisite-addon/components/SiteSwitcher.tsx src/components/
  cp /tmp/multisite-addon/components/TenantHeader.tsx src/components/
  cp /tmp/multisite-addon/components/TenantHeader.client.tsx src/components/
  cp /tmp/multisite-addon/components/TenantFooter.tsx src/components/
  cp /tmp/multisite-addon/utilities/getTenant.ts src/utilities/
  cp /tmp/multisite-addon/utilities/getTenantGlobals.ts src/utilities/
  mkdir -p src/hooks
  cp /tmp/multisite-addon/hooks/revalidateTenant.ts src/hooks/
  mkdir -p "src/app/(frontend)/[tenant]/[...slug]"
  cp "/tmp/multisite-addon/app/(frontend)/[tenant]/layout.tsx" "src/app/(frontend)/[tenant]/"
  cp "/tmp/multisite-addon/app/(frontend)/[tenant]/page.tsx" "src/app/(frontend)/[tenant]/"
  cp "/tmp/multisite-addon/app/(frontend)/[tenant]/[...slug]/page.tsx" "src/app/(frontend)/[tenant]/[...slug]/"
  cp /tmp/multisite-addon/next-config-rewrites.ts src/
  cp /tmp/multisite-addon/INSTALL.md MULTISITE-INSTALL.md

  # Pre-configure middleware with the tenant slugs and domains from the quiz
  if [ -n "$MULTISITE_KNOWN_SLUGS" ]; then
    sed -i "s|new Set(\[.*\])|new Set([$MULTISITE_KNOWN_SLUGS])|" src/middleware.ts 2>/dev/null || true
  fi
  if [ -n "$MULTISITE_DOMAIN_MAP" ]; then
    sed -i "s|const DOMAIN_TENANT_MAP:.*=.*{.*}|const DOMAIN_TENANT_MAP: Record<string, string> = { $MULTISITE_DOMAIN_MAP }|" src/middleware.ts 2>/dev/null || true
  fi
  if [ "$MULTISITE_GLOBAL" = "y" ] || [ "$MULTISITE_GLOBAL" = "Y" ]; then
    sed -i "s|const GLOBAL_TENANT_SLUG =.*|const GLOBAL_TENANT_SLUG = 'global'|" src/middleware.ts 2>/dev/null || true
  fi

  # Generate a seed script for tenants
  SEED_FILE="src/seed/tenants.ts"
  mkdir -p src/seed
  cat > "$SEED_FILE" << 'SEED_HEADER'
import type { Payload } from 'payload'

/**
 * Seed tenants — run via: pnpm payload run src/seed/tenants.ts
 * Auto-generated by deploy script based on your multi-site answers.
 */
export async function seedTenants(payload: Payload): Promise<void> {
  console.log('🌐 Seeding tenants...')

  const tenants = [
SEED_HEADER

  # Add each tenant to the seed file
  for t in "${MULTISITE_TENANTS[@]}"; do
    IFS='|' read -r name slug domain locale is_global <<< "$t"
    cat >> "$SEED_FILE" << TENANT_ENTRY
    {
      name: '$name',
      slug: '$slug',
      domain: '${domain:-}',
      locale: '$locale',
      isGlobal: $is_global,
      enabled: true,
    },
TENANT_ENTRY
  done

  cat >> "$SEED_FILE" << 'SEED_FOOTER'
  ]

  for (const tenant of tenants) {
    const existing = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: tenant.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'tenants',
        data: tenant as any,
      })
      console.log(`   ✅ Created tenant: ${tenant.name} (${tenant.slug})`)
    } else {
      console.log(`   ⏭️  Tenant already exists: ${tenant.name} (${tenant.slug})`)
    }
  }

  console.log('✅ Tenant seeding complete')
}
SEED_FOOTER

  echo ""
  echo "   📋 Multi-site files copied. Now run Claude Code to wire them up:"
  echo ""
  echo '   claude "Follow MULTISITE-INSTALL.md to integrate the multi-site addon.'
  echo '   The files and @payloadcms/plugin-multi-tenant package are already installed.'
  echo '   Wire up Tenants and SiteNavigation in payload.config.ts, add the'
  echo '   multisitePlugin, and update the root layout to use TenantProvider.'
  echo '   Skip Steps 1 and 2 (already done). Start from Step 3."'
  echo ""
  echo "   After Claude Code finishes, run migrations:"
  echo "   export POSTGRES_URL=\"<connection string from Vercel env vars or Neon dashboard>\""
  echo "   pnpm payload migrate:create && pnpm payload migrate"
  echo ""

  # If ecom is also enabled, remind about scoping ecom collections
  if [ "$USE_ECOM" = "y" ] || [ "$USE_ECOM" = "Y" ]; then
    echo "   ⚠️  Also tell Claude to add ecommerce collections to the multisite plugin"
    echo "      config so each tenant gets their own products, orders, etc."
    echo ""
  fi

  git add -A
  git commit -m "feat: add multi-site add-on with ${#MULTISITE_TENANTS[@]} tenants"
  git push origin main

  cd ..
  rm -rf /tmp/multisite-addon
  echo "   ✅ Multi-site add-on applied (${#MULTISITE_TENANTS[@]} tenants configured)"
fi

# ============================================================================
# DONE
# ============================================================================
echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "Live site:   $SITE_URL"
echo "CMS admin:   $SITE_URL/admin"
echo "GitHub repo: https://github.com/zenithics/$PROJECT_SLUG"
echo ""
echo "⏳ First deploy takes 2-3 minutes. Check progress:"
echo "   https://vercel.com/zenithics/$PROJECT_SLUG"
echo ""
STEP=1
echo "📝 Next steps:"
echo "   $STEP. Wait for deploy to finish on Vercel"; ((STEP++))
echo "   $STEP. Visit $SITE_URL/admin and create your admin account"; ((STEP++))
echo "   $STEP. Open the repo in Codespaces for frontend design"; ((STEP++))
echo "   $STEP. Use the Frontend Design Guide with Claude Code"; ((STEP++))
if [ "$USE_ECOM" = "y" ] || [ "$USE_ECOM" = "Y" ]; then
  echo "   $STEP. Run Claude Code to wire ecom into the CMS (see prompt above)"; ((STEP++))
  echo "   $STEP. Run DB migrations (POSTGRES_URL from Vercel env vars or Neon dashboard)"; ((STEP++))
  echo "   $STEP. Update Stripe keys in Vercel env vars"; ((STEP++))
  echo "   $STEP. Set up Stripe webhook pointing to $SITE_URL/api/webhooks/stripe"; ((STEP++))
fi
if [ "$USE_MULTISITE" = "y" ] || [ "$USE_MULTISITE" = "Y" ]; then
  echo "   $STEP. Run Claude Code to wire up the multi-site plugin (see prompt above)"; ((STEP++))
  echo "   $STEP. Run DB migrations (POSTGRES_URL from Vercel env vars or Neon dashboard)"; ((STEP++))
  echo "   $STEP. Create tenants in CMS admin → Multi-Site → Tenants (or run seed script)"; ((STEP++))
  echo "   $STEP. Set up per-tenant navigation in CMS admin → Site Navigation"; ((STEP++))
  if [ -n "$MULTISITE_DOMAIN_MAP" ]; then
    echo "   $STEP. Add custom domains in Vercel → Project Settings → Domains"; ((STEP++))
  fi
fi
echo ""
echo "🎨 To start designing, open Codespaces on the new repo and run:"
echo '   claude "Read CLAUDE.md and CLAUDE-DESIGN.md, then design the website"'
echo ""
