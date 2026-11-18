# Games-for-Cece

Lernspiele für Cece – im gleichen Stil wie [Game-of-Cece](https://github.com/blablubbbb/Game-of-Cece),
aber mit Schulstoff statt reinem Spaß. Startseite mit Kacheln, Münzen werden
im Browser gespeichert.

Reines HTML, CSS und JavaScript. Kein Build, keine Bibliotheken – einfach
`index.html` öffnen oder über GitHub Pages aufrufen.

Der Titel **Games for Cece** auf der Startseite ist ein versteckter Link nach
[Game of Cece](https://blablubbbb.github.io/Game-of-Cece/) — und dort führt der
Titel genauso hierher zurück. So kommt man ohne Umweg zwischen beiden Seiten
hin und her, ohne dass eine Kachel dafür draufgeht.

## Spiele

| Spiel | Fach | Was geübt wird |
|---|---|---|
| [Verben](verbos.html) | Spanisch | Die Personalformen von `ser` und der regelmäßigen Verben auf `-ar`, `-er` und `-ir` |
| [Einmaleins](einmaleins.html) | Mathe | Mal und Geteilt bis 100, mit Schatzkarte und Rekorden |
| [Uhrzeit](hora.html) | Spanisch | Die Uhrzeit auf Spanisch, analog und digital |
| [ser · estar · hay](estar.html) | Spanisch | Welches der drei Wörter in die Lücke gehört |
| [Kreuzwort](crucigrama.html) | Spanisch | Vokabeln schreiben – Frage auf Deutsch, Wort auf Spanisch |
| [Salat](sopa.html) | Spanisch | Dieselben Fragen, aber das Wort im Buchstabengitter finden |
| [Paare](parejas.html) | Spanisch | Spanisch und Deutsch zuordnen — wahlweise gehört statt gelesen |
| [Lücken](huecos.html) | Spanisch | Satz mit Lücke — Verbform, Artikel oder passendes Wort |
| [Avatar](avatar.html) | — | Figur zusammenstellen, Teile mit Münzen kaufen |

Alle Spiele teilen sich ein **Fehlergedächtnis** (`fallos.js`): Jedes merkt
sich pro Aufgabe, wie oft sie saß und wie oft nicht. Was wackelt, kommt
häufiger dran, und was gerade danebenging, kommt drei bis sieben Aufgaben
später noch einmal. Das überlebt das Schließen des Browsers.

Dazu teilen sie sich die **Bestmarken** (`marcas.js`). Jedes Spiel hält fest:
beste Runde, längste Serie und meiste richtige Antworten, das Einmaleins
außerdem die schnellste Antwort. Die Übersicht über alles liegt auf
[`marcas.html`](marcas.html) und ist oben links auf der Startseite verlinkt.

In den Spielen selbst steht in der Kopfzeile **nicht** mehr der Münzstand,
sondern was diese Runde eingebracht hat und daneben der Rundenrekord — so
sieht man beim Spielen, ob man gerade dabei ist, ihn zu schlagen. Gesammelt
werden die Münzen natürlich weiter, zu sehen sind sie auf der Startseite und
im Avatar. Am Rundenende gibt es neben *Nochmal* auch *Zurück*.

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
| **Nivel 2** | bis Unidad 5 | dazu die regelmäßigen `-er`/`-ir`-Verben und die drei Einzelfälle | ser 12 %, -ar 20 %, -er 25 %, -ir 25 %, Einzelfälle 18 % |
| **Nivel 3** | bis Unidad 5 | `ir` und die nahe Zukunft `ir a` + Infinitiv | 30 % nur `ir`, 70 % ganze Wendung |
| **Nivel 4** | bis Unidad 5 | die Gruppenverben `quiero`, `puedo` | nur Gruppenverben |

`ser` kommt in Nivel 1 absichtlich viel häufiger dran als ein einzelnes
`-ar`-Verb: es ist das einzige unregelmäßige und muss sitzen. Zum Nachregeln
reicht die Tabelle `NIVELES` in `verbos.html`.

**Nivel 4** dreht sich um die eine Regel, die bei Gruppenverben zählt: der
Stamm ändert sich überall — *außer* bei `nosotros` und `vosotros`.

> quiero · quieres · quiere · **queremos** · **queréis** · quieren

Daraus ergeben sich beide Fehlerrichtungen von selbst, und beide stehen als
Ablenker daneben: den Stammwechsel **vergessen** (`quiero` → `quero`,
`puedo` → `podo`) und ihn **zu viel** anwenden (`queremos` → `quieremos`,
`podéis` → `puedéis`). Weil das hier die eigentliche Lektion ist, kommt der
falsche Stamm in diesem Level in 60 % der Aufgaben vor statt in 40 %.

Nivel 2 zielt auf die eine Stelle, an der `-er` und `-ir` sich überhaupt
unterscheiden: `comemos`/`coméis` gegen `vivimos`/`vivís`. In allen anderen
Personen sind die Endungen gleich — das Spiel bietet dort automatisch keine
`-er`/`-ir`-Verwechslung an, weil es keine gibt.

Dazu laufen in Nivel 2 die drei **Einzelfälle** `hacer`, `salir` und `ver` mit.
Die sind völlig regelmäßig — bis auf die ich-Form. Genau dort steht deshalb die
regelmäßig gebildete Form als Falle daneben: `hago` gegen `haco`, `salgo` gegen
`salo`, `veo` gegen `vo`. Bei `ver` wäre fast jede weitere gebaute Fehlform ein
echtes Wort von `ir` (`vas`, `vamos`), deshalb gibt es dort nur noch eine:
`véis` statt des richtigen `veis`, das einsilbig ist und keinen Akzent trägt.

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
* nur in der ich-Form unregelmäßig: `hacer`, `ver` (Unidad 2), `salir` (Unidad 4)
* Gruppenverben `e → ie`: querer, pensar, empezar, entender, preferir, tener
* Gruppenverben `o → ue`: poder, volver, contar, encontrar

Die Gruppenverben stehen so im Konjugationsanhang des Buchs (S. 149/150).
`tener` gehört dazu, hat aber zusätzlich eine unregelmäßige ich-Form
(`tengo`), und steht deshalb ausgeschrieben im Code.

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

Hier gibt sie die Münzen aus, die sie in den Spielen sammelt. Neun Rubriken:
Haut, Haare, Haarfarbe, Augen, Kleidung, Hose, Schuhe, Extra und Hintergrund.
Ihr Kopf steht oben rechts auf der Startseite und führt hierher.

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

### ser · estar · hay (`estar.html`)

Ein Satz mit einer Lücke, drei Wörter zur Wahl. Die beiden falschen sind keine
Zufallswörter: zu jedem Satz stehen **ser und estar in genau der Person, die
der Satz braucht**, dazu `hay`. Zu *Mi hermana ___ alta* also `es`, `está`,
`hay` — zu *Mis amigos ___ en la heladería* dagegen `son`, `están`, `hay`.
Die Form ist damit nie das Problem, es geht wirklich um die Entscheidung
zwischen den drei Wörtern.

48 Sätze: 18 mit `ser`, 16 mit `estar`, 14 mit `hay`. Darunter die Paare, an
denen es hängt:

* *En el armario **hay** un gato* gegen *El gato **está** en el armario* —
  unbestimmt heißt `hay`, ein bestimmtes Ding an einem Ort heißt `está`.
* *Mi abuela **es** un poco estricta* gegen *Mamá **está** en la cocina* —
  wie jemand ist gegen wo jemand ist.

Nach einem Fehler bleibt der gelöste Satz stehen und darunter steht, warum:
„Wo etwas ist → estar“, „es gibt → hay“, „Eigenschaft → ser“. Am Rundenende
sind die verpassten Sätze samt Merksatz noch einmal aufgelistet.

Die Sätze stammen aus dem `Para comunicarse`-Anhang des Buchs, und **jedes
einzelne Wort ist gegen ihren ¡Apúntate!-Wortschatz geprüft** — es kommt
nichts vor, was sie nicht hatte.

### Kreuzwort (`crucigrama.html`, `puzles.js`)

Die Frage steht auf Deutsch, das Wort wird auf Spanisch eingetragen – **mit
Akzenten und ohne Artikel**. Damit übt das Spiel etwas, was die anderen nicht
abdecken: die Schreibung. Ankreuzen kann man auch mit halbem Wissen, `jardín`
hinschreiben nicht.

110 fertige Rätsel in vier Stufen, je acht Wörter:

| Stufe | Rätsel | verschiedene Wörter |
|---|---|---|
| Vorkurs | 25 | 44 |
| Unidad 1 | 30 | 84 |
| Unidad 2 | 30 | 101 |
| Alles gemischt | 25 | 134 |

Insgesamt 244 verschiedene Wörter, 45 davon mit Akzent oder `ñ`. Welches
Rätsel kommt, entscheidet das Fehlergedächtnis: zuerst die noch nicht
gespielten, und darunter das mit den meisten Wackelkandidaten. Erst wenn eine
Stufe durch ist, fängt sie von vorne an.

#### Die Fragen

Nicht einfach die Übersetzung. Zu 190 der 244 Wörter steht mindestens eine
eigene Frage im Spiel, im Schnitt zwei pro Wort, und welche erscheint, hängt
am Eintrag – dasselbe Wort wird in einem anderen Rätsel anders gefragt.

* **Umschrieben statt übersetzt** — *Dort stehen viele Bücher, aber kaufen
  kann man keines* → `biblioteca`, gegen *Dort kauft man Bücher* → `librería`.
  Genauso `lápiz` gegen `bolígrafo`.
* **Grammatik** — *1. Person Singular* → `yo`, oder, um die Ecke gedacht:
  *Sie ist die Schwester meines Bruders, aber nicht meine Schwester*.
* **Rechnen** — *7 + 5* → `doce`, *So viele Monate hat ein Jahr* ebenso.
* **Erdkunde** — *Das größte Land der Erde* → `rusia`.

Als Rückfallebene hängt an jedem Wort zusätzlich die deutsche Übersetzung aus
ihrem Wortschatz, damit kein Eintrag ohne Frage dasteht.

#### Tastatur

Eine eigene Tastatur statt der vom Handy. Grund ist die oberste Reihe:
`á é í ó ú ü ñ` liegen dort als normale Tasten. Auf der Systemtastatur müsste
sie den Vokal lange gedrückt halten und aus einem Menü wählen – so ist der
Akzent ein Tastendruck wie jeder andere. Das Rätsel bekommt dadurch auch den
ganzen Platz, den die Systemtastatur sonst einnähme.

Der 💡-Knopf verrät für drei Münzen einen Buchstaben. Er sitzt **in der
Fragezeile, nicht auf der Tastatur** – neben dem `ñ` würde ein Fehlgriff drei
Münzen kosten.

#### Wie geprüft wird

Sobald alle Felder eines Wortes voll sind, prüft das Spiel von selbst. Stimmt
es, wird es gelb und fest; stimmt es nicht, wackelt das Gitter und **genau die
falschen Buchstaben** werden rot – bei `jardin` also nur das `i`. Sie sieht
damit, *wo* es hakt, nicht nur *dass* es hakt. Die falschen Buchstaben bleiben
stehen, damit sie sie vergleichen kann.

Felder eines schon gelösten Wortes sind fest: ein Tippfehler im kreuzenden
Wort kann ein fertiges Wort nicht mehr kaputtmachen, und beim Schreiben
überspringt der Cursor sie.

#### Woher die Rätsel kommen

Die 110 Rätsel sind vorgefertigt und liegen in `puzles.js`, nicht im Browser
erzeugt. Die Skripte dazu liegen in [`herramientas/`](herramientas/) und sind
nachrechenbar — `python3 generar.py` liefert zweimal hintereinander dieselben
110 Rätsel, weil die Startwerte fest stehen (`hash()` wäre falsch gewesen:
Python würfelt den String-Hash bei jedem Prozessstart neu):

* `pool.py` – baut den Wortschatz aus ihrer Vokabelliste. Die Liste selbst
  liegt woanders, das fertige Ergebnis `pool.json` aber hier. Artikel fallen weg
  (`el/la amigo/-a` → `amigo`), Akzente bleiben, Ausdrücke mit mehreren
  Wörtern fliegen raus. 258 Wörter.
* `pistas.py` – die handgeschriebenen Fragen.
* `generar.py` – legt die Gitter. Längstes Wort zuerst, jedes weitere muss ein
  liegendes kreuzen, und `ú` und `u` gelten als verschiedene Buchstaben, sonst
  würde das Spiel Akzente verschlucken.
* `verificar.py` – prüft jedes fertige Rätsel noch einmal unabhängig nach:
  dass kein Wort aus Versehen entsteht, dass jedes Wort mindestens ein anderes
  kreuzt, dass das Gitter nicht in zwei Teile zerfällt, und dass kein Rätsel
  breiter als elf Felder wird – darüber werden die Kästchen auf dem Handy zu
  klein zum Lesen.

* `probar.js` – spielt alle 110 Rätsel im Browser durch, 873 Wörter auf den
  echten Tasten, und prüft nach jedem Wort, ob es erkannt, gelb markiert und
  mit Münzen belohnt wurde; dazu, dass jedes Gitter auf ein 360×640-Display
  passt und kein Kästchen unter 24 px fällt.
* `probar2.js` – die Randfälle: dass `jardin` ohne Akzent nicht durchgeht,
  dass der Tipp-Knopf ohne Münzen nichts verrät, dass ein gelöstes Wort nicht
  überschreibbar ist, und dass ein Tipp auf das *letzte* Feld eines Wortes
  keine Sackgasse ist — der Cursor springt an die erste Lücke, sonst hätte
  jeder weitere Buchstabe dasselbe Feld überschrieben.

### Buchstabensalat (`sopa.html`, `sopas.js`)

Dieselben Fragen wie beim Kreuzworträtsel, aber von der anderen Seite: dort
muss sie das Wort **schreiben**, hier muss sie es **wiedererkennen**. Das ist
die leichtere Hälfte derselben Vokabel und ein guter Einstieg, wenn ein Wort
noch wackelt.

90 fertige Salate in denselben vier Stufen, je acht Wörter in einem 11×11-Gitter:

| Stufe | Salate |
|---|---|
| Vorkurs | 20 |
| Unidad 1 | 25 |
| Unidad 2 | 25 |
| Alles gemischt | 20 |

Insgesamt 210 verschiedene Wörter von vier bis zehn Buchstaben. Kürzere wären
schlecht: ein Dreibuchstabenwort steht in einem vollen Gitter schnell zufällig
irgendwo.

#### Alle acht Richtungen

Wörter liegen waagerecht, senkrecht und diagonal, vorwärts wie rückwärts. Die
Richtungen sind gleichmäßig verteilt – rund 90 Wörter je Richtung –, denn wer
erst den Platz sucht und dann die Richtung nimmt, bekommt fast nur Waagerechte:
dafür gibt es in einem quadratischen Gitter geometrisch die meisten Plätze. Der
Generator geht darum umgekehrt vor und nimmt für jedes Wort die bisher am
wenigsten benutzte Richtung, in der es überhaupt passt.

Damit es einen Einstieg gibt, liegen in jedem Salat mindestens zwei Wörter
vorwärts.

#### Zwei Dinge, die ein Buchstabensalat leicht falsch macht

**Die Füllbuchstaben.** Wären sie gleichverteilt, stünden lauter k, w und x
herum und die echten Wörter stächen heraus. Gefüllt wird deshalb nach der
Buchstabenverteilung ihres eigenen Wortschatzes.

**Die Akzente.** Käme `í` nur in `jardín` vor, hätte sie das Wort gefunden,
ohne ein Wort gelesen zu haben. Die Füllung bekommt darum denselben
Akzentanteil wie das Wortmaterial: 2,7 % gegen 3,0 % in den Wörtern.

Dazu kommt eine Prüfung, die das Kreuzworträtsel nicht braucht: **keine Frage
darf ihre eigene Antwort enthalten.** `genial` heißt auf Deutsch „genial,
super, toll" – beim Kreuzworträtsel ist das in Ordnung, dort muss sie das Wort
ja trotzdem schreiben und `café` mit Akzent zu treffen ist die eigentliche
Übung. Hier wäre es geschenkt. Solche Fragen fliegen raus, und die fünf Wörter,
bei denen dann keine übrig bleibt (`somalia`, `café`, `cómic`, `póster`,
`sofá`), kommen im Salat gar nicht erst vor.

#### Wischen mit einem Kinderfinger

Mit dem Finger vom ersten zum letzten Buchstaben ziehen. Ein Kind trifft dabei
keine exakte Diagonale, also wird aus dem **Winkel** des Fingers die
nächstliegende der acht Richtungen bestimmt und die Länge darauf projiziert –
die Auswahl rastet ein, statt zu zappeln. Rückwärts gewischt zählt genauso.

Danebengegriffen ist beim Suchen normal und zählt deshalb **nicht** als Fehler;
ins Fehlergedächtnis kommt nur, wofür sie den Tipp-Knopf gebraucht hat.

Die Fragen stehen sichtbar unter dem Gitter statt hinter einem Knopf – über dem
Gitter bleibt ohnehin Platz, und sie soll beim Suchen sehen, wonach sie sucht.
Vor dem Fund steht dort nur die Länge („5 Buchst."), danach das Wort selbst in
der Farbe, in der es im Gitter markiert ist. Auf kurzen Bildschirmen gibt die
Leiste nach, nicht das Gitter: unter 24 px trifft ein Finger die Felder nicht
mehr.

#### Wie geprüft wird

* `sopa.py` – erzeugt die Salate, mit festen Startwerten, damit sie sich
  nachbauen lassen.
* `verificar_sopa.py` – rechnet jeden fertigen Salat unabhängig nach: dass
  jedes Wort wirklich an seinem Platz steht, dass es **genau einmal** im Gitter
  vorkommt (sonst wäre die Auswahl zweideutig), dass kein Wort in einem anderen
  steckt, dass keine Frage ihre Antwort verrät und dass die Akzentquoten von
  Wörtern und Füllung zusammenpassen.
* `probar_sopa.js` – spielt alle 90 Salate im Browser durch: 720 Wörter mit der
  echten Maus gewischt, davon 358 diagonal, 360 rückwärts und 180 mit
  absichtlich danebenem Finger.
* `probar_sopa2.js` – die Randfälle: dass ein Fehlgriff keine Münzen gibt und
  nicht ins Fehlergedächtnis wandert, dass der Tipp-Knopf ohne Münzen nichts
  verrät und sonst genau auf den Anfang des gesuchten Wortes zeigt.
* `medir_sopa.js` – misst den textreichsten Salat auf fünf Bildschirmgrößen von
  320×568 bis 414×896 nach.
* `probar_sopa3.js` – spielt mehrere Salate **ohne Neuladen** hintereinander,
  mit Levelwechsel über den Endbildschirm. Diese Lücke hatte die erste
  Testrunde: dort wurde vor jedem Salat neu geladen, und genau dadurch blieb
  unbemerkt, dass beim zweiten Salat das Gitter leer blieb.
* `probar_sesion.js` – dieselbe Prüfung fürs Kreuzworträtsel, weil es dieselbe
  Zeichenstruktur hat.

### Paare (`parejas.html`, `parejas.js`, `voz.js`)

Zwölf Kästchen, sechs Paare: spanisches Wort und deutsche Bedeutung
zusammenbringen. Die schnellste der Vokabelübungen — in einer Minute geht ein
Dutzend Abfragen durch, wo das Kreuzworträtsel für ein Wort so lange braucht.

Drei Arten:

| Art | Vorderseite | übt |
|---|---|---|
| **Zuordnen** | `jardín` ↔ der Garten | Wort und Bedeutung, alles offen |
| **Hören** | 🔊 ↔ der Garten | Hörverstehen; nach dem Fund erscheint die Schreibung |
| **Memory** | alles verdeckt | das Klassische, mit Vokabeln statt Bildern |

Beim Hören steht auf der einen Seite nur ein Lautsprecher. Antippen liest das
Wort vor, so oft sie will, und gesucht ist die **deutsche** Bedeutung — nicht
das spanische Schriftbild. Sonst könnte sie die Buchstaben zusammenlauten,
ohne das Wort zu verstehen. Erst wenn das Paar sitzt, zeigt das Kästchen, wie
das Wort geschrieben wird: gehört, verstanden, dann gesehen.

#### Warum manche Wörter nie zusammen vorkommen

„sein" passt auf `ser` **und** `estar`, „sie" auf `ella` und `ellos`. Lägen
beide in derselben Runde, hätte sie zwei richtige Antworten und eine davon
würde als Fehler gewertet. `parejas.py` sucht solche Wörter und steckt sie in
Konfliktgruppen; je Runde kommt höchstens eins daraus vor.

Die Gruppen zu finden ist kniffliger, als es klingt. „Teilen sich zwei Angaben
ein Wort" ist zu grob — dann landen `abrir` („etw. öffnen") und `comer` („etw.
essen") im selben Topf, nur wegen des Füllworts. Es zählt, ob die eine Angabe
in der anderen **aufgeht**, und „etwas" und „jemand" zählen dabei nicht mit.
Übrig bleiben sieben echte Gruppen, darunter `beber` („etw. trinken") gegen
`tomar` („etwas trinken") — den habe ich beim Durchlesen aller 239 Angaben von
Hand gefunden, keine Regel hatte ihn erwischt.

#### Sprachausgabe (`voz.js`)

Vorgelesen wird mit den Stimmen des Geräts über `speechSynthesis`. Der Browser
bringt keine mit, er reicht die des Betriebssystems durch — und daraus folgen
vier Fallstricke:

1. **Die Stimmenliste kommt verzögert.** Auf Android gibt `getVoices()` beim
   ersten Aufruf eine leere Liste zurück.
2. **Android schreibt die Sprachkennung mit Unterstrich** — `es_ES` statt
   `es-ES`. Wer nur auf Bindestrich prüft, findet die Stimme nie.
3. **Ohne spanische Stimme darf nicht gesprochen werden.** Setzt man nur
   `utterance.lang = "es-ES"` und es gibt keine spanische Stimme, nimmt das
   Gerät die deutsche und liest `jardín` deutsch vor. Das wäre schlimmer als
   Stille — sie lernte die falsche Aussprache, ohne dass irgendwo ein Fehler
   sichtbar wird. Deshalb wird die Stimme ausdrücklich gesetzt und sonst
   geschwiegen; der Hören-Modus ist dann gesperrt und erklärt, wie man unter
   Android eine spanische Stimme nachinstalliert.
4. **Vor dem ersten Sprechen braucht es eine Berührung.** Gesprochen wird nur
   aus Tippereignissen heraus.

Bevorzugt wird Spanien-Spanisch: ihr Buch ist auf Spanien ausgerichtet
(`vosotros` gibt es in Lateinamerika nicht).

#### Wie geprüft wird

* `parejas.py` – baut die Wortpaare und die Konfliktgruppen.
* `probar_voz.js` – schiebt dem Spiel acht verschiedene Gerätezustände unter:
  keine Stimmen, nur deutsche, nur lateinamerikanisches Spanisch, mehrere
  spanische, Kennung mit Unterstrich, verspätet gelieferte Stimmen. Der
  wichtigste Fall ist „deutsche Stimmen, aber keine spanische": da muss das
  Spiel schweigen. Der Test prüft außerdem, ob seine eigene Attrappe überhaupt
  gegriffen hat — `window.speechSynthesis` lässt sich nicht einfach
  überschreiben, und ohne diese Gegenprobe wären die Tests grün gewesen, weil
  der Testbrowser selbst keine Stimmen hat.
* `probar_parejas.js` – spielt 15 Runden in allen drei Arten und allen Stufen,
  **ohne Neuladen**: 90 Paare zugeordnet, dazu je Runde ein absichtlicher
  Fehlgriff. Geprüft wird auch, dass nie zwei Wörter derselben Konfliktgruppe
  in einer Runde liegen.

### Lückentext (`huecos.html`, `frases.js`)

Ein Satz mit einer Lücke, vier Antworten zur Auswahl. Steht der Satz, erscheint
die **deutsche Übersetzung** und bei Grammatikaufgaben eine kurze Begründung
(`yo → paso (pasar)`). Ist eine spanische Stimme da, wird der fertige Satz
vorgelesen: sie sieht ihn, füllt ihn, hört ihn und liest, was er heißt.

182 Sätze in drei Arten:

| Art | Beispiel | Lücke |
|---|---|---|
| **Verbform** (124) | Mi hermana ___ en Madrid. | vive / vivo / vives / viven |
| **Artikel** (27) | Busco ___ libro en la estantería. | el / la / los / las |
| **Welches Wort?** (31) | El profesor escribe en la ___. | pizarra / mochila / regla / silla |

58 Sätze sind Unidad 1, 124 Unidad 2. Wählbar ist außerdem, ob nur Grammatik
oder nur Bedeutung drankommt.

#### Warum hier so wenig von Hand dasteht

Das ist das erste Spiel, in dem ich ihr **falsches Spanisch beibringen** kann,
ohne dass es jemandem auffällt. Deshalb steht in `frases.py` so wenig wie
möglich:

* Bei Verblücken schreibe ich nur **Satzrahmen, Verb und Person**. Lösung und
  falsche Antworten holt das Skript aus `verbos_tabla.json` — derselben
  Tabelle, die das Verbenspiel benutzt und die gegen den Anhang ihres Buches
  geprüft ist. Eine falsch abgetippte Form kann so gar nicht entstehen. Die
  falschen Antworten sind echte Formen desselben Verbs, nur zur falschen
  Person: genau der Fehler, den sie macht.
* Bei Artikellücken schreibe ich nur Satz und Nomen. Welcher Artikel richtig
  ist, steht als Genus im Wortschatz.
* Die **Stufe wird berechnet**, nicht vergeben: ein Satz gehört zur höchsten
  Stufe, die eines seiner Wörter hat. So kann kein Satz in einer Stufe landen,
  für die er zu schwer ist. Und keine falsche Antwort darf über der Stufe der
  Aufgabe liegen — sonst rät sie zwischen Wörtern, die sie nie gesehen hat.
  Deshalb bekommen bestimmte Artikel auch `los`/`las` als falsche Antworten
  und nicht `un`/`una`: die lernt sie erst in Unidad 2.

#### Was der Prüfer findet und was nicht

`verificar_frases.py` rechnet alles unabhängig nach. Der schärfste Test liest
aus dem Satz ab, **welche Person verlangt ist**, und vergleicht sie mit der
eingetragenen Form — „Mi hermana vivo en Madrid" fällt keiner Wortschatzprüfung
auf, wäre aber genau das, was sie dann lernt. Dazu: genau eine Lücke, keine
Lücke am Satzanfang (die Antwort stünde dort klein), Fragezeichen vorn und
hinten, falsche Antworten sind echte Formen desselben Verbs, das Nomen steht
direkt hinter dem Artikel, und **kein Satzrahmen darf zweimal mit verschiedenen
Lösungen vorkommen**.

Der letzte Test hat drei echte Zweideutigkeiten gefunden, die mir beim
Schreiben durchgegangen waren: „Yo ___ un zumo" geht mit `tomo` **und** `bebo`,
„¿Tú ___ la televisión?" mit `miras` und `ves`, „Nosotros ___ en la fiesta" mit
`tocamos` und `bailamos`.

Was keine Maschine prüfen kann, ist, ob die Sätze gutes Spanisch sind und die
Übersetzungen stimmen. Dafür habe ich alle 182 gelesen und fünf Dinge
gefunden: `quedar` heißt „sich verabreden", nicht „bleiben" — meine Übersetzung
war schlicht falsch; im Schwimmbad tanzt niemand; eine Schülerin beginnt nicht
den Unterricht; vier Sätze fingen mit der Lücke an; und ein Satz sagte nichts
aus.

#### Wie geprüft wird

* `construir_frases.py` – baut die Sätze und meldet jedes Wort, das nicht im
  Wortschatz steht. Im ersten Durchlauf waren das 65 Stellen.
* `verificar_frases.py` – rechnet das Ergebnis unabhängig nach (siehe oben).
* `probar_huecos.js` – spielt **alle 182 Sätze** durch die Oberfläche, über
  80 Runden ohne Neuladen, 640 Fragen davon 123 mit absichtlichem Fehlversuch.
  Geprüft wird auch, dass die Übersetzung erst nach der Antwort erscheint,
  dass ein Fehlversuch keine Münzen gibt und dass der vorgelesene Satz der
  fertige Satz ist.
