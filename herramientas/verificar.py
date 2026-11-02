# -*- coding: utf-8 -*-
"""Prüft die fertige puzles.json unabhängig vom Generator nach."""
import json, re, collections, sys
sys.path.insert(0, ".")
from pistas import PISTAS, FUERA

puz = json.load(open(__import__("pathlib").Path(__file__).parent / "puzles.json"))
pool = {p["es"]: p for p in json.load(open(__import__("pathlib").Path(__file__).parent / "pool.json"))}
DIRS = {"h": (0, 1), "v": (1, 0)}
fallos = collections.Counter()
ejemplos = []

def anota(clave, texto):
    fallos[clave] += 1
    if len(ejemplos) < 8: ejemplos.append(f"{clave}: {texto}")

total = 0
for nivel, lista in puz.items():
    for idx, p in enumerate(lista):
        total += 1
        etq = f"{nivel}#{idx}"
        # Gitter aus den Einträgen neu aufbauen
        rej = {}
        for ent in p["entradas"]:
            dr, dc = DIRS[ent["dir"]]
            for i, letra in enumerate(ent["sol"]):
                pos = (ent["r"] + dr * i, ent["c"] + dc * i)
                if pos in rej and rej[pos] != letra:
                    anota("Kreuzung passt nicht", f"{etq} {ent['sol']} bei {pos}")
                rej[pos] = letra

        # Felderliste muss exakt dazu passen
        celdas = {(r, c) for r, c in p["celdas"]}
        if celdas != set(rej):
            anota("Felderliste stimmt nicht", f"{etq}: {len(celdas)} gegen {len(rej)}")

        # Maße
        if p["ancho"] != max(c for _, c in rej) + 1 or p["alto"] != max(r for r, _ in rej) + 1:
            anota("Maße falsch", etq)
        if max(p["ancho"], p["alto"]) > 11:
            anota("zu groß", f"{etq} {p['ancho']}x{p['alto']}")
        if min(r for r, _ in rej) != 0 or min(c for _, c in rej) != 0:
            anota("nicht auf null geschoben", etq)

        # Keine Zufallswörter
        puestas = {(e["sol"], e["r"], e["c"], e["dir"]) for e in p["entradas"]}
        for d, (dr, dc) in DIRS.items():
            for (r, c) in rej:
                if (r - dr, c - dc) in rej: continue
                letras, i = [], 0
                while (r + dr * i, c + dc * i) in rej:
                    letras.append(rej[(r + dr * i, c + dc * i)]); i += 1
                if len(letras) >= 2 and ("".join(letras), r, c, d) not in puestas:
                    anota("Zufallswort", f"{etq}: {''.join(letras)}")

        # Zusammenhängend
        inicio = next(iter(rej)); vistos, pila = {inicio}, [inicio]
        while pila:
            r, c = pila.pop()
            for q in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
                if q in rej and q not in vistos: vistos.add(q); pila.append(q)
        if len(vistos) != len(rej):
            anota("Gitter zerfällt", etq)

        # Nummern: gleicher Startpunkt -> gleiche Nummer, Reihenfolge oben links zuerst
        num = {}
        for e in p["entradas"]:
            k = (e["r"], e["c"])
            if k in num and num[k] != e["n"]:
                anota("Nummer uneinheitlich", f"{etq} bei {k}")
            num[k] = e["n"]
        orden = sorted(num, key=lambda k: num[k])
        if orden != sorted(num):
            anota("Nummerierung nicht von oben links", etq)

        # Wörter und Fragen
        for e in p["entradas"]:
            w = e["sol"]
            if w not in pool: anota("Wort nicht im Vorrat", f"{etq} {w}")
            elif nivel != "todo" and pool[w]["nivel"] != nivel:
                anota("Wort aus falschem Kapitel", f"{etq} {w}")
            if w in FUERA: anota("gesperrtes Wort benutzt", f"{etq} {w}")
            if not e.get("pistas"): anota("ohne Frage", f"{etq} {w}")
            if any(not t.strip() for t in e["pistas"]): anota("leere Frage", f"{etq} {w}")
            if len(w) < 2: anota("Wort zu kurz", f"{etq} {w}")

print(f"Rätsel geprüft: {total}")
if fallos:
    print("Mängel:")
    for k, n in fallos.most_common(): print(f"   {k}: {n}")
    print("Beispiele:"); [print("   " + x) for x in ejemplos]
else:
    print("keine Mängel")

# Kennzahlen
todas = [e["sol"] for l in puz.values() for p in l for e in p["entradas"]]
con_tilde = [w for w in todas if re.search(r"[áéíóúüñ]", w)]
print(f"\nWörter in Rätseln: {len(todas)} | verschiedene: {len(set(todas))}")
print(f"mit Akzent oder ñ: {len(con_tilde)} ({len(con_tilde)*100//len(todas)} %)")
print("Beispiele mit Akzent:", ", ".join(sorted(set(con_tilde))[:12]))
n_pistas = [len(e["pistas"]) for l in puz.values() for p in l for e in p["entradas"]]
print(f"Fragen pro Wort: {min(n_pistas)}–{max(n_pistas)}, im Schnitt {sum(n_pistas)/len(n_pistas):.1f}")
