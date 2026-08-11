-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.tasks (
  al_date jsonb DEFAULT '[]'::jsonb,
  it_name text NOT NULL,
  project text NOT NULL,
  start_date date,
  end_date date,
  target_uat date,
  target_live date,
  id bigint NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
  manday numeric DEFAULT 1,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority text DEFAULT 'High'::text CHECK (priority = ANY (ARRAY['High'::text, 'Low'::text])),
  status text DEFAULT 'In Progress'::text CHECK (status = ANY (ARRAY['In Progress'::text, 'Upcoming'::text, 'Delayed'::text, 'On Hold'::text, 'UAT'::text, 'Completed'::text])),
  updated_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  ready_for_deployment boolean DEFAULT false,
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subtasks (
  task_id bigint NOT NULL,
  title text NOT NULL,
  owner text,
  id bigint NOT NULL DEFAULT nextval('subtasks_id_seq'::regclass),
  done boolean DEFAULT false,
  status text DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'In Progress'::text, 'Done'::text, 'Blocked'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subtasks_pkey PRIMARY KEY (id),
  CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.task_logs (
  task_id bigint,
  action_type text NOT NULL,
  old_value text,
  new_value text,
  id bigint NOT NULL DEFAULT nextval('task_logs_id_seq'::regclass),
  changed_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_logs_pkey PRIMARY KEY (id),
  CONSTRAINT task_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.deployments (
  title text NOT NULL,
  deploy_date date NOT NULL,
  notes text,
  created_by text,
  id bigint NOT NULL DEFAULT nextval('deployments_id_seq'::regclass),
  environment text DEFAULT 'Live'::text CHECK (environment = ANY (ARRAY['Live'::text, 'UAT'::text, 'Staging'::text])),
  created_at timestamp with time zone DEFAULT now(),
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT deployments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.deployment_tasks (
  deployment_id bigint NOT NULL,
  task_id bigint NOT NULL,
  CONSTRAINT deployment_tasks_pkey PRIMARY KEY (deployment_id, task_id),
  CONSTRAINT deployment_tasks_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id),
  CONSTRAINT deployment_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.daily_scrum (
  it_name text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scrum_date date NOT NULL DEFAULT CURRENT_DATE,
  prev_day text NOT NULL DEFAULT ''::text,
  today text NOT NULL DEFAULT ''::text,
  next_day text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_scrum_pkey PRIMARY KEY (id)
);
CREATE TABLE public.it_deployment_entries (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  deployment_id bigint NOT NULL,
  it_name text NOT NULL,
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT it_deployment_entries_pkey PRIMARY KEY (id),
  CONSTRAINT it_deployment_entries_deployment_id_fkey FOREIGN KEY (deployment_id) REFERENCES public.deployments(id)
);
CREATE TABLE public.annual_leave (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  it_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT annual_leave_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  it_name text,
  role text NOT NULL DEFAULT 'it_user'::text CHECK (role = ANY (ARRAY['super_admin'::text, 'it_user'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.it_member_emails (
  email text NOT NULL,
  it_name text NOT NULL,
  CONSTRAINT it_member_emails_pkey PRIMARY KEY (email)
);
CREATE TABLE public.super_admin_emails (
  email text NOT NULL,
  CONSTRAINT super_admin_emails_pkey PRIMARY KEY (email)
);
CREATE TABLE public.audit_logs (
  id bigint NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  created_at timestamp with time zone DEFAULT now(),
  actor_email text,
  actor_name text,
  action text NOT NULL,
  target text,
  detail jsonb,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);