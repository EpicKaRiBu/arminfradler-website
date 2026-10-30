---
title: "KI findet Lücken schneller, als wir sie stopfen. Jetzt zählt der Hausverstand"
slug: "ki-sicherheitsluecken-was-leitungen-in-der-hand-haben"
status: "published"
pin: 1
startseite: true
date: "2026-10-30T14:00:00+01:00"
category: "KI-Strategie"
category_slug: "ki-strategie"
description: "KI findet Sicherheitslücken schneller als je zuvor. Was heißt das für Organisationen ohne IT-Abteilung? Drei Dinge, die jede Leitung selbst regeln kann."
excerpt: "Im Oktober hat KI zwei Lücken gefunden, die seit 2012 in der Technik hinter den meisten Websites steckten. Panik hilft nicht. Was hilft, ist das, was jede Feuerwehr am Land kann: wissen, wo der Hydrant ist, und wen man anruft."
seo_title: "KI und Sicherheitslücken: Was Organisationen ohne IT-Abteilung jetzt tun können"
keywords: ["Cybersecurity", "KI Sicherheit", "Sicherheitslücke Website", "PHP", "KMU", "Bildungsorganisation", "IT ohne IT-Abteilung", "Webagentur"]
minutes: 7
sources: [{"title": "PHP: Sicherheitsupdate vom 21.10.2026 (Stand: Oktober 2026)", "url": "https://www.php.net/archive/2026.php"}, {"title": "Calif: Wie die Lücken gefunden wurden (Stand: Oktober 2026)", "url": "https://calif.io/php2shell/"}, {"title": "OpenAI: Coordinated disclosure of critical vulnerabilities (21.10.2026)", "url": "https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/"}, {"title": "Sansec: Zeitablauf und Empfehlungen (Stand: Oktober 2026)", "url": "https://sansec.io/research/php2shell"}, {"title": "Rijksoverheid: Websites vorsorglich offline (21.10.2026)", "url": "https://www.rijksoverheid.nl/actueel/nieuws/2026/10/21/aantal-websites-rijksoverheid-preventief-offline-na-kwetsbaarheden-php"}, {"title": "AWS Security Blog: Angriffe vor der Veröffentlichung (21.10.2026, aktualisiert 22.10.)", "url": "https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/"}, {"title": "The Hacker News: Angriffsversuche nach dem Update (23.10.2026)", "url": "https://thehackernews.com/2026/10/php2shell-exploit-attempts-hit-millions.html"}, {"title": "W3Techs: Verbreitung von PHP (Stand: Oktober 2026)", "url": "https://w3techs.com/technologies/details/pl-php"}, {"title": "Sam Altman bei Stanford GSB, View From The Top (21.10.2026)", "url": "https://www.youtube.com/watch?v=anAmTGcewX8"}, {"title": "Gizmodo über Altmans Aussagen (23.10.2026)", "url": "https://gizmodo.com/sam-altman-i-no-longer-think-were-gonna-be-able-to-just-patch-all-the-bugs-2000829947"}, {"title": "LiteLLM: Meldung der Entwickler zu Version 1.107.0 (21.10.2026)", "url": "https://github.com/BerriAI/litellm/issues/47826"}]
image: "titel.webp"
image_label: "Bild: mit KI erstellt (gpt-image-2.5-sunburst, 10/2026)"
image_alt: "Ein gefaltetes Vorhängeschloss aus blauem Karton mit einem Riss, geflickt mit rotem Klebeband, daneben zwei alte Schlüssel, eine leere Karteikarte mit drei Spalten und ein Rotstift"
---

Kurz gesagt: KI findet inzwischen Sicherheitslücken, die Fachleute jahrelang übersehen haben, und zwar schnell. Das können die Guten, und das können die anderen. Für ein Bildungshaus, ein Steuerbüro oder einen Handwerksbetrieb ohne eigene IT heißt das nicht, dass jetzt alle Sicherheitsprofis werden müssen. Es heißt, drei Dinge zu wissen: was bei uns läuft, wer sich darum kümmert und wie schnell, und wer entscheidet, wenn es brennt.

## Was ist im Oktober passiert?

Am 21. Oktober 2026 kam eine Meldung, die viele nervös gemacht hat. PHP, die Technik hinter den meisten Websites, hatte zwei schwere Lücken. Jede WordPress-Seite läuft auf PHP. Die Lücken steckten seit 2012 im Code. Ein Sicherheitsteam hat eine davon mit Hilfe von KI gefunden, ein zweites Team ist unabhängig auf beide gestoßen.

Was mich an der Geschichte am meisten beschäftigt: 2024 hatten Fachleute PHP schon einmal gründlich geprüft und ein verwandtes Problem gesehen. Repariert wurde es nicht, weil niemand zeigen konnte, dass man es wirklich ausnutzen kann. Zwei Jahre später konnte das ein kleines Team mit KI.

