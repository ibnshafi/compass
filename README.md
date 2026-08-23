# Compass 🧭

**AI-Powered Care Coordination for Family Caregivers**

Compass is a comprehensive platform that helps the 53 million family caregivers in the US coordinate care for their aging loved ones. It uses AI to generate personalized care plans, track medications and appointments, find community resources, and facilitate family collaboration.

## 🚀 The Problem

Family caregivers face overwhelming complexity:
- **53M** unpaid family caregivers in the US
- **78%** manage medications for loved ones
- **40+ hrs/week** average care commitment
- **65%** report high stress levels
- Fragmented healthcare and social service systems
- No central place to coordinate care

## 💡 The Solution

Compass provides an all-in-one platform that:
- **Generates AI care plans** tailored to each individual's conditions and needs
- **Tracks medications** with dosage, schedule, and refill reminders
- **Manages appointments** across multiple providers
- **Coordinates family members** with shared access
- **Finds community resources** using AI matching
- **Explains medical information** in plain language
- **Provides AI assistance** for caregiving questions

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **UI** | shadcn/ui (Radix primitives) |
| **Auth** | Clerk |
| **Database** | PostgreSQL + Prisma ORM |
| **AI** | OpenAI GPT-4o-mini (Structured Outputs) |
| **Deployment** | Vercel / Docker |
| **Monitoring** | Sentry (recommended) |

## ✨ Features

### 🤖 AI-Powered Care Planning
Generate comprehensive, personalized care plans instantly. AI analyzes medical conditions, medications, allergies, and needs to create daily routines, goals, recommendations, and emergency protocols.

### 💊 Medication Management
Track all medications with dosages, schedules, and refill reminders. Never miss a dose or forget a refill.

### 📅 Appointment Coordination
Manage healthcare appointments in one place. Keep track of providers, locations, and preparation notes.

### 🏠 Community Resource Finder
AI-powered matching helps you find local resources — food assistance, home care, financial aid, transportation, and more.

### 💬 AI Caregiving Assistant
Ask questions about care, get plain-language medical explanations, and receive practical caregiving advice.

