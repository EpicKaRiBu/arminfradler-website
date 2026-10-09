-- Kontaktanfragen von arminfradler.at
-- Nur die Funktion „kontakt“ schreibt (mit dem Dienstschlüssel). Von außen ist die Tabelle weder lesbar noch beschreibbar.
create table if not exists public.kontakt (
  id uuid primary key default gen_random_uuid(),
  erstellt timestamptz not null default now(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 200),
  organisation text check (char_length(organisation) <= 200),
  anlass text not null,
  nachricht text not null check (char_length(nachricht) <= 5000),
  mail_ok boolean not null default false
);
alter table public.kontakt enable row level security;
revoke all on public.kontakt from anon, authenticated;

-- Aufräumen: Anfragen werden nach 12 Monaten gelöscht (Datenschutzerklärung, Abschnitt 5)
create extension if not exists pg_cron;
select cron.schedule('kontakt-aufraeumen', '17 3 * * *', $$delete from public.kontakt where erstellt < now() - interval '12 months'$$);