Und wie so oft lief es nicht nach Plan. Laut Amazon gab es den ersten Angriffsversuch schon am 17. Oktober, vier Tage vor dem Update, als die Lücken offiziell noch geheim waren. Einen Tag vor dem Update sickerten dann Details durch, und am 21. Oktober kamen die Angriffe schon am Vormittag, das Update erst am Nachmittag. Amazon schreibt dazu einen Satz, der hängen bleibt: Eine Geheimhaltung schützt nur so lange, bis jemand anderer denselben Fehler findet. In den Niederlanden hat die Regierung vorsorglich Seiten vom Netz genommen, sogar das Bürgerportal DigiD.

## Wird jetzt alles gehackt?

Nein. Zwei Tage nach dem Update zählten Sicherheitsfirmen Millionen Angriffsversuche, aber noch keine einzige bestätigte Übernahme einer Website. Die Angreifer taten sich schwerer als befürchtet. Wer eine gepflegte Seite bei einem Anbieter hat, der Updates rasch einspielt, konnte in Ruhe Kaffee trinken.

Das eigentliche Problem sind die Seiten, um die sich keiner mehr kümmert. Die alte Projektseite von 2019. Das Anfrageformular, das ein Praktikant gebaut hat und das seither einfach läuft. Der kleine Onlineshop. Die Lernplattform auf einem Server, bei dem keiner mehr genau weiß, wer eigentlich zuständig ist. Ich kenne kaum einen Betrieb, kaum ein Büro und kaum ein Bildungshaus, wo es so etwas nicht gibt. Und genau dort wird es jetzt ernster, weil solche Lücken schneller gefunden werden als früher.

## Was ändert sich durch KI wirklich?

Das Suchen wird billig. Was früher Monate Expertenarbeit war, schafft ein kleines Team mit KI in wenigen Wochen. OpenAI-Chef Sam Altman hat es laut einem Bericht von Gizmodo in einem Gespräch an der Universität Stanford, veröffentlicht am 21. Oktober, so gesagt: „Ich glaube nicht mehr, dass wir einfach alle Fehler beheben können.“ Und er meinte auch, dass die meisten Führungskräfte das Thema schon wieder abgehakt haben, während die Modelle immer besser werden.

Sein Rezept: Verteidigung mit derselben Technik, also mit KI. Für Konzerne stimmt das wahrscheinlich. Man darf aber dazusagen, dass er genau diese Technik verkauft. Für einen Betrieb mit zwölf Leuten ist die Technik selten das Problem. Das Problem ist, dass im entscheidenden Moment keiner weiß, ob die eigene Seite betroffen ist, wer sie betreut und wer sagen darf: Wir drehen sie heute ab.

Bei uns am Land weiß bei der Feuerwehr jeder, wo der nächste Hydrant ist und wer den Kommandanten anruft. Das ist kein Spezialwissen. Das ist Hausverstand, organisiert. Genau das fehlt bei der IT in vielen Organisationen.

Damit ändert sich auch die Rolle der Sicherheitsleute. Das Suchen und das Lesen von Warnungen übernimmt immer mehr die KI. Was bei den Menschen bleibt, ist das Urteil: Was ist für uns wichtig? Was zuerst? Wen rufen wir an? Das ist dieselbe Frage, die ich in jedem Workshop stelle: Wo lassen wir uns Arbeit abnehmen, und wo das Denken?

## Was kann jede Leitung selbst tun?

Drei Dinge, und für keins davon braucht man ein Informatikstudium.

**Wissen, was man hat.** Ein Blatt Papier reicht: Website, Anmelde- oder Bestellsystem, Lernplattform oder Kundenportal, Mail, und bei jedem die Technik dahinter. Schreiben Sie auch auf, was Sie nicht haben. „Kein eigener Server“ ist eine Zeile, die im Ernstfall viel Zeit spart.

**Wissen, wer sich kümmert, und wie schnell.** Neben jede Zeile ein Name: Webagentur, Hoster, IT-Dienstleister. Und eine Frage, die man einmal stellt und dann nie wieder vergisst: Wie schnell sichern Sie ab, wenn eine kritische Lücke bekannt wird, und wie erfahren wir davon?

**Wissen, wer entscheidet, wenn es brennt.** Wer darf sagen, dass die Website einen Tag offline geht? Gibt es eine Sicherungskopie? Und hat die schon einmal jemand zurückgespielt? Eine Sicherung, die nie getestet wurde, ist eine Hoffnung, keine Sicherung.

