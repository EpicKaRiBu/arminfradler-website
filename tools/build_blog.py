"""Baut statische Seiten für alle veröffentlichten Impulse (Blog), damit Suchmaschinen und KI-Crawler sie ohne JavaScript lesen.
- impulse/<slug>/index.html  : vollständiger Beitrag mit strukturierten Daten (schema.org Article)
- blog/<slug>/index.html     : alte Adresse, verweist auf die neue (kanonisch)
- sitemap.xml
Liest nur öffentlich freigegebene Beiträge über den öffentlichen, eingeschränkten Schlüssel. Läuft lokal oder als GitHub Action."""
import json, os, re, html, urllib.request, datetime, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, 'site.json'), encoding='utf-8'))
URL = 'https://wztxprmmrkgghisodheh.supabase.co/rest/v1/'
KEY = re.search(r"key:'([^']+)'", open(os.path.join(ROOT, 'assets', 'site.js'), encoding='utf-8').read()).group(1)

def get(path):
    req = urllib.request.Request(URL + path, headers={'apikey': KEY, 'Authorization': 'Bearer ' + KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))

esc = lambda s: html.escape(str(s or ''), quote=True)

def inline(t):
    t = esc(t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(^|[^*])\*([^*\n]+)\*', r'\1<em>\2</em>', t)
    t = re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', r'<a href="\2" rel="noopener">\1</a>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t

def md(src, images):
    lines = src.replace('\r', '').split('\n'); out = []; i = 0; para = []
    def flush():
        if para: out.append('<p>' + inline(' '.join(para)) + '</p>'); para.clear()
    while i < len(lines):
        l = lines[i]
        if not l.strip(): flush(); i += 1; continue
        m = re.match(r'^(#{1,4})\s+(.*)', l)
        if m:
            flush()
            if len(m.group(1)) > 1:
                lv = min(max(len(m.group(1)), 2), 3); out.append(f'<h{lv}>{inline(m.group(2))}</h{lv}>')
            i += 1; continue
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
            out.append('<table>' + ''.join('<tr>' + ''.join((f'<td>{inline(c)}</td>' if k else f'<th>{inline(c)}</th>') for c in cells(r)) + '</tr>' for k, r in enumerate(body)) + '</table>'); continue
        m = re.match(r'^!\[([^\]]*)\]\((https?://[^\s)]+)\)', l)
        if m: flush(); out.append(f'<figure><img src="{esc(m.group(2))}" alt="{esc(m.group(1))}" loading="lazy"></figure>'); i += 1; continue
        para.append(l.strip()); i += 1
    flush()
    s = '\n'.join(out)
    if images:
        parts = s.split('<h2>')
        for k, im in enumerate(images):
            at = min(len(parts) - 1, round((k + 1) * len(parts) / (len(images) + 1)))
            if at > 0:
                fig = f'<figure><img src="{esc(im["image_url"])}" alt="{esc(im.get("alt_text"))}" loading="lazy">' + (f'<figcaption>{esc(im.get("alt_text"))}</figcaption>' if im.get('alt_text') else '') + '</figure>'
                parts[at] = parts[at].replace('</p>', '</p>' + fig, 1)
        s = '<h2>'.join(parts)
    return s

def fmt_date(d):
    m = ['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
    dt = datetime.datetime.fromisoformat(d.replace('Z', '+00:00')); return f'{dt.day}. {m[dt.month-1]} {dt.year}'

HEAD = '''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · Armin Fradler</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{canon}">
<meta property="og:type" content="article"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canon}">{ogimg}
<link href="../../assets/fonts/fonts.css" rel="stylesheet">
<link href="../../assets/site.css" rel="stylesheet">
<script type="application/ld+json">{ld}</script>
</head>
<body data-page="impulse">
<a class="skip" href="#inhalt">Zum Inhalt</a>
<header id="site-head"></header>
<main id="inhalt"><section><article class="wrap narrow">
'''
FOOT = '''</article></section></main>
<footer id="site-foot"></footer>
<script src="../../assets/site.js" data-root="../../"></script>
</body>
</html>
'''

def main():
    base = CFG['base'].rstrip('/')
    robots = '<meta name="robots" content="noindex">\n' if CFG.get('preview') else ''
    posts = get('posts?select=*,category:categories(name,slug)&status=eq.published&order=published_at.desc')
    imgs = get('post_images?select=post_id,image_url,alt_text,image_type,sort_order&order=sort_order')
    for d in ('impulse', 'blog'):
        for name in os.listdir(os.path.join(ROOT, d)) if os.path.isdir(os.path.join(ROOT, d)) else []:
            p = os.path.join(ROOT, d, name)
            if os.path.isdir(p): shutil.rmtree(p)
    urls = []
    for p in posts:
        slug = p['slug']; canon = f'{base}/impulse/{slug}/'
        title = p['title']; desc = p.get('meta_description') or p.get('excerpt') or ''
        cat = (p.get('category') or {})
        content = re.sub(r'^#\s+.*\n', '', p.get('content') or '')
        inl = [i for i in imgs if i['post_id'] == p['id'] and i['image_type'] != 'featured']
        old = p['published_at'] < '2026-09-01'
        ld = json.dumps({'@context': 'https://schema.org', '@type': 'Article', 'headline': title, 'description': desc,
                         'datePublished': p['published_at'], 'dateModified': p.get('updated_at') or p['published_at'],
                         'author': {'@type': 'Person', 'name': 'Armin Fradler', 'url': base + '/ueber-mich.html'},
                         'publisher': {'@type': 'Person', 'name': 'Armin Fradler'}, 'inLanguage': 'de-AT',
                         'mainEntityOfPage': canon, **({'image': p['featured_image_url']} if p.get('featured_image_url') else {})}, ensure_ascii=False)
        page = HEAD.format(title=esc(title), desc=esc(desc), robots=robots, canon=canon, ld=ld.replace('</', '<\\/'),
                           ogimg=f'<meta property="og:image" content="{esc(p["featured_image_url"])}">' if p.get('featured_image_url') else '')
        page += f'<p class="kick"><a href="../?thema={esc(cat.get("slug",""))}" style="text-decoration:none">{esc(cat.get("name","Impuls"))}</a> · {fmt_date(p["published_at"])}' + (f' · {max(1, round(p["average_read_time"] / 60 if p["average_read_time"] > 60 else p["average_read_time"]))} Min.' if p.get('average_read_time') else '') + '</p>\n'
        page += f'<h1 style="font-size:clamp(32px,5vw,50px);margin-bottom:22px">{esc(title)}</h1>\n'
        if old: page += '<p class="archive-note">Aus dem Archiv: Dieser Beitrag ist vor über einem halben Jahr erschienen. Manche Zahlen und Produktnamen haben sich seither geändert.</p>\n'
        if p.get('featured_image_url'): page += f'<figure style="margin:0 0 30px"><img src="{esc(p["featured_image_url"])}" alt="" style="border-radius:4px"></figure>\n'
        page += '<div class="article">' + md(content, inl) + '</div>\n'
        page += '<hr style="border:0;border-top:1px solid var(--line);margin:46px 0 22px"><p class="s m">Armin Fradler begleitet Bildungsorganisationen und Teams beim Umgang mit KI und unterrichtet selbst in der Erwachsenenbildung.</p><p><a href="../">← Alle Impulse</a> · <a href="../../kontakt.html">Darüber reden? Schreiben Sie mir.</a></p>\n'
        page += FOOT
        os.makedirs(os.path.join(ROOT, 'impulse', slug), exist_ok=True)
        open(os.path.join(ROOT, 'impulse', slug, 'index.html'), 'w', encoding='utf-8').write(page)
        os.makedirs(os.path.join(ROOT, 'blog', slug), exist_ok=True)
        open(os.path.join(ROOT, 'blog', slug, 'index.html'), 'w', encoding='utf-8').write(
            f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>{esc(title)}</title><link rel="canonical" href="{canon}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=../../impulse/{slug}/"></head><body><p><a href="../../impulse/{slug}/">{esc(title)}</a></p></body></html>')
        urls.append((canon, (p.get('updated_at') or p['published_at'])[:10]))
    today = datetime.date.today().isoformat()
    static = ['', 'angebot.html', 'termine.html', 'impulse/', 'ueber-mich.html', 'kontakt.html']
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += [f'<url><loc>{base}/{u}</loc><lastmod>{today}</lastmod></url>' for u in static]
    sm += [f'<url><loc>{u}</loc><lastmod>{d}</lastmod></url>' for u, d in urls]
    sm.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('\n'.join(sm) + '\n')
    print(f'{len(posts)} Beiträge gebaut')

if __name__ == '__main__':
    main()
