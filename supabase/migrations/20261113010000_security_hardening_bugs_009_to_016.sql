-- =============================================================================
-- Migration: 20261113010000_security_hardening_bugs_009_to_016.sql
-- Description: Deep Security Hardening & Zero-Trust Authorization Fixes
-- Addresses:
--   BUG-009: Secure Conversation Ownership & Immutability Trigger
--   BUG-010: Secure Message-to-Conversation Authorization & Integrity
--   BUG-011: Strict Application Field Protection (Immutable Post-Submission)
--   BUG-012: Safe Account Deletion & Storage Cleanup Workflow
--   BUG-013: Complete Message Read-Receipt Protection
--   BUG-014: Durable Outbound Email Queue Table & Status Lifecycle
--   BUG-016: Strict Company Logo Authorization (Role Checking & SVG Prevention)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. BUG-009: SECURE CONVERSATION OWNERSHIP & IMMUTABILITY
-- -----------------------------------------------------------------------------

-- 1.1 Unique Conversation Constraint: Prevent duplicate conversations between the same users
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversations_participants_job
  ON public.conversations (
    LEAST(participant_one, participant_two),
    GREATEST(participant_one, participant_two),
    COALESCE(job_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- 1.2 Conversation Protection Trigger: Prohibit participant hijacking or job tampering
CREATE OR REPLACE FUNCTION public.protect_conversation_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Administrator bypass
  IF public.is_admin() THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Verify caller is an authorized participant
  IF auth.uid() IS NULL OR (auth.uid() <> OLD.participant_one AND auth.uid() <> OLD.participant_two) THEN
    RAISE EXCEPTION 'Security Violation: Only conversation participants are authorized to update this conversation.';
  END IF;

  -- Strictly forbid transferring conversation ownership or modifying participant IDs
  IF NEW.participant_one <> OLD.participant_one OR NEW.participant_two <> OLD.participant_two THEN
    RAISE EXCEPTION 'Security Violation: Conversation participants are immutable and cannot be transferred.';
  END IF;

  -- Strictly forbid altering associated job
  IF NEW.job_id IS DISTINCT FROM OLD.job_id THEN
    RAISE EXCEPTION 'Security Violation: Associated job cannot be changed once conversation is initialized.';
  END IF;

  -- Strictly forbid altering conversation ID or creation timestamp
  IF NEW.id <> OLD.id OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Security Violation: Conversation identity and creation timestamps are immutable.';
  END IF;

  -- Permit only last_message, last_message_at, and updated_at
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_protect_conversation_updates ON public.conversations;
CREATE TRIGGER trigger_protect_conversation_updates
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.protect_conversation_updates();

-- 1.3 Harden Conversation Update RLS Policy
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


-- -----------------------------------------------------------------------------
-- 2. BUG-010: SECURE MESSAGE-TO-CONVERSATION AUTHORIZATION
-- -----------------------------------------------------------------------------

-- 2.1 Trigger: Validate Message Insert against Conversation Participants
CREATE OR REPLACE FUNCTION public.validate_message_insert()
RETURNS TRIGGER AS $$
DECLARE
  target_conv RECORD;
  conv_uuid UUID;
BEGIN
  -- Administrator bypass
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- 1. Verify caller owns the sender_id
  IF auth.uid() IS NULL OR NEW.sender_id <> auth.uid() THEN
    RAISE EXCEPTION 'Security Violation: Sender ID must match authenticated user.';
  END IF;

  -- 2. Prevent sending messages to oneself
  IF NEW.receiver_id IS NOT NULL AND NEW.sender_id = NEW.receiver_id THEN
    RAISE EXCEPTION 'Invalid Operation: Senders cannot message themselves.';
  END IF;

  -- 3. Conversation ID must be valid and non-empty
  IF NEW.conversation_id IS NULL OR trim(NEW.conversation_id::text) = '' THEN
    RAISE EXCEPTION 'Security Violation: Message must be attached to an existing conversation.';
  END IF;

  BEGIN
    conv_uuid := NEW.conversation_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid Conversation: conversation_id is not a valid UUID.';
  END;

  -- 4. Verify conversation exists and sender is a verified participant
  SELECT * INTO target_conv FROM public.conversations WHERE id = conv_uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Security Violation: Target conversation does not exist.';
  END IF;

  IF auth.uid() <> target_conv.participant_one AND auth.uid() <> target_conv.participant_two THEN
    RAISE EXCEPTION 'Security Violation: Sender is not an authorized participant of this conversation.';
  END IF;

  -- 5. If receiver_id is specified, verify it matches the conversation peer
  IF NEW.receiver_id IS NOT NULL THEN
    IF (target_conv.participant_one = auth.uid() AND NEW.receiver_id <> target_conv.participant_two) OR
       (target_conv.participant_two = auth.uid() AND NEW.receiver_id <> target_conv.participant_one) THEN
      RAISE EXCEPTION 'Security Violation: Receiver ID does not match the other conversation participant.';
    END IF;
  ELSE
    -- Auto-populate receiver_id from conversation peer
    IF target_conv.participant_one = auth.uid() THEN
      NEW.receiver_id := target_conv.participant_two;
    ELSE
      NEW.receiver_id := target_conv.participant_one;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_validate_message_insert ON public.messages;
CREATE TRIGGER trigger_validate_message_insert
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_message_insert();

-- 2.2 Harden Message INSERT Policy
DROP POLICY IF EXISTS "Senders create messages" ON public.messages;
CREATE POLICY "Senders create messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    sender_id <> receiver_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = messages.conversation_id::text
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
        AND (messages.receiver_id IS NULL OR messages.receiver_id IN (c.participant_one, c.participant_two))
    )
  );

