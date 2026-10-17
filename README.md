# Games-for-Cece

Lernspiele für Cece – im gleichen Stil wie [Game-of-Cece](https://github.com/blablubbbb/Game-of-Cece),
aber mit Schulstoff statt reinem Spaß. Startseite mit Kacheln, Münzen werden
im Browser gespeichert.

Reines HTML, CSS und JavaScript. Kein Build, keine Bibliotheken – einfach
`index.html` öffnen oder über GitHub Pages aufrufen.

## Spiele

| Spiel | Fach | Was geübt wird |
|---|---|---|
| [Verben](verbos.html) | Spanisch | Die Personalformen von `ser` und der regelmäßigen Verben auf `-ar`, `-er` und `-ir` |
| [Einmaleins](einmaleins.html) | Mathe | Mal und Geteilt bis 100, mit Schatzkarte und Rekorden |
| [Uhrzeit](hora.html) | Spanisch | Die Uhrzeit auf Spanisch, analog und digital |
| [Avatar](avatar.html) | — | Figur zusammenstellen, Teile mit Münzen kaufen |

Alle Spiele teilen sich ein **Fehlergedächtnis** (`fallos.js`): Jedes merkt
sich pro Aufgabe, wie oft sie saß und wie oft nicht. Was wackelt, kommt
häufiger dran, und was gerade danebenging, kommt drei bis sieben Aufgaben
später noch einmal. Das überlebt das Schließen des Browsers.

### Verben (`verbos.html`)

Oben steht eine Person und ein Verb, zum Beispiel **tú · hablar**. Von oben
fallen drei Formen desselben Verbs in drei Bahnen – nur eine passt zur Person.
Den Korb mit ◀ ▶ (oder den Pfeiltasten, oder direkt auf die Bahn tippen) unter
die richtige Form schieben, bevor sie unten ankommt. Wer die Form schon weiß,
drückt ⬇ (oder Leertaste) und muss nicht warten.

Das Tempo zieht bei jedem richtigen Wort ein wenig an: 13,8 Sekunden am Anfang,
2 Sekunden nach 40 Wörtern, 1 Sekunde nach 60, ab 80 Wörtern bleibt es bei einer
halben Sekunde. Nachregeln geht über die Tabelle `TEMPO` in `verbos.html`.

* Richtig gefangen: 1 Münze, fünf in Folge geben 3 extra.
* Falsch gefangen: ein Herz weg, die richtige Form wird kurz gezeigt.
* Nach drei Herzen ist Schluss – dann listet das Spiel auf, welche Formen
  noch wackeln.

#### Die drei Level

Beim Start wird gewählt, die Wahl wird gemerkt. Nach dem Spielende geht es über
*Anderes Level* zurück zur Auswahl.

| | Unidad | Verben | Wie oft |
|---|---|---|---|
| **Nivel 1** | bis Unidad 1 | `ser` · die `-ar`-Verben | ser 30 %, -ar 70 % |
| **Nivel 2** | bis Unidad 2 | dazu die regelmäßigen `-er`- und `-ir`-Verben | ser 15 %, -ar 25 %, -er 30 %, -ir 30 % |
| **Nivel 3** | bis Unidad 5 | `ir` und die nahe Zukunft `ir a` + Infinitiv | 30 % nur `ir`, 70 % ganze Wendung |

`ser` kommt in Nivel 1 absichtlich viel häufiger dran als ein einzelnes
`-ar`-Verb: es ist das einzige unregelmäßige und muss sitzen. Zum Nachregeln
reicht die Tabelle `NIVELES` in `verbos.html`.

Nivel 2 zielt auf die eine Stelle, an der `-er` und `-ir` sich überhaupt
unterscheiden: `comemos`/`coméis` gegen `vivimos`/`vivís`. In allen anderen
Personen sind die Endungen gleich — das Spiel bietet dort automatisch keine
`-er`/`-ir`-Verwechslung an, weil es keine gibt.

Nivel 3 hat zwei Sorten Aufgaben. Ohne Markierung ist einfach `ir` zu
konjugieren (**vosotros · ir** → `vais`). Steht unter dem Verb die Marke
**mañana**, ist die nahe Zukunft gefragt: **ella · vivir · mañana** → `va a
vivir`. Nur `ir` wird konjugiert, das zweite Verb bleibt im Infinitiv — und
genau da passieren die Fehler, deshalb stehen als Ablenker `va a vive`
(zweites Verb mitkonjugiert) und `va vivir` (das `a` vergessen) daneben.

#### Die Ablenker

Normalerweise sind es andere Personalformen **desselben** Verbs. Raten über den
Wortstamm bringt also nichts, es geht wirklich um die Endung.

In etwa 40 % der Aufgaben ist einer der beiden Ablenker stattdessen die
*gefragte* Person mit einer **falschen Endung** – also genau der Fehler, den man
selbst macht: `somos → seramos`, `hablamos → hablemos`, `comemos → comimos`.
Steuern lässt sich das über `P_ENDING_FALSO`. Bei der ich-Form gibt es keine,
weil alle drei Gruppen dort auf `-o` enden.

Die erfundenen `ser`-Formen (`so`, `ses`, `sere`, `semos`, `seramos`, `séis`,
`serís`, `sen`, `seren`) sind bewusst keine echten spanischen Wörter. Bei den
regelmäßigen Verben geht das nicht immer: `hablemos` oder `comimos` gibt es
wirklich, nur eben im subjuntivo bzw. im indefinido. Das Spiel behauptet nie,
dass es die Formen nicht gibt — es fragt nach dem presente zu einer bestimmten
Person, und dafür sind sie falsch.

#### Wortschatz

Alles aus ¡Apúntate! 1 (Ausgabe 2024), und nur Verben, die vollständig
regelmäßig sind:

* `-ar` (Unidad 1): hablar, estudiar, escuchar, mirar, tocar, buscar, charlar,
  tomar, quedar, pasar, descansar
* `-er` (Unidad 2): comer, beber, leer, aprender, esconder, responder
* `-ir` (Unidad 2): vivir, escribir, compartir, discutir, abrir
* unregelmäßig: `ser` (Unidad 1), `ir` (Unidad 5)

`hacer` und `ver` stehen zwar auch in Unidad 2, haben aber eine unregelmäßige
ich-Form (`hago`, `veo`) und bleiben deshalb draußen — sonst würde das Spiel
falsche Endungen antrainieren.

### Einmaleins (`einmaleins.html`)

Eine Aufgabe, eine Zifferntastatur, ein Zeitbalken. Stimmt die getippte Zahl,
geht es sofort weiter — das hält das Tempo hoch. Mit ✓ kann man auch eine
falsche Antwort abschicken, mit ⌫ korrigieren. Am Computer gehen die
Zifferntasten, Rücktaste und Enter.

Gerechnet wird das kleine Einmaleins von 1·1 bis 10·10, etwa ein Drittel der
Aufgaben als Division (`56 : 7`). Die Bedenkzeit schrumpft mit jeder richtigen
Antwort von 9 auf 3,5 Sekunden (Tabelle `TIEMPO`).

**Die Schatzkarte** ist das Herz des Spiels: 10×10 Felder, eines pro Aufgabe.

* grau — noch nie drangekommen
* lila — schon mal da, sitzt aber noch nicht
* rot — wackelt (weniger als die Hälfte richtig)
* gold — sitzt (mindestens dreimal richtig und drei Viertel aller Versuche)

`7·8` und `8·7` sind dasselbe Wissen, deshalb leuchten immer beide Felder
zusammen und die Karte ist symmetrisch. Sie füllt sich über Wochen und zeigt
auf einen Blick, was noch fehlt.

Rekorde (längste Serie, meiste richtige, schnellste Antwort) bleiben
gespeichert. Münzen gibt es wie im Verbenspiel: eine pro richtiger Antwort,
drei extra für jede fünfte in Folge. Nach drei Fehlern ist die Runde vorbei.

### Uhrzeit (`hora.html`)

Zwei Richtungen im Wechsel. Meistens zeigt eine Uhr die Zeit und der passende
Satz ist unter dreien zu finden; in etwa vier von zehn Aufgaben steht der Satz
da und die richtige von drei Uhren ist gesucht.

Die Uhr ist mal analog, mal digital — nie beides zugleich. Von beiden gibt es
drei Ausführungen: das Zifferblatt mit allen zwölf Zahlen, nur `3 6 9 12` oder
ganz ohne, und als Digitaluhr einen Wecker mit Leuchtziffern, eine Klappanzeige
wie am Bahnhof oder einen Handy-Sperrbildschirm.

**Sprachlich genau im Rahmen von Módulo 3:** `Es la una` gegen `Son las ...`,
`en punto`, `y cuarto`, `y media`, `menos cuarto` und `y`/`menos` + Minutenzahl
in Fünferschritten.

Die Hälfte der Digitaluhren zeigt **24 Stunden** — dann ist auch die Tageszeit
gefragt: `15:30` heißt `Son las tres y media de la tarde`. Weil der Satz ab 35
Minuten schon die nächste Stunde nennt, richtet sich die Tageszeit nach der
*genannten* Stunde. Ausgelassen sind 12 Uhr mittags, 20 Uhr (da gehen `tarde`
und `noche` beide) und die Nacht zwischen 0 und 6, für die das Buch kein Wort
anbietet — es bleiben 177 eindeutige Uhrzeiten.

Die Ablenker sind die Fehler, die man als Deutsche:r wirklich macht:

* **Die Stunde nicht weitergedreht.** 3:45 heißt `Son las cuatro menos cuarto`,
  nicht `las tres`. Genau dieser Satz steht als Ablenker daneben.
* **`y` statt `menos`.** Aus „Viertel vor vier" wird schnell `Son las tres y
  cuarto` — auch das steht zur Wahl.
* **`cuarto` und `media` verwechselt.**
* **Der Artikel.** `Son las una` oder `Es la tres` kommt in jeder vierten
  Aufgabe als Falle vor.
* **Die falsche Tageszeit.** Bei 24-Stunden-Aufgaben steht in der Hälfte der
  Fälle derselbe Satz mit `de la noche` statt `de la mañana` daneben. Wird
  andersherum nach der Uhr gefragt, ist der Ablenker dieselbe Zeit in der
  anderen Tageshälfte: `15:30` gegen `03:30`.

### Avatar (`avatar.html`, `avatar.js`)

Hier gibt sie die Münzen aus, die sie in den Spielen sammelt. Sieben Rubriken:
Haut, Haare, Haarfarbe, Augen, Kleidung, Extra und Hintergrund.

Von jeder Rubrik gehört ihr die **Grundausstattung** von Anfang an. Alles
andere kostet Münzen, zwischen 25 und 220. Was sie sich gerade leisten kann,
steht mit Preis da und lässt sich antippen; es wird erst am Avatar gezeigt und
dann gefragt, ob sie es wirklich kauft. Was sie sich **noch nicht leisten
kann, ist ausgegraut** und sagt beim Antippen, wie viele Münzen noch fehlen —
sichtbar bleibt es trotzdem, damit es etwas zum Sparen gibt.

Der gekaufte **Hintergrund** gilt für beides: für das Avatarbild und für die
Auswahlseite selbst. Bei den dunklen (Nacht, Weltall) wird die Schrift hell.

#### Zwei Ansichten aus einer Teileliste

Jedes Teil wird in beiden Ansichten gezeichnet: **von vorne** zum
Zusammenstellen und **von der Seite** (nach rechts schauend) für ein Spiel, in
dem die Figur läuft. Die Haare liegen dabei in zwei Lagen — was hinten hängt,
wird vor dem Kopf gezeichnet, der Rest danach, sonst landen lange Haare in der
Seitenansicht im Gesicht.

#### Für das andere Repo

`avatar.js` hängt an nichts. Ein anderes Spiel auf derselben Domain lädt die
Datei und hat denselben Avatar:

```html
<script src="avatar.js"></script>
<script>
  const yo = Avatar.cargar();
  spielfigur.innerHTML = Avatar.dibujar(yo, "lado");   // oder "frente"
</script>
```

Gespeichert wird im `localStorage`, den sich alle Seiten der Domain teilen:

| Schlüssel | Inhalt |
|---|---|
| `cece-avatar` | `{ partes: { piel, pelo, colorPelo, ojos, ropa, extra, fondo }, compradas: ["extra:gorro", …] }` |
| `cece-coins` | Münzen, geteilt mit allen Spielen |
| `cece-fallos` | Fehlergedächtnis (siehe oben) |

`Avatar.dibujar(sel, vista, { fondo: false })` zeichnet ohne Hintergrund —
praktisch, wenn die Figur in einer eigenen Szene stehen soll.
