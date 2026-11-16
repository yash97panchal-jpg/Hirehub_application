# HireHub — rebuilt from scratch

A clean React + TypeScript + Vite application foundation for a multi-role job marketplace. This project is a new implementation; it does not reuse the previous HireHub frontend code. The earlier project is used only as a product requirements reference.

## Product direction

- **Visual system:** midnight navy `#101B2D`, brushed gold `#C5A15B`, warm ivory `#F7F4ED`, off-white surfaces, restrained depth, glass-style 3D hero treatment.
- **Responsive targets:** 360 / 375 / 393 / 412 px phones, 768 / 820 px tablets, 1024 px small laptops, 1366 / 1536 / 1920 px desktop.
- **Roles:** job seeker, recruiter/employer, administrator.
- **Web/mobile strategy:** one responsive web app, installable PWA, with Capacitor configuration for Android and iOS packaging.

## Current implementation in this starter

- Landing page and responsive navigation.
- Job board with keyword/category/employment filters and sample listing data.
- Job detail page, saved-job interactions and preview apply confirmation.
- Sign-in / registration screens; Supabase Auth integration when environment keys are configured; browser-only preview sign-in when not configured.
- Job-seeker workspace, application overview, saved roles and profile form.
- Recruiter workspace and job-posting form.
- Admin overview and moderation queue presentation.
- Responsive mobile bottom navigation, tablet/desktop layouts, reduced-motion support and accessible focus styles.
- New Supabase schema foundation for profiles, companies, company memberships, jobs, applications, status history, screening questions/answers, interviews, feedback, recruiter notes, saved jobs, job alerts, notifications, reports and audit logs.

**Important:** This is the first clean-codebase milestone, not a production-complete marketplace. Several dashboard counts and applicant rows are illustrative preview data. Job creation, application submission, file storage, notifications, recruiter pipelines, moderation actions, analytics, email delivery and all end-to-end role permissions still require their service-layer wiring and integration tests before launch. Do not publish this build as a live service yet.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+
- Supabase project for live authentication and database operations
- Android Studio / Android SDK for Android packaging
- macOS + Xcode for iOS packaging

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Only the Supabase anon/public key belongs in the client. Never put a service-role key in frontend environment variables.

## Supabase setup

1. Create a new Supabase project.
2. Open SQL Editor and run `supabase/migrations/0001_hirehub_schema.sql`.
3. Configure Auth email confirmation and password recovery URLs for your local and production domains.
4. Create private Storage buckets for `resumes` and `avatars`; do not make resumes public. Serve resume downloads through short-lived signed URLs after authorization.
5. Create an initial admin profile using a controlled server-side process. Never let a user choose or self-assign the admin role during public registration.
6. Review every RLS policy against real candidate, recruiter, company-member and admin accounts before importing production data.

## Build and mobile packaging

```bash
npm run typecheck
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Open Android in Android Studio and generate a signed Android App Bundle (`.aab`). Open iOS in Xcode on macOS to configure signing and archive. A valid production release also needs privacy policy, terms, account deletion, store listing assets, data safety declarations, reviewer credentials and device testing. Capacitor config alone does not mean store-ready native apps exist.

## Quality gate before release

- Configure Supabase and replace preview data with database-backed queries/mutations.
- Verify RLS with separate job seeker, recruiter, company owner and admin accounts.
- Add automated unit, integration and browser E2E tests.
- Test resume upload/download permissions, file type/size validation and signed URL expiry.
- Verify all job application status transitions, interview notifications and withdrawal behavior.
- Test keyboard navigation, screen readers, contrast, reduced motion and mobile safe areas.
- Test responsive widths listed above and confirm no horizontal overflow.
- Add production monitoring, backups, rate limits, abuse reporting and operational support.

## Project layout

```text
src/
  App.tsx             routes, layouts and first-pass screens
  main.tsx            React entry point
  styles.css          design tokens and responsive visual system
  lib/data.ts         Supabase client and typed preview data
supabase/
  migrations/         clean database schema and RLS baseline
public/
  manifest.webmanifest
```
