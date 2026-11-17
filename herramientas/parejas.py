# -*- coding: utf-8 -*-
"""Baut die Wortpaare fürs Zuordnungsspiel.

Anders als Kreuzworträtsel und Buchstabensalat werden hier keine fertigen
Runden erzeugt – eine Runde ist nur „sechs Paare auswählen“, das kann der
Browser selbst. Erzeugt wird die geprüfte Wortliste.

Drei Dinge müssen stimmen, damit das Spiel überhaupt lösbar ist:

  * Die deutsche Seite muss genau ein spanisches Wort meinen. „sein“ passt auf
    ser und estar, „sie“ auf ella und ellos – liegen beide in derselben Runde,
    gibt es zwei richtige Antworten und eine davon wird als falsch gewertet.
    Solche Wörter bekommen eine gemeinsame Konfliktgruppe; je Runde darf nur
    eins daraus vorkommen.
  * Die deutsche Angabe darf das spanische Wort nicht enthalten. „Portugal“
    neben portugal wäre geschenkt.
  * Sie muss auf ein Kästchen passen. Die Vokabelkarten haben teils ganze
    Erklärungen im Feld („der Lautsprecher, pl. die Lautsprecher-Box“); davon
    wird der erste Teil genommen und alles über 20 Zeichen fliegt raus.
"""
import json, pathlib, re, sys, unicodedata

AQUI = pathlib.Path(__file__).parent
sys.path.insert(0, str(AQUI))
from pistas import FUERA

LARGO_MAX = 20          # so breit ist ein Kästchen auf dem Handy
ARTICULOS = ("der", "die", "das", "ein", "eine", "einen", "zu", "sich")


def pelar(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def recortar(texto):
    """Erster brauchbarer Teil der Vokabelangabe."""
    t = texto.split(",")[0].split(" hier:")[0].split(" auch:")[0].strip()
    t = re.sub(r"\s+", " ", t).strip(" .;:")
    return t


# Abkürzungen der Vokabelkarten. Ohne das wären „etw. trinken“ (beber) und
# „etwas trinken“ (tomar) für den Vergleich zwei verschiedene Angaben – für
# ein Kind sind sie dieselbe, und beide in einer Runde hätten zwei Lösungen.
ABREVIADO = {"etw": "etwas", "jmd": "jemand", "jmdn": "jemand", "jmdm": "jemand",
             "jdn": "jemand", "jdm": "jemand", "pl": "plural"}

# „etwas“ und „jemand“ sind Platzhalter, keine Bedeutung: „etw. öffnen“ und
# „etw. essen“ sind zwei völlig verschiedene Vokabeln. Für den Vergleich
# zählen sie darum nicht mit – sonst hinge am Ende halb Unidad 2 in einer
# einzigen Konfliktgruppe.
RELLENO = {"etwas", "jemand", "plural"}


def tokens(aleman):
    """Alle Wörter einer Angabe, Artikel abgezogen, Abkürzungen aufgelöst."""
    palabras = []
    for w in re.split(r"[\s/()-]+", pelar(aleman)):
        w = w.strip(".,;:!?")
        w = ABREVIADO.get(w, w)
        if not w or w in ARTICULOS or len(w) < 2: continue
        palabras.append(w)
    return set(palabras)


def contenido(aleman):
    """Nur die bedeutungstragenden Wörter."""
    return tokens(aleman) - RELLENO


def delata(aleman, espanol):
    """Steht das spanische Wort in der deutschen Angabe?"""
    return re.search(r"(?<![a-zñ])" + re.escape(pelar(espanol)) + r"(?![a-zñ])",
                     pelar(aleman)) is not None


def construir():
    pool = json.load(open(AQUI / "pool.json"))
    palabras = []
    for p in pool:
        es = p["es"]
        if es in FUERA or len(es) < 2: continue
        # Die kürzeste brauchbare Angabe nehmen
        opciones = [recortar(t) for t in p["de"]]
        opciones = [t for t in opciones if t and len(t) <= LARGO_MAX and not delata(t, es)]
        if not opciones: continue
        alem = min(opciones, key=len)
        palabras.append({"es": es, "de": alem, "nivel": p["nivel"],
                         "_c": contenido(alem), "_t": tokens(alem)})

    # Konfliktgruppen: Wörter, deren deutsche Angaben sich ein Wort teilen
    padre = list(range(len(palabras)))
    def raiz(i):
        while padre[i] != i: padre[i] = padre[padre[i]]; i = padre[i]
        return i
    # Verwechselbar ist nicht, was sich irgendein Wort teilt, sondern was
    # ineinander aufgeht: „sein“ und „sein“, „sie“ in „sie (Plural)“. Sonst
    # landeten „etw. öffnen“ und „etw. essen“ in einem Topf, nur wegen des
    # Füllworts – und das sind zwei völlig verschiedene Vokabeln.
    for i in range(len(palabras)):
        for j in range(i + 1, len(palabras)):
            a, b = palabras[i]["_c"], palabras[j]["_c"]
            # Verwechselbar, wenn die Bedeutung der einen in der anderen
            # aufgeht – oder wenn die Angaben Wort für Wort dieselben sind,
            # auch wenn nur Füllwörter übrig bleiben.
            if (a and b and (a <= b or b <= a)) or palabras[i]["_t"] == palabras[j]["_t"]:
                padre[raiz(i)] = raiz(j)
    grupos, siguiente = {}, 1
    for i, p in enumerate(palabras):
        r = raiz(i)
        tam = sum(1 for k in range(len(palabras)) if raiz(k) == r)
        if tam == 1:
            p["g"] = 0                      # mit niemandem verwechselbar
        else:
            if r not in grupos: grupos[r] = siguiente; siguiente += 1
            p["g"] = grupos[r]

    salida = {}
    for p in palabras:
        salida.setdefault(p["nivel"], []).append(
            {"es": p["es"], "de": p["de"], "g": p["g"]})
    return salida, grupos


if __name__ == "__main__":
    salida, grupos = construir()
    total = sum(len(v) for v in salida.values())
    for niv in ("vorkurs", "u1", "u2"):
        lista = salida.get(niv, [])
        enConflicto = sum(1 for p in lista if p["g"])
        print(f"  {niv:8} {len(lista):4} Paare, davon {enConflicto} in einer Konfliktgruppe")
    print(f"\n{total} Paare, {len(grupos)} Konfliktgruppen")
    # Die Gruppen zeigen, damit man sie nachlesen kann
    porGrupo = {}
    for niv, lista in salida.items():
        for p in lista:
            if p["g"]: porGrupo.setdefault(p["g"], []).append(f'{p["es"]} ({p["de"]})')
    for g, miembros in sorted(porGrupo.items()):
        print(f"   Gruppe {g}: {', '.join(sorted(miembros))}")
    json.dump(salida, open(AQUI / "parejas.json", "w"), ensure_ascii=False,
              separators=(",", ":"))
