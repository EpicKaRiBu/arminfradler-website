// Anonymer Seitenzähler von arminfradler.at
// Nimmt Seite und Herkunft entgegen und erhöht eine Tageszahl. Speichert keine IP, keine Uhrzeit, keine Kennung.
// Läuft ohne Anmeldung (verify_jwt aus), wie die Funktion „kontakt“.
import {createClient} from 'npm:@supabase/supabase-js@2.49.4';

const ERLAUBT = ['https://arminfradler.at', 'https://www.arminfradler.at'];
const EIGEN = ['arminfradler.at', 'www.arminfradler.at', 'epickaribu.github.io'];
// Suchmaschinen und Netzwerke bekommen einen kurzen Namen, alles andere wird auf die Domain gekürzt
const NAMEN: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'], [/(^|\.)ecosia\.org$/, 'Ecosia'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'], [/(^|\.)facebook\.com$|^fb\.me$/, 'Facebook'], [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, 'ChatGPT'], [/(^|\.)perplexity\.ai$/, 'Perplexity'],
];

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ERLAUBT.includes(origin) ? origin : ERLAUBT[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Vary': 'Origin',
});
const leer = (origin: string | null) => new Response(null, {status: 204, headers: cors(origin)});

const seiteVon = (v: unknown) => {
  let p = typeof v === 'string' ? v.split(/[?#]/)[0].toLowerCase() : '';
  if (!/^\/[a-z0-9\/._-]{0,119}$/.test(p)) return '';
  p = p.replace(/index\.html$/, '').replace(/\.html$/, '');
  return p.length > 1 ? p.replace(/\/$/, '') : '/';
};
const herkunftVon = (ref: unknown, quelle: unknown) => {
  const q = typeof quelle === 'string' ? quelle.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) : '';
  if (q) return 'quelle:' + q; // z. B. ?quelle=vhs auf einem Folien-QR-Code
  let host = '';
  try { host = new URL(String(ref || '')).hostname.toLowerCase(); } catch { return 'direkt'; }
  if (!host) return 'direkt';
  if (EIGEN.includes(host)) return 'intern';
  for (const [re, name] of NAMEN) if (re.test(host)) return name;
  return host.replace(/^www\./, '').slice(0, 80);
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return leer(origin);
  if (req.method !== 'POST' || !origin || !ERLAUBT.includes(origin)) return leer(origin);
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return leer(origin); }
  const seite = seiteVon(d.seite);
  if (!seite) return leer(origin);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  await db.rpc('zaehle', {p_seite: seite, p_herkunft: herkunftVon(d.herkunft, d.quelle)});
  return leer(origin);
});
