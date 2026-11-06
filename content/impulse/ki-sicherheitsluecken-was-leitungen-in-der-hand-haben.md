---
title: "KI findet Lücken schneller, als wir sie stopfen. Jetzt zählt der Hausverstand"
slug: "ki-sicherheitsluecken-was-leitungen-in-der-hand-haben"
status: "published"
pin: 2
startseite: true
date: "2026-10-30T14:00:00+01:00"
updated: "2026-11-06T03:00:00+01:00"
category: "Sicher mit Hausverstand"
category_slug: "sicher-mit-hausverstand"
description: "KI findet Sicherheitslücken schneller als je zuvor. Was heißt das für Organisationen ohne IT-Abteilung? Drei Dinge, die jede Leitung selbst regeln kann."
excerpt: "Im Oktober wurden zwei Lücken bekannt, die seit 2012 in der Technik hinter den meisten Websites steckten, gefunden mit Hilfe von KI. Panik hilft nicht. Was hilft, ist das, was jede Feuerwehr am Land kann: wissen, wo der Hydrant ist, und wen man anruft."
seo_title: "KI und Sicherheitslücken: Was Organisationen ohne IT-Abteilung jetzt tun können"
keywords: ["Cybersecurity", "KI Sicherheit", "Sicherheitslücke Website", "PHP", "KMU", "Bildungsorganisation", "IT ohne IT-Abteilung", "Webagentur"]
minutes: 7
sources: [{"title": "PHP: Sicherheitsupdate vom 21.10.2026 (Stand: Oktober 2026)", "url": "https://www.php.net/archive/2026.php"}, {"title": "Calif: Wie die Lücken gefunden wurden (Stand: Oktober 2026)", "url": "https://calif.io/php2shell/"}, {"title": "OpenAI: Coordinated disclosure of critical vulnerabilities (21.10.2026)", "url": "https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/"}, {"title": "Sansec: Zeitablauf und Empfehlungen (Stand: Oktober 2026)", "url": "https://sansec.io/research/php2shell"}, {"title": "Rijksoverheid: Websites vorsorglich offline (21.10.2026)", "url": "https://www.rijksoverheid.nl/actueel/nieuws/2026/10/21/aantal-websites-rijksoverheid-preventief-offline-na-kwetsbaarheden-php"}, {"title": "AWS Security Blog: Angriffe vor der Veröffentlichung (21.10.2026, aktualisiert 22.10.)", "url": "https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/"}, {"title": "The Hacker News: Angriffsversuche nach dem Update (23.10.2026)", "url": "https://thehackernews.com/2026/10/php2shell-exploit-attempts-hit-millions.html"}, {"title": "W3Techs: Verbreitung von PHP (Stand: November 2026)", "url": "https://w3techs.com/technologies/details/pl-php"}, {"title": "Sam Altman bei Stanford GSB, View From The Top (21.10.2026)", "url": "https://www.youtube.com/watch?v=anAmTGcewX8"}, {"title": "Gizmodo über Altmans Aussagen (23.10.2026)", "url": "https://gizmodo.com/sam-altman-i-no-longer-think-were-gonna-be-able-to-just-patch-all-the-bugs-2000829947"}, {"title": "LiteLLM: Meldung der Entwickler zu Version 1.107.0 (21.10.2026)", "url": "https://github.com/BerriAI/litellm/issues/47826"}, {"title": "The Next Web: CISA führt PHP2Shell als ausgenutzt (28.10.2026)", "url": "https://thenextweb.com/news/php2shell-flaws-exploited-cisa-kev"}, {"title": "The Record: Erste erfolgreiche Ausnutzungen gemeldet (29.10.2026)", "url": "https://therecord.media/php2shell-successful-exploitation-reports-emerge"}]
image: "titel.webp"
image_label: "Bild: mit KI erstellt (gpt-image-2.5-sunburst, 10/2026)"
image_alt: "Ein gefaltetes Vorhängeschloss aus blauem Karton mit einem Riss, geflickt mit rotem Klebeband, daneben zwei alte Schlüssel, eine leere Karteikarte mit drei Spalten und ein Rotstift"
---

