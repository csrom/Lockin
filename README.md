# Lock In

30-dňová výzva disciplíny pre chlapov. Sám, vo dvojici alebo v skupine.

Statický web (HTML, CSS, JS) na **Verceli**, dáta a prihlásenie v **Supabase**.

## Spustenie

### 1. Supabase – databáza
1. Supabase → tvoj projekt → **SQL Editor → New query**.
2. Vlož celý obsah súboru [`supabase.sql`](supabase.sql) a klikni **Run**.

### 2. Supabase – prihlasovanie
1. **Authentication → Sign In / Providers → Email**: nechaj zapnuté.
2. **Authentication → URL Configuration**:
   - **Site URL**: adresa z Vercelu, napr. `https://lockin-xxx.vercel.app`
   - **Redirect URLs**: pridaj tú istú adresu

### 3. Vercel
1. **Add New → Project → Import** repozitár `csrom/Lockin`.
2. Framework Preset: **Other**. Build ani premenné netreba.
3. **Deploy**.

## Súbory
- `index.html`, `style.css`, `app.js` – appka
- Prihlásenie: e-mail + heslo. V Supabase → Authentication → Sign In / Providers → Email vypni „Confirm email“.
- `config.js` – Supabase URL a verejný (publishable) kľúč. Tajný kľúč sem nikdy nedávaj.
- `supabase.sql` – tabuľky, pravidlá prístupu a rebríčky
- `media/` – obrázky a video výstupu

## Súkromie
Každý vidí len svoje odkliknutia a odkliknutia parťáka s rovnakým kódom dvojice.
Rebríčky skupín a dvojíc ukazujú iba súhrnné čísla.
