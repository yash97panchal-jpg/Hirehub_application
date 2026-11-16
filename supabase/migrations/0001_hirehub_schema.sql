-- HireHub clean database foundation. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create type public.account_role as enum ('job_seeker','recruiter','admin');
create type public.job_status as enum ('draft','pending_review','published','paused','closed','rejected');
create type public.application_status as enum ('applied','viewed','under_review','assessment','shortlisted','interview_scheduled','interview_completed','selected','rejected','withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.account_role not null default 'job_seeker',
  phone text, location text, headline text, bio text,
  skills text[] not null default '{}',
  resume_path text,
  avatar_path text,
  profile_completion int not null default 10 check (profile_completion between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.companies (
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  website text, industry text, size_range text, description text, logo_path text,
  headquarters text, verified_at timestamptz, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'recruiter' check(member_role in ('owner','admin','recruiter','viewer')),
  created_at timestamptz not null default now(), primary key(company_id,user_id)
);
create table public.jobs (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.profiles(id), title text not null, slug text not null,
  description text not null, responsibilities text, requirements text, benefits text,
  location text, workplace_type text not null default 'onsite' check(workplace_type in ('onsite','hybrid','remote')),
  employment_type text not null default 'full_time' check(employment_type in ('full_time','part_time','contract','internship','temporary')),
  experience_level text, salary_min numeric, salary_max numeric, salary_currency text not null default 'INR',
  salary_period text not null default 'year' check(salary_period in ('hour','month','year')),
  skills text[] not null default '{}', category text, apply_mode text not null default 'internal' check(apply_mode in ('internal','external')),
  external_apply_url text, status public.job_status not null default 'draft', is_featured boolean not null default false,
  application_deadline date, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(company_id,slug)
);
create table public.applications (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text, resume_path text, status public.application_status not null default 'applied',
  source text not null default 'hirehub', submitted_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(job_id,applicant_id)
);
create table public.application_status_history (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  changed_by uuid references public.profiles(id), previous_status public.application_status, new_status public.application_status not null,
  note text, created_at timestamptz not null default now()
);
create table public.application_questions (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.jobs(id) on delete cascade,
  question text not null, question_type text not null default 'text' check(question_type in ('text','yes_no','single_choice','multiple_choice')),
  options jsonb not null default '[]', is_required boolean not null default false, sort_order int not null default 0
);
create table public.application_answers (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  question_id uuid not null references public.application_questions(id) on delete cascade, answer jsonb not null,
  unique(application_id,question_id)
);
create table public.interviews (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_by uuid not null references public.profiles(id), starts_at timestamptz not null, ends_at timestamptz,
  meeting_url text, location text, interview_type text not null default 'video', status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled','rescheduled')),
  notes text, created_at timestamptz not null default now()
);
create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  author_id uuid not null references public.profiles(id), rating int check(rating between 1 and 5), feedback text, recommendation text,
  created_at timestamptz not null default now(), unique(interview_id,author_id)
);
create table public.recruiter_notes (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references public.profiles(id), body text not null, is_private boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.saved_jobs (
  user_id uuid not null references public.profiles(id) on delete cascade, job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id,job_id)
);
create table public.job_alerts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, keywords text, location text, employment_type text, category text, is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text not null, kind text not null default 'general', target_url text,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id),
  job_id uuid references public.jobs(id) on delete cascade, company_id uuid references public.companies(id) on delete cascade,
  reason text not null, details text, status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  reviewed_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id), action text not null,
  entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create index jobs_public_search_idx on public.jobs(status, published_at desc);
