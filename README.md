# Games-for-Cece

Lernspiele für Cece – im gleichen Stil wie [Game-of-Cece](https://github.com/blablubbbb/Game-of-Cece),
aber mit Schulstoff statt reinem Spaß. Startseite mit Kacheln, Münzen werden
im Browser gespeichert.

Reines HTML, CSS und JavaScript. Kein Build, keine Bibliotheken – einfach
`index.html` öffnen oder über GitHub Pages aufrufen.

## Spiele

| Spiel | Fach | Was geübt wird |
|---|---|---|
| [Verben](verbos.html) | Spanisch | Die Personalformen von `ser` und der regelmäßigen Verben auf `-ar` |

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

Die Ablenker sind immer andere Personalformen **desselben** Verbs. Raten über
den Wortstamm bringt also nichts, es geht wirklich um die Endung.

Der Wortschatz bleibt im Rahmen von ¡Apúntate! 1 bis Unidad 1, Texto B:
`ser` und die `-ar`-Verben hablar, estudiar, escuchar, mirar, tocar, buscar,
charlar, tomar, quedar, pasar, descansar.
