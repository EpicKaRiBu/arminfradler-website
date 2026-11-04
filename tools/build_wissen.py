#!/usr/bin/env python3
"""Baut data/wissen.json für wissen.html.

Quellen (alle im Projektordner, gepflegt von den Wochenaufgaben):
  Wissen/Faktenbank.md          -> "Nachgeschaut" (nur Einträge mit Link, ohne Abschnitt "Veraltet")
  content/wissen/radar.json     -> Radar und Begriffe (Armins Einordnung)
  content/wissen/kurz.json      -> "Das Wichtigste" je Blickwinkel
  content/wissen/nachrichten/   -> KI-Nachrichten je Woche, dazu wissen-feed.xml (RSS) und data/neu.json (Startseite)
  content/wissen/werkzeuge.json -> Steckbriefe auf modelle.html

Aufruf:  python3 tools/build_wissen.py --wissen ../Wissen
"""
import argparse, datetime as dt, hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
GUETE = {"B": "begutachtet", "P": "Preprint", "A": "Arbeitspapier oder Bericht", "U": "Umfrage",
         "H": "Anbieter oder Organisation", "G": "Gesetz oder Behörde", "S": "Fachkanzlei"}
BLICK = {
    "bildung": re.compile(r"Erwachsenenbild|Ö-Cert|Weiterbildung|Kurs|Trainer|Tutor|AMS|Deutschlernend|Lernkont|Bildungskarenz|Lernmarkt|Lernerfolg|Lernzuwachs", re.I),
    "schule": re.compile(r"PISA|(?<!hoch)Schul|Schüler|Handy|Jugend|Lehrkr|Kinder|Klass|Tutor|Hausübung|Lernen|Prüfling|Social-Media", re.I),
    "gemeinde": re.compile(r"Bund|Verwaltung|DSGVO|Datenschutz|NISG|GovGPT|DSB|DSFA|Behörde|Overheid|Pseudonym|Art\. 4|AI Act|KI-VO|Rotes Kreuz|Data Boundary|Privacy", re.I),
    "betrieb": re.compile(r"Unternehmen|Betrieb|Beschäftigt|KMU|Copilot|McKinsey|Zapier|Workslop|Arbeitgeber|Büro|Wissensarbeit|Schatten-KI|Zeitersparnis|Agent|Mittelstand", re.I),
}
# Herkunft: wo wurde das erhoben oder beschlossen? Reihenfolge = Vorrang.
LAND = [
    ("ch", r"Schweiz"),
    ("at", r"Österreich|Austria|\.at/|\bAT\b|Feldkirch|Vorarlberg|Gemeindebund|Amstetten|Gailtal|Reichenau|Krieglach|Langenzersdorf|Niederösterreich|Steiermark|AK Wien|OGH|ArbVG|Bundeskriminalamt|\bBMB\b|KMU\.DIGITAL|\bAVG\b|Nationalrat|KSÖ|Kärnt|Burgenland|Wien|Salzburg|IQS|Ö-Cert|\bAMS\b|Bundeskanzleramt|RIS\b|BGBl|NISG|GovGPT|DSFA-V|Datenschutzbehörde|Uni Graz|Statistik Austria|PIAAC Österreich|Rotes Kreuz|Budgetdienst"),
    ("eu", r"Anhang III|Art\. 50|Erwägungsgrund|\bEU\b|EU-|Kommission|eur-lex|EDSA|Omnibus|AI Act|DSGVO|KI-VO|Data Privacy|Ratsempfehlung"),
    ("de", r"Deutschland|\.de/|IW Köln|\bIW\b|BSI|TÜV|LMU|Bitkom|Heuking"),
    ("uk", r"England|Lancet Regional|Bainbridge"),
    ("nl", r"Niederlande"), ("dk", r"Dänemark"), ("no", r"Norwegen"), ("pl", r"Polen"), ("tr", r"Türkei"),
    ("fr", r"Frankreich"), ("kr", r"Südkorea"),
    ("intl", r"OECD|PISA 2025 OECD|weltweit|Global"),
    ("us", r"\bUS\b|USA|US-|Stanford|NBER|RAND|Wharton|\bMIT\b|Microsoft|OpenAI|Anthropic|Google|Zapier|McKinsey|Axios|Florida|METR|Fortune|Chegg|Harvard|CHI|BCG|Kapwing|W3Techs|Cloudflare|AWS|PNAS|Sci Adv|Sci Rep|Psychological Bulletin|PHP|LiteLLM|Willison|CSO"),
]
REGION = {"at": "oesterreich", "de": "dach", "ch": "dach", "eu": "europa", "uk": "europa", "nl": "europa", "dk": "europa",
          "no": "europa", "pl": "europa", "tr": "europa", "fr": "europa", "ee": "europa", "al": "europa", "us": "welt", "kr": "welt", "cn": "welt", "ng": "welt", "intl": "welt"}