-- 2.3 Harden Message SELECT Policy: Only participants can read messages
DROP POLICY IF EXISTS "Participants view their messages" ON public.messages;
CREATE POLICY "Participants view their messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = messages.conversation_id::text
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    ) OR
    public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- 3. BUG-011: STRICT APPLICATION FIELD PROTECTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_application_update()
RETURNS TRIGGER AS $$
DECLARE
  is_caller_admin BOOLEAN := public.is_admin();
  is_caller_recruiter BOOLEAN := false;
BEGIN
  -- Case A: Administrator has full access
  IF is_caller_admin THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Check if caller is an authorized recruiter or owner for the job's company
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.company_members cm ON cm.company_id = j.company_id
    WHERE j.id = OLD.job_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner'::company_member_role, 'recruiter'::company_member_role)
  ) INTO is_caller_recruiter;

  -- Case B: Candidate / Job Seeker is updating
  IF auth.uid() = OLD.user_id AND NOT is_caller_recruiter THEN
    -- 1. Candidate can ONLY change status to 'Withdrawn'
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status <> 'Withdrawn'::application_status THEN
        RAISE EXCEPTION 'Security Violation: Candidates are strictly forbidden from setting application status to %.', NEW.status;
      END IF;

      -- Check eligibility for withdrawal
      IF OLD.status IN ('Rejected'::application_status, 'Withdrawn'::application_status) THEN
        RAISE EXCEPTION 'Invalid Operation: Application in % status cannot be withdrawn.', OLD.status;
      END IF;
    END IF;

    -- 2. Every applicant-submitted and evaluation field is strictly immutable for the applicant
    IF NEW.user_id <> OLD.user_id OR NEW.job_id <> OLD.job_id THEN
      RAISE EXCEPTION 'Security Violation: Application ownership and job association cannot be modified.';
    END IF;

    IF NEW.resume_file IS DISTINCT FROM OLD.resume_file OR
       NEW.cover_letter IS DISTINCT FROM OLD.cover_letter OR
       NEW.answers IS DISTINCT FROM OLD.answers OR
       NEW.notes IS DISTINCT FROM OLD.notes OR
       NEW.ats_score IS DISTINCT FROM OLD.ats_score OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Security Violation: Previously submitted application data (resume, cover letter, answers, evaluations) cannot be altered post-submission.';
    END IF;

    -- If extended profile fields exist on applications table, ensure they are also immutable
    BEGIN
      IF NEW.full_name IS DISTINCT FROM OLD.full_name OR
         NEW.email IS DISTINCT FROM OLD.email OR
         NEW.mobile_number IS DISTINCT FROM OLD.mobile_number OR
         NEW.current_location IS DISTINCT FROM OLD.current_location OR
         NEW.highest_qualification IS DISTINCT FROM OLD.highest_qualification OR
         NEW.skills IS DISTINCT FROM OLD.skills OR
         NEW.work_experience IS DISTINCT FROM OLD.work_experience OR
         NEW.expected_salary IS DISTINCT FROM OLD.expected_salary OR
         NEW.submitted_data IS DISTINCT FROM OLD.submitted_data THEN
        RAISE EXCEPTION 'Security Violation: Candidate submitted profile fields cannot be modified post-submission.';
      END IF;
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Case C: Recruiter is updating
  IF is_caller_recruiter THEN
    -- Recruiters can ONLY modify recruiter-controlled evaluation fields:
    -- status, notes, ats_score, recruiter_id, updated_at
    -- Strictly forbid modifying applicant-submitted fields:
    IF NEW.user_id <> OLD.user_id OR NEW.job_id <> OLD.job_id THEN
      RAISE EXCEPTION 'Security Violation: Recruiters cannot alter candidate or job linkages.';
    END IF;

    IF NEW.resume_file IS DISTINCT FROM OLD.resume_file OR
       NEW.cover_letter IS DISTINCT FROM OLD.cover_letter OR
       NEW.answers IS DISTINCT FROM OLD.answers OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Security Violation: Recruiters are forbidden from modifying applicant-submitted content (resume, cover letter, answers).';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Case D: Unauthorized user
  RAISE EXCEPTION 'Unauthorized: You do not have permission to update this application.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- -----------------------------------------------------------------------------