### 👨‍👩‍👧‍👦 Family Collaboration
Invite family members to share care responsibilities, assign tasks, and stay informed.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Landing  │  │Dashboard │  │  Care    │  │  AI Features │ │
│  │  Page    │  │  Layout  │  │Recipients│  │  (Chat,Plan) │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   API Routes                             ││
│  │  /api/care-recipients  /api/medications  /api/tasks      ││
│  │  /api/appointments    /api/resources    /api/ai/*        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
         │PostgreSQL│  │  Clerk  │  │ OpenAI  │
         │ + Prisma │  │  Auth   │  │   API   │
         └─────────┘  └─────────┘  └─────────┘
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (free tier available)
- OpenAI API key

### 1. Clone and Install

```bash
git clone https://github.com/hexa3/compass.git
cd compass
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/compass?schema=public"

# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed sample data (community resources)
node scripts/seed.js
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Set Up Clerk Webhook (Optional)

To automatically sync users, set up a Clerk webhook:

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to `user.created` and `user.updated` events
4. Copy the webhook secret to your `.env` as `CLERK_WEBHOOK_SECRET`

## 🐳 Docker Deployment

```bash
# Set environment variables
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
export CLERK_SECRET_KEY=sk_test_...
export OPENAI_API_KEY=sk-...

# Build and run
docker-compose up -d
```

## 🚀 One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhexa3%2Fcompass&env=DATABASE_URL,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,OPENAI_API_KEY&envDescription=Required%20environment%20variables%20for%20Compass&envLink=https%3A%2F%2Fgithub.com%2Fhexa3%2Fcompass%2Fblob%2Fmain%2F.env.example)

### Prerequisites

Before deploying, you'll need accounts with these services (all have free tiers):

| Service | Purpose | Sign Up |
|---------|---------|--------|
| **Vercel** | Hosting | [vercel.com](https://vercel.com) |
| **Neon** (or any PostgreSQL) | Database | [neon.tech](https://neon.tech) |
| **Clerk** | Authentication | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **OpenAI** | AI Features | [platform.openai.com](https://platform.openai.com) |

### Step-by-Step Deployment

#### 1. Set Up PostgreSQL Database

Create a free PostgreSQL database:

- **Option A: Neon (Recommended)** — Go to [neon.tech](https://neon.tech), sign up, create a project, and copy your connection string.
- **Option B: Supabase** — Go to [supabase.com](https://supabase.com), create a project, and get your PostgreSQL connection string from Settings > Database.
- **Option C: Vercel Postgres** — If deploying on Vercel Pro, you can use Vercel's integrated Postgres storage.

#### 2. Set Up Clerk Authentication

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign up
2. Create a new application
3. Enable **Email + Google** (or your preferred) sign-in methods
4. Copy your **Publishable Key** and **Secret Key** from the API Keys page

#### 3. Get OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (starts with `sk-...`)

#### 4. Deploy to Vercel

**Option A: One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhexa3%2Fcompass&env=DATABASE_URL,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,OPENAI_API_KEY)

**Option B: Manual Deploy**

```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/hexa3/compass.git
git push -u origin main

# 2. Import in Vercel
# Go to https://vercel.com/new and import your GitHub repository
```

#### 5. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string from Neon/Supabase |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard > API Keys |
| `CLERK_SECRET_KEY` | From Clerk Dashboard > API Keys |
| `OPENAI_API_KEY` | From OpenAI Platform > API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g., `https://compass.vercel.app`) |

#### 6. Run Database Migrations

After deploying, open the Vercel CLI or run:

```bash
npx prisma migrate deploy
```

Or if using Neon, you can run from your local machine pointing to the production database:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

#### 7. Seed Community Resources

```bash
DATABASE_URL="your-production-url" node scripts/seed.js
```

#### 8. Set Up Clerk Webhook (Recommended)

1. In Clerk Dashboard, go to **Webhooks**
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Subscribe to `user.created` and `user.updated` events
4. Copy the **Signing Secret**
5. Add `CLERK_WEBHOOK_SECRET` to your Vercel environment variables

### Post-Deployment Checklist

- [ ] Landing page loads and is responsive
- [ ] Sign up / Sign in flow works
- [ ] Can add a care recipient
- [ ] Can add medications
- [ ] Can schedule appointments
- [ ] Can create tasks
- [ ] AI care plan generation works
- [ ] AI assistant chat works
- [ ] Community resources load
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout is correct

## 📊 Database Schema

Key models:
- **User** - Caregivers and family members (synced with Clerk)
- **CareRecipient** - People receiving care
- **Medication** - Medications with dosages and schedules
- **Appointment** - Healthcare appointments
- **CareTask** - To-dos and care activities
- **CarePlan** - AI-generated care plans with goals and routines
- **CommunityResource** - Local resources and services
- **AIConversation** - AI assistant chat history

## 🤖 AI Features

Compass uses OpenAI's GPT-4o-mini with structured outputs for:

1. **Care Plan Generation** - Creates comprehensive care plans with goals, daily routines, recommendations, and emergency info
2. **Caregiving Assistant** - Conversational AI that answers caregiving questions with context about the patient
3. **Medical Text Explainer** - Translates medical jargon into plain language
4. **Resource Matching** - Matches user needs to community resources with relevance scoring

## 🔒 Security

- Authentication via Clerk (secure, SOC 2 compliant)
- Row-level security via Prisma (users can only access their own data)
- API route protection with Clerk middleware
- Input validation with Zod schemas
- Rate limiting recommended via Vercel WAF
- No sensitive data in client-side code

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npx playwright test
```

## 📝 License

[MIT](LICENSE)

---

Built with ❤️ for family caregivers everywhere.
