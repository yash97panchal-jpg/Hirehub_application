-- HireHub Comprehensive Database Schema Migration
-- Includes: Extensions, Custom Types, Tables, Storage Buckets, Triggers, and Row-Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('job_seeker', 'recruiter', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE company_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE company_member_role AS ENUM ('owner', 'recruiter', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_apply_mode AS ENUM ('easy', 'external', 'both');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_source AS ENUM ('posted', 'imported');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected', 'Withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE external_apply_status AS ENUM ('applied', 'not_applied');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'job_seeker',
  phone TEXT,
  headline TEXT,
  location TEXT,
  about TEXT,
  avatar TEXT,
  skills TEXT[] DEFAULT '{}',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  resume_url TEXT,
  profile_completion INT DEFAULT 20,
  is_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  banner TEXT,
  website TEXT,
  description TEXT,
  size TEXT DEFAULT '50-200',
  industry TEXT DEFAULT 'Technology',
  location TEXT,
  address TEXT,
  coordinates JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  status company_status NOT NULL DEFAULT 'pending',
  rating NUMERIC(2,1) DEFAULT 4.8,
  review_count INT DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. COMPANY MEMBERS (Recruiter <-> Company Many-to-Many)
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role company_member_role NOT NULL DEFAULT 'recruiter',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- 6. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  coordinates JSONB,
  remote_type TEXT NOT NULL DEFAULT 'Hybrid', -- 'Remote', 'Hybrid', 'On-site'
  job_type TEXT NOT NULL DEFAULT 'Full-time', -- 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT '1-3 years',
  category TEXT DEFAULT 'Engineering',
  status job_status NOT NULL DEFAULT 'published',
  expires_at TIMESTAMPTZ,
  apply_mode job_apply_mode NOT NULL DEFAULT 'easy',
  external_apply_url TEXT,
  screening_questions JSONB DEFAULT '[]',
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  source job_source NOT NULL DEFAULT 'posted',
  external_id TEXT,
  application_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_external_url CHECK (
    apply_mode = 'easy' OR (external_apply_url IS NOT NULL AND external_apply_url ~* '^https://')
  ),
  UNIQUE (company_id, external_id)
);

-- Full-text search index on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_search ON public.jobs USING gin(
  to_tsvector('english', title || ' ' || description || ' ' || location || ' ' || category)
);

-- 7. APPLICATIONS TABLE (In-App Easy Apply)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_file TEXT NOT NULL,
  cover_letter TEXT,
  answers JSONB DEFAULT '{}',
  status application_status NOT NULL DEFAULT 'Applied',
  notes TEXT,
  ats_score INT DEFAULT 85,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- 8. EXTERNAL APPLY CLICKS (External Site Tracking)
CREATE TABLE IF NOT EXISTS public.external_apply_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  user_confirmed external_apply_status
);

-- 9. SAVED JOBS
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- 10. JOB ALERTS
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT,
  location TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. JOB REPORTS (Trust, Safety & Moderation)
CREATE TABLE IF NOT EXISTS public.job_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. MESSAGES (Recruiter <-> Candidate Real-time Messaging)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. AUTO APPLICATION COUNT INCREMENT TRIGGER
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs SET application_count = GREATEST(0, application_count - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_job_application_count ON public.applications;
CREATE TRIGGER trigger_job_application_count
AFTER INSERT OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- 14. HELPER FUNCTION TO CHECK IF USER IS SYSTEM ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. ROW-LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_apply_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid())));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR ALL USING (public.is_admin());

-- COMPANIES POLICIES
DROP POLICY IF EXISTS "Public can view approved companies" ON public.companies;
CREATE POLICY "Public can view approved companies" ON public.companies
  FOR SELECT USING (
    status = 'approved' OR 
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Recruiters can create company" ON public.companies;
CREATE POLICY "Recruiters can create company" ON public.companies
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    verified = false AND
    status = 'pending'
  );

DROP POLICY IF EXISTS "Company members can update own company" ON public.companies;
CREATE POLICY "Company members can update own company" ON public.companies
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  ) WITH CHECK (
    public.is_admin() OR (verified = (SELECT verified FROM public.companies c WHERE c.id = companies.id) AND status = (SELECT status FROM public.companies c WHERE c.id = companies.id))
  );

DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;
CREATE POLICY "Admins have full access to companies" ON public.companies
  FOR ALL USING (public.is_admin());