-- 4. BUG-012: SAFE ACCOUNT DELETION & STORAGE CLEANUP WORKFLOW
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'storage_cleanup_failed', 'database_cleanup_failed', 'completed')),
  storage_files JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Users view own deletion requests" ON public.account_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users create own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Users create own deletion requests" ON public.account_deletion_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Prepare account deletion: returns file list to purge via Storage API and initiates tracking
CREATE OR REPLACE FUNCTION public.prepare_account_deletion()
RETURNS JSONB AS $$
DECLARE
  caller_id UUID := auth.uid();
  file_record RECORD;
  files_array JSONB := '[]'::jsonb;
  req_id UUID;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Collect user files from private storage buckets (resumes, avatars)
  FOR file_record IN
    SELECT bucket_id, name
    FROM storage.objects
    WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
      AND (storage.foldername(name))[1] = caller_id::text
  LOOP
    files_array := files_array || jsonb_build_object(
      'bucket', file_record.bucket_id,
      'name', file_record.name
    );
  END LOOP;

  -- Create or update deletion request record
  INSERT INTO public.account_deletion_requests (user_id, status, storage_files, updated_at)
  VALUES (caller_id, 'processing', files_array, now())
  RETURNING id INTO req_id;

  RETURN jsonb_build_object(
    'request_id', req_id,
    'user_id', caller_id,
    'status', 'processing',
    'storage_files', files_array
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Finalize account deletion after Storage API confirms cleanup
CREATE OR REPLACE FUNCTION public.finalize_account_deletion(request_id UUID)
RETURNS JSONB AS $$
DECLARE
  caller_id UUID := auth.uid();
  req_record RECORD;
  remaining_files INT := 0;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO req_record FROM public.account_deletion_requests
  WHERE id = request_id AND user_id = caller_id;

  IF NOT FOUND AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Deletion request not found or access denied.';
  END IF;

  -- Verify no files remain in storage buckets for this user
  SELECT COUNT(*) INTO remaining_files
  FROM storage.objects
  WHERE (bucket_id = 'resumes' OR bucket_id = 'avatars')
    AND (storage.foldername(name))[1] = caller_id::text;

  IF remaining_files > 0 THEN
    UPDATE public.account_deletion_requests
    SET status = 'storage_cleanup_failed',
        error_message = format('%s files remain unpurged in storage.', remaining_files),
        updated_at = now()
    WHERE id = request_id;

    RAISE EXCEPTION 'Storage cleanup incomplete: % files could not be purged via Storage API.', remaining_files;
  END IF;

  -- Relational database purge
  BEGIN
    DELETE FROM public.messages WHERE sender_id = caller_id OR receiver_id = caller_id;
    DELETE FROM public.conversations WHERE participant_one = caller_id OR participant_two = caller_id;
    DELETE FROM public.applications WHERE user_id = caller_id;
    DELETE FROM public.saved_jobs WHERE user_id = caller_id;
    DELETE FROM public.job_alerts WHERE user_id = caller_id;

    -- Only remove user from company memberships; do not delete shared company assets
    DELETE FROM public.company_members WHERE user_id = caller_id;

    DELETE FROM public.profiles WHERE id = caller_id;
    DELETE FROM auth.users WHERE id = caller_id;

    UPDATE public.account_deletion_requests
    SET status = 'completed', updated_at = now()
    WHERE id = request_id;

  EXCEPTION WHEN OTHERS THEN
    UPDATE public.account_deletion_requests
    SET status = 'database_cleanup_failed',
        error_message = SQLERRM,
        updated_at = now()
    WHERE id = request_id;

    RAISE EXCEPTION 'Database cleanup failed: %. Deletion halted.', SQLERRM;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'completed',
    'deleted_user_id', caller_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- -----------------------------------------------------------------------------
-- 5. BUG-013: COMPLETE MESSAGE READ-RECEIPT PROTECTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- Only the verified message receiver can update read receipts
    IF auth.uid() IS NULL OR auth.uid() <> OLD.receiver_id THEN
      RAISE EXCEPTION 'Security Violation: Only the message recipient is authorized to update read status.';
    END IF;

    -- Only permit the transition from unread (false) to read (true)
    IF OLD.is_read = true AND NEW.is_read = false THEN
      RAISE EXCEPTION 'Security Violation: Cannot mark an already read message as unread.';
    END IF;

    IF NEW.is_read <> true THEN
      RAISE EXCEPTION 'Security Violation: Read-receipt update must set is_read = true.';
    END IF;

    -- All other fields are strictly immutable
    IF NEW.sender_id <> OLD.sender_id OR
       NEW.receiver_id <> OLD.receiver_id OR
       NEW.content <> OLD.content OR
       NEW.conversation_id <> OLD.conversation_id OR
       NEW.created_at <> OLD.created_at OR
       NEW.interview_invite IS DISTINCT FROM OLD.interview_invite THEN
      RAISE EXCEPTION 'Security Violation: Message recipient cannot alter message content, sender, receiver, conversation, or interview invite.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- -----------------------------------------------------------------------------
-- 6. BUG-014: DURABLE OUTBOUND EMAIL QUEUE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.outbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'retrying')),
  retry_count INT DEFAULT 0,
  idempotency_key TEXT UNIQUE NOT NULL,
  provider_message_id TEXT,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outbound_emails_status ON public.outbound_emails(status);
