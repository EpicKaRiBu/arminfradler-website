"""Einmalig: Impulse (Blog) aus der alten Lovable-Datenbank ins eigene Repository holen.

Ergebnis:
- content/impulse/<slug>.md          Beitrag als Markdown mit Kopfdaten (Titel, Datum, Thema, Beschreibung …)
- assets/impulse/<slug>/*.webp       alle Bilder lokal, verkleinert (max. 1600 px breit)

Liest nur öffentlich freigegebene Beiträge über den öffentlichen, eingeschränkten Schlüssel.
Danach braucht der Blog keine Datenbank mehr: tools/build_blog.py baut alles aus den Markdown-Dateien."""
import io, json, os, re, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://wztxprmmrkgghisodheh.supabase.co/rest/v1/'
KEY = re.search(r"key:'([^']+)'", open(os.path.join(ROOT, 'assets', 'site.js'), encoding='utf-8').read()).group(1)
MD = os.path.join(ROOT, 'content', 'impulse')
IMG = os.path.join(ROOT, 'assets', 'impulse')


def get(path):
    req = urllib.request.Request(URL + path, headers={'apikey': KEY, 'Authorization': 'Bearer ' + KEY})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def bild(url, slug, name):
    """Bild laden, auf max. 1600 px verkleinern, als WebP speichern. Gibt den Dateinamen zurück."""
    os.makedirs(os.path.join(IMG, slug), exist_ok=True)
    datei = name + '.webp'
    ziel = os.path.join(IMG, slug, datei)
    if not os.path.exists(ziel):
        with urllib.request.urlopen(url, timeout=120) as r:
            im = Image.open(io.BytesIO(r.read()))
        im = im.convert('RGB')
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(ziel, 'WEBP', quality=80, method=6)
    return datei


def ueberschriften(text, titel):
    """Ein führendes H1 mit dem Titel entfernen. Nutzt der Beitrag # als Abschnittsebene, alles eine Ebene tiefer setzen."""
    text = text.replace('\r', '').strip() + '\n'
    erste = text.split('\n', 1)
    if erste[0].startswith('# ') and erste[0][2:].strip().lower() == titel.strip().lower():
        text = erste[1].lstrip('\n') if len(erste) > 1 else ''
    if re.search(r'^# ', text, re.M):
        text = re.sub(r'^(#{1,5}) ', lambda m: '#' + m.group(1) + ' ', text, flags=re.M)
    return text


def einfuegen(text, bilder):
    """Inline-Bilder wie bisher gleichmäßig zwischen die Abschnitte (##) verteilen, jeweils nach dem ersten Absatz."""
    if not bilder:
        return text
    teile = re.split(r'(?m)^(?=## )', text)
    for k, (datei, alt) in enumerate(bilder):
        at = min(len(teile) - 1, round((k + 1) * len(teile) / (len(bilder) + 1)))
        if at <= 0:
            continue
        t = teile[at]
        kopf = t.find('\n') + 1
        rest = t[kopf:]
        lead = len(rest) - len(rest.lstrip('\n'))
        m = re.search(r'\n\s*\n', rest[lead:])
        pos = kopf + lead + (m.start() if m else len(rest[lead:]))
        teile[at] = t[:pos] + f'\n\n![{alt}]({datei})' + t[pos:]
    return ''.join(teile)


def kopf(d):
    return '---\n' + ''.join(f'{k}: {json.dumps(v, ensure_ascii=False)}\n' for k, v in d.items() if v not in (None, '', [])) + '---\n\n'


def main():
    os.makedirs(MD, exist_ok=True)
    cats = {c['id']: c for c in get('categories?select=*')}
    posts = get('posts?select=*&status=eq.published&order=published_at.desc')
    imgs = get('post_images?select=*&order=sort_order')
    for p in posts:
        slug = p['slug']
        cat = cats.get(p.get('category_id')) or {}
        meta = [i for i in imgs if i['post_id'] == p['id']]
        ai = any(i.get('ai_prompt') for i in meta)
        titelbild = bild(p['featured_image_url'], slug, 'titel') if p.get('featured_image_url') else None
        text = ueberschriften(p.get('content') or '', p['title'])
        # Bilder, die direkt im Text stehen
        n = [0]
        def ersetze(m):
            n[0] += 1
            return f'![{m.group(1)}]({bild(m.group(2), slug, f"text-{n[0]}")})'
        text = re.sub(r'!\[([^\]]*)\]\((https?://[^\s)]+)\)', ersetze, text)
        inline = [(bild(i['image_url'], slug, f'bild-{i["sort_order"]}'), (i.get('alt_text') or '').replace(']', ')'))
                  for i in meta if i['image_type'] != 'featured']
        text = einfuegen(text, inline)
        rt = p.get('average_read_time') or 0
        d = {
            'title': p['title'],
            'slug': slug,
            'status': 'published',
            'date': p['published_at'],
            'updated': p.get('updated_at'),
            'category': cat.get('name'),
            'category_slug': cat.get('slug'),
            'description': p.get('meta_description') or p.get('excerpt'),
            'excerpt': p.get('excerpt'),
            'seo_title': p.get('meta_title'),
            'keywords': p.get('meta_keywords') or [],
            'minutes': max(1, round(rt / 60 if rt > 60 else rt)) if rt else None,
            'image': titelbild,
            'image_alt': next((i.get('alt_text') for i in meta if i['image_type'] == 'featured'), None),
            'image_label': 'Bild: mit KI erstellt' if ai else None,
            'sources': p.get('external_sources') or [],
        }
        with open(os.path.join(MD, slug + '.md'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(kopf(d) + text.strip() + '\n')
        print(slug, '·', len(inline) + (1 if titelbild else 0) + n[0], 'Bilder')
    print(len(posts), 'Beiträge exportiert')


if __name__ == '__main__':
    main()
