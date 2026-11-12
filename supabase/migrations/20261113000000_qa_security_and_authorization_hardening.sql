-- =============================================================================
-- Migration: 20261113000000_qa_security_and_authorization_hardening.sql
-- Description: Comprehensive Security Hardening & Authorization Fixes
-- Addresses:
--   BUG-001: Fix Job Application Status Authorization & Safe Withdrawal
--   BUG-002: Fix Job Report Moderation Authorization
--   BUG-003: Database Table & Realtime Setup for Real Supabase Messaging
--   BUG-005: Fix Company Logo Storage Authorization & Company Membership Checks
--   BUG-006: Fix Account Deletion Atomic Storage Cleanup
--   BUG-008: Fix Message Read-Receipt Authorization for Message Receivers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CONVERSATIONS TABLE FOR REAL MESSAGING (BUG-003)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_different_participants CHECK (participant_one <> participant_two)
);

-- Index for participant searches
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_one);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_two);
CREATE INDEX IF NOT EXISTS idx_conversations_job ON public.conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_at ON public.conversations(last_message_at DESC);

-- Add interview_invite JSONB to messages table if not present
ALTER TABLE IF EXISTS public.messages
  ADD COLUMN IF NOT EXISTS interview_invite JSONB DEFAULT NULL;

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Participants view own conversations" ON public.conversations;
  CREATE POLICY "Participants view own conversations" ON public.conversations
    FOR SELECT TO authenticated
    USING (
      participant_one = auth.uid() OR
      participant_two = auth.uid() OR
      public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Participants create conversations" ON public.conversations;
  CREATE POLICY "Participants create conversations" ON public.conversations
    FOR INSERT TO authenticated
    WITH CHECK (
      (participant_one = auth.uid() OR participant_two = auth.uid()) OR
      public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Participants update own conversations" ON public.conversations;
  CREATE POLICY "Participants update own conversations" ON public.conversations
    FOR UPDATE TO authenticated
    USING (
      participant_one = auth.uid() OR
      participant_two = auth.uid() OR
      public.is_admin()
    )
    WITH CHECK (
      participant_one = auth.uid() OR
      participant_two = auth.uid() OR
      public.is_admin()
    );
EXCEPTION WHEN OTHERS THEN null; END $$;

-- -----------------------------------------------------------------------------
-- 2. BUG-008: FIX MESSAGE READ-RECEIPT AUTHORIZATION
-- -----------------------------------------------------------------------------
-- Ensure RLS on messages is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop obsolete or restrictive policies
DROP POLICY IF EXISTS "Users view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Participants view their messages" ON public.messages;
DROP POLICY IF EXISTS "Senders create messages" ON public.messages;
DROP POLICY IF EXISTS "Receivers mark messages read" ON public.messages;
DROP POLICY IF EXISTS "Senders and admins delete messages" ON public.messages;

-- 2.1 SELECT: Sender, Receiver, or Admin can read messages
CREATE POLICY "Participants view their messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    public.is_admin()
  );

-- 2.2 INSERT: Authenticated sender can insert messages (must be sender_id = auth.uid())
CREATE POLICY "Senders create messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (sender_id = auth.uid() AND sender_id <> receiver_id) OR
    public.is_admin()
  );

-- 2.3 UPDATE: Receiver can update read-receipts (is_read = true)
CREATE POLICY "Receivers mark messages read" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    receiver_id = auth.uid() OR
    public.is_admin()
  )
  WITH CHECK (
    receiver_id = auth.uid() OR
    public.is_admin()
  );

-- 2.4 DELETE: Senders and Admins can delete messages
CREATE POLICY "Senders and admins delete messages" ON public.messages
  FOR DELETE TO authenticated
  USING (
    sender_id = auth.uid() OR
    public.is_admin()
  );

-- Trigger to prevent receiver from mutating message content, sender, or timestamp during read-receipt update
CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- If caller is receiver, only allow updating is_read
    IF auth.uid() = OLD.receiver_id THEN
      IF NEW.sender_id <> OLD.sender_id OR
         NEW.receiver_id <> OLD.receiver_id OR
         NEW.content <> OLD.content OR
         NEW.conversation_id <> OLD.conversation_id OR
         NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'Security Violation: Message participants may only update read receipt status.';
      END IF;
    ELSE
      -- Neither admin nor receiver
      RAISE EXCEPTION 'Security Violation: Only the message recipient is authorized to update read status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_protect_message_updates ON public.messages;
CREATE TRIGGER trigger_protect_message_updates
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.protect_message_updates();

-- -----------------------------------------------------------------------------
-- 3. BUG-001: FIX JOB APPLICATION STATUS AUTHORIZATION
-- -----------------------------------------------------------------------------
-- Drop previous insecure or broad UPDATE policies
DROP POLICY IF EXISTS "Seekers can withdraw or recruiters update status" ON public.applications;
DROP POLICY IF EXISTS "Authorized status update on application" ON public.applications;
DROP POLICY IF EXISTS "Job seekers can only withdraw own application" ON public.applications;
DROP POLICY IF EXISTS "Recruiters update applications for own company jobs" ON public.applications;
DROP POLICY IF EXISTS "Admins update all applications" ON public.applications;

