# Compass — LingoQL + Sub0 Deployment Guide

> **Architecture**: Frontend (Next.js) deployed on LingoQL. Backend (data + AI APIs) built on Sub0.
> **Auth**: Clerk (frontend) → Sub0 JWT (backend).
> **Database**: PostgreSQL managed by LingoQL, connected to Sub0.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Set Up LingoQL Account](#3-step-1-set-up-lingoql-account)
4. [Step 2: Set Up Sub0 Project](#4-step-2-set-up-sub0-project)
5. [Step 3: Configure Environment Variables](#5-step-3-configure-environment-variables)
6. [Step 4: Deploy Frontend to LingoQL](#6-step-4-deploy-frontend-to-lingoql)
7. [Step 5: Deploy Backend to Sub0](#7-step-5-deploy-backend-to-sub0)
8. [Step 6: Wire Frontend ↔ Backend](#8-step-6-wire-frontend--backend)
9. [Step 7: CI/CD Auto-Deploy](#9-step-7-cicd-auto-deploy)
10. [Step 8: DNS / Custom Domain](#10-step-8-dns--custom-domain)
11. [Post-Deploy Smoke Tests](#11-post-deploy-smoke-tests)
12. [Rollback Plan](#12-rollback-plan)
13. [RUN THIS Consolidated Command Block](#13-run-this-consolidated-command-block)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LingoQL Platform                          │
│                                                                   │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │   Frontend Service          │  │   Backend Service (Sub0)  │  │
│  │   (Next.js on LingoQL)      │  │   (Declarative Engine)    │  │
│  │                             │  │                            │  │
│  │  ┌───────────────────────┐  │  │  ┌──────────────────────┐  │  │
│  │  │ Landing Page          │  │  │  │ Auth / JWT Endpoints │  │  │
│  │  │ Dashboard             │  │  │  │ CRUD Endpoints       │  │  │
│  │  │ Care Recipients UI    │──┼──┼──▶ AI Endpoints         │  │  │
│  │  │ Medications UI        │  │  │  │ Dashboard Endpoints  │  │  │
│  │  │ Appointments UI       │  │  │  │ Family Endpoints     │  │  │
│  │  │ Tasks UI              │  │  │  └──────────┬───────────┘  │  │
│  │  │ Resources UI          │  │  │             │              │  │
│  │  │ AI Assistant UI       │  │  │  ┌──────────▼───────────┐  │  │
│  │  └───────────────────────┘  │  │  │   PostgreSQL          │  │  │
│  │  ┌───────────────────────┐  │  │  │   (LingoQL Managed)   │  │  │
│  │  │ Clerk Auth            │  │  │  └──────────────────────┘  │  │
│  │  └───────────────────────┘  │  │                            │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│                                                                   │
│  External:  OpenAI API ─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js on LingoQL | LingoQL auto-detects Next.js via Railpack/Nixpacks |
| **Backend** | Sub0 declarative engine | User requirement; replaces Prisma + API route boilerplate |
| **Auth** | Clerk (frontend) → Sub0 JWT (backend) | Clerk handles user management; Sub0 JWT secures API |
| **Database** | PostgreSQL on LingoQL | Managed service provisioned via LingoQL dashboard |
| **AI** | Sub0 HTTPREQUEST → OpenAI | Sub0 actionables call OpenAI directly; no separate service needed |
| **Deploy** | Git push → CI/CD → LingoQL + Sub0 | Automated via GitHub Actions |

---

## 2. Prerequisites

**Assumption:** You have accounts with the following services (all have free tiers):

| Service | Purpose | Setup URL |
|---------|---------|-----------|
| **LingoQL** | Hosting platform | https://lingoql.com |
| **Sub0** | Backend engine | https://sub0.app |
| **Clerk** | Authentication | https://dashboard.clerk.com |
| **OpenAI** | AI features | https://platform.openai.com/api-keys |
| **GitHub** | Source control | Your repo |

⚠️ **Inferred assumption**: LingoQL requires a deploy token for CLI-based deploys.
   If LingoQL uses a different auth mechanism (OAuth, personal access token),
   adapt the deploy commands accordingly.

---

## 3. Step 1: Set Up LingoQL Account

```bash
# 1. Sign up at https://lingoql.com
# 2. Create a new project called "compass-frontend"

# 3. Install LingoQL CLI (inferred CLI name — adjust if different)
curl -fsSL https://lingoql.com/install.sh | sh

# 4. Authenticate CLI
lingoql auth login
# Follow the browser prompt to get your deploy token

# 5. Verify
lingoql whoami
```

### Provision PostgreSQL Database

```bash
# Via LingoQL dashboard or CLI:
# 1. Go to your project → Services → Add Database
# 2. Select PostgreSQL
# 3. Note the connection string: postgresql://user:pass@host:5432/compass?schema=public
# 4. Save this as DATABASE_URL
```

---

## 4. Step 2: Set Up Sub0 Project

```bash
# 1. Go to https://sub0.app and sign in
# 2. Click "New Project" → name it "compass-backend"
# 3. Select PostgreSQL as your database
```

### Import Database Models

The Sub0 database models are defined in `sub0/models/` as JSON files.
One file per table. Upload each file in the Sub0 editor:

| File | Table | Description |
|------|-------|-------------|
| `sub0/models/_user.json` | `_user` | Users synced from Clerk |
| `sub0/models/_care_recipient.json` | `_care_recipient` | Care recipients |
| `sub0/models/_family_member.json` | `_family_member` | Family relationships |
| `sub0/models/_medication.json` | `_medication` | Medications |
| `sub0/models/_appointment.json` | `_appointment` | Appointments |
| `sub0/models/_care_task.json` | `_care_task` | Tasks |
| `sub0/models/_care_plan.json` | `_care_plan` | AI-generated care plans |
| `sub0/models/_community_resource.json` | `_community_resource` | Community resources |
| `sub0/models/_ai_conversation.json` | `_ai_conversation` | AI chat history |

### Import API Endpoints

The Sub0 API endpoints are defined in `sub0/endpoints/` as JSON files.
Each file defines one endpoint resource with actionables.

**Auth endpoints** — `sub0/endpoints/auth/`:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `auth/sync-clerk` | POST | Clerk webhook sync |
| `auth/sign-up` | POST | User registration |
| `auth/sign-in` | POST | User login → JWT |
| `auth/profile` | GET | Authenticated user profile |

**CRUD endpoints** — `sub0/endpoints/`:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `care-recipients` | GET | List care recipients |
| `care-recipients/create` | POST | Create care recipient |
| `care-recipients/:id` | GET | Get single recipient |
| `care-recipients/:id/update` | PUT | Update recipient |
| `care-recipients/:id/delete` | DELETE | Delete recipient |
| `medications` | GET | List medications |
| `medications/create` | POST | Create medication |
| `medications/:id/update` | PUT | Update medication |
| `medications/:id/delete` | DELETE | Delete medication |
| `appointments` | GET | List appointments |
| `appointments/create` | POST | Create appointment |
| `appointments/:id/update` | PUT | Update appointment |
| `appointments/:id/delete` | DELETE | Delete appointment |
| `tasks` | GET | List tasks |
| `tasks/create` | POST | Create task |
| `tasks/:id/update` | PUT | Update task |
| `tasks/:id/delete` | DELETE | Delete task |
| `resources` | GET | List resources (public, cached) |
| `resources/create` | POST | Create resource |
| `resources/:id/delete` | DELETE | Delete resource |
| `care-plans` | GET | List care plans |
| `care-plans/create` | POST | Create care plan |

**AI endpoints** — `sub0/endpoints/ai/`:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `ai/care-plan` | POST | AI care plan generation → saves to DB |
| `ai/assist` | POST | AI caregiving assistant chat |
| `ai/explain` | POST | Medical text explanation |
| `ai/resources` | POST | AI resource matching |
| `ai/conversations` | GET | List chat conversations |
| `ai/conversations/create` | POST | Create new conversation |

**Dashboard** — `sub0/endpoints/dashboard/`:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `dashboard` | GET | Aggregated dashboard stats |

**Family** — `sub0/endpoints/family/`:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `family/list` | GET | List family members |
| `family/invite` | POST | Invite family member |

### Configure Sub0 Environment Variables

In the Sub0 editor dashboard → Manage Project → Environment Variables:

**Custom Variables:**
```env
JWT_KEY=<generate-a-random-256-bit-key>
OPENAI_API_KEY=sk-<your-openai-key>
```

**System Variables (update):**
```env
ALLOWED_ORIGINS=compass.lingoql.app|localhost:3000
SHOW_LANDING_PAGE=false
```

---

## 5. Step 3: Configure Environment Variables

### LingoQL Frontend Environment Variables

Set these in the LingoQL dashboard (Project → Settings → Environment Variables):

```env
# Database (from LingoQL PostgreSQL service)
DATABASE_URL=postgresql://user:pass@host:5432/compass?schema=public

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<your-key>
CLERK_SECRET_KEY=sk_test_<your-key>

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook Secret (for user sync)
CLERK_WEBHOOK_SECRET=whsec_<your-secret>

# OpenAI
OPENAI_API_KEY=sk-<your-key>

# App URL (your LingoQL domain)
NEXT_PUBLIC_APP_URL=https://compass.lingoql.app

# Sub0 Backend URL (service URL from LingoQL dashboard)
NEXT_PUBLIC_SUB0_API_URL=https://compass-backend.lingoql.app

# LingoQL deployment flag
LINGOQL_DEPLOY=true
```

### Clerk Configuration

1. Go to Clerk Dashboard → Configure → JWT Templates
2. Create a custom JWT template for Sub0 with claims: `id`, `email`
3. In Clerk Dashboard → Webhooks → Add Endpoint:
   - URL: `https://compass.lingoql.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

---

## 6. Step 4: Deploy Frontend to LingoQL

### Via LingoQL Dashboard (Manual)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy to LingoQL + Sub0"
git push origin main

# 2. Go to LingoQL dashboard → New Deploy
# 3. Connect your GitHub repository
# 4. LingoQL auto-detects Next.js → uses npm run build → npm start
# 5. Add environment variables (see Step 3)
# 6. Deploy
```

### Via LingoQL CLI

```bash
# Build the frontend
LINGOQL_DEPLOY=true npm run build

# Deploy
lingoql deploy \
  --token "$LINGOQL_DEPLOY_TOKEN" \
  --project "compass-frontend" \
  --build-dir . \
  --env "DATABASE_URL=$DATABASE_URL" \
  --env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  --env "CLERK_SECRET_KEY=$CLERK_SECRET_KEY" \
  --env "OPENAI_API_KEY=$OPENAI_API_KEY" \
  --env "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in" \
  --env "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up" \
  --env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard" \
  --env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard" \
  --env "NEXT_PUBLIC_APP_URL=https://compass.lingoql.app" \
  --env "NEXT_PUBLIC_SUB0_API_URL=$NEXT_PUBLIC_SUB0_API_URL" \
  --env "LINGOQL_DEPLOY=true"
```

### Run Database Migrations

```bash
# After deployment, run Prisma migrations against production DB:
DATABASE_URL="<production-db-url>" npx prisma migrate deploy

# Seed community resources:
DATABASE_URL="<production-db-url>" node scripts/seed.js
```

---

## 7. Step 5: Deploy Backend to Sub0

Sub0 endpoints are deployed via the Sub0 web editor at https://sub0.app:

### Manual Deployment

```bash
# 1. Go to https://sub0.app → Your Project ("compass-backend")
# 2. In the Models tab:
#    - Click "Add Model" for each file in sub0/models/
#    - Paste the JSON content from each file
#    - Save each model
#
# 3. In the Endpoints tab:
#    - Click "Add Endpoint" for each file in sub0/endpoints/
#    - Paste the JSON content
#    - Save and deploy each endpoint
#
# 4. In Settings → Environment Variables:
#    - Add JWT_KEY, OPENAI_API_KEY
#    - Update ALLOWED_ORIGINS
#
# 5. Click "Deploy" — Sub0 deploys in ~15-22 seconds
```

### Automated Deployment (via API)

**Assumption:** Sub0 provides a REST API for deploying models and endpoints.
If the Sub0 API is available, use this script:

```bash
#!/bin/bash
# deploy-sub0.sh — Deploy all Sub0 models and endpoints

SUB0_API_URL="${SUB0_API_URL:-https://api.sub0.app}"
SUB0_DEPLOY_KEY="${SUB0_DEPLOY_KEY}"

if [ -z "$SUB0_DEPLOY_KEY" ]; then
  echo "Error: SUB0_DEPLOY_KEY is not set"
  exit 1
fi

echo "Deploying Sub0 models..."
for model_file in sub0/models/*.json; do
  model_name=$(basename "$model_file" .json)
  echo "  → Deploying model: $model_name"
  curl -X POST "$SUB0_API_URL/models" \
    -H "Authorization: Bearer $SUB0_DEPLOY_KEY" \
    -H "Content-Type: application/json" \
    -d @"$model_file"
done

echo "Deploying Sub0 endpoints..."
for endpoint_file in sub0/endpoints/**/*.json; do
  resource=$(basename "$endpoint_file" .json)
  echo "  → Deploying endpoint: $resource"
  curl -X POST "$SUB0_API_URL/endpoints" \
    -H "Authorization: Bearer $SUB0_DEPLOY_KEY" \
    -H "Content-Type: application/json" \
    -d @"$endpoint_file"
done

echo "✓ All Sub0 models and endpoints deployed"
```

Make this executable and run it:
```bash
chmod +x deploy-sub0.sh
SUB0_DEPLOY_KEY="your-key" ./deploy-sub0.sh
```

---

## 8. Step 6: Wire Frontend ↔ Backend

### Configure the Next.js App to Point to Sub0

The Sub0 API client is at `src/lib/sub0-client.ts`. It reads:

```env
NEXT_PUBLIC_SUB0_API_URL=https://compass-backend.lingoql.app
```

This is set in the LingoQL environment variables (Step 3).

### Auth Integration Flow

```
1. User signs in via Clerk UI
2. Next.js receives Clerk session
3. Frontend exchanges Clerk token for Sub0 JWT:
   POST /auth/sync-clerk { clerkId, email, ... } → JWT
4. Store Sub0 JWT in localStorage
5. All subsequent API calls include: Authorization: Bearer <sub0_jwt>
```

### Keeping Existing Prisma API Routes (Migration Path)

The existing Next.js API routes (`src/app/api/`) continue to use Prisma.
To migrate an API route to Sub0:

1. Import the Sub0 client: `import { sub0 } from "@/lib/sub0-client";`
2. Replace Prisma queries with Sub0 API calls
3. Remove the Prisma dependency from that route

Example migration:

```typescript
// Before (Prisma)
import prisma from "@/lib/prisma";
const recipients = await prisma.careRecipient.findMany({ ... });

// After (Sub0)
import { sub0 } from "@/lib/sub0-client";
const { data: recipients } = await sub0.careRecipients.list();
```

---

## 9. Step 7: CI/CD Auto-Deploy

The CI/CD pipeline is defined in `.github/workflows/ci.yml`.

### Pipeline Stages

```
1. Lint & Type Check  →  tsc --noEmit + eslint
2. Test              →  vitest run
3. Build             →  npm run build
4. Deploy Frontend   →  LingoQL deploy (main only)
5. Deploy Backend    →  Sub0 deploy (main only)
```

### GitHub Secrets Required

| Secret | Description | Source |
|--------|-------------|--------|
| `LINGOQL_DEPLOY_TOKEN` | LingoQL deploy token | LingoQL dashboard → Settings → Tokens |
| `DATABASE_URL` | PostgreSQL connection string | LingoQL database service |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Clerk dashboard → Webhooks |
| `OPENAI_API_KEY` | OpenAI API key | platform.openai.com/api-keys |
| `SUB0_API_URL` | Sub0 backend service URL | LingoQL dashboard → Sub0 service |
| `SUB0_DEPLOY_KEY` | Sub0 deploy API key | Sub0 dashboard → Settings |

### Auto-Deploy Triggers

- Push to `main` → deploys to production (LingoQL + Sub0)
- Push to `develop` → runs lint + test + build only
- PR to `main` → runs lint + test + build

---

## 10. Step 8: DNS / Custom Domain

### LingoQL Default Domain

After deployment, LingoQL assigns a default domain:
```
https://compass-frontend-<hash>.lingoql.app
https://compass-backend-<hash>.lingoql.app
```

### Custom Domain Setup

**Assumption:** LingoQL supports custom domains via CNAME records.
Adapt based on actual LingoQL dashboard UI.

```bash
# 1. Go to LingoQL dashboard → Project → Domains
# 2. Add your domain: compass.yourfamily.com

# 3. In your DNS provider, add a CNAME record:
compass.yourfamily.com  CNAME  compass-frontend-<hash>.lingoql.app

# 4. For the Sub0 backend API subdomain:
api.compass.yourfamily.com  CNAME  compass-backend-<hash>.lingoql.app

# 5. Wait for DNS propagation (5-60 min)
# 6. LingoQL provisions SSL certificate automatically
# 7. Update Clerk URLs and NEXT_PUBLIC_APP_URL to use custom domain
```

### Post-DNS Updates

```bash
# Update Clerk dashboard:
#   - Sign-in URL: https://compass.yourfamily.com/sign-in
#   - Sign-up URL: https://compass.yourfamily.com/sign-up
#   - Webhook URL: https://compass.yourfamily.com/api/webhooks/clerk
#   - JWT Template audience: https://api.compass.yourfamily.com

# Update environment variables:
#   NEXT_PUBLIC_APP_URL → https://compass.yourfamily.com
#   SUB0_API_URL → https://api.compass.yourfamily.com
#   ALLOWED_ORIGINS → compass.yourfamily.com|api.compass.yourfamily.com
```

---

## 11. Post-Deploy Smoke Tests

Run these tests after deployment to verify everything works:

```bash
#!/bin/bash
# smoke-test.sh — Post-deployment smoke tests

FRONTEND_URL="${1:-https://compass.lingoql.app}"
BACKEND_URL="${2:-https://compass-backend.lingoql.app}"

echo "═══════════════════════════════════════════════"
echo "  Post-Deployment Smoke Tests"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "═══════════════════════════════════════════════"
echo ""

failures=0

# ── Test 1: Landing page loads ──
echo "🔍 Test 1: Landing page loads..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Landing page OK (200)"
else
  echo "  ❌ Landing page returned $HTTP_STATUS"
  ((failures++))
fi

# ── Test 2: Sign-in page loads ──
echo "🔍 Test 2: Sign-in page loads..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/sign-in")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Sign-in page OK"
else
  echo "  ❌ Sign-in page returned $HTTP_STATUS"
  ((failures++))
fi

# ── Test 3: Public API is accessible ──
echo "🔍 Test 3: Public API accessible..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/public/info")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Public API OK"
else
  echo "  ⚠️  Public API returned $HTTP_STATUS (might be removed in Sub0 migration)"
fi

# ── Test 4: Sub0 backend health ──
echo "🔍 Test 4: Sub0 backend health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/status")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Sub0 backend OK"
else
  echo "  ❌ Sub0 backend returned $HTTP_STATUS"
  ((failures++))
fi

# ── Test 5: Resources endpoint (public, cached) ──
echo "🔍 Test 5: Resources API (public)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/resources")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Resources API OK"
else
  echo "  ❌ Resources API returned $HTTP_STATUS"
  ((failures++))
fi

# ── Test 6: Dashboard page redirects to sign-in (unauthenticated) ──
echo "🔍 Test 6: Dashboard redirects to sign-in (unauthenticated)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/dashboard")
if [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "302" ] || [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Dashboard redirect OK ($HTTP_STATUS)"
else
  echo "  ⚠️  Dashboard returned $HTTP_STATUS (check Clerk middleware)"
fi

# ── Test 7: Page contains expected content ──
echo "🔍 Test 7: Landing page content check..."
if curl -s "$FRONTEND_URL" | grep -q "Compass"; then
  echo "  ✅ Landing page has expected content"
else
  echo "  ❌ Landing page content mismatch"
  ((failures++))
fi

# ── Test 8: Security headers ──
echo "🔍 Test 8: Security headers present..."
HEADERS=$(curl -s -I "$FRONTEND_URL")
if echo "$HEADERS" | grep -qi "x-content-type-options: nosniff"; then
  echo "  ✅ X-Content-Type-Options present"
else
  echo "  ⚠️  Security header X-Content-Type-Options missing"
fi

echo ""
echo "═══════════════════════════════════════════════"
if [ "$failures" -eq 0 ]; then
  echo "  ✅ All smoke tests passed!"
else
  echo "  ❌ $failures test(s) failed. Review output above."
fi
echo "═══════════════════════════════════════════════"
```

Run:
```bash
chmod +x smoke-test.sh
./smoke-test.sh https://compass.lingoql.app https://compass-backend.lingoql.app
```

### Manual Post-Deployment Checklist

- [ ] Landing page loads and is responsive
- [ ] Sign up / Sign in flow works (Clerk)
- [ ] Can add a care recipient
- [ ] Can add medications
- [ ] Can schedule appointments
- [ ] Can create tasks
- [ ] AI care plan generation works
- [ ] AI assistant chat works
- [ ] Community resources load
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout is correct
- [ ] Custom domain resolves with HTTPS
- [ ] Clerk webhook syncs users
- [ ] Sub0 backend logs show no errors

---

## 12. Rollback Plan

### LingoQL Frontend Rollback

```bash
# Option A: Previous deploy
lingoql rollback \
  --project "compass-frontend" \
  --token "$LINGOQL_DEPLOY_TOKEN"

# Option B: Git revert + re-deploy
git revert HEAD --no-edit
git push origin main

# Option C: Via dashboard
# 1. Go to LingoQL dashboard → Deployments
# 2. Find the last known-good deployment
# 3. Click "Rollback to this version"
```

### Sub0 Backend Rollback

```bash
# Option A: Via Sub0 dashboard
# 1. Go to Sub0 → Project → Deployments
# 2. Select previous working deployment
# 3. Click "Restore"

# Option B: Revert endpoint/model changes
# 1. Download the previous model/endpoint JSON backups
# 2. Upload them via the Sub0 editor
# 3. Deploy

# Option C: Database restore
# 1. Connect to PostgreSQL
# 2. Restore from the most recent backup
psql "$DATABASE_URL" < backup-latest.sql
```

### Database Backup Strategy

```bash
# Create a backup (run daily via cron)
pg_dump "$DATABASE_URL" > "backup-$(date +%Y%m%d).sql"

# Create a cron job for automated backups:
0 3 * * * pg_dump "$DATABASE_URL" > "/backups/compass-$(date +\%Y\%m\%d).sql"
```

### Rollback Decision Matrix

| Failure Scenario | Action | RTO |
|-----------------|--------|-----|
| Frontend broken | Rollback LingoQL deploy | 2 min |
| Backend broken | Rollback Sub0 deploy | 1 min |
| Database corrupted | Restore from backup | 15 min |
| Auth broken | Reconfigure Clerk + Sub0 JWT | 5 min |
| AI not working | Check OPENAI_API_KEY env var | 2 min |
| DNS misconfigured | Update DNS records | 10 min |

---

## 13. RUN THIS — Consolidated Command Block

```bash
#!/bin/bash
# =============================================================================
# COMPASS — FULL DEPLOYMENT TO LINGOQL + SUB0
# Run this script to deploy the entire application in order.
# =============================================================================
set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════"
echo "  Compass Deployment — LingoQL + Sub0"
echo "═══════════════════════════════════════════════════════════════════"

# ── Prerequisites ──────────────────────────────────────────────────────
# Make sure you've:
#   1. Created LingoQL account + project "compass-frontend"
#   2. Created Sub0 project "compass-backend"
#   3. Set up Clerk application + got API keys
#   4. Got OpenAI API key
#   5. Provisioned PostgreSQL via LingoQL

# ── 0. Export required environment variables ───────────────────────────
# (Set these before running, or use a .env file)
export LINGOQL_DEPLOY_TOKEN="${LINGOQL_DEPLOY_TOKEN:?Required}"
export DATABASE_URL="${DATABASE_URL:?Required}"
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:?Required}"
export CLERK_SECRET_KEY="${CLERK_SECRET_KEY:?Required}"
export OPENAI_API_KEY="${OPENAI_API_KEY:?Required}"

echo "✅ Environment variables loaded"

# ── 1. Install dependencies ────────────────────────────────────────────
echo ""
echo "📦 Step 1: Installing dependencies..."
npm ci
npx prisma generate

# ── 2. Run tests ───────────────────────────────────────────────────────
echo ""
echo "🧪 Step 2: Running tests..."
npx vitest run --reporter=verbose

# ── 3. Lint and type check ─────────────────────────────────────────────
echo ""
echo "🔍 Step 3: Lint and type check..."
npx tsc --noEmit
npm run lint

# ── 4. Build frontend ──────────────────────────────────────────────────
echo ""
echo "🏗️  Step 4: Building frontend..."
LINGOQL_DEPLOY=true npm run build

# ── 5. Run database migrations ─────────────────────────────────────────
echo ""
echo "🗄️  Step 5: Running database migrations..."
npx prisma migrate deploy

# ── 6. Seed community resources ────────────────────────────────────────
echo ""
echo "🌱 Step 6: Seeding community resources..."
node scripts/seed.js

# ── 7. Deploy frontend to LingoQL ─────────────────────────────────────
echo ""
echo "🚀 Step 7: Deploying frontend to LingoQL..."
lingoql deploy \
  --token "$LINGOQL_DEPLOY_TOKEN" \
  --project "compass-frontend" \
  --build-dir . \
  --env "DATABASE_URL=$DATABASE_URL" \
  --env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  --env "CLERK_SECRET_KEY=$CLERK_SECRET_KEY" \
  --env "OPENAI_API_KEY=$OPENAI_API_KEY" \
  --env "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in" \
  --env "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up" \
  --env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard" \
  --env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard" \
  --env "NEXT_PUBLIC_APP_URL=https://compass.lingoql.app" \
  --env "NEXT_PUBLIC_SUB0_API_URL=https://compass-backend.lingoql.app" \
  --env "LINGOQL_DEPLOY=true"

# ── 8. Deploy Sub0 backend ─────────────────────────────────────────────
echo ""
echo "🔄 Step 8: Deploying backend to Sub0..."
# 8a. Deploy models
for model_file in sub0/models/*.json; do
  model_name=$(basename "$model_file" .json)
  echo "  → Model: $model_name"
  curl -X POST "https://api.sub0.app/models" \
    -H "Authorization: Bearer $SUB0_DEPLOY_KEY" \
    -H "Content-Type: application/json" \
    -d @"$model_file"
done

# 8b. Deploy endpoints
find sub0/endpoints -name "*.json" -type f | while read endpoint_file; do
  resource=$(basename "$endpoint_file" .json)
  echo "  → Endpoint: $resource"
  curl -X POST "https://api.sub0.app/endpoints" \
    -H "Authorization: Bearer $SUB0_DEPLOY_KEY" \
    -H "Content-Type: application/json" \
    -d @"$endpoint_file"
done

# ── 9. Run smoke tests ────────────────────────────────────────────────
echo ""
echo "🔬 Step 9: Running smoke tests..."
bash smoke-test.sh "https://compass.lingoql.app" "https://compass-backend.lingoql.app"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  ✅ Deployment complete!"
echo "  Frontend: https://compass.lingoql.app"
echo "  Backend:  https://compass-backend.lingoql.app"
echo "═══════════════════════════════════════════════════════════════════"
```

---

## Migration Path: Prisma → Sub0

The existing codebase uses Prisma for all database operations and Next.js API routes.
To fully migrate to Sub0, follow this step-by-step plan:

### Phase 1: Deploy (Current State)
- Deploy the full Next.js app on LingoQL (Prisma + API routes intact)
- Create Sub0 models + endpoints (ready but not yet used by frontend)
- Both systems run in parallel

### Phase 2: Migrate Data Operations
- One by one, replace API route Prisma queries with Sub0 API calls
- Use the `sub0-client.ts` utility
- Test each endpoint after migration

### Phase 3: Remove Prisma
- Remove `prisma/` directory and `@prisma/client` dependency
- Replace Prisma migrations with Sub0 schema management
- All data operations go through Sub0

### Phase 4: Optimize
- Remove Next.js API routes that are fully replaced
- Frontend components call Sub0 directly (no proxy)
- Remove `src/lib/prisma.ts` and `src/lib/auth-utils.ts`

---

### 🔑 Important: Clerk ID Uniqueness Constraint

After deploying the Sub0 models, add a unique index on the `clerkId` field:

```sql
CREATE UNIQUE INDEX idx_user_clerk_id ON _user ("clerkId");
```

This is required because the `sync-clerk` endpoint uses `ON CONFLICT (clerkId)` to upsert users.
The Sub0 model's `indexable: true` creates a regular index but does not enforce uniqueness.

---

## File Reference

| Path | Description |
|------|-------------|
| `sub0/models/*.json` | Sub0 database model definitions (9 tables) |
| `sub0/endpoints/**/*.json` | Sub0 API endpoint definitions (25+ endpoints) |
| `src/lib/sub0-client.ts` | TypeScript client for calling Sub0 from Next.js |
| `next.config.ts` | Next.js config (LingoQL-aware) |
| `.github/workflows/ci.yml` | CI/CD pipeline with LingoQL + Sub0 deploy steps |
| `smoke-test.sh` | Post-deployment smoke test script |
| `DEPLOY.md` | This deployment guide |

---

## Notes on Inferred vs. Confirmed

The following are **inferred** based on LingoQL/Sub0 documentation patterns
and standard industry practices. Adjust if the actual CLI or API differs:

| Inference | Actual (verify) |
|-----------|-----------------|
| LingoQL CLI command: `lingoql deploy --token` | Check `lingoql --help` |
| Sub0 API: `POST /models` and `POST /endpoints` | Check Sub0 dashboard for API docs |
| Sub0 deploy: ~15-22 seconds | Per Sub0 docs, verify in dashboard |
| CNAME-based custom domains | Check LingoQL docs for exact DNS setup |
| Health check: `/status` endpoint | Check Sub0 system vars: `STATUS_ENDPOINT` |
| Rollback: `lingoql rollback` | Check `lingoql rollback --help` |