Kurz gesagt: KI findet inzwischen Sicherheitslücken, die Fachleute jahrelang übersehen haben, und zwar schnell. Das können die Guten, und das können die anderen. Für ein Bildungshaus, ein Steuerbüro oder einen Handwerksbetrieb ohne eigene IT heißt das nicht, dass jetzt alle Sicherheitsprofis werden müssen. Es heißt, drei Dinge zu wissen: was bei uns läuft, wer sich darum kümmert und wie schnell, und wer entscheidet, wenn es brennt.

## Was ist im Oktober passiert?

Am 21. Oktober 2026 kam eine Meldung, die viele nervös gemacht hat. PHP, die Technik hinter den meisten Websites, hatte zwei schwere Lücken. Jede WordPress-Seite läuft auf PHP. Die Lücken steckten seit 2012 im Code. Gefunden haben sie zwei Teams unabhängig voneinander, beide mit Hilfe von KI.

Was mich an der Geschichte am meisten beschäftigt: 2024 hatten Fachleute PHP schon einmal gründlich geprüft und ein verwandtes Problem gesehen. Repariert wurde es nicht, weil niemand zeigen konnte, dass man es wirklich ausnutzen kann. Zwei Jahre später konnte das ein kleines Team mit KI.

Und wie so oft lief es nicht nach Plan. Laut Amazon gab es den ersten Angriffsversuch schon am 17. Oktober, vier Tage vor dem Update, als die Lücken offiziell noch geheim waren. Einen Tag vor dem Update sickerten dann Details durch, und am 21. Oktober kamen die Angriffe schon am Vormittag, das Update erst am Nachmittag. Amazon schreibt dazu einen Satz, der hängen bleibt: Eine Geheimhaltung schützt nur so lange, bis jemand anderer denselben Fehler findet. In den Niederlanden hat die Regierung vorsorglich Seiten vom Netz genommen, sogar das Bürgerportal DigiD.

## Wird jetzt alles gehackt?

Nein. Schon am Tag nach dem Update zählten Sicherheitsfirmen Millionen Angriffsversuche. Bis 23. Oktober war aber keine einzige Übernahme einer Website bestätigt, die Angreifer taten sich schwerer als befürchtet. Wer eine gepflegte Seite bei einem Anbieter hat, der Updates rasch einspielt, war gut dran, auch wenn die Lücke selbst dort einige Stunden offen war.

*Nachtrag 5. November:* Inzwischen führt die US-Cybersicherheitsbehörde CISA beide Lücken als aktiv ausgenutzt. Sicherheitsfirmen melden erste erfolgreiche Angriffe, vor allem auf Firewalls. Übernommene Websites sind bisher nicht belegt.

Das eigentliche Problem sind die Seiten, um die sich keiner mehr kümmert. Die alte Projektseite von 2019. Das Anfrageformular, das ein Praktikant gebaut hat und das seither einfach läuft. Der kleine Onlineshop. Die Lernplattform auf einem Server, bei dem keiner mehr genau weiß, wer eigentlich zuständig ist. Ich kenne kaum einen Betrieb, kaum ein Büro und kaum ein Bildungshaus, wo es so etwas nicht gibt. Und genau dort wird es jetzt ernster, weil solche Lücken schneller gefunden werden als früher.

## Was ändert sich durch KI wirklich?

