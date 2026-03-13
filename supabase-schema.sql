-- ============================================================
-- ResourceIQ — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

create table if not exists public.tasks (
  id           bigserial primary key,
  it_name      text        not null,
  project      text        not null,
  manday       numeric     default 1,
  al_date      date,
  start_date   date,
  end_date     date,
  progress     integer     default 0 check (progress between 0 and 100),
  priority     text        default 'High' check (priority in ('High','Low')),
  status       text        default 'In Progress' check (status in ('In Progress','On Hold','UAT')),
  updated_date date        default current_date,
  target_uat   date,
  target_live  date,
  created_at   timestamptz default now()
);

-- Enable Row Level Security (recommended even for internal tools)
alter table public.tasks enable row level security;

-- Allow all operations for anonymous/authenticated users
-- (For internal use — tighten this if you add auth later)
create policy "Allow all" on public.tasks
  for all using (true) with check (true);

-- Enable realtime so all browser tabs update live
alter publication supabase_realtime add table public.tasks;

-- ── Optional: seed with sample data ──────────────────────────
-- (delete this block once you have real data)
insert into public.tasks (it_name, project, manday, start_date, end_date, progress, priority, status, updated_date, target_uat, target_live)
values
  ('Ahmad Farid',      'CRM Customer Portal',   10, current_date - 10, current_date + 4,  60, 'High', 'In Progress', current_date, current_date + 10, current_date + 17),
  ('Siti Nurhaliza',   'Reporting Module',      15, current_date - 14, current_date + 3,  80, 'High', 'In Progress', current_date, current_date + 7,  null),
  ('Rajesh Kumar',     'API Integration v2',     8, current_date + 3,  current_date + 12, 0,  'Low',  'In Progress', current_date, null,              null),
  ('Lim Wei Xin',      'Bug Fix Batch #12',      3, current_date - 5,  current_date - 3,  100,'High', 'In Progress', current_date, null,              null),
  ('Nur Aisyah',       'Feedback Support Q2',    5, current_date - 2,  current_date + 3,  40, 'Low',  'In Progress', current_date, null,              null),
  ('Kevin Tan',        'Mobile App Sync',        12,current_date + 10, current_date + 21, 0,  'High', 'In Progress', current_date, current_date + 24, current_date + 31),
  ('Priya Subramaniam','UAT Support CRM v3',     6, current_date - 4,  current_date + 2,  90, 'High', 'UAT',         current_date, current_date + 4,  current_date + 11),
  ('Muhammad Haziq',   'Data Migration Script',  4, current_date - 20, current_date - 16, 50, 'High', 'In Progress', current_date, null,              null),
  ('Chloe Wong',       'Dashboard Enhancement',  7, current_date + 3,  current_date + 11, 0,  'Low',  'In Progress', current_date, null,              null),
  ('Danial Ariff',     'Auth Module Upgrade',    9, current_date - 4,  current_date + 5,  70, 'High', 'In Progress', current_date, current_date + 10, null);