-- COMPANY MEMBERS POLICIES
DROP POLICY IF EXISTS "Teammates can view company members" ON public.company_members;
CREATE POLICY "Teammates can view company members" ON public.company_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Owners can add company members" ON public.company_members;
CREATE POLICY "Owners can add company members" ON public.company_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid() AND cm.role = 'owner') OR
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND c.created_by = auth.uid()) OR
    public.is_admin()
  );

-- JOBS POLICIES
DROP POLICY IF EXISTS "Public can view published jobs from approved companies" ON public.jobs;
CREATE POLICY "Public can view published jobs from approved companies" ON public.jobs
  FOR SELECT USING (
    (status = 'published' AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = jobs.company_id AND c.status = 'approved')) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Recruiters can insert jobs for approved companies" ON public.jobs;
CREATE POLICY "Recruiters can insert jobs for approved companies" ON public.jobs
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = jobs.company_id AND c.status = 'approved' AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = c.id AND cm.user_id = auth.uid())))) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Recruiters can update own company jobs" ON public.jobs;
CREATE POLICY "Recruiters can update own company jobs" ON public.jobs
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Recruiters can delete own company jobs" ON public.jobs;
CREATE POLICY "Recruiters can delete own company jobs" ON public.jobs
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()) OR
    public.is_admin()
  );

-- APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Seekers see own applications, recruiters see their company applications" ON public.applications;
CREATE POLICY "Seekers see own applications, recruiters see their company applications" ON public.applications
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs j 
      JOIN public.company_members cm ON cm.company_id = j.company_id 
      WHERE j.id = applications.job_id AND cm.user_id = auth.uid()
    ) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Seekers can insert applications" ON public.applications;
CREATE POLICY "Seekers can insert applications" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Seekers can withdraw or recruiters update status" ON public.applications;
CREATE POLICY "Seekers can withdraw or recruiters update status" ON public.applications
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs j 
      JOIN public.company_members cm ON cm.company_id = j.company_id 
      WHERE j.id = applications.job_id AND cm.user_id = auth.uid()
    ) OR
    public.is_admin()
  );

-- EXTERNAL APPLY CLICKS POLICIES
DROP POLICY IF EXISTS "Anyone can insert external clicks" ON public.external_apply_clicks;
CREATE POLICY "Anyone can insert external clicks" ON public.external_apply_clicks
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own clicks, recruiters view their job clicks" ON public.external_apply_clicks;
CREATE POLICY "Users update own clicks, recruiters view their job clicks" ON public.external_apply_clicks
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs j 
      JOIN public.company_members cm ON cm.company_id = j.company_id 
      WHERE j.id = external_apply_clicks.job_id AND cm.user_id = auth.uid()
    ) OR
    public.is_admin()
  );

-- SAVED JOBS POLICIES
DROP POLICY IF EXISTS "Users manage own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users manage own saved jobs" ON public.saved_jobs
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- JOB ALERTS POLICIES
DROP POLICY IF EXISTS "Users manage own job alerts" ON public.job_alerts;
CREATE POLICY "Users manage own job alerts" ON public.job_alerts
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- JOB REPORTS POLICIES
DROP POLICY IF EXISTS "Users can file reports, admins can review" ON public.job_reports;
CREATE POLICY "Users can file reports, admins can review" ON public.job_reports
  FOR ALL USING (
    user_id = auth.uid() OR public.is_admin()
  ) WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
  );

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Users view their own messages" ON public.messages;
CREATE POLICY "Users view their own messages" ON public.messages
  FOR ALL USING (
    sender_id = auth.uid() OR receiver_id = auth.uid() OR public.is_admin()
  ) WITH CHECK (
    sender_id = auth.uid() OR public.is_admin()
  );

-- 16. STORAGE BUCKET CONFIGURATION (Resumes bucket: private, max 5MB, PDF/DOCX only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false, 
  5242880, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Storage RLS Policies for Resumes
DROP POLICY IF EXISTS "Users upload own resumes" ON storage.objects;
CREATE POLICY "Users upload own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users and authorized recruiters read resumes" ON storage.objects;
CREATE POLICY "Users and authorized recruiters read resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.applications app
        JOIN public.jobs j ON j.id = app.job_id
        JOIN public.company_members cm ON cm.company_id = j.company_id
        WHERE app.resume_file LIKE '%' || name || '%' AND cm.user_id = auth.uid()
      )
    )
  );