VORFALL = re.compile(r"[Aa]ngriff\b|Angriffsversuch|angegriffen|kaperten|gekapert|Datenleck|Sicherheitslücke|\bLücke|CVE|insolvent|Annullierung|kompromittiert|Ausfall|ausgefallen|offline")
GESETZ = re.compile(r"gesetz|Novelle|beschlossen|Pflichtgegenst|§|Art\. \d|VO \d|verordnung|Richtlinie|BGBl|AI Act|AI-Act|KI-VO|NISG|DSGVO|Verbot|Erlass|Bescheid|Erledigung|Rechtsgrundlage|No-Stop|Hochrisiko|hochriskant|Kennzeichnung|förder|beihilfe|Geräteinitiative|Lernapps|Clouddienste|Eigenerklärung|Vorgaben|Handreichung|Strategie|Erläuterungen", re.I)
WERKZ = re.compile(r"Copilot|ChatGPT|Claude|Gemini|Modell|Agent|Skills|Notebooks|GovGPT|GemeindeKI|Lizenz|Study Mode|Protokoll|Workspace")
ZAHL = re.compile(r"\d+(,\d+)? ?%")
def herkunft(text):
    for code, rx in LAND:
        if re.search(rx, text):
            return code
    return "intl"


def art(text, guete):
    """Studie und Zahlen, Gesetz und Regeln (auch Förderregeln, Behördenvorgaben), Werkzeug, Vorfall."""
    if VORFALL.search(text):
        return "vorfall"
    if guete in ("B", "P", "U") or (guete == "G" and ZAHL.search(text)):
        return "studie"
    if GESETZ.search(text):
        return "gesetz"
    if guete == "H" and WERKZ.search(text):
        return "werkzeug"
    return "werkzeug" if guete == "H" else "studie"


SICHER = re.compile(r"PHP|LiteLLM|NISG|Angriff|Lücke|CVE|Prompt|trifecta|Sicherheit|Cyber|Phishing|Betrug|Fraud|Deepfake|Ransomware", re.I)
WERKZEUG = re.compile(r"Agent|Copilot|Workspace Studio|Cowork|Chatbot|GovGPT|GemeindeKI|Teachino|Lernapps|Dialogsystem", re.I)
THEMA = {"Arbeit oder Denken": "lernen", "KI als Organisationskompetenz": "team",
         "Lernen, wenn KI vieles kann": "lernen", "KI-Entwicklung und Lernmarkt": "markt",
         "Aufmerksamkeit, Feed und Schule": "aufmerksamkeit",
         # Abschnitte aus der Tiefenrecherche je Blickwinkel (4.11.2026)
         "Recht und Regeln 2026": "team", "Bildungshaus und Erwachsenenbildung": "lernen", "Schule": "lernen",
         "Gemeinde und Verwaltung": "team", "Betriebe": "team", "Sicherheit und Vorfälle": "sicher"}
