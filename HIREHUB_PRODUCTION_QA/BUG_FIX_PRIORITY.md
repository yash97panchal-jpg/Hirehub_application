# HIREHUB BUG FIX & ISSUE RESOLUTION LOG

This document tracks all bugs, architectural flaws, and performance defects identified during the multi-role audit and details the applied fixes.

---

## Priority 1: Critical (Security & Authentication)

### [BUG-001] Anonymous Exposure of Candidate Personal Data
* **Severity:** Critical (CVSS 8.6)
* **Root Cause:** Default RLS policy on `public.profiles` used `USING (true)`.
* **Fix Applied:** Replaced policy in `20261109000000_security_and_production_hardening.sql`. Resumes and contact information are now restricted to the applicant, verified recruiters reviewing their job application, or administrators.
* **Status:** Resolved & Verified.

### [BUG-002] Privilege Escalation via User Metadata Tampering
* **Severity:** Critical (CVSS 8.2)
* **Root Cause:** Client was capable of modifying `raw_user_meta_data->>'role'` or sending `role: 'admin'` upon signup.
* **Fix Applied:**
  1. Added `handle_new_user()` trigger ensuring registration role defaults strictly to `job_seeker` or `recruiter` (admin cannot be assigned via client).
  2. Added `protect_profile_fields()` trigger preventing non-admins from altering their own `role` or `is_verified` flags.
  3. Updated `src/App.tsx` session hydration to fetch verified role from `profiles` table rather than client `user_metadata`.
* **Status:** Resolved & Verified.

### [BUG-003] Incomplete Account & PII Deletion
* **Severity:** High (GDPR / Google Play Policy Violation)
* **Root Cause:** `deleteAccount()` only deleted from `public.profiles`, leaving credentials in `auth.users` and uploaded resumes in storage buckets.
* **Fix Applied:** Created `delete_user_account()` PostgreSQL function with `SECURITY DEFINER` that atomicially removes user storage files, applications, notifications, profile row, and Auth credentials.
* **Status:** Resolved & Verified.

---

## Priority 2: High (Functionality & Reliability)

### [BUG-004] Over-aggressive Service Worker Origin Cache Wiping
* **Severity:** High
* **Root Cause:** `sw.js` activation hook performed `keys.map(k => caches.delete(k))`, purging all origin caches indiscriminately.
* **Fix Applied:** Filtered keys to only remove `hirehub-cache-*` prefixes older than the active version (`hirehub-cache-v3`).
* **Status:** Resolved & Verified.

### [BUG-005] Unauthenticated GET Caching of Private API Payloads
* **Severity:** High
* **Root Cause:** `sw.js` cached all successful GET responses without checking whether the URL pointed to Supabase REST or Auth APIs.
* **Fix Applied:** Added endpoint filters in `sw.js` bypassing cache for `/rest/v1/`, `/auth/v1/`, and requests with Authorization headers.
* **Status:** Resolved & Verified.

### [BUG-006] Mock Logins in Production Deployments
* **Severity:** High
* **Root Cause:** Fallback logic automatically created mock users if Supabase was unconfigured, even in live production builds.
* **Fix Applied:** Wrapped fallbacks with `import.meta.env.PROD` checks that throw explicit configuration errors when running in production.
* **Status:** Resolved & Verified.

---

## Priority 3: Medium (UI/UX, Accessibility & Responsive)

### [BUG-007] Accessibility Zoom Destruction & Clipboard Hijacking
* **Severity:** Medium (WCAG 1.4.4 Violation)
* **Root Cause:** `securityAndControls.ts` and `index.html` disabled keyboard zoom, pinch-to-zoom (`user-scalable=no`), copy, cut, and text selection.
* **Fix Applied:**
  1. Updated `index.html` viewport to `width=device-width, initial-scale=1.0, viewport-fit=cover`.
  2. Replaced `securityAndControls.ts` with accessibility-compliant framebusting defense that leaves zooming and clipboard uninhibited.
* **Status:** Resolved & Verified.

### [BUG-008] PWA Orientation Locked to Portrait on Tablets
* **Severity:** Medium
* **Root Cause:** `manifest.json` had `"orientation": "portrait-primary"`.
* **Fix Applied:** Updated `"orientation": "any"` in `manifest.json` to enable landscape tablet and iPad views.
* **Status:** Resolved & Verified.
