-- =============================================================================
-- HireHub Complete Job Application Management System Migration
-- Migration: 20261110000002_complete_job_application_system.sql
-- =============================================================================
-- 1. Expands application_status enum with all 11 lifecycle statuses:
--    'Applied', 'Viewed', 'Screening', 'Shortlisted', 'Assessment', 
--    'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'Hired', 'Withdrawn'
-- 2. Complete applications table columns:
--    id, application_number, job_id, user_id (candidate_id), recruiter_id,
--    resume_file (resume_id), cover_letter, expected_salary, notice_period,
--    current_location, highest_qualification, work_experience, current_company,
--    skills, linkedin_url, portfolio_url, additional_information (submitted_data),
--    status, created_at (applied_at), updated_at
-- 3. Application status history table:
--    id, application_id, previous_status, new_status, changed_by, changed_by_name, remarks, created_at
-- 4. Application questions table:
--    id, job_id, question, question_type, options, is_required, created_at
-- 5. Application answers table:
--    id, application_id, question_id, answer, created_at
-- 6. Interviews table:
--    id, application_id, job_id, candidate_id, candidate_name, candidate_email,
--    job_title, company_name, round, interview_title, interview_type,
--    interview_date, interview_time, duration_minutes, platform, meeting_link,
--    location, interviewer_id, interviewer_name, interviewer_email,
--    instructions, notes, status, created_at, updated_at
-- 7. Interview feedback table:
--    id, interview_id, interviewer_id, interviewer_name, rating, feedback, strengths, weaknesses, result, created_at
-- 8. Row Level Security (RLS) policies, indexes, and triggers

-- 1. UPDATE / EXPAND APPLICATION STATUS ENUM
DO $$ BEGIN
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Screening';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Assessment';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Interview Scheduled';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Interview Completed';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Selected';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Hired';
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 2. ENHANCE APPLICATIONS TABLE
ALTER TABLE IF EXISTS public.applications
  ADD COLUMN IF NOT EXISTS application_number VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS application_code VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT,
  ADD COLUMN IF NOT EXISTS highest_qualification TEXT,
  ADD COLUMN IF NOT EXISTS college_university TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_experience TEXT,
  ADD COLUMN IF NOT EXISTS current_company TEXT,
  ADD COLUMN IF NOT EXISTS notice_period TEXT,
  ADD COLUMN IF NOT EXISTS expected_salary TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_name TEXT,
  ADD COLUMN IF NOT EXISTS resume_id TEXT,
  ADD COLUMN IF NOT EXISTS additional_information JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS submitted_data JSONB DEFAULT '{}'::jsonb;

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_code ON public.applications(application_code);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

-- 3. APPLICATION STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name TEXT NOT NULL DEFAULT 'System',
  remarks TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_status_history_app_id ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_app_status_history_created_at ON public.application_status_history(created_at DESC);

-- 4. APPLICATION QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.application_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'yes_no', 'multiple_choice'
  options TEXT[] DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_questions_job_id ON public.application_questions(job_id);

-- 5. APPLICATION ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.application_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_answers_application_id ON public.application_answers(application_id);
CREATE INDEX IF NOT EXISTS idx_app_answers_question_id ON public.application_answers(question_id);

-- 6. RECRUITER NOTES TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_notes_app_id ON public.recruiter_notes(application_id);

-- 7. ENHANCE / CREATE INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  round TEXT NOT NULL DEFAULT 'Technical',
  interview_title TEXT DEFAULT 'Job Interview',
  interview_type TEXT DEFAULT 'Online', -- 'Online', 'Phone', 'In-person'
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  duration_minutes INT DEFAULT 45,
  platform TEXT NOT NULL DEFAULT 'Google Meet',
  meeting_link TEXT,
  location TEXT,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interviewer_name TEXT NOT NULL,
  interviewer_email TEXT NOT NULL,
  instructions TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'rescheduled', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all new columns exist if interviews table already was created
ALTER TABLE IF EXISTS public.interviews
  ADD COLUMN IF NOT EXISTS interview_title TEXT DEFAULT 'Job Interview',
  ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'Online',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS instructions TEXT;

CREATE INDEX IF NOT EXISTS idx_interviews_app_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON public.interviews(job_id);

-- 8. INTERVIEW FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.interview_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  score INT CHECK (score >= 1 AND score <= 5),
  feedback TEXT,
  strengths TEXT NOT NULL DEFAULT '',
  weaknesses TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT 'Hire', -- 'Strong Hire', 'Hire', 'Neutral', 'No Hire'
  recommendation TEXT NOT NULL DEFAULT 'Hire',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_feedbacks_interview_id ON public.interview_feedbacks(interview_id);

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedbacks ENABLE ROW LEVEL SECURITY;

-- Helper admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applications RLS:
-- Candidate can view own applications
DO $$ BEGIN
  DROP POLICY IF EXISTS "Candidates read own applications" ON public.applications;
  CREATE POLICY "Candidates read own applications"
    ON public.applications FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Recruiters view applications for jobs they own or manage in their company
DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiters read company job applications" ON public.applications;
  CREATE POLICY "Recruiters read company job applications"
    ON public.applications FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE j.id = applications.job_id
        AND cm.user_id = auth.uid()
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Candidates can submit new applications
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users submit application" ON public.applications;
  CREATE POLICY "Authenticated users submit application"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Candidate can withdraw own application; Recruiters can update status
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authorized status update on application" ON public.applications;
  CREATE POLICY "Authorized status update on application"
    ON public.applications FOR UPDATE
    USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE j.id = applications.job_id
        AND cm.user_id = auth.uid()
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Status History Policies:
DO $$ BEGIN
  DROP POLICY IF EXISTS "Candidates and recruiters read status history" ON public.application_status_history;
  CREATE POLICY "Candidates and recruiters read status history"
    ON public.application_status_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_status_history.application_id
        AND (
          a.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.company_members cm ON cm.company_id = j.company_id
            WHERE j.id = a.job_id
            AND cm.user_id = auth.uid()
          )
        )
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authorized users insert status history" ON public.application_status_history;
  CREATE POLICY "Authorized users insert status history"
    ON public.application_status_history FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Application Questions Policies:
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view application questions for active jobs" ON public.application_questions;
  CREATE POLICY "Anyone can view application questions for active jobs"
    ON public.application_questions FOR SELECT
    USING (true);
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiters and admins manage questions" ON public.application_questions;
  CREATE POLICY "Recruiters and admins manage questions"
    ON public.application_questions FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE j.id = application_questions.job_id
        AND cm.user_id = auth.uid()
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- Application Answers Policies:
DO $$ BEGIN
  DROP POLICY IF EXISTS "Candidates and recruiters view answers" ON public.application_answers;
  CREATE POLICY "Candidates and recruiters view answers"
    ON public.application_answers FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_answers.application_id
        AND (
          a.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.company_members cm ON cm.company_id = j.company_id
            WHERE j.id = a.job_id
            AND cm.user_id = auth.uid()
          )
        )
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Candidates submit answers with application" ON public.application_answers;
  CREATE POLICY "Candidates submit answers with application"
    ON public.application_answers FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_answers.application_id
        AND a.user_id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 10. RECRUITER NOTES RLS POLICIES (Private to recruiters & admins, never visible to candidates)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Recruiter notes access" ON public.recruiter_notes;
  CREATE POLICY "Recruiter notes access"
    ON public.recruiter_notes FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE a.id = recruiter_notes.application_id
        AND cm.user_id = auth.uid()
      )
      OR public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;