ABSCHNITT_FUER = {"Bildungshaus und Erwachsenenbildung": "bildung", "Schule": "schule",
                  "Gemeinde und Verwaltung": "gemeinde", "Betriebe": "betrieb"}
NEUE_ABSCHNITTE = set(ABSCHNITT_FUER) | {"Recht und Regeln 2026", "Sicherheit und Vorfälle"}


def datum(s):
    m = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", s or "")
    return dt.date(int(m[3]), int(m[2]), int(m[1])) if m else None


def faktenbank(path, live_impulse):
    out, abschnitt, abschnitt_eff = [], None, None
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            abschnitt = line[3:].strip()
            continue
        if abschnitt and abschnitt.startswith("Veraltet") and line.count("|") >= 7 and LINK.search(line):
            print("Hinweis: aktuelle Tatsache steht unter 'Veraltet', bitte verschieben:", line[:70], file=sys.stderr)
            abschnitt_eff = "KI-Entwicklung und Lernmarkt"
        elif line.startswith("| "):
            abschnitt_eff = abschnitt
        if not line.startswith("| ") or abschnitt_eff not in THEMA or line.startswith("| Tatsache") or set(line) <= set("|- "):
            continue
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(c) < 6:
            continue
        text, quelle, guete, grenzen, geprueft, verwendet = c[:6]
        links = [{"t": t, "u": u} for t, u in LINK.findall(quelle)]
        links += [{"t": t, "u": u} for t, u in LINK.findall(grenzen)]   # Zweitquellen aus „Grenzen“
        grenzen = LINK.sub(r"\1", grenzen)
        if not links:          # ohne nachprüfbaren Link nicht öffentlich
            continue
        g = guete.strip()[:1]
        pruefen_bis = datum(grenzen.split("prüfen bis")[1]) if "prüfen bis" in grenzen else None
        gp = datum(geprueft)
        faellig = pruefen_bis or (gp + dt.timedelta(days=183) if gp else None)
        imp = [s for s in re.findall(r"[a-z0-9]+(?:-[a-z0-9]+){2,}", verwendet) if s in live_impulse]
        thema = THEMA[abschnitt_eff]
        if abschnitt_eff in NEUE_ABSCHNITTE and thema != "sicher":
            if SICHER.search(text):
                thema = "sicher"
            elif WERKZEUG.search(text):
                thema = "werkzeuge"
        tags = [thema] + (["sicher"] if thema != "sicher" and SICHER.search(text) else [])
        out.append({
            "id": "f" + hashlib.sha1(text.encode()).hexdigest()[:7],
            "text": LINK.sub(r"\1", text), "quellen": links, "guete": g, "guete_name": GUETE.get(g, g),
            "grenzen": re.sub(r"[;,]?\s*prüfen bis [\d.]+", "", grenzen).strip(" ;,"), "geprueft": gp.isoformat() if gp else None,
            "land": herkunft(text + " " + quelle + " " + grenzen),
            "art": art(text, g),
            # Abschnitt je Blickwinkel: nur dieser; sonst nach Stichworten
            "fuer": [ABSCHNITT_FUER[abschnitt_eff]] if abschnitt_eff in ABSCHNITT_FUER else [k for k, rx in BLICK.items() if rx.search(text + " " + grenzen)],
            "kern": ABSCHNITT_FUER.get(abschnitt_eff),
            "faellig": faellig.isoformat() if faellig else None, "abschnitt": abschnitt_eff, "tags": tags, "impulse": imp,
        })
    return out


ARTEN = {"modell": "Modelle", "werkzeug": "Werkzeuge", "recht": "Recht und Regeln", "studie": "Studien",
         "sicherheit": "Sicherheit", "markt": "Markt"}
GEWICHT = {"wichtig": "Wichtig", "gut": "Gut zu wissen", "laut": "Laute Schlagzeile"}
BLICKE = {"bildung", "schule", "gemeinde", "betrieb"}

