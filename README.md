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
