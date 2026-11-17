# -*- coding: utf-8 -*-
"""Prüft sopas.json nach, ohne sopa.py zu benutzen.

Alles wird aus der fertigen Datei neu hergeleitet: ob jedes Wort wirklich im
Gitter steht, ob es genau einmal dort steht, ob die Füllung die Wörter nicht
verrät und ob die Fragen dieselben sind wie beim Kreuzworträtsel.
"""
import collections, json, pathlib, re, sys, unicodedata

AQUI = pathlib.Path(__file__).parent
sys.path.insert(0, str(AQUI))
from pistas import PISTAS, FUERA

DIRS = [(0, 1), (1, 0), (1, 1), (-1, 1), (0, -1), (-1, 0), (-1, -1), (1, -1)]
ADELANTE = {(0, 1), (1, 0)}
ALFABETO = set("abcdefghijklmnopqrstuvwxyzáéíóúüñ")
ACENTOS = set("áéíóúüñ")

fallos = []
mal = fallos.append


def pelar(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def delata(frase, palabra):
    """Keine Frage darf ihre eigene Antwort als Wort enthalten – sonst wäre
    das Wort zu finden, ohne die Frage gelesen zu haben."""
    return re.search(r"(?<![a-zñ])" + re.escape(pelar(palabra)) + r"(?![a-zñ])",
                     pelar(frase)) is not None


def ocurrencias(filas, palabra, lado):
    sitios, L = [], len(palabra)
    for r in range(lado):
        for c in range(lado):
            for dr, dc in DIRS:
                if not (0 <= r + dr * (L - 1) < lado and 0 <= c + dc * (L - 1) < lado):
                    continue
                if all(filas[r + dr * i][c + dc * i] == palabra[i] for i in range(L)):
                    sitios.append((r, c, dr, dc))
    return sitios


def main():
    datos = json.load(open(AQUI / "sopas.json"))
    pool = {p["es"]: p for p in json.load(open(AQUI / "pool.json"))}

    total = celdas_palabra = celdas_relleno = 0
    ac_palabra = ac_relleno = 0
    dirs = collections.Counter()
    largos = collections.Counter()
    usadas = collections.Counter()
    firmas = set()

    for nivel, sopas in datos.items():
        for idx, s in enumerate(sopas):
            etq = f"{nivel}#{idx}"
            total += 1
            lado = s["lado"]
            filas = s["letras"]

            # --- Gitter
            if len(filas) != lado: mal(f"{etq}: {len(filas)} Zeilen statt {lado}")
            for i, f in enumerate(filas):
                if len(f) != lado: mal(f"{etq}: Zeile {i} hat {len(f)} Zeichen")
                fuera = set(f) - ALFABETO
                if fuera: mal(f"{etq}: Zeile {i} enthält {fuera}")

            pals = s["palabras"]
            if len(pals) != 8: mal(f"{etq}: {len(pals)} Wörter statt 8")

            ocupadas = set()
            for x in pals:
                p, r, c, dr, dc = x["p"], x["r"], x["c"], x["dr"], x["dc"]
                largos[len(p)] += 1
                dirs[(dr, dc)] += 1
                usadas[p] += 1

                # --- Steht das Wort wirklich dort, wo es stehen soll?
                if (dr, dc) not in DIRS: mal(f"{etq}: {p} hat Richtung {(dr,dc)}")
                dentro = (0 <= r + dr * (len(p) - 1) < lado and
                          0 <= c + dc * (len(p) - 1) < lado and
                          0 <= r < lado and 0 <= c < lado)
                if not dentro:
                    mal(f"{etq}: {p} läuft aus dem Gitter"); continue
                escrito = "".join(filas[r + dr * i][c + dc * i] for i in range(len(p)))
                if escrito != p:
                    mal(f"{etq}: an {p}s Platz steht „{escrito}“")
                for i in range(len(p)):
                    ocupadas.add((r + dr * i, c + dc * i))

                # --- Genau einmal auffindbar? Sonst ist die Auswahl zweideutig
                sitios = ocurrencias(filas, p, lado)
                if len(sitios) != 1:
                    mal(f"{etq}: {p} steht {len(sitios)}x im Gitter")

                # --- Länge und Herkunft
                if not (4 <= len(p) <= 10): mal(f"{etq}: {p} ist {len(p)} Buchstaben lang")
                if p in FUERA: mal(f"{etq}: {p} steht auf der Ausschlussliste")
                if p not in pool: mal(f"{etq}: {p} steht nicht im Wortschatz")
                elif nivel != "todo" and pool[p]["nivel"] != nivel:
                    mal(f"{etq}: {p} gehört zu {pool[p]['nivel']}, nicht {nivel}")

                # --- Fragen: dieselben wie beim Kreuzworträtsel
                esperadas = list(PISTAS.get(p, []))
                for t in pool.get(p, {}).get("de", []):
                    t = t.strip()
                    if t and t not in esperadas: esperadas.append(t)
                esperadas = [t for t in esperadas if not delata(t, p)]
                for t in x["pistas"]:
                    if delata(t, p): mal(f"{etq}: Frage „{t}“ verrät {p}")
                if x["pistas"] != esperadas:
                    mal(f"{etq}: Fragen zu {p} weichen ab")
                if not x["pistas"] or not all(t.strip() for t in x["pistas"]):
                    mal(f"{etq}: {p} hat eine leere Frage")

            # --- Kein Wort darf in einem anderen stecken
            ps = [x["p"] for x in pals]
            if len(set(ps)) != len(ps): mal(f"{etq}: Wort doppelt im selben Salat")
            for i, a in enumerate(ps):
                for b in ps[i + 1:]:
                    if a in b or a[::-1] in b or b in a or b[::-1] in a:
                        mal(f"{etq}: „{a}“ steckt in „{b}“")

            # --- Einstieg: mindestens zwei Wörter vorwärts
            adel = sum(1 for x in pals if (x["dr"], x["dc"]) in ADELANTE)
            if adel < 2: mal(f"{etq}: nur {adel} Wörter vorwärts, kein Einstieg")

            # --- Akzente: die Füllung muss welche haben, sonst verrät sie alles
            for r in range(lado):
                for c in range(lado):
                    ac = filas[r][c] in ACENTOS
                    if (r, c) in ocupadas:
                        celdas_palabra += 1; ac_palabra += ac
                    else:
                        celdas_relleno += 1; ac_relleno += ac

            firma = (nivel, tuple(sorted(ps)))
            if firma in firmas: mal(f"{etq}: Wortauswahl kommt doppelt vor")
            firmas.add(firma)

    # --- Übersicht und die beiden Quoten gegeneinander
    q_pal = 100 * ac_palabra / max(celdas_palabra, 1)
    q_rel = 100 * ac_relleno / max(celdas_relleno, 1)
    print(f"{total} Salate, {sum(usadas.values())} Wortplätze, "
          f"{len(usadas)} verschiedene Wörter")
    print("Längen:", dict(sorted(largos.items())))
    nombres = {(0,1):"→", (1,0):"↓", (1,1):"↘", (-1,1):"↗",
               (0,-1):"←", (-1,0):"↑", (-1,-1):"↖", (1,-1):"↙"}
    print("Richtungen:", {nombres[k]: v for k, v in sorted(dirs.items(), key=lambda x: -x[1])})
    print(f"Akzente in Wörtern {q_pal:.1f} %, in der Füllung {q_rel:.1f} %")
    if abs(q_pal - q_rel) > 1.5:
        mal(f"Akzentquoten zu verschieden: Wörter {q_pal:.1f} %, Füllung {q_rel:.1f} % "
            "– die Füllung verrät damit die Wörter")
    if q_rel < 1.0:
        mal(f"Füllung hat fast keine Akzente ({q_rel:.1f} %)")

    print()
    print(f"{len(fallos)} MÄNGEL:\n" + "\n".join("  - " + f for f in fallos[:30])
          if fallos else "keine Mängel")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
