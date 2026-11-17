# -*- coding: utf-8 -*-
"""Erzeugt Buchstabensalate (sopas de letras) und prüft jeden einzelnen nach.

Dieselben Fragen wie beim Kreuzworträtsel, aber von der anderen Seite: dort
muss sie das Wort schreiben, hier muss sie es wiedererkennen.

Wörter liegen in allen acht Richtungen, Diagonalen und rückwärts eingeschlossen.
Damit es einen Einstieg gibt, liegen mindestens zwei Wörter vorwärts (→ oder ↓).

Zwei Dinge, die ein Buchstabensalat leicht falsch macht:

  * Die Füllbuchstaben dürfen nicht gleichverteilt sein. Wäre jeder Buchstabe
    gleich wahrscheinlich, stünden lauter k, w und x herum und die echten
    Wörter stächen heraus. Gefüllt wird darum nach der Buchstabenverteilung
    ihres eigenen Wortschatzes.
  * Akzente sind sonst ein Verräter. Kommt í nur in jardín vor, hat sie das
    Wort gefunden, ohne ein Wort gelesen zu haben. Die Füllung bekommt darum
    denselben Akzentanteil wie das Wortmaterial, rund 3 %.
"""
import collections, json, random, re, sys, unicodedata, pathlib

AQUI = pathlib.Path(__file__).parent
sys.path.insert(0, str(AQUI))
from pistas import PISTAS, FUERA

LADO = 11          # 11x11 – bei 360 px Bildschirm sind das noch 31 px je Feld
PALABRAS = 8       # Wörter je Rätsel
LARGO = (4, 10)    # kürzere Wörter tauchen im Salat zu oft zufällig auf

# Alle acht Richtungen. Die ersten beiden gelten als „vorwärts“.
DIRS = [(0, 1), (1, 0), (1, 1), (-1, 1), (0, -1), (-1, 0), (-1, -1), (1, -1)]
ADELANTE = {(0, 1), (1, 0)}


def frecuencias(pool):
    """Buchstabenverteilung ihres Wortschatzes, inklusive Akzenten."""
    c = collections.Counter()
    for p in pool:
        if LARGO[0] <= len(p["es"]) <= LARGO[1]:
            c.update(p["es"])
    letras = list(c)
    pesos = [c[l] for l in letras]
    return letras, pesos


def encaja(rejilla, palabra, r, c, dr, dc):
    """Passt das Wort hierhin? Kreuzungen mit gleichem Buchstaben sind erlaubt."""
    if not (0 <= r + dr * (len(palabra) - 1) < LADO): return False
    if not (0 <= c + dc * (len(palabra) - 1) < LADO): return False
    for i, letra in enumerate(palabra):
        hay = rejilla[r + dr * i][c + dc * i]
        if hay is not None and hay != letra: return False
    return True


def poner(rejilla, palabra, r, c, dr, dc):
    for i, letra in enumerate(palabra):
        rejilla[r + dr * i][c + dc * i] = letra


def apariciones(rejilla, palabra):
    """Wie oft steht das Wort im Gitter, über alle acht Richtungen?"""
    n, L = 0, len(palabra)
    for r in range(LADO):
        for c in range(LADO):
            for dr, dc in DIRS:
                if not (0 <= r + dr * (L - 1) < LADO and 0 <= c + dc * (L - 1) < LADO):
                    continue
                if all(rejilla[r + dr * i][c + dc * i] == palabra[i] for i in range(L)):
                    n += 1
    return n


def se_contienen(a, b):
    """Steckt eins der Wörter im anderen? Dann wäre die Auswahl zweideutig."""
    return a in b or a[::-1] in b or b in a or b[::-1] in a


