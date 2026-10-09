"""Baut die Impulse (Blog) aus den Markdown-Dateien in content/impulse/ – ohne Datenbank, ohne externe Dienste.

Ein neuer Beitrag ist eine Datei content/impulse/<slug>.md (Kopfdaten zwischen ---) plus Bilder in assets/impulse/<slug>/.
Bilder im Text: ![Beschreibung](datei.webp) – ein bloßer Dateiname meint den Bilderordner des Beitrags.

Erzeugt:
- impulse/<slug>/index.html   vollständiger Beitrag mit strukturierten Daten (schema.org Article)
- blog/<slug>/index.html      alte Adresse, leitet auf die neue weiter
- impulse/index.html          Übersicht (zwischen den Markierungen impulse:start/end), Filter nach Thema
- index.html                  die drei neuesten Beiträge (zwischen latest:start/end)
- impulse/feed.xml            RSS-Feed
- sitemap.xml, llms.txt       für Suchmaschinen und KI-Assistenten

Status „draft“: Beitrag wird nicht gebaut, seine Adressen führen zur Übersicht, mit „replaced_by: <slug>“ zum neuen Beitrag. „pin: 1“ bis „pin: 3“ stellt Beiträge nach vorne. Läuft lokal oder als GitHub Action."""
import datetime, html, json, os, re, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, 'site.json'), encoding='utf-8'))
SRC = os.path.join(ROOT, 'content', 'impulse')
ARCHIV_VOR = '2026-09-01'

esc = lambda s: html.escape(str(s or ''), quote=True)


def lesen(pfad):
    """Kopfdaten (key: JSON-Wert) und Markdown-Text einer Beitragsdatei."""
    s = open(pfad, encoding='utf-8').read().replace('\r', '')
    m = re.match(r'---\n(.*?)\n---\n', s, re.S)
    meta = {}
    for zeile in (m.group(1).split('\n') if m else []):
        if ':' in zeile:
            k, v = zeile.split(':', 1)
            v = v.strip()
            try:
                meta[k.strip()] = json.loads(v)
            except ValueError:
                meta[k.strip()] = v
    meta['text'] = s[m.end():] if m else s
    return meta


