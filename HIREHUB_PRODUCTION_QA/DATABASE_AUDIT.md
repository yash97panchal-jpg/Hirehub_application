# HIREHUB SUPABASE DATABASE & SCHEMA AUDIT

**Database Engine:** PostgreSQL 15+ (Supabase Managed Cloud)  
**Migration Path:**
1. `20261104000000_hirehub_init.sql` (Core Schema & Initial Tables)
2. `20261109000000_security_and_production_hardening.sql` (Security Hardening, RLS Fixes & RPC Functions)

---

## 1. Schema Inventory

| Table Name | Description | RLS Enabled | Cascade Deletes |
| :--- | :--- | :---: | :---: |
| `public.profiles` | User profiles linked with `auth.users(id)` | **YES** | ON DELETE CASCADE |
| `public.companies` | Employer companies, verification status, slugs | **YES** | ON DELETE SET NULL |
| `public.company_members` | Recruiter <-> Company team membership | **YES** | ON DELETE CASCADE |
| `public.jobs` | Job postings, requirements, salaries, apply mode | **YES** | ON DELETE CASCADE |
| `public.applications` | Candidate applications, resumes, status tracking | **YES** | ON DELETE CASCADE |
| `public.external_apply_clicks` | Outbound click tracking for external jobs | **YES** | ON DELETE SET NULL |
| `public.saved_jobs` | Candidate saved jobs / bookmarks | **YES** | ON DELETE CASCADE |
| `public.job_alerts` | Candidate search alert configurations | **YES** | ON DELETE CASCADE |
| `public.job_reports` | Moderation flags for fraudulent/spam postings | **YES** | ON DELETE CASCADE |
| `public.messages` | In-app messaging between recruiters and candidates | **YES** | ON DELETE CASCADE |

---

## 2. PostgreSQL Functions & Triggers

1. **`protect_profile_fields()`:** Prevents non-administrators from self-updating their assigned role or verification flags.
2. **`handle_new_user()`:** Triggered automatically on `AFTER INSERT ON auth.users`. Enforces safe role assignment (`job_seeker` or `recruiter`).
3. **`delete_user_account()`:** `SECURITY DEFINER` function enabling authenticated users to safely purge their account, resumes from storage, and auth credentials.
4. **`update_job_application_count()`:** Auto-increments/decrements `jobs.application_count` on application insert or deletion.
5. **`is_admin()`:** Server-side helper evaluating `role = 'admin'` from `public.profiles`.

---

## 3. Storage Buckets Configured
- **`resumes`**: Private (`public = false`), 5 MB file size limit, PDF/DOC/DOCX only.
- **`avatars`**: Public read (`public = true`), 2 MB file size limit, PNG/JPEG/WEBP only. Authenticated user upload for their own folder.
- **`company-logos`**: Public read (`public = true`), 2 MB file size limit, PNG/JPEG/WEBP/SVG only.
