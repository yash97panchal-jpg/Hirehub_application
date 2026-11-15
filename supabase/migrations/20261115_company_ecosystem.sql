-- ============================================================================
-- HireHub Company Ecosystem Migration
-- Description: Companies, Follows, Link Jobs, RLS Policies, and Triggers
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  rid BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  cover_url TEXT,
  tagline VARCHAR(200) NOT NULL,
  website VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  hq VARCHAR(100) NOT NULL,
  founded INT NOT NULL CHECK (founded >= 1900 AND founded <= EXTRACT(YEAR FROM CURRENT_DATE)),
  about TEXT NOT NULL,
  benefits TEXT[] DEFAULT '{}'::TEXT[],
  tech_stack TEXT[] DEFAULT '{}'::TEXT[],
  gallery JSONB DEFAULT '[]'::JSONB,
  culture JSONB DEFAULT '[]'::JSONB,
  locations JSONB DEFAULT '[]'::JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search & filtering
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON public.companies(size);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);
CREATE INDEX IF NOT EXISTS idx_companies_rid ON public.companies(rid);

-- 2. COMPANY FOLLOWS TABLE (Seeker follows companies)
CREATE TABLE IF NOT EXISTS public.company_follows (
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_company_follows_user ON public.company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON public.company_follows(company_id);

-- 3. LINK JOBS TO COMPANY_ID
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES public.companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

-- Policy 4.1: Anyone can view verified companies or companies they own
DROP POLICY IF EXISTS "Public read verified companies" ON public.companies;
CREATE POLICY "Public read verified companies"
ON public.companies FOR SELECT
USING (
  verified = TRUE 
  OR (auth.uid() IS NOT NULL AND auth.uid()::text = rid::text)
  OR ((auth.jwt() ->> 'role') = 'admin')
);

-- Policy 4.2: Recruiters can insert a company profile if they don't have one
DROP POLICY IF EXISTS "Recruiters insert own company" ON public.companies;
CREATE POLICY "Recruiters insert own company"
ON public.companies FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid()::text = rid::text
);

-- Policy 4.3: Recruiters edit ONLY their own company; Admins edit all
DROP POLICY IF EXISTS "Recruiters update own company" ON public.companies;
CREATE POLICY "Recruiters update own company"
ON public.companies FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid()::text = rid::text)
  OR ((auth.jwt() ->> 'role') = 'admin')
)
WITH CHECK (
  -- Prevent recruiters from verifying their own company
  ((auth.jwt() ->> 'role') = 'admin') 
  OR (verified = (SELECT c.verified FROM public.companies c WHERE c.id = companies.id))
);

-- Policy 4.4: Admins full control
DROP POLICY IF EXISTS "Admins full access companies" ON public.companies;
CREATE POLICY "Admins full access companies"
ON public.companies FOR ALL
USING ((auth.jwt() ->> 'role') = 'admin');

-- Policy 4.5: Company Follows RLS
DROP POLICY IF EXISTS "Users view own follows" ON public.company_follows;
CREATE POLICY "Users view own follows"
ON public.company_follows FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users manage own follows" ON public.company_follows;
CREATE POLICY "Users manage own follows"
ON public.company_follows FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

-- 5. AUTOMATED TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_companies_updated_at ON public.companies;
CREATE TRIGGER trigger_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