def inline(t):
    t = esc(t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(^|[^*])\*([^*\n]+)\*', r'\1<em>\2</em>', t)
    t = re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', r'<a href="\2" rel="noopener">\1</a>', t)
    t = re.sub(r'\[([^\]]+)\]\((/[^\s)]*)\)', intern, t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t


LIVE, ERSETZT = set(), {}  # veröffentlichte Slugs und „replaced_by“ der Entwürfe, setzt main()
SEITEN = {'kontakt': 'kontakt.html', 'ueber-mich': 'ueber-mich.html', 'angebot': 'angebot.html', 'termine': 'termine.html', 'impulse': 'impulse/', 'blog': 'impulse/'}


def intern(m):
    """Interne Links aus alten Beiträgen (/blog/<slug>, /kontakt …) auf die neue Seite umbiegen.
    Beiträge, die nicht mehr online sind, werden zu reinem Text (oder zum Nachfolger)."""
    text, pfad = m.group(1), m.group(2).strip('/').split('#')[0]
    teile = pfad.split('/')
    if len(teile) == 2 and teile[0] in ('blog', 'impulse'):
        ziel = teile[1] if teile[1] in LIVE else ERSETZT.get(teile[1])
        return f'<a href="../../impulse/{ziel}/">{text}</a>' if ziel in LIVE else text
    if teile[0] in SEITEN and len(teile) == 1:
        return f'<a href="../../{SEITEN[teile[0]]}">{text}</a>'
    return text


def masse(slug, datei):
    try:
        with Image.open(os.path.join(ROOT, 'assets', 'impulse', slug, datei)) as im:
            return f' width="{im.width}" height="{im.height}"'
    except OSError:
        return ''


def ki_text(label):
    """„Bild: mit KI erstellt (Modell, Monat)“ → kurzer Text für den KI-Stempel."""
    return (label or '').replace('Bild: mit KI erstellt', 'Mit KI erstellt').strip() or None


def stempel(ki):
    return f'<span class="ki" title="{esc(ki)}"><span aria-hidden="true">KI</span><span class="sr">{esc(ki)}</span></span>' if ki else ''


def figur(src, alt, slug, rel, caption=None, ki=None, extra=' loading="lazy" decoding="async"'):
    """Bild mit optionaler Bildunterschrift und dezentem KI-Stempel in der Ecke."""
    if '://' in src:
        attr = ''
    else:
        attr = masse(slug, src)
        src = f'{rel}assets/impulse/{slug}/{src}'
    cap = f'<figcaption>{esc(caption)}</figcaption>' if caption else ''
    return f'<figure><div class="ki-wrap"><img src="{esc(src)}" alt="{esc(alt)}"{extra}{attr}>{stempel(ki)}</div>{cap}</figure>'


def md(src, slug, rel, label):
    lines = src.split('\n'); out = []; i = 0; para = []
    def flush():
        if para: out.append('<p>' + inline(' '.join(para)) + '</p>'); para.clear()
    while i < len(lines):
        l = lines[i]
        if not l.strip(): flush(); i += 1; continue
        m = re.match(r'^(#{1,4})\s+(.*)', l)
        if m:
            flush(); lv = min(max(len(m.group(1)), 2), 3); out.append(f'<h{lv}>{inline(m.group(2))}</h{lv}>'); i += 1; continue
        if re.match(r'^---+\s*$', l): flush(); out.append('<hr>'); i += 1; continue
        if re.match(r'^>\s?', l):
            flush(); q = []
            while i < len(lines) and re.match(r'^>\s?', lines[i]): q.append(re.sub(r'^>\s?', '', lines[i])); i += 1
            out.append('<blockquote>' + inline(' '.join(q)) + '</blockquote>'); continue
        if re.match(r'^\s*[-*]\s+', l):
            flush(); it = []
            while i < len(lines) and re.match(r'^\s*[-*]\s+', lines[i]): it.append(re.sub(r'^\s*[-*]\s+', '', lines[i])); i += 1
            out.append('<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in it) + '</ul>'); continue
        if re.match(r'^\s*\d+[.)]\s+', l):
            flush(); it = []
            while i < len(lines) and re.match(r'^\s*\d+[.)]\s+', lines[i]): it.append(re.sub(r'^\s*\d+[.)]\s+', '', lines[i])); i += 1
            out.append('<ol>' + ''.join(f'<li>{inline(x)}</li>' for x in it) + '</ol>'); continue
        if re.match(r'^\|.*\|\s*$', l):
            flush(); rows = []
            while i < len(lines) and re.match(r'^\|.*\|\s*$', lines[i]): rows.append(lines[i]); i += 1
            body = [r for r in rows if not re.match(r'^\|[\s:|-]+\|$', r.strip())]
            cells = lambda r: [c.strip() for c in r.strip()[1:-1].split('|')]
            out.append('<div class="tbl"><table>' + ''.join('<tr>' + ''.join((f'<td>{inline(c)}</td>' if k else f'<th>{inline(c)}</th>') for c in cells(r)) + '</tr>' for k, r in enumerate(body)) + '</table></div>'); continue
        m = re.match(r'^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)\s*$', l)  # optional: "eigene Bildunterschrift"
        if m:
            # KI-Stempel: ohne eigene Bildunterschrift gilt die Kennzeichnung des Beitrags; Dateien mit „ki-“ am Anfang immer
            flush(); src, cap = m.group(2), m.group(3)
            ki = ki_text(label) if label and (cap is None or os.path.basename(src).startswith('ki-')) else None
            out.append(figur(src, m.group(1), slug, rel, cap, ki)); i += 1; continue
        para.append(l.strip()); i += 1
    flush()
    return '\n'.join(out)


MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
dt = lambda d: datetime.datetime.fromisoformat(str(d).replace('Z', '+00:00'))
datum = lambda d: f'{dt(d).day}. {MONATE[dt(d).month - 1]} {dt(d).year}'


def karte(p, rel):
    """Karte für Übersicht und Startseite. rel = Weg zur Website-Wurzel."""
    s = p['slug']
    img = (f'<div class="im"><img src="{rel}assets/impulse/{s}/{esc(p["image"])}" alt="" loading="lazy" decoding="async"{masse(s, p["image"])}>{stempel(ki_text(p.get("image_label")))}</div>'
           if p.get('image') else '')
    meta = datum(p['date']) + (f' · {p["minutes"]} Min. Lesezeit' if p.get('minutes') else '')
    return (f'<a class="post rv" href="{rel}impulse/{s}/" data-c="{esc(p.get("category_slug", ""))}">{img}'
            f'<div class="b"><span class="cat">{esc(p.get("category") or "Impuls")}</span><h3>{esc(p["title"])}</h3>'
            + (f'<p>{esc(p["excerpt"])}</p>' if p.get('excerpt') else '') + f'<span class="meta">{meta}</span></div></a>')


def ersetzen(datei, marke, inhalt):
    pfad = os.path.join(ROOT, datei)
    s = open(pfad, encoding='utf-8').read()
    neu, n = re.subn(rf'(<!-- {marke}:start -->).*?(<!-- {marke}:end -->)', lambda m: m.group(1) + inhalt + m.group(2), s, flags=re.S)
    if not n:
        raise SystemExit(f'Markierung {marke} fehlt in {datei}')
    if neu != s:
        open(pfad, 'w', encoding='utf-8', newline='\n').write(neu)


HEAD = '''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · Armin Fradler</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{canon}">
<link rel="alternate" type="application/rss+xml" title="Impulse · Armin Fradler" href="{base}/impulse/feed.xml">
<meta property="og:type" content="article"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canon}"><meta property="og:locale" content="de_AT">{ogimg}
<link rel="icon" href="../../assets/logo/favicon.svg" type="image/svg+xml">
<link rel="icon" href="../../assets/logo/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../../assets/logo/apple-touch-icon.png">
<link href="../../assets/fonts/fonts.css" rel="stylesheet">
<link href="../../assets/site.css?v=20261009e" rel="stylesheet">
<link href="../../assets/textures.css?v=20261009e" rel="stylesheet">
<script type="application/ld+json">{ld}</script>
</head>
<body data-page="impulse">
<a class="skip" href="#inhalt">Zum Inhalt</a>
<header id="site-head"></header>
<main id="inhalt"><section><article class="wrap narrow">
'''
FOOT = '''</article></section></main>
<footer id="site-foot"></footer>
<script src="../../assets/site.js?v=20261009e" data-root="../../"></script>
</body>
</html>
'''
UMLEITUNG = '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>{t}</title><link rel="canonical" href="{c}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url={u}"></head><body><p><a href="{u}">{t}</a></p></body></html>'


def main():
    base = CFG['base'].rstrip('/')
    robots = '<meta name="robots" content="noindex">\n' if CFG.get('preview') else ''
    alle = [lesen(os.path.join(SRC, f)) for f in sorted(os.listdir(SRC)) if f.endswith('.md')]
    posts = sorted([p for p in alle if p.get('status') == 'published'], key=lambda p: p['date'], reverse=True)
    # Kopfdaten „pin: 1/2/3“: diese Beiträge stehen vorne (Startseite und Übersicht), danach nach Datum
    posts.sort(key=lambda p: (p.get('pin') or 99))
    for d in ('impulse', 'blog'):
        for name in os.listdir(os.path.join(ROOT, d)) if os.path.isdir(os.path.join(ROOT, d)) else []:
            if os.path.isdir(os.path.join(ROOT, d, name)): shutil.rmtree(os.path.join(ROOT, d, name))

    LIVE.update(q['slug'] for q in posts)
    ERSETZT.update({q['slug']: q['replaced_by'] for q in alle if q.get('status') != 'published' and q.get('replaced_by')})
    for p in posts:
        slug = p['slug']; canon = f'{base}/impulse/{slug}/'
        title = p['title']; desc = p.get('description') or p.get('excerpt') or ''
        bild_abs = f'{base}/assets/impulse/{slug}/{p["image"]}' if p.get('image') else ''
        if os.path.exists(os.path.join(ROOT, 'assets', 'impulse', slug, 'social.jpg')):
            bild_abs = f'{base}/assets/impulse/{slug}/social.jpg'  # 1200 × 630 für LinkedIn & Co.
        ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': title, 'description': desc,
              'datePublished': p['date'], 'dateModified': p.get('updated') or p['date'], 'inLanguage': 'de-AT',
              'author': {'@type': 'Person', 'name': 'Armin Fradler', 'url': base + '/ueber-mich.html'},
              'publisher': {'@type': 'Person', 'name': 'Armin Fradler', 'url': base + '/'},
              'mainEntityOfPage': canon, 'keywords': ', '.join(p.get('keywords') or [])}
        if bild_abs: ld['image'] = bild_abs
        if p.get('category'): ld['articleSection'] = p['category']
        page = HEAD.format(title=esc(p.get('seo_title') or title).replace(' | Armin Fradler', '').replace(' · Armin Fradler', ''),
                           desc=esc(desc), robots=robots, canon=canon, base=base,
                           ld=json.dumps(ld, ensure_ascii=False).replace('</', '<\\/'),
                           ogimg=(f'<meta property="og:image" content="{esc(bild_abs)}"><meta name="twitter:card" content="summary_large_image">' if bild_abs else ''))
        page += (f'<p class="kick"><a href="../?thema={esc(p.get("category_slug", ""))}" style="text-decoration:none">{esc(p.get("category") or "Impuls")}</a>'
                 f' · <time datetime="{esc(p["date"][:10])}">{datum(p["date"])}</time>' + (f' · {p["minutes"]} Min.' if p.get('minutes') else '') + '</p>\n')
        page += f'<h1 style="font-size:clamp(32px,5vw,50px);margin-bottom:22px">{esc(title)}</h1>\n'
        if p['date'] < ARCHIV_VOR:
            page += '<p class="archive-note">Aus dem Archiv: Dieser Beitrag ist vor über einem halben Jahr erschienen. Manche Zahlen und Produktnamen haben sich seither geändert.</p>\n'
        if p.get('image'):
            page += '<div class="lead-img">' + figur(p['image'], p.get('image_alt') or '', slug, '../../', None, ki_text(p.get('image_label')), ' fetchpriority="high"') + '</div>\n'
        page += '<div class="article">' + md(p['text'], slug, '../../', p.get('image_label')) + '</div>\n'
        if p.get('sources'):
            page += '<h2 class="src-h">Quellen</h2><ul class="sources">' + ''.join(
                f'<li><a href="{esc(q["url"])}" rel="noopener">{esc(q.get("title") or q["url"])}</a></li>' if isinstance(q, dict) else f'<li>{inline(str(q))}</li>'
                for q in p['sources']) + '</ul>\n'
        page += ('<hr style="border:0;border-top:1px solid var(--line);margin:46px 0 22px"><p class="s m">Armin Fradler begleitet Bildungsorganisationen und Teams beim Umgang mit KI'
                 ' und unterrichtet selbst in der Erwachsenenbildung.</p><p><a href="../">← Alle Impulse</a> · <a href="../../kontakt.html">Darüber reden? Schreiben Sie mir.</a></p>\n')
        page += FOOT
        os.makedirs(os.path.join(ROOT, 'impulse', slug), exist_ok=True)
        open(os.path.join(ROOT, 'impulse', slug, 'index.html'), 'w', encoding='utf-8', newline='\n').write(page)
        os.makedirs(os.path.join(ROOT, 'blog', slug), exist_ok=True)
        open(os.path.join(ROOT, 'blog', slug, 'index.html'), 'w', encoding='utf-8', newline='\n').write(
            UMLEITUNG.format(t=esc(title), c=canon, u=f'../../impulse/{slug}/'))

    # Entwürfe: alte Adressen führen zur Übersicht, mit „replaced_by“ zum Beitrag, der sie ersetzt
    live = {q['slug']: q for q in posts}
    for p in alle:
        if p.get('status') != 'published':
            neu = live.get(p.get('replaced_by'))
            ziel = (neu['title'], f'{base}/impulse/{neu["slug"]}/', f'../../impulse/{neu["slug"]}/') if neu else ('Impulse', f'{base}/impulse/', '../../impulse/')
            for d in ('impulse', 'blog'):
                os.makedirs(os.path.join(ROOT, d, p['slug']), exist_ok=True)
                open(os.path.join(ROOT, d, p['slug'], 'index.html'), 'w', encoding='utf-8', newline='\n').write(
                    UMLEITUNG.format(t=esc(ziel[0]), c=ziel[1], u=ziel[2]))

    # Übersicht mit Filter und Startseite
    themen = list(dict.fromkeys((p['category_slug'], p['category']) for p in posts if p.get('category_slug')))
    filter_html = '<button type="button" data-c="" aria-pressed="true">Alle</button>' + ''.join(
        f'<button type="button" data-c="{esc(s)}" aria-pressed="false">{esc(n)}</button>' for s, n in themen)
    ersetzen('impulse/index.html', 'impulse',
             f'\n    <div class="filters" id="filters" role="group" aria-label="Nach Thema filtern">{filter_html}</div>\n'
             f'    <div class="grid g3" id="list">\n' + '\n'.join(karte(p, '../') for p in posts) + '\n    </div>\n    ')
    # Startseite: nur Beiträge mit „startseite: true“ (geprüft, mit Quellen, für Einsteiger:innen verständlich), höchstens zwei
    ersetzen('index.html', 'latest', '\n' + '\n'.join(karte(p, '') for p in [q for q in posts if q.get('startseite') is True][:2]) + '\n')

    # RSS
    jetzt = dt(max(str(p.get('updated') or p['date']) for p in posts)).strftime('%a, %d %b %Y %H:%M:%S +0000') if posts else ''
    items = ''.join(
        f'<item><title>{esc(p["title"])}</title><link>{base}/impulse/{p["slug"]}/</link><guid>{base}/impulse/{p["slug"]}/</guid>'
        f'<pubDate>{dt(p["date"]).strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate><description>{esc(p.get("description") or p.get("excerpt"))}</description></item>'
        for p in posts[:30])
    open(os.path.join(ROOT, 'impulse', 'feed.xml'), 'w', encoding='utf-8', newline='\n').write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Impulse · Armin Fradler</title><link>{base}/impulse/</link>'
        f'<description>KI in Organisationen, Bildung und Arbeit</description><language>de-AT</language><lastBuildDate>{jetzt}</lastBuildDate>{items}</channel></rss>\n')

    # Sitemap
    heute = datetime.date.today().isoformat()
    static = ['', 'angebot.html', 'termine.html', 'impulse/', 'methode.html', 'ueber-mich.html', 'kontakt.html']
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += [f'<url><loc>{base}/{u}</loc><lastmod>{heute}</lastmod></url>' for u in static]
    sm += [f'<url><loc>{base}/impulse/{p["slug"]}/</loc><lastmod>{str(p.get("updated") or p["date"])[:10]}</lastmod></url>' for p in posts]
    sm.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write('\n'.join(sm) + '\n')

    # llms.txt: kurze Landkarte der Seite für KI-Assistenten (llmstxt.org)
    llm = [f'# Armin Fradler', '',
           '> Workshops, Vorträge und Fortbildungen zu KI für Bildungsorganisationen, Teams und kleine Betriebe. Aus Oberwart (Burgenland), in ganz Österreich und online. '
           'Leitfrage: Wo lassen wir uns Arbeit abnehmen – und wo das Denken?', '',
           '## Seiten', '',
           f'- [Angebot]({base}/angebot.html): Formate und Themen für Organisationen, Schulen und Betriebe',
           f'- [So arbeite ich]({base}/methode.html): Leitfrage, Prinzipien und Ablauf eines Workshops, mit Quellen',
           f'- [Über mich]({base}/ueber-mich.html): Hintergrund und Arbeitsweise',
           f'- [Termine]({base}/termine.html): offene Vorträge und Workshops',
           f'- [Kostenlose Werkzeuge](https://mitmachen.arminfradler.at/werkzeuge/ki/): Datenampel, Module zu Regeln, Kontext, Menschen und Wissen',
           f'- [Kontakt]({base}/kontakt.html)', '', '## Impulse', '']
    llm += [f'- [{p["title"]}]({base}/impulse/{p["slug"]}/): {p.get("description") or p.get("excerpt") or ""}' for p in posts]
    open(os.path.join(ROOT, 'llms.txt'), 'w', encoding='utf-8', newline='\n').write('\n'.join(llm) + '\n')
    print(f'{len(posts)} Beiträge gebaut, {len(alle) - len(posts)} Entwürfe')


if __name__ == '__main__':
    main()