def nachrichten(radar_ids, fehlt):
    """KI-Nachrichten: content/wissen/nachrichten/<JJJJ>-KW<nn>.json, eine Datei je Woche.
    Die Routine legt Entwürfe an, Armin gibt frei. Jede Meldung braucht eine Quelle, die auf den konkreten Artikel zeigt."""
    wochen, alle = [], []
    for f in sorted((ROOT / "content/wissen/nachrichten").glob("20??-KW*.json"), reverse=True):
        w = json.loads(f.read_text(encoding="utf-8"))
        wid = f.stem
        wochen.append({"id": wid, "von": w["von"], "bis": w["bis"], "stand": w.get("stand", w["bis"])})
        for i, m in enumerate(w["meldungen"]):
            wo = f"{wid} Nr. {i + 1}"
            if m.get("art") not in ARTEN: fehlt.append(f"{wo}: Art {m.get('art')}")
            if m.get("gewicht") not in GEWICHT: fehlt.append(f"{wo}: Gewicht {m.get('gewicht')}")
            if not set(m.get("fuer", [])) <= BLICKE: fehlt.append(f"{wo}: fuer {m.get('fuer')}")
            if not m.get("quellen"): fehlt.append(f"{wo}: keine Quelle")
            for q in m.get("quellen", []):
                if not re.match(r"https?://[^/]+/.+", q["u"]): fehlt.append(f"{wo}: Startseite statt Artikel {q['u']}")
            if m.get("radar") and m["radar"] not in radar_ids: fehlt.append(f"{wo}: Radarpunkt {m['radar']}")
            m["woche"] = wid
            m["id"] = "n" + hashlib.sha1((m["titel"] + m["datum"]).encode()).hexdigest()[:7]
            alle.append(m)
    alle.sort(key=lambda m: m["datum"], reverse=True)
    return {"wochen": wochen, "meldungen": alle, "arten": ARTEN, "gewicht": GEWICHT,
            "stand": max((w["stand"] for w in wochen), default=None)}


def feed(meldungen, base="https://arminfradler.at"):
    """RSS-Feed des Schaukastens: ein Eintrag pro Zettel. Ohne Anmeldung, ohne Zählung."""
    from email.utils import format_datetime
    from xml.sax.saxutils import escape as x
    items = []
    for p in [m for m in meldungen if m["gewicht"] != "laut"][:60]:
        zeit = format_datetime(dt.datetime.combine(dt.date.fromisoformat(p["datum"]), dt.time(9, 0), dt.timezone.utc))
        text = p["was"] + " Was das heißt: " + p["einordnung"]
        quellen = " ".join(f'<a href="{x(q["u"])}">{x(q["t"])}</a>' for q in p.get("quellen", []))
        items.append(f'<item><title>{x(p["titel"])}</title><link>{base}/nachrichten.html#{p["id"]}</link>'
                     f'<guid isPermaLink="false">{p["id"]}</guid><pubDate>{zeit}</pubDate>'
                     f'<description>{x("<p>" + x(text) + "</p><p>" + quellen + "</p>")}</description></item>')
    (ROOT / "wissen-feed.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>KI-Nachrichten, eingeordnet · Armin Fradler</title>'
        f'<link>{base}/nachrichten.html</link><description>KI-Nachrichten mit Einordnung, am Original nachgelesen. Für Bildungshäuser, Schulen, Gemeinden und Betriebe.</description><language>de-at</language>'
        + "".join(items) + "</channel></rss>\n", encoding="utf-8")


