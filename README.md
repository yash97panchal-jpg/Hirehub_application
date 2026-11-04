# HireHub - Enterprise Multi-Company Job Marketplace & ATS Platform

HireHub is a modern, full-stack multi-company job marketplace and Applicant Tracking System (ATS) built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, **Supabase** (PostgreSQL, Auth, Storage, Row-Level Security), and wrapped for iOS & Android with **Capacitor**.

---

## 🌟 Architecture & Core Capabilities

### 1. Multi-Company Marketplace with Flexible Apply Modes
Every job listing in HireHub supports one of three configurable application modes:
- **Easy Apply (`easy`)**: 4-step in-app application flow (resume upload with signed storage URL, cover letter note, dynamic screening questions, final review & submission) with duplicate application prevention (`unique(job_id, user_id)`).
- **Apply on Company Website (`external`)**: Secure redirect to the employer's official ATS/careers page (`rel="noopener noreferrer"`). When the candidate returns to the app, a confirmation dialog (*"Did you finish applying to {company}?"*) allows self-reporting to the Application Tracker.
- **Both (`both`)**: Displays both in-app Easy Apply and direct external ATS link, empowering candidate choice.

### 2. Company Onboarding & Admin Moderation
- Recruiters register and establish their company profile (default state: `status = 'pending'`, `verified = false`).
- Platform administrators review companies in the **Admin Dashboard** (`/admin`), with powers to approve, reject, block, and grant the official **Verified Employer** badge.
- Only approved companies can publish active listings to the public marketplace.
- Recruiters can invite teammates with role designations (`owner`, `recruiter`, `member`).
- Public company profile page (`/companies/:slug`) displays verified branding, metadata, GIS office map, and all open positions.

### 3. Server-Side Authentication & Row-Level Security (RLS)
- Powered by Supabase Auth (Email + Password and Google OAuth).
- Server-side role enforcement (`job_seeker`, `recruiter`, `admin`).
- PostgreSQL Row-Level Security policies strictly isolate tenant data:
  - Candidates view only their own applications.
  - Recruiters view only applications for jobs posted by their own company.
  - Non-admins cannot verify companies or approve pending employers.
  - Zero-config local development fallback ensures full functionality in offline or local preview mode.

### 4. Interactive GIS Map View & Location Discovery
- Integrated OpenStreetMap GIS views across `JobDetail` (`/jobs/:id`) and `CompanyPage` (`/companies/:slug`).
- Coordinates and physical addresses plotted on high-resolution interactive maps.

### 5. AI Career Help Bot & Resume Matcher
- Floating conversational career assistant available across all pages.
- Real-time customer support Q&A handling application guidelines and account support.
- **Intelligent Resume-to-Job Matcher**: Candidates upload or paste their resume; the bot parses core competencies, calculates match percentages (e.g., 94% Match), highlights matching skills, and provides tailored recommendations.

### 6. Official Job Board API Importer (Feature Flagged)
- Connects to official public job board APIs (**Greenhouse**, **Lever**, **Workable**).
- Deduplicates listings via `(company_id, external_id)`.
- Automatically assigns `apply_mode = 'external'` with original ATS tracking URLs.
- Built without web scraping in compliance with platform terms of service.

### 7. Mobile First (iOS & Android via Capacitor)
- Configured with `@capacitor/core`, `@capacitor/cli`, `@capacitor/browser`, and `@capacitor/app`.
- Full synchronization via `npx cap sync`.

---

## 🗄️ Database Setup & SQL Migrations

Database definitions and security policies are located in `/supabase`:

```
supabase/
├── migrations/
│   └── 20261104000000_hirehub_init.sql  # Full schema, types, tables, storage, and RLS policies
└── seed.sql                             # Seed data (Meta, Stripe, Spotify, Google, jobs, and applications)
```

### Applying Migrations via Supabase CLI
```bash
# Login to your Supabase project
supabase login

# Link your remote project
supabase link --project-ref <your-project-ref>

# Push the schema migration
supabase db push

# Apply sample seed data
supabase db reset
# or execute seed.sql directly via Supabase SQL Editor
```

---

## ⚙️ Environment Variables

Create a `.env.local` file inside `Job Portal Web App/`:

```env
# Supabase Configuration (Get from Supabase Dashboard > Project Settings > API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Feature Flags
VITE_ENABLE_JOB_IMPORT=true
```

> **Zero-Config Development Notice:** If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are omitted, HireHub automatically boots with an in-memory/localStorage seed store, allowing full UI and workflow testing without mandatory cloud credentials.

---

## 📦 Manual Configuration Checklist

To connect production third-party services:

1. **Supabase Storage Bucket**:
   - Create a private bucket named `resumes`.
   - Set max file size limit to `5 MB`.
   - Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
   - Policies defined in `20261104000000_hirehub_init.sql` grant seekers read/write on their folder and recruiters read access for submitted applications.

2. **Google OAuth Provider**:
   - Go to **Supabase Dashboard > Authentication > Providers > Google**.
   - Input your Google Cloud OAuth Client ID and Secret.
   - Add `https://<your-project>.supabase.co/auth/v1/callback` to Authorized redirect URIs in Google Cloud Console.

3. **Transactional Email Provider (Pluggable)**:
   - Configure SMTP or Resend/SendGrid in Supabase Auth settings to dispatch verification emails and application status updates.

4. **In-App Mobile Purchases (iOS / Android)**:
   - In accordance with App Store Review Guideline 3.1.1, online web checkout is suspended in the mobile wrapper in favor of native Apple In-App Purchase (IAP) products.

---

## 🧪 Testing & Quality Assurance

Run the test suite and verify type safety:

```bash
# Navigate to the app directory
cd "Job Portal Web App"

# 1. Run Unit & RLS Policy Tests (Vitest)
npm test

# 2. Run TypeScript Verification
npm run typecheck

# 3. Run Production Build (Vite)
npm run build

# 4. Synchronize Native Mobile Shell
npx cap sync
```

---

## 🚀 Local Development

```bash
cd "Job Portal Web App"
npm install
npm run dev
```

Visit `http://localhost:8443` or the configured local dev port.