create index jobs_company_idx on public.jobs(company_id, created_at desc);
create index applications_candidate_idx on public.applications(applicant_id, submitted_at desc);
create index applications_job_idx on public.applications(job_id, submitted_at desc);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.is_active=true);
$$;
create or replace function public.is_company_member(target_company uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.company_members m where m.company_id=target_company and m.user_id=auth.uid());
$$;
create or replace function public.can_manage_job(target_job uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.jobs j where j.id=target_job and public.is_company_member(j.company_id));
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name,email,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,case when new.raw_user_meta_data->>'role'='recruiter' then 'recruiter'::public.account_role else 'job_seeker'::public.account_role end);
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_questions enable row level security;
alter table public.application_answers enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_feedback enable row level security;
alter table public.recruiter_notes enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles visible to self, recruiters with applications, and admins" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin() or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.applicant_id=profiles.id and public.is_company_member(j.company_id)));
create or replace function public.protect_profile_role() returns trigger language plpgsql security definer set search_path=public as $$ begin if not public.is_admin() and new.role is distinct from old.role then new.role := old.role; end if; return new; end; $$;
create trigger protect_profile_role_before_update before update on public.profiles for each row execute procedure public.protect_profile_role();
create policy "users update own profile" on public.profiles for update to authenticated using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "companies public read" on public.companies for select using(true);
create policy "company creator creates company" on public.companies for insert to authenticated with check(created_by=auth.uid());
create policy "company members update company" on public.companies for update to authenticated using(public.is_company_member(id) or public.is_admin()) with check(public.is_company_member(id) or public.is_admin());
create policy "members see own company memberships" on public.company_members for select to authenticated using(user_id=auth.uid() or public.is_company_member(company_id) or public.is_admin());
create policy "company owners manage members" on public.company_members for all to authenticated using(public.is_company_member(company_id) or public.is_admin()) with check(public.is_company_member(company_id) or public.is_admin());
create policy "company creator adds self as owner" on public.company_members for insert to authenticated with check(user_id=auth.uid() and member_role='owner' and exists(select 1 from public.companies c where c.id=company_id and c.created_by=auth.uid()));
create policy "published jobs are public" on public.jobs for select using(status='published' or created_by=auth.uid() or public.is_company_member(company_id) or public.is_admin());
create policy "company members create jobs" on public.jobs for insert to authenticated with check(created_by=auth.uid() and public.is_company_member(company_id));
create policy "company members update jobs" on public.jobs for update to authenticated using(public.is_company_member(company_id) or public.is_admin()) with check(public.is_company_member(company_id) or public.is_admin());
create policy "company members delete jobs" on public.jobs for delete to authenticated using(public.is_company_member(company_id) or public.is_admin());
create policy "candidate and job owner view applications" on public.applications for select to authenticated using(applicant_id=auth.uid() or public.can_manage_job(job_id) or public.is_admin());
create policy "candidate applies as self" on public.applications for insert to authenticated with check(applicant_id=auth.uid() and exists(select 1 from public.jobs j where j.id=job_id and j.status='published'));
create policy "recruiters update application pipeline" on public.applications for update to authenticated using(public.can_manage_job(job_id) or public.is_admin()) with check(public.can_manage_job(job_id) or public.is_admin());
create policy "application history visible to participants" on public.application_status_history for select to authenticated using(exists(select 1 from public.applications a where a.id=application_id and (a.applicant_id=auth.uid() or public.can_manage_job(a.job_id))) or public.is_admin());
create policy "questions public read for published jobs" on public.application_questions for select using(exists(select 1 from public.jobs j where j.id=job_id and (j.status='published' or public.is_company_member(j.company_id))));
create policy "recruiters manage questions" on public.application_questions for all to authenticated using(public.can_manage_job(job_id) or public.is_admin()) with check(public.can_manage_job(job_id) or public.is_admin());
create policy "answers visible to applicant and recruiter" on public.application_answers for select to authenticated using(exists(select 1 from public.applications a where a.id=application_id and (a.applicant_id=auth.uid() or public.can_manage_job(a.job_id))) or public.is_admin());
create policy "applicant submits own answers" on public.application_answers for insert to authenticated with check(exists(select 1 from public.applications a where a.id=application_id and a.applicant_id=auth.uid()));
create policy "interviews visible to participants" on public.interviews for select to authenticated using(exists(select 1 from public.applications a where a.id=application_id and (a.applicant_id=auth.uid() or public.can_manage_job(a.job_id))) or public.is_admin());
create policy "recruiters schedule interviews" on public.interviews for all to authenticated using(exists(select 1 from public.applications a where a.id=application_id and public.can_manage_job(a.job_id)) or public.is_admin()) with check(exists(select 1 from public.applications a where a.id=application_id and public.can_manage_job(a.job_id)) or public.is_admin());
create policy "feedback visible to participants" on public.interview_feedback for select to authenticated using(exists(select 1 from public.interviews i join public.applications a on a.id=i.application_id where i.id=interview_id and (a.applicant_id=auth.uid() or public.can_manage_job(a.job_id))) or public.is_admin());
create policy "interview participants submit feedback" on public.interview_feedback for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.interviews i join public.applications a on a.id=i.application_id where i.id=interview_id and (a.applicant_id=auth.uid() or public.can_manage_job(a.job_id))));
create policy "recruiters manage notes" on public.recruiter_notes for all to authenticated using(author_id=auth.uid() or exists(select 1 from public.applications a where a.id=application_id and public.can_manage_job(a.job_id)) or public.is_admin()) with check(author_id=auth.uid() and exists(select 1 from public.applications a where a.id=application_id and public.can_manage_job(a.job_id)));
create policy "users manage own saved jobs" on public.saved_jobs for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users manage own alerts" on public.job_alerts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users read and update own notifications" on public.notifications for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy "users update own notifications" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users create reports" on public.reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "reporter and admins view reports" on public.reports for select to authenticated using(reporter_id=auth.uid() or public.is_admin());
create policy "admins manage reports" on public.reports for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select to authenticated using(public.is_admin());