> **Ein Beispiel (erfunden):** Das Bildungswerk Apfelland hat keine IT-Abteilung. Am 21. Oktober liest die Leiterin von der PHP-Lücke und hat keine Ahnung, ob es ihr Haus betrifft. Sie schreibt der Webagentur drei Fragen: Läuft unsere Seite auf PHP? Ist das Update drauf? Wie erfahren wir das nächste Mal davon? Um zehn Uhr kommt die Antwort: betroffen, abgesichert, Update am Nachmittag. Seither steht die PHP-Version auf ihrem Blatt, und im Vertrag steht, dass sich die Agentur bei kritischen Lücken von selbst meldet. Aufwand: eine Mail.

## Wo hilft KI, und wo nicht?

KI kann die Wache übernehmen. Bei mir läuft seit dem 21. Oktober jeden Tag eine KI-Routine. Sie liest die neuen Sicherheitsmeldungen und vergleicht sie mit meiner Liste. Melden tut sie sich nur, wenn mich etwas betrifft. Sie ändert nichts selbst. Ein Update spielt sie erst ein, wenn ich Ja sage.

Eine Lehre aus den ersten Tagen gebe ich gern weiter, auch wenn sie mir nicht ganz angenehm ist. Am Abend des 21. Oktober bekam ich eine Zusammenfassung, laut der ein bekanntes KI-Werkzeug namens LiteLLM in einer bestimmten Version manipuliert worden war. Unsere Nachprüfung fand nur einen älteren Vorfall mit anderen Versionsnummern und erklärte die Meldung für falsch. Drei Tage später habe ich bei den Entwicklern selbst nachgeschaut. Es gab zwei Vorfälle, die Meldung hatte recht. Mich hat es nicht betroffen, ich nutze das Werkzeug nicht. Aber seither gilt bei mir: Wenn sich zwei Angaben widersprechen, zählt die Meldung des Herstellers vom selben Tag. Nicht die Zusammenfassung, und auch nicht die Erinnerung an einen älteren Fall.

Was die KI nicht übernehmen kann, ist die Entscheidung. Ob die Anmeldeseite einen Tag offline geht, entscheidet jemand, der weiß, dass nächste Woche die Herbstkurse starten. Ob der Onlineshop vom Netz geht, entscheidet jemand, der weiß, was ein Tag ohne Bestellungen kostet.

## Was das für Sie heißt

1. **Das Blatt anlegen.** Drei Spalten: was läuft, mit welcher Technik, wer sich kümmert. Mit Ihrer Agentur oder Ihrem Dienstleister ist das in einer Stunde erledigt.
2. **Die eine Frage stellen.** Schreiben Sie Ihrer Webagentur oder Ihrem Hoster: Wie schnell sichern Sie bei kritischen Lücken ab, und wie erfahren wir davon?
3. **Einen Satz für den Notfall aufschreiben.** Wer darf ein System vom Netz nehmen, und wer wird dann informiert?

## Häufige Fragen

**Muss ich jetzt selbst nachschauen, ob unsere Website auf PHP läuft?**
Nein. Fragen Sie Ihre Webagentur oder Ihren Hoster. Eine Lücke in PHP lässt sich nicht im Inhalt der Website beheben, sondern nur mit einem Update auf dem Server. Das macht der, der den Server betreibt.

**Wir haben WordPress. Sind wir betroffen?**
WordPress läuft auf PHP, also war Ihre Seite vermutlich betroffen. Ob sie es noch ist, hängt davon ab, ob Ihr Hoster das Update vom 21. Oktober eingespielt hat. Das sagt er Ihnen in einem Satz. Fragen Sie gleich mit, ob er auch die Einstellung gegen die zweite, viel unwahrscheinlichere PHP-Schwachstelle gesetzt hat, auf die PHP am 23. Oktober hingewiesen hat.

**Brauchen wir jetzt eine KI für die Sicherheit?**
Nicht als Erstes. Zuerst kommen das Blatt, die Zuständigkeiten und automatische Updates, wo es sie gibt. Eine KI-Routine, die Warnungen liest, ist eine gute Ergänzung, wenn Ihre Organisation schon ein freigegebenes KI-Werkzeug hat.

**Ist so eine Liste nicht selbst heikel?**
Ja. Sie zeigt, wo man angreifen könnte. Nach der [Datenampel](/impulse/datenampel-welche-daten-in-ki-tools/) ist sie mindestens Gelb: Sie gehört nur in ein KI-Programm, das Ihre Organisation offiziell erlaubt hat, nie in ein privates Gratis-Konto.

**Wird das jetzt öfter passieren?**
Ziemlich sicher. Wenn KI das Suchen billiger macht, werden mehr alte Lücken gefunden, von beiden Seiten. Kein Grund zur Panik. Aber ein guter Grund, die drei Fragen oben einmal ordentlich zu beantworten.
