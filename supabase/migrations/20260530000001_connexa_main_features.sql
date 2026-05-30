-- house_scores: one row per house per week, scores managed by admin/functions only
create table if not exists public.house_scores (
  id uuid primary key default gen_random_uuid(),
  house public.connexa_house not null,
  week_start date not null,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (house, week_start)
);

alter table public.house_scores enable row level security;

revoke all on table public.house_scores from anon, authenticated;
grant select on table public.house_scores to authenticated;

drop policy if exists "authenticated users can read house scores" on public.house_scores;
create policy "authenticated users can read house scores"
on public.house_scores for select
using (auth.uid() is not null);

-- Seed current week with zero scores for all four houses
insert into public.house_scores (house, week_start, score)
values
  ('tinkerers',  date_trunc('week', current_date)::date, 0),
  ('wanderers',  date_trunc('week', current_date)::date, 0),
  ('strategists',date_trunc('week', current_date)::date, 0),
  ('mavericks',  date_trunc('week', current_date)::date, 0)
on conflict (house, week_start) do nothing;

-- introductions: pending intro requests between users, inserted by admin/matching logic
create table if not exists public.introductions (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'passed')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_user, to_user)
);

alter table public.introductions enable row level security;

revoke all on table public.introductions from anon, authenticated;
grant select on table public.introductions to authenticated;
grant update (status, responded_at) on table public.introductions to authenticated;

drop policy if exists "users can read their own introductions" on public.introductions;
create policy "users can read their own introductions"
on public.introductions for select
using (from_user = auth.uid() or to_user = auth.uid());

drop policy if exists "recipients can respond to introductions" on public.introductions;
create policy "recipients can respond to introductions"
on public.introductions for update
using (to_user = auth.uid())
with check (to_user = auth.uid());

-- Allow verified housemates to see each other's profiles
-- (existing policy only allowed own row or admin)
drop policy if exists "verified housemates can see each other" on public.users;
create policy "verified housemates can see each other"
on public.users for select
using (
  verification_status = 'verified'
  and house is not null
  and house = (
    select house from public.users where id = auth.uid()
  )
);