def neu_json(N, n=3):
    """data/neu.json: drei Meldungen für den Wegweiser auf der Startseite (klein, damit die Startseite nicht die ganze Datenbank lädt)."""
    st = dt.date.fromisoformat(N["stand"])
    grenze = (st - dt.timedelta(days=28)).isoformat()
    gw = {"wichtig": 2, "gut": 1, "laut": 0}
    pool = [m for m in N["meldungen"] if m["datum"] >= grenze and m["gewicht"] != "laut"]
    top = sorted(pool, key=lambda m: (gw[m["gewicht"]], m["datum"]), reverse=True)[:n]
    top.sort(key=lambda m: m["datum"], reverse=True)
    out = {"stand": N["stand"], "meldungen": [{"id": m["id"], "datum": m["datum"], "titel": m["titel"], "art": N["arten"][m["art"]]} for m in top]}
    (ROOT / "data/neu.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wissen", default=str(ROOT.parent / "Wissen"))
    a = ap.parse_args()
    w = pathlib.Path(a.wissen)
    live = {p.stem for p in (ROOT / "content/impulse").glob("*.md")
            if re.search(r'^status:\s*"?published', p.read_text(encoding="utf-8"), re.M)}
    fakten = faktenbank(w / "Faktenbank.md", live)
    radar = json.loads((ROOT / "content/wissen/radar.json").read_text(encoding="utf-8"))
    fehlt = []
    for p in radar["punkte"]:
        ids = []
        for key in p["belege"]:
            hit = next((f["id"] for f in fakten if key.lower() in f["text"].lower()), None)
            (ids.append(hit) if hit else fehlt.append(f'{p["id"]}: {key}'))
        p["belege"] = ids
        for f in fakten:
            if f["id"] in ids:
                f.setdefault("radar", []).append(p["id"])
    titel = {}
    for p in (ROOT / "content/impulse").glob("*.md"):
        m = re.search(r'^title:\s*"(.+)"', p.read_text(encoding="utf-8"), re.M)
        if p.stem in live and m:
            titel[p.stem] = m[1]
    korr = json.loads((ROOT / "content/wissen/herkunft.json").read_text(encoding="utf-8"))["korrekturen"]
    for k in korr:
        hit = [f for f in fakten if k["key"].lower() in f["text"].lower()]
        if not hit:
            fehlt.append("herkunft: " + k["key"])
        for f in hit:
            f.update({x: k[x] for x in ("land", "art") if x in k})
    for f in fakten:
        f["region"] = REGION.get(f["land"], "welt")
    kurz = json.loads((ROOT / "content/wissen/kurz.json").read_text(encoding="utf-8"))
    rids = {p["id"] for p in radar["punkte"]}
    for bw in ("alle", "bildung", "schule", "gemeinde", "betrieb"):
        for k in kurz[bw]:
            ids = []
            for key in k.get("belege", []):
                hit = next((f["id"] for f in fakten if key.lower() in f["text"].lower()), None)
                (ids.append(hit) if hit else fehlt.append(f"kurz {bw}: {key}"))
            k["belege"] = ids
            fehlt += [f"kurz {bw}: Radarpunkt {r}" for r in k.get("radar", []) if r not in rids]
    kurz = {bw: kurz[bw] for bw in ("stand", "alle", "bildung", "schule", "gemeinde", "betrieb")}
    data = {"gebaut": dt.date.today().isoformat(), "radar": radar, "fakten": fakten, "kurz": kurz,
            "impulse": titel, "guete": GUETE}
    N = nachrichten({p["id"] for p in radar["punkte"]}, fehlt)
    data["nachrichten"] = N
    feed(N["meldungen"])
    neu_json(N)
    werkzeuge = ROOT / "content/wissen/werkzeuge.json"
    if werkzeuge.exists():
        data["werkzeuge"] = json.loads(werkzeuge.read_text(encoding="utf-8"))
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data/wissen.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(fakten)} Befunde, {len(radar['punkte'])} Radarpunkte, {len(N['meldungen'])} Nachrichten in {len(N['wochen'])} Wochen")
    if fehlt:
        print("Beleg nicht gefunden:\n  " + "\n  ".join(fehlt), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
