-- Lock In – databáza pre Supabase
-- Vlož celé do Supabase → SQL Editor → New query a klikni Run.
-- Skript sa dá spustiť aj opakovane.

-- ─── Tabuľky ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nick        text not null check (char_length(nick) between 1 and 20),
  pair_code   text check (pair_code is null or char_length(pair_code) <= 24),
  group_name  text check (group_name is null or char_length(group_name) <= 24),
  start_date  date not null default current_date,
  seen        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.days (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null,
  habits      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);

create index if not exists profiles_pair_idx  on public.profiles (lower(pair_code));
create index if not exists profiles_group_idx on public.profiles (lower(group_name));
create index if not exists days_day_idx       on public.days (day);

-- ─── Pomocné funkcie ─────────────────────────────────────
-- kód dvojice prihláseného používateľa (bez rekurzie v pravidlách)
create or replace function public.my_pair_code()
returns text language sql stable security definer set search_path = public as $$
  select nullif(lower(trim(pair_code)), '') from public.profiles where id = auth.uid()
$$;

-- dobrý deň: aspoň 5 zo 6 bodov, v nedeľu stačí 1
create or replace function public.is_good(h jsonb, d date)
returns boolean language sql immutable set search_path = public as $$
  select (select count(*) from jsonb_each(h) where value = 'true'::jsonb)
         >= case when extract(isodow from d) = 7 then 1 else 5 end
$$;

-- ─── Pravidlá prístupu (RLS) ─────────────────────────────
-- Každý vidí len seba a svojho parťáka (rovnaký kód dvojice).
-- Rebríčky idú cez funkcie nižšie, ktoré vracajú iba súhrny, nie jednotlivé body.
alter table public.profiles enable row level security;
alter table public.days     enable row level security;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or (public.my_pair_code() is not null and lower(trim(pair_code)) = public.my_pair_code()));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete on public.profiles for delete to authenticated using (id = auth.uid());

drop policy if exists days_select on public.days;
drop policy if exists days_insert on public.days;
drop policy if exists days_update on public.days;
drop policy if exists days_delete on public.days;
create policy days_select on public.days for select to authenticated
  using (user_id = auth.uid() or user_id in (
    select id from public.profiles
    where public.my_pair_code() is not null and lower(trim(pair_code)) = public.my_pair_code()));
create policy days_insert on public.days for insert to authenticated with check (user_id = auth.uid());
create policy days_update on public.days for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy days_delete on public.days for delete to authenticated using (user_id = auth.uid());

-- ─── Rebríčky (len súhrny) ───────────────────────────────
-- Skupiny: percento dobrých dní za posledných 7 dní; každému sa rátajú len dni od jeho štartu.
create or replace function public.leaderboard_groups()
returns table (group_name text, members int, pct int)
language sql stable security definer set search_path = public as $$
  with eligible as (
    select p.id, trim(p.group_name) as g, d::date as day
    from public.profiles p
    cross join generate_series(current_date - 6, current_date, interval '1 day') d
    where coalesce(trim(p.group_name), '') <> '' and d::date >= p.start_date
  )
  select min(e.g) as group_name,
         count(distinct e.id)::int as members,
         coalesce(round(100.0 * count(*) filter (where public.is_good(x.habits, e.day)) / nullif(count(*), 0)), 0)::int as pct
  from eligible e
  left join public.days x on x.user_id = e.id and x.day = e.day
  group by lower(e.g)
  order by pct desc, members desc
  limit 50
$$;

-- Dvojice: počet dní za posledných 30, keď boli dobrí obaja (od štartu neskoršieho z nich).
create or replace function public.leaderboard_pairs()
returns table (names text, group_name text, days int)
language sql stable security definer set search_path = public as $$
  with pairs as (
    select lower(trim(pair_code)) as code,
           string_agg(nick, ' + ' order by created_at) as names,
           min(nullif(trim(group_name), '')) as group_name,
           max(start_date) as start_date,
           count(*) as n
    from public.profiles
    where coalesce(trim(pair_code), '') <> ''
    group by lower(trim(pair_code))
    having count(*) >= 2
  ), cal as (
    select pr.code, d::date as day, pr.n
    from pairs pr
    cross join generate_series(current_date - 29, current_date, interval '1 day') d
    where d::date >= pr.start_date
  ), goodcount as (
    select c.code, c.day
    from cal c
    join public.profiles p on lower(trim(p.pair_code)) = c.code
    left join public.days x on x.user_id = p.id and x.day = c.day
    group by c.code, c.day, c.n
    having count(*) filter (where public.is_good(x.habits, c.day)) = c.n
  )
  select pr.names, pr.group_name, (select count(*) from goodcount g where g.code = pr.code)::int as days
  from pairs pr
  order by days desc
  limit 50
$$;

revoke all on function public.leaderboard_groups() from public, anon;
revoke all on function public.leaderboard_pairs()  from public, anon;
grant execute on function public.leaderboard_groups() to authenticated;
grant execute on function public.leaderboard_pairs()  to authenticated;
revoke all on function public.my_pair_code() from public, anon;
revoke all on function public.is_good(jsonb, date) from anon;
grant execute on function public.my_pair_code()       to authenticated;

-- ─── Admin ───────────────────────────────────────────────
-- Admini sú určení e-mailom. Tabuľka nie je prístupná z prehliadača.
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
insert into public.admins (email) values ('roman.stanco19@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'))
$$;

-- Prehľad všetkých účastníkov, len pre adminov.
create or replace function public.admin_overview()
returns table (nick text, email text, pair_code text, group_name text, start_date date,
               good_days int, last_day date, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.nick, u.email::text, p.pair_code, p.group_name, p.start_date,
         (select count(*) from public.days d where d.user_id = p.id and d.day >= p.start_date and public.is_good(d.habits, d.day))::int,
         (select max(d.day) from public.days d where d.user_id = p.id),
         p.created_at
  from public.profiles p join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at
$$;

revoke all on function public.is_admin()       from public, anon;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.is_admin()       to authenticated;
grant execute on function public.admin_overview() to authenticated;