-- 3.1 Job Seekers UPDATE: Can only update if user_id = auth.uid() AND target status is 'Withdrawn'
CREATE POLICY "Job seekers can only withdraw own application" ON public.applications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    status = 'Withdrawn'::application_status
  );

-- 3.2 Recruiters UPDATE: Only recruiters belonging to the company that owns the job can update
CREATE POLICY "Recruiters update applications for own company jobs" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_members cm ON cm.company_id = j.company_id
      WHERE j.id = applications.job_id
        AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_members cm ON cm.company_id = j.company_id
      WHERE j.id = applications.job_id
        AND cm.user_id = auth.uid()
    )
  );

-- 3.3 Admins UPDATE: Platform administrators can update applications
CREATE POLICY "Admins update all applications" ON public.applications
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.4 Deep Enforcement Trigger: validate_application_update
CREATE OR REPLACE FUNCTION public.validate_application_update()
RETURNS TRIGGER AS $$
DECLARE
  is_caller_admin BOOLEAN := public.is_admin();
  is_caller_recruiter BOOLEAN := false;
BEGIN
  -- Check if caller is an authorized recruiter for the job's company
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.company_members cm ON cm.company_id = j.company_id
    WHERE j.id = OLD.job_id AND cm.user_id = auth.uid()
  ) INTO is_caller_recruiter;

  -- Case A: Administrator has full access
  IF is_caller_admin THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Case B: Candidate / Job Seeker is updating
  IF auth.uid() = OLD.user_id AND NOT is_caller_recruiter THEN
    -- Prohibit modifying ownership or relational fields
    IF NEW.user_id <> OLD.user_id OR NEW.job_id <> OLD.job_id THEN
      RAISE EXCEPTION 'Security Violation: Cannot alter application candidate or job association.';
    END IF;

    -- Prohibit modifying recruiter evaluations
    IF NEW.notes IS DISTINCT FROM OLD.notes OR NEW.ats_score IS DISTINCT FROM OLD.ats_score THEN
      RAISE EXCEPTION 'Security Violation: Candidates cannot modify recruiter evaluations or notes.';
    END IF;

    -- Prohibit status promotion (Selected, Shortlisted, Interview, Rejected, etc.)
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status <> 'Withdrawn'::application_status THEN
        RAISE EXCEPTION 'Security Violation: Candidates are strictly forbidden from setting application status to %.', NEW.status;
      END IF;

      -- Check if application is eligible for withdrawal
      IF OLD.status IN ('Rejected'::application_status, 'Withdrawn'::application_status) THEN
        RAISE EXCEPTION 'Invalid Operation: Application in % status cannot be withdrawn.', OLD.status;
      END IF;
    END IF;

    -- During withdrawal, ensure other sensitive data is unchanged
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Case C: Recruiter is updating
  IF is_caller_recruiter THEN
    -- Prohibit modifying foreign keys
    IF NEW.user_id <> OLD.user_id OR NEW.job_id <> OLD.job_id THEN
      RAISE EXCEPTION 'Security Violation: Recruiters cannot change application candidate or job linkages.';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Case D: Unauthorized user
  RAISE EXCEPTION 'Unauthorized: You do not have permission to update this application.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_validate_application_update ON public.applications;
CREATE TRIGGER trigger_validate_application_update
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.validate_application_update();

-- 3.5 Secure RPC Function: withdraw_application
CREATE OR REPLACE FUNCTION public.withdraw_application(app_id UUID)
RETURNS JSONB AS $$
DECLARE
  target_app RECORD;
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO target_app FROM public.applications WHERE id = app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  IF target_app.user_id <> caller_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: You do not own this application.';
  END IF;

  IF target_app.status IN ('Withdrawn'::application_status, 'Rejected'::application_status) THEN
    RAISE EXCEPTION 'Application cannot be withdrawn in current state: %', target_app.status;
  END IF;

  UPDATE public.applications
  SET status = 'Withdrawn'::application_status,
      updated_at = now()
  WHERE id = app_id;

  -- Log into status history if table exists
  BEGIN
    INSERT INTO public.application_status_history (
      application_id,
      previous_status,
      new_status,
      changed_by,
      changed_by_name,
      remarks,
      created_at
    ) VALUES (
      app_id,
      target_app.status::text,
      'Withdrawn',
      caller_id,
      'Candidate',
      'Candidate voluntarily withdrew application.',
      now()
    );
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Safe fallback if history table not installed
  END;

  RETURN jsonb_build_object(
    'success', true,
    'application_id', app_id,
    'status', 'Withdrawn',
    'updated_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- -----------------------------------------------------------------------------
-- 4. BUG-002: FIX JOB REPORT AUTHORIZATION
-- -----------------------------------------------------------------------------
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can file reports, admins can review" ON public.job_reports;
DROP POLICY IF EXISTS "Users can file job reports" ON public.job_reports;
DROP POLICY IF EXISTS "Users view own reports, admins view all" ON public.job_reports;
DROP POLICY IF EXISTS "Only admins update job reports" ON public.job_reports;
DROP POLICY IF EXISTS "Only admins delete job reports" ON public.job_reports;

-- 4.1 INSERT: Users can file reports (must own report or be anon; default status must be pending)
CREATE POLICY "Users can file job reports" ON public.job_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user_id OR user_id IS NULL) AND
    (status IS NULL OR status = 'pending')
  );

