-- HireHub Complete Role Features Migration
-- Adds tables and RLS policies for:
-- 1. Expanded Application Status Pipeline
-- 2. Interview Schedules & Scorecard Feedback
-- 3. Candidate Saved Searches & Multiple Resumes
-- 4. Support Tickets & Complaints
-- 5. Admin Audit Logging & System Announcements
-- 6. Platform Taxonomies (Categories, Skills, Locations)

-- 1. EXPAND APPLICATION STATUS ENUM
DO $$ BEGIN
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Screening';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Assessment';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Final Selection';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Hired';
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 2. INTERVIEW SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  round TEXT NOT NULL DEFAULT 'Technical', -- 'Screening', 'Technical', 'System Design', 'Behavioral', 'Final'
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  duration_minutes INT DEFAULT 45,
  platform TEXT NOT NULL DEFAULT 'Google Meet', -- 'Google Meet', 'Zoom', 'Microsoft Teams', 'In-Person', 'Phone'
  meeting_link TEXT NOT NULL,
  interviewer_name TEXT NOT NULL,
  interviewer_email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INTERVIEW FEEDBACK & SCORECARD TABLE
CREATE TABLE IF NOT EXISTS public.interview_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interviewer_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  strengths TEXT NOT NULL,
  weaknesses TEXT NOT NULL,
  recommendation TEXT NOT NULL, -- 'Strong Hire', 'Hire', 'Neutral', 'No Hire'
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CANDIDATE SAVED SEARCHES
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keyword TEXT DEFAULT '',
  location TEXT DEFAULT '',
  category TEXT DEFAULT '',
  is_remote BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SUPPORT TICKETS & COMPLAINTS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Account',
  priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
  status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'admin',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PLATFORM ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'alert', 'success'
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'job_seekers', 'recruiters'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TAXONOMIES (Categories, Skills, Locations)
CREATE TABLE IF NOT EXISTS public.taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'category', 'skill', 'location', 'industry'
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (type, slug)
);

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomies ENABLE ROW LEVEL SECURITY;

-- Interviews: Candidates see own; Recruiters see candidates for their company jobs; Admins see all
DROP POLICY IF EXISTS "Users can view relevant interviews" ON public.interviews;
CREATE POLICY "Users can view relevant interviews" ON public.interviews
  FOR SELECT USING (
    candidate_id = auth.uid() OR
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_members cm ON cm.company_id = j.company_id
      WHERE j.id = interviews.job_id AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Recruiters and admins can create/manage interviews" ON public.interviews;
CREATE POLICY "Recruiters and admins can create/manage interviews" ON public.interviews
  FOR ALL USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_members cm ON cm.company_id = j.company_id
      WHERE j.id = interviews.job_id AND cm.user_id = auth.uid()
    )
  );

-- Saved searches: user sees & manages own
CREATE POLICY "Users manage own saved searches" ON public.saved_searches
  FOR ALL USING (user_id = auth.uid());

-- Support tickets: user sees own tickets, admin sees all
CREATE POLICY "Users view own support tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users insert support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage support tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin());

-- Audit logs: Admins view and create
CREATE POLICY "Admins manage audit logs" ON public.admin_audit_logs
  FOR ALL USING (public.is_admin());

-- Announcements: Public/Users read active, Admins manage
CREATE POLICY "Public read active announcements" ON public.platform_announcements
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage announcements" ON public.platform_announcements
  FOR ALL USING (public.is_admin());

-- Taxonomies: Public read, Admins manage
CREATE POLICY "Public read taxonomies" ON public.taxonomies
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage taxonomies" ON public.taxonomies
  FOR ALL USING (public.is_admin());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job ON public.interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);