def armar(candidatos, rng, letras, pesos):
    """Einen Salat bauen. Gibt (rejilla, colocadas) zurück oder None."""
    # Wörter aussuchen, die nicht ineinander stecken
    elegidas = []
    for p in rng.sample(candidatos, len(candidatos)):
        if len(elegidas) >= PALABRAS: break
        if any(se_contienen(p, q) for q in elegidas): continue
        elegidas.append(p)
    if len(elegidas) < PALABRAS: return None

    rejilla = [[None] * LADO for _ in range(LADO)]
    colocadas = []
    # Längste zuerst – die haben die wenigsten Plätze
    # Richtungen der Reihe nach abarbeiten statt alle Plätze auf einmal zu
    # sammeln: sonst gewinnen die Waagerechten, weil es für sie geometrisch
    # mehr Plätze gibt, und die Diagonalen kämen kaum vor.
    orden_dirs = DIRS[:]
    rng.shuffle(orden_dirs)
    usadas_dir = collections.Counter()

    for palabra in sorted(elegidas, key=len, reverse=True):
        opciones = []
        for dr, dc in sorted(orden_dirs, key=lambda d: usadas_dir[d]):
            for r in range(LADO):
                for c in range(LADO):
                    if encaja(rejilla, palabra, r, c, dr, dc):
                        # Kreuzungen sind erwünscht, das macht den Salat dichter
                        cruces = sum(1 for i in range(len(palabra))
                                     if rejilla[r + dr * i][c + dc * i] is not None)
                        opciones.append((cruces, r, c, dr, dc))
            # Die erste Richtung, in der es überhaupt geht, wird genommen –
            # und das ist die bisher am wenigsten benutzte.
            if opciones: break
        if not opciones: return None
        usadas_dir[(opciones[0][3], opciones[0][4])] += 1
        mejor = max(o[0] for o in opciones)
        # Meist kreuzen lassen, aber nicht stur – sonst sehen alle Rätsel gleich aus
        pool_op = [o for o in opciones if o[0] == mejor] if rng.random() < 0.6 else opciones
        _, r, c, dr, dc = rng.choice(pool_op)
        poner(rejilla, palabra, r, c, dr, dc)
        colocadas.append({"p": palabra, "r": r, "c": c, "dr": dr, "dc": dc})

    if sum(1 for x in colocadas if (x["dr"], x["dc"]) in ADELANTE) < 2:
        return None                      # kein Einstieg zum Finden

    # Füllen und nachsehen, dass kein Wort versehentlich doppelt entsteht
    for _ in range(60):
        prueba = [[rejilla[r][c] or rng.choices(letras, pesos)[0] for c in range(LADO)]
                  for r in range(LADO)]
        if all(apariciones(prueba, x["p"]) == 1 for x in colocadas):
            return prueba, colocadas
    return None


def delata(frase, palabra):
    """Steht die Antwort als eigenes Wort in der Frage?

    „genial“ heißt auf Deutsch „genial, super, toll“ – im Kreuzworträtsel ist
    das noch in Ordnung, dort muss sie das Wort ja schreiben. Hier wäre es
    geschenkt: sie bräuchte die Frage nicht einmal zu lesen.
    """
    a = pelar(palabra)
    return re.search(r"(?<![a-zñ])" + re.escape(a) + r"(?![a-zñ])", pelar(frase)) is not None


def pelar(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def pistas_de(palabra, pool):
    """Dieselben Fragen wie beim Kreuzworträtsel, ohne die verräterischen."""
    todas = list(PISTAS.get(palabra, []))
    for t in pool[palabra]["de"]:
        t = t.strip()
        if t and t not in todas: todas.append(t)
    return [t for t in todas if not delata(t, palabra)]


def generar_nivel(pool, nivel, cuantos, semilla):
    candidatos = [p["es"] for p in pool.values()
                  if p["es"] not in FUERA
                  and LARGO[0] <= len(p["es"]) <= LARGO[1]
                  and (nivel == "todo" or p["nivel"] == nivel)
                  and pistas_de(p["es"], pool)]   # ohne Frage kein Wort
    letras, pesos = frecuencias(list(pool.values()))
    rng = random.Random(semilla)
    sopas, vistos, intentos = [], set(), 0
    while len(sopas) < cuantos and intentos < cuantos * 400:
        intentos += 1
        muestra = rng.sample(candidatos, min(len(candidatos), PALABRAS + 8))
        hecho = armar(muestra, rng, letras, pesos)
        if not hecho: continue
        rejilla, colocadas = hecho
        firma = tuple(sorted(x["p"] for x in colocadas))
        if firma in vistos: continue
        vistos.add(firma)
        for x in colocadas:
            x["pistas"] = pistas_de(x["p"], pool)
        sopas.append({"lado": LADO,
                      "letras": ["".join(f) for f in rejilla],
                      "palabras": sorted(colocadas, key=lambda x: x["p"]),
                      "nivel": nivel})
    return sopas, intentos


if __name__ == "__main__":
    pool = {p["es"]: p for p in json.load(open(AQUI / "pool.json"))}
    # Feste Startwerte, damit sich die Rätsel nachbauen lassen. hash() wäre
    # falsch: Python würfelt den String-Hash bei jedem Prozessstart neu.
    NIVELES = [("vorkurs", 20, 511), ("u1", 25, 622), ("u2", 25, 733), ("todo", 20, 844)]
    salida = {}
    for nivel, cuantos, semilla in NIVELES:
        sopas, intentos = generar_nivel(pool, nivel, cuantos, semilla)
        salida[nivel] = sopas
        densidad = [sum(1 for x in s["palabras"] for _ in x["p"]) for s in sopas]
        dirs = collections.Counter((x["dr"], x["dc"]) for s in sopas for x in s["palabras"])
        print(f"  {nivel:8} {len(sopas):3} Salate aus {intentos} Versuchen | "
              f"Buchstaben in Wörtern {min(densidad)}–{max(densidad)} von {LADO*LADO}")
    json.dump(salida, open(AQUI / "sopas.json", "w"), ensure_ascii=False,
              separators=(",", ":"))
    print(f"\ninsgesamt {sum(len(v) for v in salida.values())} Salate")
