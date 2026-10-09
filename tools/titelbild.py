"""Neues Titelbild in einen Beitrag übernehmen.

  python tools/titelbild.py <slug> <bild.png> [<bild.json>]

- assets/impulse/<slug>/titel.webp   1600 px breit, für die Seite
- assets/impulse/<slug>/social.jpg   1200 × 630, Vorschaubild für LinkedIn & Co. (og:image)
- Kopfdaten im Beitrag: image, image_alt, image_label (aus der JSON-Datei von Bilder/bild.py)
Danach: python tools/build_blog.py"""
import json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(slug, png, info=None, alt=None):
    ziel = os.path.join(ROOT, 'assets', 'impulse', slug)
    os.makedirs(ziel, exist_ok=True)
    im = Image.open(png).convert('RGB')
    w = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS) if im.width > 1600 else im
    w.save(os.path.join(ziel, 'titel.webp'), 'WEBP', quality=82, method=6)
    # 1200 × 630 aus der Mitte
    r = 1200 / 630
    if im.width / im.height > r:
        b = round(im.height * r); box = ((im.width - b) // 2, 0, (im.width - b) // 2 + b, im.height)
    else:
        h = round(im.width / r); box = (0, (im.height - h) // 2, im.width, (im.height - h) // 2 + h)
    im.crop(box).resize((1200, 630), Image.LANCZOS).save(os.path.join(ziel, 'social.jpg'), 'JPEG', quality=85, optimize=True, progressive=True)

    meta = json.load(open(info, encoding='utf-8')) if info else {}
    md = os.path.join(ROOT, 'content', 'impulse', slug + '.md')
    s = open(md, encoding='utf-8').read()
    kopf, rest = s.split('\n---\n', 1)
    werte = {'image': 'titel.webp', 'image_label': meta.get('kennzeichnung')}
    if alt or meta.get('alt'):
        werte['image_alt'] = alt or meta.get('alt')
    for k, v in werte.items():
        if v is None:
            continue
        zeile = f'{k}: {json.dumps(v, ensure_ascii=False)}'
        kopf = re.sub(rf'^{k}: .*$', zeile.replace('\\', '\\\\'), kopf, flags=re.M) if re.search(rf'^{k}: ', kopf, re.M) else kopf + '\n' + zeile
    open(md, 'w', encoding='utf-8', newline='\n').write(kopf + '\n---\n' + rest)
    print(slug, 'übernommen')


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 2:
        print(__doc__)
    else:
        main(a[0], a[1], a[2] if len(a) > 2 else None)