Das Suchen wird billig. Im PHP-Fall fand ein Sicherheitsforscher mit KI-Unterstützung binnen gut zwei Wochen einen funktionierenden Angriff. Eine fast zweimonatige Prüfung durch Fachleute hatte eines der Probleme 2024 zwar gesehen, aber nicht als ausnutzbar erkannt. OpenAI-Chef Sam Altman hat es laut einem Bericht von Gizmodo in einem Gespräch an der Universität Stanford, veröffentlicht am 21. Oktober, so gesagt: „Ich glaube nicht mehr, dass wir einfach alle Fehler beheben können.“ Und er meinte, dass sich die meisten Führungskräfte schon wieder anderen Dingen zugewandt haben, während die Modelle immer besser werden.

Sein Rezept: Verteidigung mit derselben Technik, also mit KI. Für Konzerne stimmt das wahrscheinlich. Man darf aber dazusagen, dass er genau diese Technik verkauft. Einem Betrieb mit zwölf Leuten fehlt im entscheidenden Moment meist etwas anderes: das Wissen, ob die eigene Seite betroffen ist, wer sie betreut und wer sagen darf: Wir drehen sie heute ab.

Bei uns am Land weiß bei der Feuerwehr jeder, wo der nächste Hydrant ist und wer den Kommandanten anruft. Dafür braucht es kein Spezialwissen, nur Absprachen. Bei der IT gibt es sie in vielen Organisationen noch nicht.

Damit ändert sich auch die Rolle der Sicherheitsleute. Das Suchen und das Lesen von Warnungen wird, so meine Einschätzung, immer mehr die KI übernehmen. Bei den Menschen bleibt, was für uns wichtig ist, was zuerst kommt und wen wir anrufen. Das ist dieselbe Frage, die ich in jedem Workshop stelle: [Wo lassen wir uns Arbeit abnehmen, und wo das Denken?](/impulse/wo-lassen-wir-uns-arbeit-abnehmen-und-wo-das-denken/)

## Was kann jede Leitung selbst tun?

Drei Dinge, und für keines davon braucht man ein Informatikstudium.

**Wissen, was man hat.** Ein Blatt Papier reicht: Website, Anmelde- oder Bestellsystem, Lernplattform oder Kundenportal, Mail, und bei jedem die Technik dahinter. Schreiben Sie auch auf, was Sie nicht haben. „Kein eigener Server“ ist eine Zeile, die im Ernstfall viel Zeit spart.

**Wissen, wer sich kümmert, und wie schnell.** Neben jede Zeile ein Name: Webagentur, Hoster, IT-Dienstleister. Und eine Frage, die man einmal stellt und dann nie wieder vergisst: Wie schnell sichern Sie ab, wenn eine kritische Lücke bekannt wird, und wie erfahren wir davon?

**Wissen, wer entscheidet, wenn es brennt.** Wer darf sagen, dass die Website einen Tag offline geht? Gibt es eine Sicherungskopie? Und hat die schon einmal jemand zurückgespielt? Erst wenn eine Sicherung einmal zurückgespielt wurde, wissen Sie, ob sie funktioniert.

> **Ein Beispiel (erfunden):** Das Bildungswerk Apfelland hat keine IT-Abteilung. Am 21. Oktober liest die Leiterin von der PHP-Lücke und hat keine Ahnung, ob es ihr Haus betrifft. Sie schreibt der Webagentur drei Fragen: Läuft unsere Seite auf PHP? Ist das Update eingespielt? Wie erfahren wir das nächste Mal davon? Um zehn Uhr kommt die Antwort: betroffen, das Update kommt am Nachmittag, bis dahin ist die Anmeldung abgeschaltet. Seither steht die PHP-Version auf ihrem Blatt, und im Vertrag steht, dass sich die Agentur bei kritischen Lücken von selbst meldet. Aufwand: eine Mail.

## Wo hilft KI, und wo nicht?

KI kann die Wache übernehmen. Bei mir läuft seit dem 21. Oktober jeden Tag eine KI-Routine. Sie liest die neuen Sicherheitsmeldungen und vergleicht sie mit meiner Liste. Sie meldet sich nur, wenn mich etwas betrifft. Sie ändert nichts selbst. Ein Update spielt sie erst ein, wenn ich Ja sage.