create or replace function public.withdraw_application(target_application uuid) returns void
language plpgsql security definer set search_path=public as $$
declare current_app public.applications%rowtype;
begin
 select * into current_app from public.applications where id=target_application for update;
 if not found or current_app.applicant_id <> auth.uid() then raise exception 'Application not found or not owned by current user'; end if;
 if current_app.status in ('withdrawn','rejected','selected') then raise exception 'This application can no longer be withdrawn'; end if;
 update public.applications set status='withdrawn', updated_at=now() where id=target_application;
 insert into public.application_status_history(application_id,changed_by,previous_status,new_status,note)
 values(target_application,auth.uid(),current_app.status,'withdrawn','Withdrawn by applicant');
end; $$;

create or replace function public.set_application_status(target_application uuid, next_status public.application_status, status_note text default null) returns void
language plpgsql security definer set search_path=public as $$
declare current_app public.applications%rowtype;
begin
 select * into current_app from public.applications where id=target_application for update;
 if not found then raise exception 'Application not found'; end if;
 if not public.can_manage_job(current_app.job_id) and not public.is_admin() then raise exception 'Not authorized to update this application'; end if;
 if current_app.status in ('withdrawn','rejected','selected') then raise exception 'This application is in a final state'; end if;
 update public.applications set status=next_status, updated_at=now() where id=target_application;
 insert into public.application_status_history(application_id,changed_by,previous_status,new_status,note)
 values(target_application,auth.uid(),current_app.status,next_status,status_note);
end; $$;
revoke all on function public.withdraw_application(uuid) from public;
revoke all on function public.set_application_status(uuid,public.application_status,text) from public;
grant execute on function public.withdraw_application(uuid) to authenticated;
grant execute on function public.set_application_status(uuid,public.application_status,text) to authenticated;

create or replace function public.guard_job_publication() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='published' and not public.is_admin() and (tg_op='INSERT' or old.status is distinct from 'published') then
   new.status := 'pending_review';
 end if;
 return new;
end; $$;
create trigger guard_job_publication_before_write before insert or update on public.jobs for each row execute procedure public.guard_job_publication();

-- Keep role assignment controlled: profile self-update policy above prevents changing role.
-- Create private storage buckets manually or with the dashboard; use signed URLs for resumes.
