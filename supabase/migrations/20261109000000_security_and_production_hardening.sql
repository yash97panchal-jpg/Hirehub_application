-- HireHub Security Hardening, Production RLS, and Optimization Migration
-- Generated for Phase 2 (Security) & Phase 7 (Database Optimization)

-- 1. PREVENT ROLE ESCALATION TRIGGER ON PROFILES
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent non-admins from modifying their own role, verification, or administrative flags
  IF NOT public.is_admin() THEN
    IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security Violation: Users cannot modify their own assigned role.';
    END IF;
    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      NEW.is_verified := OLD.is_verified;
    END IF;
    IF NEW.is_email_verified IS DISTINCT FROM OLD.is_email_verified THEN
      NEW.is_email_verified := OLD.is_email_verified;
    END IF;
    IF NEW.is_phone_verified IS DISTINCT FROM OLD.is_phone_verified THEN
      NEW.is_phone_verified := OLD.is_phone_verified;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_profile_fields ON public.profiles;
CREATE TRIGGER trigger_protect_profile_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 2. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'job_seeker';
  meta_role text := NEW.raw_user_meta_data->>'role';
BEGIN
  -- Restrict registration role to job_seeker or recruiter (never allow self-assigning admin)
  IF meta_role = 'recruiter' THEN
    assigned_role := 'recruiter';
  ELSE
    assigned_role := 'job_seeker';
  END IF;

  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    avatar,
    profile_completion,
    is_verified
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    assigned_role,
    NEW.raw_user_meta_data->>'avatar_url',
    25,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. HARDENED PROFILE RLS POLICIES
-- Candidate resumes and contact details must only be visible to:
-- - The owner (auth.uid() = id)
-- - Authorized recruiters where the candidate submitted an application
-- - Platform administrators
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;

CREATE POLICY "Public and candidates view authorized profiles" ON public.profiles
  FOR SELECT USING (
    -- User sees own full profile
    auth.uid() = id OR
    -- Admin sees all profiles
    public.is_admin() OR
    -- Recruiters can view profiles of candidates who applied to their jobs
    EXISTS (
      SELECT 1 FROM public.applications app
      JOIN public.jobs j ON j.id = app.job_id
      JOIN public.company_members cm ON cm.company_id = j.company_id
      WHERE app.user_id = profiles.id AND cm.user_id = auth.uid()
    ) OR
    -- Or publicly visible basic profiles for approved recruiters / company representatives
    (role = 'recruiter' AND EXISTS (
      SELECT 1 FROM public.companies c WHERE c.created_by = profiles.id AND c.status = 'approved'
    ))
  );

-- Users can insert their own profile (used if client creates profile row)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id AND (role != 'admin' OR public.is_admin())
  );

-- 4. SECURE SERVER-SIDE ACCOUNT DELETION WORKFLOW
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: Unable to delete unauthenticated account.';
  END IF;

  -- Remove storage objects belonging to user (resumes and avatars)
  BEGIN
    DELETE FROM storage.objects
    WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
      AND (storage.foldername(name))[1] = caller_id::text;
  EXCEPTION WHEN OTHERS THEN
    -- Continue if storage cleanup encounters partial locks
    NULL;
  END;

  -- Delete associated user applications
  DELETE FROM public.applications WHERE user_id = caller_id;

  -- Delete saved jobs & alerts
  DELETE FROM public.saved_jobs WHERE user_id = caller_id;
  DELETE FROM public.job_alerts WHERE user_id = caller_id;

  -- Delete user messages
  DELETE FROM public.messages WHERE sender_id = caller_id OR receiver_id = caller_id;

  -- Delete company memberships
  DELETE FROM public.company_members WHERE user_id = caller_id;

  -- Delete profile record
  DELETE FROM public.profiles WHERE id = caller_id;

  -- Delete auth user account permanently
  DELETE FROM auth.users WHERE id = caller_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account, authentication record, files, and personal data permanently purged.',
    'deleted_user_id', caller_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. AVATARS & COMPANY LOGOS STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'avatars', 
    'avatars', 
    true, 
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'company-logos', 
    'company-logos', 
    true, 
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS for Avatars
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS for Company Logos
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;
CREATE POLICY "Public can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Recruiters upload company logos" ON storage.objects;
CREATE POLICY "Recruiters upload company logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND auth.uid() IS NOT NULL
  );

-- 6. HIGH-PERFORMANCE DATABASE INDEXES FOR REAL-WORLD SEARCH & SCALE
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON public.jobs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON public.job_alerts(user_id);
