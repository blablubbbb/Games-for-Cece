# -*- coding: utf-8 -*-
"""Erzeugt Kreuzworträtsel und prüft jedes einzelne nach.

Vorgehen: längstes Wort zuerst waagerecht legen, dann jedes weitere so, dass
es ein schon liegendes kreuzt. Buchstaben müssen exakt übereinstimmen — ú und
u sind verschiedene Buchstaben, sonst würde das Spiel Akzente verschlucken.

Danach wird jedes fertige Gitter geprüft:
  * jedes Wort kreuzt mindestens ein anderes
  * alle Wörter hängen zusammen
  * es entstehen keine Wörter aus Versehen (zwei Buchstaben nebeneinander,
    die kein gewolltes Wort bilden)
"""
import json, random, sys, collections
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from pistas import PISTAS, FUERA

DIRS = {"h": (0, 1), "v": (1, 0)}

def cabe(rejilla, palabra, r, c, d):
    """Darf das Wort hier liegen? Gibt die Zahl der Kreuzungen zurück, sonst None."""
    dr, dc = DIRS[d]
    cruces = 0
    # Feld davor und dahinter muss frei sein
    if (r - dr, c - dc) in rejilla: return None
    if (r + dr * len(palabra), c + dc * len(palabra)) in rejilla: return None
    for i, letra in enumerate(palabra):
        p = (r + dr * i, c + dc * i)
        if p in rejilla:
            if rejilla[p] != letra: return None
            cruces += 1
        else:
            # Quer dazu muss frei sein, sonst klebt das Wort an einem anderen
            if d == "h":
                vecinos = [(p[0] - 1, p[1]), (p[0] + 1, p[1])]
            else:
                vecinos = [(p[0], p[1] - 1), (p[0], p[1] + 1)]
            if any(v in rejilla for v in vecinos): return None
    return cruces

def poner(rejilla, palabra, r, c, d):
    dr, dc = DIRS[d]
    for i, letra in enumerate(palabra):
        rejilla[(r + dr * i, c + dc * i)] = letra

def construir(palabras, objetivo, rng):
    """Versucht, objetivo Wörter zu legen. Gibt (rejilla, colocadas) zurück."""
    palabras = sorted(palabras, key=lambda w: -len(w))
    primera = palabras[0]
    rejilla = {}
    poner(rejilla, primera, 0, 0, "h")
    colocadas = [(primera, 0, 0, "h")]
    restantes = palabras[1:]
    rng.shuffle(restantes)

    for palabra in restantes:
        if len(colocadas) >= objetivo: break
        opciones = []
        for (puesta, pr, pc, pd) in colocadas:
            pdr, pdc = DIRS[pd]
            nd = "v" if pd == "h" else "h"
            ndr, ndc = DIRS[nd]
            for i, letra_puesta in enumerate(puesta):
                for j, letra in enumerate(palabra):
                    if letra != letra_puesta: continue
                    r = pr + pdr * i - ndr * j
                    c = pc + pdc * i - ndc * j
                    cr = cabe(rejilla, palabra, r, c, nd)
                    if cr:
                        opciones.append((cr, r, c, nd))
        if not opciones: continue
        # Mehr Kreuzungen sind besser, sonst zufällig
        mejor = max(o[0] for o in opciones)
        cr, r, c, d = rng.choice([o for o in opciones if o[0] == mejor])
        poner(rejilla, palabra, r, c, d)
        colocadas.append((palabra, r, c, d))
    return rejilla, colocadas

# ------------------------------------------------------------------ Prüfung

def palabras_en_rejilla(rejilla):
    """Alle waagerechten und senkrechten Buchstabenfolgen ab Länge 2."""
    encontradas = []
    for d, (dr, dc) in DIRS.items():
        for (r, c) in rejilla:
            if (r - dr, c - dc) in rejilla: continue      # nicht der Anfang
            letras, i = [], 0
            while (r + dr * i, c + dc * i) in rejilla:
                letras.append(rejilla[(r + dr * i, c + dc * i)]); i += 1
            if len(letras) >= 2:
                encontradas.append(("".join(letras), r, c, d))
    return encontradas

def revisar(rejilla, colocadas):
    """Gibt eine Liste von Mängeln zurück. Leer heißt sauber."""
    fallos = []
    puestas = {(w, r, c, d) for w, r, c, d in colocadas}

    # 1. Keine Wörter aus Versehen
    for w, r, c, d in palabras_en_rejilla(rejilla):
        if (w, r, c, d) not in puestas:
            fallos.append(f"Zufallswort „{w}“ bei {r},{c} {d}")

    # 2. Jedes Wort kreuzt mindestens eines
    for w, r, c, d in colocadas:
        dr, dc = DIRS[d]
        od = "v" if d == "h" else "h"
        odr, odc = DIRS[od]
        cruza = False
        for i in range(len(w)):
            p = (r + dr * i, c + dc * i)
            if (p[0] - odr, p[1] - odc) in rejilla or (p[0] + odr, p[1] + odc) in rejilla:
                cruza = True; break
        if not cruza:
            fallos.append(f"„{w}“ kreuzt nichts")

    # 3. Alles hängt zusammen
    if rejilla:
        inicio = next(iter(rejilla))
        vistos, pila = {inicio}, [inicio]
        while pila:
            r, c = pila.pop()
            for p in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
                if p in rejilla and p not in vistos:
                    vistos.add(p); pila.append(p)
        if len(vistos) != len(rejilla):
            fallos.append(f"Gitter zerfällt: {len(vistos)} von {len(rejilla)} Feldern hängen zusammen")
    return fallos

