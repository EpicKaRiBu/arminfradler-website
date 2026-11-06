#!/usr/bin/env node
/* arminfradler.at · Vorrendern für Suchmaschinen.

   Was es tut:
   1. Öffnet jede Hauptseite im Browser (Playwright), lässt das JavaScript laufen und schreibt den
      fertigen Inhalt der Behälter (Kopf, Fuß, Nachrichten, Befunde, Steckbriefe …) fest ins HTML.
      Das JavaScript ersetzt diese Inhalte beim Laden wie bisher; Besucher:innen sehen dieselbe Seite,
      nur ohne leeren Moment. Suchmaschinen und Leser ohne JavaScript sehen jetzt den ganzen Text.
   2. Baut je Nachrichtenwoche eine eigene Seite (nachrichten-2026-kw45.html …)
      und je Werkzeug einen eigenen Steckbrief (modelle-copilot.html …).

   Aufruf (nach tools/build_wissen.py und vor tools/build_blog.py):
     node tools/vorrendern.mjs
   Läuft beliebig oft; das Ergebnis ist bei gleichen Daten gleich.
*/
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://arminfradler.at';
const MON = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const lang = iso => { const [y, m, d] = iso.split('-'); return `${+d}. ${MON[m - 1]} ${y}`; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kurzText = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + ' …'; };

// Behälter je Seite. Kopf und Fuß kommen auf jeder Seite dazu.
const KOPF_FUSS = ['#site-head', '#site-foot'];
const SEITEN = {
  'index.html': [], 'angebot.html': [], 'methode.html': [], 'termine.html': [], 'ueber-mich.html': [],
  'kontakt.html': [], 'impressum.html': [], 'datenschutz.html': [], 'agb.html': [],
  'wissen.html': ['[data-stand]', '[data-n="fakten"]', '[data-n="radar"]', '[data-n="woche"]', '#bw', '#board',
    '#kurz-kick', '#kurz-h', '#kurz-list', '#kurz-stand', '#radar-list', '#facts', '#terms', '#count', '#g-zahlen'],
  'nachrichten.html': ['[data-stand]', '#bw', '#chips-art', '#count', '#n-list'],
  'modelle.html': ['[data-stand]', '#bw', '#m-tab', '#m-cards'],
};
const KLASSE = { '#site-head': 'site-head', '#site-foot': 'site-foot' };

