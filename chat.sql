-- Lock In – chat. Vlož do Supabase → SQL Editor → New query → Run.
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
