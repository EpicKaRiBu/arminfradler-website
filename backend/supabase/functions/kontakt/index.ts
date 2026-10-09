// Kontaktformular von arminfradler.at
// Prüft die Anfrage, speichert sie (Frankfurt) und schickt eine E-Mail an Armin – mit Antwort-Adresse der Person.
// Geheimnisse (im Supabase-Dashboard unter Edge Functions → Secrets, nie im Code):
//   RESEND_API_KEY   Schlüssel von resend.com (nur „Sending access“)
//   KONTAKT_AN       Empfänger, z. B. info@arminfradler.at
//   KONTAKT_VON      Absender auf der bei Resend bestätigten Domain, z. B. Website arminfradler.at <noreply@updates.arminfradler.at>
import {createClient} from 'npm:@supabase/supabase-js@2.49.4';

const ERLAUBT = ['https://arminfradler.at', 'https://www.arminfradler.at', 'https://epickaribu.github.io', 'http://localhost:8765'];
const ANLAESSE = ['Workshop', 'Vortrag oder Impuls', 'Pädagogischer Tag / SCHILF', 'Leitungsklausur', 'Workshop-Reihe', 'Online-Format', 'Etwas anderes'];
const zuletzt = new Map<string, number[]>(); // einfache Bremse pro Instanz: höchstens 5 Anfragen in 10 Minuten je Adresse

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ERLAUBT.includes(origin) ? origin : ERLAUBT[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Vary': 'Origin',
});
const antwort = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), {status, headers: {...cors(origin), 'Content-Type': 'application/json'}});
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const zeile = (v: unknown, max: number) => text(v, max).replace(/\s+/g, ' '); // einzeilig, keine Zeilenumbrüche im Betreff
const html = (s: string) => s.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!));

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, {headers: cors(origin)});
  if (req.method !== 'POST') return antwort(405, {ok: false}, origin);

  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return antwort(400, {ok: false, fehler: 'Ungültige Anfrage.'}, origin); }

  // Schutz vor Spam: verstecktes Feld muss leer bleiben, Ausfüllen dauert mindestens 3 Sekunden
  if (text(d.website, 200) || Number(d.dauer) < 3000) return antwort(200, {ok: true}, origin);

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const jetzt = Date.now();
  const liste = (zuletzt.get(ip) || []).filter((t) => jetzt - t < 600_000);
  if (liste.length >= 5) return antwort(429, {ok: false, fehler: 'Zu viele Anfragen. Bitte später noch einmal.'}, origin);
  zuletzt.set(ip, [...liste, jetzt]);

  const name = zeile(d.name, 120), email = zeile(d.email, 200), organisation = zeile(d.organisation, 200);
  const anlass = ANLAESSE.includes(text(d.anlass, 60)) ? text(d.anlass, 60) : 'Etwas anderes';
  const nachricht = text(d.nachricht, 5000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || nachricht.length < 10)
    return antwort(400, {ok: false, fehler: 'Bitte Name, gültige E-Mail-Adresse und eine Nachricht angeben.'}, origin);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data: eintrag, error} = await db.from('kontakt').insert({name, email, organisation: organisation || null, anlass, nachricht}).select('id').single();
  if (error) return antwort(500, {ok: false, fehler: 'Die Nachricht konnte nicht gespeichert werden.'}, origin);

  let mail_ok = false;
  const key = Deno.env.get('RESEND_API_KEY');
  if (key) try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        from: Deno.env.get('KONTAKT_VON') || 'Website arminfradler.at <noreply@updates.arminfradler.at>',
        to: [Deno.env.get('KONTAKT_AN') || 'info@arminfradler.at'],
        reply_to: email,
        subject: `Anfrage über die Website: ${anlass} – ${name}`,
        text: `${name}${organisation ? ' · ' + organisation : ''}\n${email}\nAnlass: ${anlass}\n\n${nachricht}\n`,
        html: `<p><b>${html(name)}</b>${organisation ? ' · ' + html(organisation) : ''}<br>${html(email)}<br>Anlass: ${html(anlass)}</p><p style="white-space:pre-wrap">${html(nachricht)}</p>`,
      }),
    });
    mail_ok = r.ok;
  } catch { /* gespeichert ist die Nachricht trotzdem */ }
  await db.from('kontakt').update({mail_ok}).eq('id', eintrag.id);
  return antwort(200, {ok: true}, origin);
});