# ------------------------------------------------------------------ Ausgabe

def normalizar(rejilla, colocadas):
    """Auf (0,0) schieben und Wörter nach Kreuzworträtsel-Art nummerieren."""
    r0 = min(r for r, _ in rejilla); c0 = min(c for _, c in rejilla)
    rej = {(r - r0, c - c0): v for (r, c), v in rejilla.items()}
    col = [(w, r - r0, c - c0, d) for w, r, c, d in colocadas]
    alto = max(r for r, _ in rej) + 1
    ancho = max(c for _, c in rej) + 1

    # Nummern vergeben: von oben links nach unten rechts
    inicios = sorted({(r, c) for w, r, c, d in col})
    num = {p: i + 1 for i, p in enumerate(inicios)}
    entradas = []
    for w, r, c, d in sorted(col, key=lambda x: (num[(x[1], x[2])], x[3])):
        entradas.append({"n": num[(r, c)], "r": r, "c": c, "dir": d, "sol": w})
    return {"ancho": ancho, "alto": alto,
            "celdas": [[r, c] for (r, c) in sorted(rej)],
            "entradas": entradas}

def pistas_de(palabra, pool):
    """Fragen zu einem Wort: handgeschriebene plus deutsche Übersetzung."""
    fuera = list(PISTAS.get(palabra, []))
    de = pool[palabra]["de"]
    for t in de:
        t = t.strip()
        if t and t not in fuera: fuera.append(t)
    return fuera

def generar_nivel(pool, nivel, cuantos, objetivo=8, semilla=0):
    candidatos = [p["es"] for p in pool.values()
                  if p["es"] not in FUERA and len(p["es"]) >= 3
                  and (nivel == "todo" or p["nivel"] == nivel)]
    cortas = [p["es"] for p in pool.values()
              if p["es"] not in FUERA and len(p["es"]) == 2
              and (nivel == "todo" or p["nivel"] == nivel)]
    rng = random.Random(semilla)
    puzles, intentos = [], 0
    vistos = set()
    while len(puzles) < cuantos and intentos < cuantos * 200:
        intentos += 1
        muestra = rng.sample(candidatos, min(len(candidatos), objetivo + 6))
        muestra += rng.sample(cortas, min(len(cortas), 1)) if cortas else []
        rejilla, colocadas = construir(muestra, objetivo, rng)
        if len(colocadas) < max(5, objetivo - 2): continue
        if revisar(rejilla, colocadas): continue
        p = normalizar(rejilla, colocadas)
        # Auf dem Handy bleiben mehr als elf Felder zu klein zum Lesen
        if max(p["ancho"], p["alto"]) > 11: continue
        firma = tuple(sorted(e["sol"] for e in p["entradas"]))
        if firma in vistos: continue
        vistos.add(firma)
        for e in p["entradas"]:
            e["pistas"] = pistas_de(e["sol"], pool)
        p["nivel"] = nivel
        puzles.append(p)
    return puzles, intentos

if __name__ == "__main__":
    aqui = __import__("pathlib").Path(__file__).parent
    pool = {p["es"]: p for p in json.load(open(aqui / "pool.json"))}
    # Fester Startwert je Stufe. hash() wäre falsch: Python würfelt den
    # String-Hash pro Prozess neu, dann käme bei jedem Lauf ein anderer
    # Satz Rätsel heraus und puzles.js ließe sich nicht nachbauen.
    NIVELES = [("vorkurs", 25, 101), ("u1", 30, 202), ("u2", 30, 303), ("todo", 25, 404)]
    salida = {}
    for nivel, cuantos, semilla in NIVELES:
        puzles, intentos = generar_nivel(pool, nivel, cuantos, semilla=semilla)
        salida[nivel] = puzles
        tam = [f'{p["ancho"]}x{p["alto"]}' for p in puzles]
        pal = [len(p["entradas"]) for p in puzles]
        print(f"  {nivel:8} {len(puzles):3} Rätsel aus {intentos} Versuchen | "
              f"Wörter {min(pal)}–{max(pal)} | Größen {collections.Counter(tam).most_common(3)}")
    json.dump(salida, open(aqui / "puzles.json", "w"), ensure_ascii=False,
              separators=(",", ":"))
    total = sum(len(v) for v in salida.values())
    print(f"\ninsgesamt {total} Rätsel")