Eine Lehre aus den ersten Tagen gebe ich gern weiter, auch wenn sie mir nicht ganz angenehm ist. Am Abend des 21. Oktober bekam ich eine Zusammenfassung, laut der ein bekanntes KI-Werkzeug namens LiteLLM in einer bestimmten Version manipuliert worden war. Ein zweiter KI-Durchgang fand nur einen älteren Vorfall mit anderen Versionsnummern und erklärte die Meldung für falsch. Drei Tage später habe ich bei den Entwicklern selbst nachgeschaut. Es gab zwei Vorfälle, die Meldung hatte recht. Mich hat es nicht betroffen, ich nutze das Werkzeug nicht. Aber seither gilt bei mir: Wenn sich zwei Angaben widersprechen, zählt die Meldung des Herstellers vom selben Tag. Nicht die Zusammenfassung, und auch nicht die Erinnerung an einen älteren Fall.

Die Entscheidung bleibt bei der Leitung. Sie trägt die Folgen, wenn die Anmeldeseite eine Woche vor den Herbstkursen einen Tag offline geht, oder wenn der Onlineshop einen Tag lang keine Bestellungen annimmt.

## Was das für Sie heißt

1. **Das Blatt anlegen.** Pro Zeile drei Angaben: was läuft, mit welcher Technik, wer sich kümmert. Mit Ihrer Agentur oder Ihrem Dienstleister ist das in einer Stunde erledigt.
2. **Die eine Frage stellen.** Schreiben Sie Ihrer Webagentur oder Ihrem Hoster: Wie schnell sichern Sie bei kritischen Lücken ab, und wie erfahren wir davon?
3. **Einen Satz für den Notfall aufschreiben.** Wer darf ein System vom Netz nehmen, und wer wird dann informiert?

## Häufige Fragen

**Muss ich jetzt selbst nachschauen, ob unsere Website auf PHP läuft?**
Nein. Fragen Sie Ihre Webagentur oder Ihren Hoster. Eine Lücke in PHP lässt sich nicht im Inhalt der Website beheben, sondern nur mit einem Update oder einer Einstellung auf dem Server. Das macht der, der den Server betreibt.

**Wir haben WordPress. Sind wir betroffen?**
WordPress läuft auf PHP, also war Ihre Seite vermutlich betroffen. Ob sie es noch ist, hängt davon ab, ob Ihr Hoster das Update vom 21. Oktober eingespielt hat. Für sehr alte PHP-Versionen (8.1 und älter) gibt es kein fertiges Update, nur Korrekturen für Fachleute. Gerade alte Seiten sollten Sie deshalb nachfragen. Fragen Sie gleich mit, ob auch die Einstellung gesetzt ist, die PHP am 23. Oktober gegen eine weitere, weniger wahrscheinliche Schwachstelle empfohlen hat.

**Brauchen wir jetzt eine KI für die Sicherheit?**
Nicht als Erstes. Zuerst kommen das Blatt, die Zuständigkeiten und automatische Updates, wo es sie gibt. Eine KI-Routine, die Warnungen liest, ist eine gute Ergänzung, wenn Ihre Organisation schon ein freigegebenes KI-Werkzeug hat.

**Ist so eine Liste nicht selbst heikel?**
Ja. Sie zeigt, wo man angreifen könnte. Nach der [Datenampel](/impulse/datenampel-welche-daten-in-ki-tools/) ist sie mindestens Gelb: Sie gehört nur in ein KI-Programm, das Ihre Organisation offiziell erlaubt hat, nie in ein privates Konto, auch nicht in ein bezahltes.

**Wird das jetzt öfter passieren?**
Ich rechne damit. Wenn KI das Suchen billiger macht, werden wahrscheinlich mehr alte Lücken gefunden, von beiden Seiten. Kein Grund zur Panik. Aber ein guter Grund, die drei Fragen oben einmal ordentlich zu beantworten.