CREATE INDEX IF NOT EXISTS idx_outbound_emails_idempotency ON public.outbound_emails(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_outbound_emails_recipient ON public.outbound_emails(recipient);

ALTER TABLE public.outbound_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all outbound emails" ON public.outbound_emails;
CREATE POLICY "Admins view all outbound emails" ON public.outbound_emails
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users view own outbound emails" ON public.outbound_emails;
CREATE POLICY "Users view own outbound emails" ON public.outbound_emails
  FOR SELECT TO authenticated
  USING (
    recipient = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- 7. BUG-016: STRICT COMPANY LOGO AUTHORIZATION & FILE SANITIZATION
-- -----------------------------------------------------------------------------

-- Drop existing storage policies for company logos
DROP POLICY IF EXISTS "Authorized company members upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized company members update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized company members delete logos" ON storage.objects;

-- 7.1 INSERT: Strictly require company owner, verified recruiter role, or admin
-- Explicitly disallow SVG files to prevent XSS script injection
CREATE POLICY "Authorized company members upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    -- File extension check: SVG is prohibited; allowed: png, jpg, jpeg, webp
    (storage.extension(name) IN ('png', 'jpg', 'jpeg', 'webp')) AND
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
          AND cm.role IN ('owner'::company_member_role, 'recruiter'::company_member_role)
      )
    )
  );

-- 7.2 UPDATE: Strictly require company owner, verified recruiter, or admin
CREATE POLICY "Authorized company members update logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (storage.extension(name) IN ('png', 'jpg', 'jpeg', 'webp')) AND
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
          AND cm.role IN ('owner'::company_member_role, 'recruiter'::company_member_role)
      )
    )
  )
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL AND
    (storage.extension(name) IN ('png', 'jpg', 'jpeg', 'webp')) AND
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
          AND cm.role IN ('owner'::company_member_role, 'recruiter'::company_member_role)
      )
    )
  );

-- 7.3 DELETE: Strictly require company owner, verified recruiter, or admin
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
          AND cm.role IN ('owner'::company_member_role, 'recruiter'::company_member_role)
      )
    )
  );
