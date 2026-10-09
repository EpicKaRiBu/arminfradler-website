"""Umzug von der Vorschau auf arminfradler.at – erst ausführen, wenn die DNS-Einträge auf GitHub Pages zeigen (Auftrag 2).

  python tools/live.py

- site.json: preview → false (Beiträge ohne noindex)
- robots.txt: Suchmaschinen erlaubt, mit Sitemap
- noindex aus den Hauptseiten entfernen (bleibt auf 404, Weiterleitung und Rechtlichem)
- CNAME-Datei für GitHub Pages
- Impulse neu bauen
Danach: Commit und Push, dann in GitHub die eigene Domain setzen und HTTPS erzwingen."""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'arminfradler.at'
SEITEN = ['index.html', 'angebot.html', 'termine.html', 'ueber-mich.html', 'kontakt.html', os.path.join('impulse', 'index.html')]


def main():
    p = os.path.join(ROOT, 'site.json')
    cfg = json.load(open(p, encoding='utf-8'))
    cfg['preview'] = False
    json.dump(cfg, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8', newline='\n').write(
        f'User-agent: *\nAllow: /\n\nSitemap: https://{DOMAIN}/sitemap.xml\n')
    for s in SEITEN:
        f = os.path.join(ROOT, s)
        t = open(f, encoding='utf-8', newline='').read()
        t2 = re.sub(r'<meta name="robots" content="noindex">\r?\n?', '', t)
        open(f, 'w', encoding='utf-8', newline='').write(t2)
        print(('noindex entfernt: ' if t2 != t else 'schon offen: ') + s)
    open(os.path.join(ROOT, 'CNAME'), 'w', encoding='utf-8', newline='\n').write(DOMAIN + '\n')
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_blog.py')], check=True)
    print('Fertig. Jetzt committen, pushen und in GitHub die Domain setzen.')


if __name__ == '__main__':
    main()