// ---------- kleiner Server ----------
const TYP = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYP[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URLB = `http://127.0.0.1:${server.address().port}/`;

// ---------- Einsetzen ins Quell-HTML ----------
// Ein Selektor (#id oder [attr="wert"]) wird im Quelltext über sein öffnendes Tag gefunden.
// Inhalt mit Tags steht zwischen <!--vr--> und <!--/vr-->, damit der nächste Lauf ihn sauber ersetzt.
function einsetzen(src, sel, inner, datei) {
  const attr = sel.startsWith('#') ? `id="${sel.slice(1)}"` : sel.slice(1, -1).replace(/^([\w-]+)$/, '$1');
  const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*\\b${attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s>])[^>]*>)(<!--vr-->[\\s\\S]*?<!--/vr-->|[^<]*)(</\\2>)`);
  const m = src.match(re);
  if (!m) throw new Error(`${datei}: ${sel} nicht gefunden oder Inhalt nicht leer`);
  let open = m[1];
  if (KLASSE[sel] && !/\bclass="/.test(open)) open = open.replace(/>$/, ` class="${KLASSE[sel]}">`);
  const neu = /</.test(inner) ? `<!--vr-->${inner}<!--/vr-->` : inner;
  return src.slice(0, m.index) + open + neu + m[4] + src.slice(m.index + m[0].length);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });

async function oeffnen(datei) {
  const pg = await ctx.newPage();
  const fehler = [];
  pg.on('pageerror', e => fehler.push(e.message));
  // Der Zähler soll beim Bauen nicht mitzählen.
  await pg.route(/supabase\.co/, r => r.abort());
  await pg.goto(URLB + datei, { waitUntil: 'networkidle' });
  await pg.waitForTimeout(300);
  if (fehler.length) throw new Error(`${datei}: ${fehler.join('; ')}`);
  return pg;
}

// 1. Hauptseiten vorrendern
for (const [datei, sels] of Object.entries(SEITEN)) {
  const f = path.join(ROOT, datei);
  if (!fs.existsSync(f)) continue;
  // vorher die alten vorgerenderten Inhalte leeren, damit das JavaScript auf dem Ausgangszustand läuft
  let src = fs.readFileSync(f, 'utf8').replace(/<!--vr-->[\s\S]*?<!--\/vr-->/g, '');
  fs.writeFileSync(f, src);
  const pg = await oeffnen(datei);
  for (const sel of [...KOPF_FUSS, ...sels]) {
    const inner = await pg.$eval(sel, el => {
      const c = el.cloneNode(true);
      // nur Zustand vom Laden, keine Scroll- oder Einblend-Zustände
      c.querySelectorAll('.progress').forEach(x => x.remove());
      c.querySelectorAll('.in').forEach(x => x.classList.remove('in'));
      c.querySelectorAll('[style*="--p"]').forEach(x => x.style.removeProperty('--p'));
      return c.innerHTML.trim();
    }).catch(() => null);
    if (inner === null) throw new Error(`${datei}: ${sel} fehlt auf der Seite`);
    src = einsetzen(src, sel, inner, datei);
  }
  fs.writeFileSync(f, src);
  await pg.close();
  console.log('vorgerendert', datei);
}

// 2. Eigene Seiten je Woche und je Steckbrief
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/wissen.json'), 'utf8'));
const N = D.nachrichten, W = D.werkzeuge;
for (const f of fs.readdirSync(ROOT)) if (/^(nachrichten-\d{4}-kw\d+|modelle-[a-z0-9-]+)\.html$/.test(f)) fs.unlinkSync(path.join(ROOT, f));

const vorlage = datei => fs.readFileSync(path.join(ROOT, datei), 'utf8');
function seite(tpl, { titel, beschreibung, url, mitte, ogTitel }) {
  const kopf = tpl.slice(0, tpl.indexOf('<main id="inhalt">'))
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titel)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${BASE}/${url}`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(beschreibung)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(ogTitel || titel)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(beschreibung)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${BASE}/${url}`);
  const bereich = tpl.match(/<nav class="w-bereich"[\s\S]*?<\/nav>/)[0];
  const cta = tpl.slice(tpl.indexOf('<section class="tight alt">'));
  const fuss = cta.replace(/<script src="assets\/(nachrichten|modelle)\.js[^>]*><\/script>\n?/, '');
  return `${kopf}<main id="inhalt">\n\n${bereich}\n${mitte}\n\n${fuss}`;
}

// Wochen: die fertigen Kärtchen holen wir aus der gerenderten Nachrichtenseite (Standardansicht).
{
  const pg = await oeffnen('nachrichten.html');
  await pg.$eval('#laut', el => { el.checked = true; el.dispatchEvent(new Event('change')); });
  const wochen = await pg.$$eval('#n-list .n-week', els => els.map(e => e.outerHTML));
  await pg.close();
  const tpl = vorlage('nachrichten.html');
  const ids = N.wochen.map(w => w.id);
  const name = id => id.replace(/^(\d{4})-KW0?(\d+)$/, 'KW $2/$1');
  const datei = id => `nachrichten-${id.toLowerCase()}.html`;
  N.wochen.forEach((w, i) => {
    const html = wochen.find(x => x.includes(`>${w.id.replace(/^\d{4}-KW0?/, 'KW ')} ·`));
    if (!html) return;
    const ms = N.meldungen.filter(m => m.woche === w.id);
    const zeit = `${lang(w.von)} bis ${lang(w.bis)}`;
    const andere = ids.map(id => id === w.id ? `<b>${name(id)}</b>` : `<a href="${datei(id)}">${name(id)}</a>`).join(' · ');
    const mitte = `<section class="w-hero n-hero">
  <div class="wrap">
    <div>
      <p class="kick">Wissen · KI-Nachrichten · ${esc(name(w.id))}</p>
      <h1>KI-Nachrichten der Woche, <span class="nw"><span class="mark">${esc(name(w.id).replace(/\/\d{4}$/, ''))}</span>.</span></h1>
      <p class="hand w-sub">${esc(zeit)}</p>
      <p class="lead">${ms.length} Meldungen aus dieser Woche, jede am Original nachgelesen, mit Quelle und einem Satz, was sie für Bildungshäuser, Schulen, Gemeinden und Betriebe heißt. Die aktuellen Nachrichten stehen auf der <a href="nachrichten.html">Nachrichtenseite</a>.</p>
    </div>
    ${tpl.match(/<ul class="n-legend"[\s\S]*?<\/ul>/)[0]}
  </div>
</section>

<section class="n-list-sec alt">
  <div class="wrap">
    <div id="n-list">${html}</div>
    <p class="s m">Andere Wochen: ${andere}</p>
    <p class="xs m">Einordnung zur Orientierung, keine Rechts- oder IT-Beratung im Einzelfall. Angaben nach bestem Wissen und ohne Gewähr, mit Datum und Quelle.</p>
  </div>
