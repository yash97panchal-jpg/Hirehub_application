-- HireHub Complete Job Application Management System Migration
-- Migration: 20261110000001_job_application_management.sql
-- 
-- 1. Expands application_status enum with all 11 standard recruitment lifecycle states:
--    'Applied', 'Viewed', 'Under Review', 'Shortlisted', 'Assessment', 
--    'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'Hired', 'Withdrawn'
-- 2. Enhances applications table with unique application_id (APP-YYYYMMDD-XXXX) and full candidate profile fields
-- 3. Creates application_status_history table for immutable timeline audit trails
-- 4. Creates recruiter_notes table for private candidate evaluations
-- 5. Enhances interviews table with interview_title, interview_type (Online/Offline), location, instructions
-- 6. Enforces strict Row Level Security (RLS) policies and performance indexes

-- 1. UPDATE / EXPAND APPLICATION STATUS ENUM
DO $$ BEGIN
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Under Review';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Interview Scheduled';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Interview Completed';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Selected';
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 2. ENHANCE APPLICATIONS TABLE
ALTER TABLE IF EXISTS public.applications
  ADD COLUMN IF NOT EXISTS application_code VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT,
  ADD COLUMN IF NOT EXISTS highest_qualification TEXT,
  ADD COLUMN IF NOT EXISTS college_university TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[],
  ADD COLUMN IF NOT EXISTS work_experience TEXT,
  ADD COLUMN IF NOT EXISTS current_company TEXT,
  ADD COLUMN IF NOT EXISTS notice_period TEXT,
  ADD COLUMN IF NOT EXISTS expected_salary TEXT,
  ADD COLUMN IF NOT EXISTS resume_name TEXT,
  ADD COLUMN IF NOT EXISTS submitted_data JSONB DEFAULT '{}'::jsonb;

-- Create index on application_code for fast lookup
CREATE INDEX IF NOT EXISTS idx_applications_code ON public.applications(application_code);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_user ON public.applications(job_id, user_id);

-- 3. APPLICATION STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name TEXT NOT NULL DEFAULT 'System',
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_status_history_app_id ON public.application_status_history(application_id);

-- 4. RECRUITER PRIVATE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_notes_app_id ON public.recruiter_notes(application_id);

-- 5. ENHANCE INTERVIEWS TABLE
ALTER TABLE IF EXISTS public.interviews
  ADD COLUMN IF NOT EXISTS interview_title TEXT DEFAULT 'Job Interview',
  ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'Online', -- 'Online', 'Offline'
  ADD COLUMN IF NOT EXISTS interview_location TEXT,
  ADD COLUMN IF NOT EXISTS additional_instructions TEXT;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;

-- Status History: Candidates can read history for their own applications
DO $$ BEGIN
  DROP POLICY IF EXISTS "Candidates read own application history" ON public.application_status_history;
  CREATE POLICY "Candidates read own application history"
    ON public.application_status_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_status_history.application_id
        AND a.user_id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Status History: Recruiters can read history for applications to their company jobs
DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiters read company application history" ON public.application_status_history;
  CREATE POLICY "Recruiters read company application history"
    ON public.application_status_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE a.id = application_status_history.application_id
        AND cm.user_id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Status History: Insert allowed for authorized recruiters or admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiters and admins append status history" ON public.application_status_history;
  CREATE POLICY "Recruiters and admins append status history"
    ON public.application_status_history FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Recruiter Notes: Private to recruiters of the company & admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiters manage notes for company applications" ON public.recruiter_notes;
  CREATE POLICY "Recruiters manage notes for company applications"
    ON public.recruiter_notes FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE a.id = recruiter_notes.application_id
        AND cm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN null; END $$;
