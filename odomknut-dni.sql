-- Lock In – zrušenie zámku o polnoci. Dni sa dajú odkliknúť aj spätne (posledných 7 dní).
-- Supabase → SQL Editor → New query → vlož celé → Run.
drop policy if exists days_insert on public.days;
drop policy if exists days_update on public.days;
create policy days_insert on public.days for insert to authenticated
  with check (user_id = auth.uid() and (day >= (now() at time zone 'Europe/Bratislava')::date - 7 or public.is_admin()));
create policy days_update on public.days for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (day >= (now() at time zone 'Europe/Bratislava')::date - 7 or public.is_admin()));