</section>`;
    const beschreibung = kurzText(`KI-Nachrichten ${name(w.id)}, eingeordnet für Bildung, Schule, Gemeinde und Betrieb: ` + ms.slice(0, 3).map(m => m.titel).join('; '), 158);
    fs.writeFileSync(path.join(ROOT, datei(w.id)), seite(tpl, { titel: `KI-Nachrichten ${name(w.id)}, eingeordnet · Armin Fradler`, beschreibung, url: datei(w.id), mitte }));
    console.log('Woche', datei(w.id), ms.length);
  });
  // Liste der Wochen auf der Nachrichtenseite (fest im HTML)
  const f = path.join(ROOT, 'nachrichten.html');
  let src = fs.readFileSync(f, 'utf8');
  const zeile = `<p class="s m" id="n-archiv">Jede Woche auch auf einer eigenen Seite: ${ids.map(id => `<a href="${datei(id)}">${name(id)}</a>`).join(' · ')}</p>`;
  src = /<p class="s m" id="n-archiv">.*?<\/p>/.test(src) ? src.replace(/<p class="s m" id="n-archiv">.*?<\/p>/, zeile)
    : src.replace(/(<p class="s m w-feed">)/, `${zeile}\n    $1`);
  fs.writeFileSync(f, src);
}

// Steckbriefe: das fertige Kärtchen aus der gerenderten Modelle-Seite, aufgeklappt.
{
  const pg = await oeffnen('modelle.html');
  const karten = await pg.$$eval('#m-cards .m-card', els => els.map(e => ({ id: e.id, html: e.outerHTML.replace('<details class="m-more">', '<details class="m-more" open>') })));
  await pg.close();
  const tpl = vorlage('modelle.html');
  const datei = id => `modelle-${id}.html`;
  for (const w of W.werkzeuge) {
    const k = karten.find(x => x.id === w.id);
    if (!k) continue;
    const andere = W.werkzeuge.filter(x => x.id !== w.id).map(x => `<a href="${datei(x.id)}">${esc(x.name)}</a>`).join(' · ');
    const mitte = `<section class="w-hero n-hero">
  <div class="wrap">
    <div>
      <p class="kick">Wissen · Modelle und Werkzeuge · Steckbrief</p>
      <h1>${esc(w.name)}<span class="nw">.</span></h1>
      <p class="hand w-sub">Daten, Kosten, Schule. Am Original nachgelesen.</p>
      <p class="lead">${esc(w.gut_fuer ? 'Gut für: ' + w.gut_fuer : w.art)} Stand ${esc(lang(w.stand || W.stand))}. Den Vergleich aller Werkzeuge finden Sie im <a href="modelle.html">Überblick</a>.</p>
    </div>
    <div class="n-note"><p class="kick">Vorweg</p><p>${esc(W.vorweg.alle)}</p></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="m-cards">${k.html}</div>
    <p class="s m">Weitere Steckbriefe: ${andere}</p>
    <p class="s m">Preise und Angaben laut Hersteller, nach bestem Wissen und ohne Gewähr. Meine Einschätzung ist Orientierung, keine Rechts- oder IT-Beratung.</p>
  </div>
</section>`;
    const beschreibung = kurzText(`${w.name} im Steckbrief: wo die Daten liegen, was es kostet, ob es für die Schule taugt. ${w.einschaetzung || ''}`, 158);
    fs.writeFileSync(path.join(ROOT, datei(w.id)), seite(tpl, { titel: `${w.name}: Steckbrief für Bildung und Betrieb · Armin Fradler`, beschreibung, url: datei(w.id), mitte }));
    console.log('Steckbrief', datei(w.id));
  }
  const f = path.join(ROOT, 'modelle.html');
  let src = fs.readFileSync(f, 'utf8');
  const zeile = `<p class="s m" id="m-einzeln">Jeder Steckbrief auch auf einer eigenen Seite: ${W.werkzeuge.map(x => `<a href="${datei(x.id)}">${esc(x.name)}</a>`).join(' · ')}</p>`;
  src = /<p class="s m" id="m-einzeln">.*?<\/p>/.test(src) ? src.replace(/<p class="s m" id="m-einzeln">.*?<\/p>/, zeile)
    : src.replace(/(<div class="m-cards" id="m-cards">[\s\S]*?<\/div>)(\s*<\/div>\s*<\/section>)/, `$1\n    ${zeile}$2`);
  fs.writeFileSync(f, src);
}

await browser.close();
server.close();
