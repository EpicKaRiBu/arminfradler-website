-- Anonymer Seitenzähler für arminfradler.at
-- Gespeichert wird nur: Tag, Seite, Herkunft (z. B. linkedin.com) und eine Zahl. Keine IP, keine Uhrzeit, kein Cookie, keine Person.
-- Jeder Aufruf erhöht nur die Zahl in der passenden Zeile. Einzelne Besuche lassen sich daraus nicht nachverfolgen.
create table if not exists public.aufrufe (
  tag date not null default current_date,
  seite text not null check (char_length(seite) <= 120),
  herkunft text not null check (char_length(herkunft) <= 80),
  anzahl integer not null default 0,
  primary key (tag, seite, herkunft)
);
alter table public.aufrufe enable row level security;
revoke all on public.aufrufe from anon, authenticated;

-- Nur die Funktion „zaehler“ (mit dem Dienstschlüssel) darf zählen
create or replace function public.zaehle(p_seite text, p_herkunft text) returns void
language sql security definer set search_path = public as $$
  insert into public.aufrufe (tag, seite, herkunft, anzahl) values (current_date, p_seite, p_herkunft, 1)
  on conflict (tag, seite, herkunft) do update set anzahl = public.aufrufe.anzahl + 1;
$$;
revoke all on function public.zaehle(text, text) from public, anon, authenticated;

-- Übersicht zum Nachschauen im Supabase-Dashboard (SQL Editor: select * from monatsuebersicht;)
create or replace view public.monatsuebersicht with (security_invoker = true) as
  select date_trunc('month', tag)::date as monat, seite, herkunft, sum(anzahl)::int as aufrufe
  from public.aufrufe group by 1, 2, 3 order by 1 desc, 4 desc;
revoke all on public.monatsuebersicht from anon, authenticated;

-- Aufräumen: Zahlen älter als 25 Monate werden gelöscht (Datenschutzerklärung, Abschnitt 3)
select cron.schedule('aufrufe-aufraeumen', '27 3 * * *', $$delete from public.aufrufe where tag < current_date - interval '25 months'$$);

-- Kontaktformular: freiwillige Angabe „Wie sind Sie auf mich gekommen?“
alter table public.kontakt add column if not exists quelle text check (char_length(quelle) <= 200);
