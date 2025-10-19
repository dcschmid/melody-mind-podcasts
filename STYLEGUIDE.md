# Melody Mind Podcast Styleguide

## Titel

Neue Längenanforderung (v2): Jeder Titel 55–65 Zeichen (inkl. Leerzeichen & Emoji). Früherer Wort-/Zeichenzielbereich ist obsolet.

Formel: `<Thema oder Kategorie>: <prägnante Hook mit 2–3 starken Nomen oder Gegensätzen> <Emoji>`

### Sonderregel: Dekaden-Titel

Für Jahrzehnte (1950s, 1960s, … 2010s) wird KEIN Doppelpunkt verwendet, sondern ein Gedankenstrich (en dash `–`) nach der Dekaden-Bezeichnung.

Aktuelles Pattern Beispiel: `1950s – Spark That Ignited Rock & Roll's Youthquake Era 🎸`

Regeln für Dekaden-Titel:

1. Struktur: `<YYYYs>` + ` – ` + Hook (Großschreibung konsistent wie bei anderen Titeln)
2. Hook 4–8 Wörter, Gesamtziel Titel 6–8 Wörter
3. Ein finales Emoji laut Mapping (siehe unten)
4. Keine abweichenden Satzzeichen (kein zusätzlicher Doppelpunkt oder Bindestrich statt Gedankenstrich)
5. Keine abschließenden Punkte

Beispiele:

- `1980s – Neon Dreams & Global Anthems 🔊`
- `Female Pop Superstars: Reinvention, Resilience & Glitter ✨`
- `Floor Jansen: Operatic Precision, Human Fire 🔥`

Regeln (aktualisiert):

1. Kein abschließender Punkt im Titel.
2. Gesamtzeichenzahl (kompletter Titel inkl. Emoji) muss zwischen 55 und 65 liegen (hartes Minimum/Maximum).
3. Ein einziges thematisch passendes Emoji am Ende (siehe Mapping). Keine mehrfachen Emojis.
4. Großschreibung für Hauptwörter; Ampersands (`&`) für knappe Verknüpfung.
5. Bei Dekaden zwingend en dash, kein Colon.
6. Falls semantisch nötig für Ziel-Länge: zulässige Erweiterungen durch kurze prägnante Zusätze (`Era`, `Explode`, `Mosaic`, `Frontier`, etc.).

## Description (Kurztext im JSON)

Neue Längenanforderung (v2): Gesamtzeichen (inkl. Leerzeichen & Emoji) pro Description 250–300 Zeichen. Frühere Wortbasierten Ziele (22–36 Wörter) sind verworfen.

Struktur:

1. 2–3 dichte Sätze: thematisch-emotionale Zusammenfassung (1–2 Sätze) + CTA (abschließender Satz).
2. Host-Erwähnung obligatorisch: `Daniel and Annabelle guide you...` oder Variante `Daniel and Annabelle guide you through ...` im ersten oder zweiten Satz vor CTA.
3. CTA beginnt immer exakt mit: `Press play and ...`
   - Danach kraftvolles Verb + verdichtetes Bild (keine zweite Person `you` im CTA selbst, kein Ausrufezeichen).
4. CTA schließt mit genau EINEM passenden Emoji laut Mapping.
5. Zeichenlänge muss zwischen 250 und 300 liegen. Kürzen oder erweitern durch präzise, sinnvolle Details (keine Füllwörter).
6. Vermeide redundante Wiederholung des Episodentitels in der Description.

Beispiele korrekter CTA:

- `Press play and feel expectations shatter. 🤘`
- `Press play and let history speak. 🕯️`
- `Press play and hear evolution roar. 🔥`

## Emoji-Mapping (Primär-Emoji pro Kategorie)

Dekaden:

- 1950s 🎸
- 1960s ✌️
- 1970s 🌈
- 1980s 🔊
- 1990s 🌀
- 2000s 💽
- 2010s 🌍

Genres & Szenen:

- Orchestral 🎼
- Soundtrack 🎧 (alternativ 🎞️ im Fließtext möglich)
- Opera 🎶
- Classical 🕯️ (Zeitlosigkeit)
- Chamber Music 🤲
- New Age 🌌
- Piano 🎹

Stil-/Female-Fokus Episoden:

- Female Blues Legends 🎤
- Female Country Stars 🤠
- Female DJs 🎧
- Female Grunge Artists ⚡
- Female Hip-Hop Artists 🎤
- Female Rappers 🔥
- Female Jazz Vocalists 🎷
- Female Pop Superstars ✨
- Female R&B Divas 💜
- Female Rock & Metal Vocalists 🤘
- Female Soul Legends 🎙️
- Female Vocal Icons 👑

Einzelkünstler (bestehende Episoden):

- Cristina Scabbia 🌘
- Sharon den Adel 🌩️
- Amy Lee 🕯️
- Charlotte Wessels 🦋
- Doro Pesch ✊
- Floor Jansen 🌋
- Simone Simons 🌌
- Tarja Turunen ❄️

Regeln Emojis:

- Ein Emoji pro Beschreibung, am Ende hinter einem Punkt (falls Satz endet) oder direkt ohne zusätzlichen Text.
- Keine Mischungen zweier Emojis, kein Wechseln zwischen Synonymen ohne triftigen Grund.
- Ausnahme: Wenn Thema später erweitert wird und Primär-Emoji bereits belegt, kann ein Sekundär-Emoji definiertermaßen ergänzt werden (Dokument erweitern).

## Sprachstil

- Aktiv, bildhaft, keine Füllfloskeln.
- Mix aus konkreten Substantiven + sensorischen Verben.
- Vermeide generische Wörter wie "interesting", "nice", "very".
- Keine Ausrufezeichen im CTA.

## Qualitäts-Checkliste vor Merge (v2)

- Titel zwischen 55–65 Zeichen, Formel & Emoji korrekt.
- Description 250–300 Zeichen, Host-Erwähnung enthalten.
- CTA Satz startet exakt `Press play and ...` + genau ein Emoji am Ende.
- Keine doppelten JSON-Keys.
- Emoji stimmt mit Mapping.
- Keine überlangen oder zu kurzen Texte (Messung über Skript `measure-lengths.mjs`).

## Fehlerklassen & Korrektur

| Fehler | Beispiel | Korrektur |
|--------|----------|-----------|
| Falscher CTA-Start | `Hit play to...` | `Press play and ...` |
| Fehlendes Emoji | (kein Emoji) | Emoji laut Mapping anfügen |
| Falsches Emoji | `Female Jazz Vocalists ... 🎤` | Ersetzen durch 🎷 |
| Mehrere Emojis | `... 🌍✨` | Auf Primär-Emoji reduzieren |

## Erweiterung

Neue Kategorien: Primär-Emoji wählen nach: (1) Eindeutigkeit, (2) semantische Passung, (3) Verwechslungsfreiheit mit existierenden. Dokument aktualisieren.

---

Version: 2.0 (Änderungen: Zeichenbasierte Längen + Host-Erwähnung Pflicht)
