-- EvoriPlay lives inside the shared evoria-platform Supabase project.
-- All app-owned objects stay inside this schema to avoid cross-app collisions.
create schema if not exists evoriplay;

grant usage on schema evoriplay to anon, authenticated, service_role;
alter default privileges in schema evoriplay grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema evoriplay grant usage, select on sequences to authenticated;

create table if not exists evoriplay.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 32),
  level integer not null default 1 check (level >= 1),
  xp bigint not null default 0 check (xp >= 0),
  coins bigint not null default 0 check (coins >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evoriplay.game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  game_version integer not null default 1,
  save_schema_version integer not null default 1,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists evoriplay.achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  game_id text,
  progress integer not null default 0,
  unlocked_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists evoriplay.sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_event_id uuid not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, client_event_id)
);

alter table evoriplay.profiles enable row level security;
alter table evoriplay.game_progress enable row level security;
alter table evoriplay.achievements enable row level security;
alter table evoriplay.sync_events enable row level security;

create policy "profiles_owner_all" on evoriplay.profiles
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "game_progress_owner_all" on evoriplay.game_progress
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "achievements_owner_all" on evoriplay.achievements
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "sync_events_owner_all" on evoriplay.sync_events
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on all tables in schema evoriplay to authenticated;
grant all on all tables in schema evoriplay to service_role;
