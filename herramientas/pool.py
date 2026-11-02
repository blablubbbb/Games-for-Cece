# -*- coding: utf-8 -*-
"""Wortvorrat fürs Kreuzworträtsel: Einzelwörter aus den ersten drei Kapiteln.

Braucht ihre Vokabelliste als Argument:
    python3 pool.py es_cards_final.json
Das Ergebnis (pool.json) liegt fertig daneben, die Liste selbst gehört
nicht in dieses Repo."""
import json, re, collections, sys

UNIDADES = {"01 ¡Apúntate!": "vorkurs", "02 Unidad 1": "u1", "03 Unidad 2": "u2"}

def construir():
    d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "es_cards_final.json"))
    vistos = {}
    for x in d:
        if x["unidad"] not in UNIDADES: continue
        es = x["es"].strip()
        # "el/la amigo/-a" und "nosotros/-as": männliche Grundform herausziehen
        es = re.sub(r"^el/la\s+", "", es)
        es = re.sub(r"/-a[s]?$", "", es)
        m = re.match(r"^(el|la|los|las)\s+(.+)$", es)
        palabra = (m.group(2) if m else es).lower()
        art = m.group(1) if m else None
        if " " in palabra or "/" in palabra or "…" in palabra: continue
        # Ab zwei Buchstaben: "yo" und "tú" sollen vorkommen dürfen
        if not re.fullmatch(r"[a-záéíóúüñ]{2,14}", palabra): continue
        # Doppelte zusammenführen, Bedeutungen sammeln
        if palabra in vistos:
            if x["de"] not in vistos[palabra]["de"]:
                vistos[palabra]["de"].append(x["de"])
        else:
            vistos[palabra] = {"es": palabra, "art": art, "de": [x["de"]],
                               "nivel": UNIDADES[x["unidad"]]}
    return list(vistos.values())

if __name__ == "__main__":
    pool = construir()
    print(f"Wörter: {len(pool)}")
    for niv in ("vorkurs", "u1", "u2"):
        ws = [p for p in pool if p["nivel"] == niv]
        print(f"\n### {niv} ({len(ws)})")
        for i in range(0, len(ws), 4):
            print("   " + "  ".join(f"{p['es']:14}" for p in ws[i:i+4]))
    json.dump(pool, open("pool.json", "w"), ensure_ascii=False, indent=1)
