-- Lock In – aktualizácia: chat, rebríčky podľa bodov, zámok dní o polnoci.
-- Vlož celé do Supabase → SQL Editor → New query → Run. Dá sa spustiť aj opakovane.

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  room       text not null check (char_length(room) between 1 and 40),
  nick       text not null default '',
  body       text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages (room, created_at desc);

create or replace function public.my_rooms()
returns text[] language sql stable security definer set search_path = public as $$
  select array_remove(array['all',
    case when coalesce(trim(group_name), '') <> '' then 'g:' || lower(trim(group_name)) end,
    case when coalesce(trim(pair_code), '') <> '' then 'p:' || lower(trim(pair_code)) end], null)
  from public.profiles where id = auth.uid()
$$;
revoke all on function public.my_rooms() from public, anon;
grant execute on function public.my_rooms() to authenticated;

create or replace function public.messages_fill()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  new.nick := coalesce((select nick from public.profiles where id = auth.uid()), '?');
  new.body := trim(new.body);
  new.created_at := now();
  return new;
end $$;
drop trigger if exists messages_fill on public.messages;
create trigger messages_fill before insert on public.messages for each row execute function public.messages_fill();

alter table public.messages enable row level security;
drop policy if exists messages_select on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_delete on public.messages;
create policy messages_select on public.messages for select to authenticated using (room = any (public.my_rooms()));
create policy messages_insert on public.messages for insert to authenticated with check (room = any (public.my_rooms()));
create policy messages_delete on public.messages for delete to authenticated using (user_id = auth.uid() or public.is_admin());
grant select, insert, delete on public.messages to authenticated;
revoke all on public.messages from anon;

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

-- ─── Body: počet odkliknutých aktivít v dni ─────────────
create or replace function public.pts(h jsonb)
returns int language sql immutable set search_path = public as $$
  select count(*)::int from jsonb_each(coalesce(h, '{}'::jsonb)) where value = 'true'::jsonb
$$;

-- ─── Rebríčky podľa bodov (admin skrytý) ────────────────
drop function if exists public.leaderboard_players();
create function public.leaderboard_players()
returns table (nick text, group_name text, points int, days int, pct int)
language sql stable security definer set search_path = public as $$
  select p.nick, nullif(trim(p.group_name), ''),
         coalesce((select sum(public.pts(d.habits)) from public.days d
           where d.user_id = p.id and d.day >= p.start_date and d.day < p.start_date + 30 and d.day <= current_date), 0)::int,
         (select count(*) from public.days d
           where d.user_id = p.id and d.day >= p.start_date and d.day < p.start_date + 30
             and d.day <= current_date and public.is_good(d.habits, d.day))::int,
         coalesce((select round(100.0 * count(*) filter (where public.is_good(x.habits, g::date)) / nullif(count(*), 0))
           from generate_series(greatest(p.start_date, current_date - 6), current_date, interval '1 day') g
           left join public.days x on x.user_id = p.id and x.day = g::date), 0)::int
  from public.profiles p
  where not public.is_hidden(p.id)
  order by 3 desc, 4 desc, p.created_at
  limit 100
$$;

drop function if exists public.leaderboard_pairs();
create function public.leaderboard_pairs()
returns table (names text, group_name text, points int, days int)
language sql stable security definer set search_path = public as $$
  with pairs as (
    select lower(trim(pair_code)) as code,
           string_agg(nick, ' + ' order by created_at) as names,
           min(nullif(trim(group_name), '')) as group_name,
           greatest(max(start_date), current_date - 29) as since,
           count(*) as n
    from public.profiles
    where coalesce(trim(pair_code), '') <> ''
    group by lower(trim(pair_code))
    having count(*) >= 2 and not bool_or(public.is_hidden(id))
  ), cal as (
    select pr.code, d::date as day, pr.n
    from pairs pr cross join generate_series(pr.since, current_date, interval '1 day') d
  ), daystat as (
    select c.code, c.day, c.n,
           count(*) filter (where public.is_good(x.habits, c.day)) as good_n,
           coalesce(sum(public.pts(x.habits)), 0) as pts
    from cal c
    join public.profiles p on lower(trim(p.pair_code)) = c.code
    left join public.days x on x.user_id = p.id and x.day = c.day
    group by c.code, c.day, c.n
  )
  select pr.names, pr.group_name,
         coalesce((select sum(ds.pts) from daystat ds where ds.code = pr.code), 0)::int,
         (select count(*) from daystat ds where ds.code = pr.code and ds.good_n = ds.n)::int
  from pairs pr
  order by 3 desc, 4 desc
  limit 50
$$;

drop function if exists public.leaderboard_groups();
create function public.leaderboard_groups()
returns table (group_name text, members int, points numeric, pct int)
language sql stable security definer set search_path = public as $$
  with eligible as (
    select p.id, trim(p.group_name) as g, d::date as day
    from public.profiles p
    cross join generate_series(current_date - 6, current_date, interval '1 day') d
    where coalesce(trim(p.group_name), '') <> '' and d::date >= p.start_date and not public.is_hidden(p.id)
  )
  select min(e.g),
         count(distinct e.id)::int,
         round(coalesce(sum(public.pts(x.habits)), 0)::numeric / nullif(count(distinct e.id), 0), 1),
         coalesce(round(100.0 * count(*) filter (where public.is_good(x.habits, e.day)) / nullif(count(*), 0)), 0)::int
  from eligible e
  left join public.days x on x.user_id = e.id and x.day = e.day
  group by lower(e.g)
  order by 3 desc, 4 desc
  limit 50
$$;

revoke all on function public.leaderboard_players() from public, anon;
revoke all on function public.leaderboard_pairs()   from public, anon;
revoke all on function public.leaderboard_groups()  from public, anon;
grant execute on function public.leaderboard_players() to authenticated;
grant execute on function public.leaderboard_pairs()   to authenticated;
grant execute on function public.leaderboard_groups()  to authenticated;

-- ─── Zámok: deň sa dá meniť len v ten deň (do 23:59, Bratislava). Admin môže vždy. ─
drop policy if exists days_insert on public.days;
drop policy if exists days_update on public.days;
create policy days_insert on public.days for insert to authenticated
  with check (user_id = auth.uid() and (day >= (now() at time zone 'Europe/Bratislava')::date or public.is_admin()));
create policy days_update on public.days for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (day >= (now() at time zone 'Europe/Bratislava')::date or public.is_admin()));