-- 4.2 SELECT: Users can only view their own reports; Admins can view all
CREATE POLICY "Users view own reports, admins view all" ON public.job_reports
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

-- 4.3 UPDATE: ONLY Admins can update reports (moderation status, resolution)
CREATE POLICY "Only admins update job reports" ON public.job_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.4 DELETE: ONLY Admins can delete reports
CREATE POLICY "Only admins delete job reports" ON public.job_reports
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 4.5 Moderation Protection Trigger: Non-admins cannot alter moderation status
CREATE OR REPLACE FUNCTION public.protect_job_reports()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.status := 'pending';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Security Violation: Only platform administrators can modify report moderation status.';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_protect_job_reports ON public.job_reports;
CREATE TRIGGER trigger_protect_job_reports
BEFORE INSERT OR UPDATE ON public.job_reports
FOR EACH ROW EXECUTE FUNCTION public.protect_job_reports();

-- -----------------------------------------------------------------------------
-- 5. BUG-005: FIX COMPANY LOGO STORAGE AUTHORIZATION
-- -----------------------------------------------------------------------------
-- Storage RLS for Company Logos: Strictly verified to authorized company owner/recruiter
DROP POLICY IF EXISTS "Recruiters upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized company members upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized company members update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized company members delete logos" ON storage.objects;

-- 5.1 Public SELECT
CREATE POLICY "Public can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

-- 5.2 INSERT: Only authorized company owner, recruiter, or admin
CREATE POLICY "Authorized company members upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND c.created_by = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.company_members cm
        JOIN public.companies c ON c.id = cm.company_id
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND cm.user_id = auth.uid()
      )
    )
  );

-- 5.3 UPDATE: Only authorized company owner, recruiter, or admin
CREATE POLICY "Authorized company members update logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND c.created_by = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.company_members cm
        JOIN public.companies c ON c.id = cm.company_id
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND cm.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND c.created_by = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.company_members cm
        JOIN public.companies c ON c.id = cm.company_id
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND cm.user_id = auth.uid()
      )
    )
  );

-- 5.4 DELETE: Only authorized company owner, recruiter, or admin
CREATE POLICY "Authorized company members delete logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND c.created_by = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.company_members cm
        JOIN public.companies c ON c.id = cm.company_id
        WHERE (c.id::text = (storage.foldername(name))[1] OR c.slug = (storage.foldername(name))[1])
          AND cm.user_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- 6. BUG-006: FIX ATOMIC ACCOUNT DELETION & STORAGE CLEANUP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB AS $$
DECLARE
  caller_id UUID := auth.uid();
  deleted_files_count INT := 0;
  remaining_files_count INT := 0;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: Unable to delete unauthenticated account.';
  END IF;

  -- 1. Count storage objects to be deleted
  SELECT COUNT(*) INTO deleted_files_count
  FROM storage.objects
  WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
    AND (storage.foldername(name))[1] = caller_id::text;

  -- 2. Execute storage cleanup without silently discarding failures
  BEGIN
    DELETE FROM storage.objects
    WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
      AND (storage.foldername(name))[1] = caller_id::text;
  EXCEPTION WHEN OTHERS THEN
    -- If storage deletion fails, abort the transaction so user record is not orphaned
    RAISE EXCEPTION 'Storage cleanup failed during account deletion: %. Account deletion aborted.', SQLERRM;
  END;

  -- 3. Verify no orphaned storage files remain for this user
  SELECT COUNT(*) INTO remaining_files_count
  FROM storage.objects
  WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
    AND (storage.foldername(name))[1] = caller_id::text;

  IF remaining_files_count > 0 THEN
    RAISE EXCEPTION 'Storage cleanup verification failed: % files could not be purged. Deletion halted.', remaining_files_count;
  END IF;

  -- 4. Purge relational records
  DELETE FROM public.messages WHERE sender_id = caller_id OR receiver_id = caller_id;
  DELETE FROM public.conversations WHERE participant_one = caller_id OR participant_two = caller_id;
  DELETE FROM public.applications WHERE user_id = caller_id;
  DELETE FROM public.saved_jobs WHERE user_id = caller_id;
  DELETE FROM public.job_alerts WHERE user_id = caller_id;
  DELETE FROM public.company_members WHERE user_id = caller_id;

  -- 5. Purge profile
  DELETE FROM public.profiles WHERE id = caller_id;

  -- 6. Purge auth user permanently
  DELETE FROM auth.users WHERE id = caller_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account, authentication credentials, files, and personal data permanently purged.',
    'deleted_user_id', caller_id,
    'purged_files_count', deleted_files_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- -----------------------------------------------------------------------------
-- 7. REALTIME PUBLICATION REGISTRATION (BUG-003)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN null; END;
  END IF;
END $$;
