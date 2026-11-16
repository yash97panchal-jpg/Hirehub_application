# HireHub implementation plan

This rebuild is intentionally phased. A polished screen is not considered a completed feature until it is connected to persistent data, authorized server-side, tested and verified on devices.

## Phase 1 — New foundation (included in this archive)
- Fresh React/TypeScript/Vite codebase and design tokens.
- Responsive public landing page, job board and role-specific workspace shells.
- First-pass candidate, recruiter and admin journeys.
- Supabase schema/RLS baseline and environment template.
- PWA manifest, service-worker shell and Capacitor configuration.

## Phase 2 — Core production workflows
- Supabase-backed job search, company pages, filters, pagination and job details.
- Secure registration, email verification, login, password reset, OAuth (when configured), session refresh and account deletion.
- Candidate profile, work history, education, skills, multiple resume versions and private resume storage.
- Save/unsave jobs, alerts, internal apply, external apply tracking and application withdrawal.
- Application status history, recruiter notes, screening questions and candidate answers.
- Company onboarding, member invitations, role-based company access and verification.
- Recruiter job drafts, publish/moderation, edit/close/reopen and applicant pipeline.
- Interview scheduling, rescheduling, cancellation, feedback and notifications.

## Phase 3 — Full platform features
- Admin moderation for companies, job posts, user reports and platform content.
- Admin analytics, audit history, role controls and operational settings.
- Candidate messaging, recruiter talent search, profile discovery and consent controls.
- Resume builder, ATS keyword helper, skill assessments and salary insights.
- Email templates and delivery via a trusted provider / Supabase Edge Functions.
- Accessibility, localization, abuse protection, rate limits and observability.

## Phase 4 — Release and store readiness
- Play Store signed AAB, iOS archive, deep links, push notifications and app lifecycle handling.
- Store screenshots, feature graphic, app icons, privacy manifest and accurate data-safety declarations.
- Public privacy policy, terms, support and account-deletion pages.
- Production Supabase project, backups, migrations, monitoring, error reporting and incident runbooks.
- E2E tests across Android/iOS and responsive browser viewports.

## Definition of done
A feature is done only when the user journey works end-to-end with real backend data, the correct role can access it and other roles cannot, failures are handled, loading/empty states are present, accessibility is checked, and automated tests cover the important behavior.
