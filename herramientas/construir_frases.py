# -*- coding: utf-8 -*-
"""Baut die Lückensätze zusammen und meldet alles, was nicht in ihren
Wortschatz passt.

Die Lösungen werden abgeleitet, nicht abgeschrieben:
  * Verbformen aus verbos_tabla.json (gegen den Anhang ihres Buches geprüft)
  * Artikel aus dem Genus im Wortschatz
Nur bei Bedeutungslücken stehen die Antworten von Hand in frases.py.

Die Stufe eines Satzes ist die höchste Stufe, die eines seiner Wörter hat.
"""
import json, pathlib, random, re, sys, unicodedata

AQUI = pathlib.Path(__file__).parent
sys.path.insert(0, str(AQUI))
from frases import VERBO, ARTICULO, PALABRA, FUNCION, PLURALES, REGULARES_EXTRA

ORDEN = {"vorkurs": 0, "u1": 1, "u2": 2}
PERSONAS = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"]

pool = {p["es"]: p for p in json.load(open(AQUI / "pool.json"))}
tabla = {v["inf"]: v for v in json.load(open(AQUI / "verbos_tabla.json"))}

TERMINACIONES = {
    "ar": ["o", "as", "a", "amos", "áis", "an"],
    "er": ["o", "es", "e", "emos", "éis", "en"],
    "ir": ["o", "es", "e", "imos", "ís", "en"],
}

# Die zusätzlichen regelmäßigen Verben nach Regel bilden – und die von Hand
# eingetragene ich-Form als Gegenprobe nehmen. Passt sie nicht, ist das Verb
# nicht regelmäßig und darf nicht nach Regel konjugiert werden.
for inf, yo_mano in REGULARES_EXTRA.items():
    if inf in tabla:
        raise SystemExit(f"{inf} steht schon in der Verbtabelle")
    if inf not in pool:
        raise SystemExit(f"{inf} steht nicht in ihrem Wortschatz")
    clase = inf[-2:]
    if clase not in TERMINACIONES:
        raise SystemExit(f"{inf} endet nicht auf -ar/-er/-ir")
    raiz = inf[:-2]
    formas = [raiz + t for t in TERMINACIONES[clase]]
    if formas[0] != yo_mano:
        raise SystemExit(f"{inf}: Regel ergibt „{formas[0]}“, von Hand steht da „{yo_mano}“ "
                         "– das Verb ist nicht regelmäßig")
    tabla[inf] = {"inf": inf, "clase": clase, "formas": formas, "de": None}

problemas = []
def mal(t): problemas.append(t)


def palabras_de(texto):
    """Alle spanischen Wörter eines Satzes, klein geschrieben."""
    return [w.lower() for w in re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+", texto)]


def nivel_de_palabra(w):
    """Stufe eines Wortes, oder None wenn unbekannt."""
    if w in pool: return pool[w]["nivel"]
    if w in FUNCION: return FUNCION[w]
    if w in tabla: return "u1"                 # Infinitiv eines bekannten Verbs
    # Konjugierte Form eines bekannten Verbs?
    for v in tabla.values():
        if w in [f.lower() for f in v["formas"]]: return "u1"
    # Mehrzahl eines bekannten Nomens?
    for sing, plu in PLURALES.items():
        if w == plu: return pool[sing]["nivel"] if sing in pool else "u1"
    # Regelmäßige Mehrzahl und Femininform: „el/la amigo/-a“ lernt sie als
    # Einheit, der Wortschatz führt aber nur „amigo“.
    for base, datos in pool.items():
        if len(base) < 3: continue
        formas = {base}
        formas.add(base + "s" if base[-1] in "aeiouáéíóú" else base + "es")
        if base.endswith("o"):
            fem = base[:-1] + "a"
            formas |= {fem, fem + "s", base + "s"}
        elif base[-1] not in "aeiouáéíóú":
            formas |= {base + "a", base + "as"}
        if w in formas: return datos["nivel"]
    return None


def revisar_malas(malas, nivel, etq):
    """Keine falsche Antwort darf über der Stufe der Aufgabe liegen – sonst
    rät sie zwischen Wörtern, die sie noch nie gesehen hat."""
    for m in malas:
        for w in palabras_de(m):
            n = nivel_de_palabra(w)
            if n is None: mal(f"{etq}: falsche Antwort „{m}“ ist unbekannt")
            elif ORDEN[n] > ORDEN[nivel]:
                mal(f"{etq}: falsche Antwort „{m}“ ist {n}, die Aufgabe aber {nivel}")


def nivel_de_frase(partes):
    """Höchste Stufe aller Wörter. Unbekannte Wörter werden gemeldet."""
    peor, desconocidas = "vorkurs", []
    for texto in partes:
        for w in palabras_de(texto):
            n = nivel_de_palabra(w)
            if n is None: desconocidas.append(w)
            elif ORDEN[n] > ORDEN[peor]: peor = n
    return peor, desconocidas


def revisar_frase(frase, etq):
    if frase.count("___") != 1:
        mal(f"{etq}: {frase.count('___')} Lücken statt einer — „{frase}“")
    if not frase.strip().endswith((".", "?", "!")):
        mal(f"{etq}: Satz endet ohne Satzzeichen — „{frase}“")
    if "¿" in frase and "?" not in frase:
        mal(f"{etq}: ¿ ohne schließendes ? — „{frase}“")
    if frase.strip().endswith("?") and "¿" not in frase:
        mal(f"{etq}: Frage ohne ¿ am Anfang — „{frase}“")


def construir():
    rng = random.Random(4711)
    salida = []

    # ---------------------------------------------------------- Verblücken
    for frase, lema, persona, de in VERBO:
        etq = f"verbo/{lema}/{persona}"
        revisar_frase(frase, etq)
        if lema not in tabla:
            mal(f"{etq}: „{lema}“ steht nicht in der Verbtabelle"); continue
        formas = tabla[lema]["formas"]
        sol = formas[persona]
        # Falsche Antworten: andere Personen desselben Verbs. Die sind echte
        # Formen, nur zur falschen Person – genau der Fehler, den sie macht.
        otras = [f for i, f in enumerate(formas) if f != sol]
        malas = rng.sample(otras, min(3, len(otras)))
        nivel, desc = nivel_de_frase([frase.replace("___", sol)])
        for w in desc: mal(f"{etq}: unbekanntes Wort „{w}“ in „{frase}“")
        revisar_malas(malas, nivel, etq)
        salida.append({"frase": frase, "sol": sol, "malas": malas, "de": de,
                       "tipo": "verbo", "nivel": nivel,
                       "porque": f"{PERSONAS[persona]} → {sol} ({lema})"})

    # -------------------------------------------------------- Artikellücken
    for frase, sust, clase, de in ARTICULO:
        etq = f"articulo/{sust}/{clase}"
        revisar_frase(frase, etq)
        if sust not in pool or not pool[sust].get("art"):
            mal(f"{etq}: „{sust}“ hat kein Genus im Wortschatz"); continue
        art = pool[sust]["art"]
        if art not in ("el", "la"):
            mal(f"{etq}: „{sust}“ steht im Wortschatz als „{art}“ — nur Einzahl benutzen")
            continue
        sol = art if clase == "def" else ("un" if art == "el" else "una")
        # Bestimmte Artikel bekommen bestimmte Artikel als falsche Antworten:
        # un/una lernt sie erst in Unidad 2, und eine Aufgabe, in der sie
        # zwischen unbekannten Wörtern raten muss, übt nichts.
        malas = ([a for a in ["el", "la", "los", "las"] if a != sol] if clase == "def"
                 else [a for a in ["un", "una", "el", "la"] if a != sol])[:3]
        nivel, desc = nivel_de_frase([frase.replace("___", sol)])
        for w in desc: mal(f"{etq}: unbekanntes Wort „{w}“ in „{frase}“")
        revisar_malas(malas, nivel, etq)
        salida.append({"frase": frase, "sol": sol, "malas": malas, "de": de,
                       "tipo": "articulo", "nivel": nivel,
                       "porque": f"{sust} ist {'männlich' if art == 'el' else 'weiblich'} → {sol} {sust}"})

    # ------------------------------------------------------ Bedeutungslücken
    for frase, sol, malas, de in PALABRA:
        etq = f"palabra/{sol}"
        revisar_frase(frase, etq)
        if sol in malas: mal(f"{etq}: Lösung steht auch bei den falschen Antworten")
        if len(set(malas)) != len(malas): mal(f"{etq}: falsche Antwort doppelt")
        if len(malas) != 3: mal(f"{etq}: {len(malas)} falsche Antworten statt drei")
        nivel, desc = nivel_de_frase([frase.replace("___", sol)])
        for w in desc: mal(f"{etq}: unbekanntes Wort „{w}“")
        revisar_malas(malas, nivel, etq)
        salida.append({"frase": frase, "sol": sol, "malas": list(malas), "de": de,
                       "tipo": "palabra", "nivel": nivel, "porque": ""})

    return salida


if __name__ == "__main__":
    frases = construir()
    if problemas:
        print(f"{len(problemas)} PROBLEME:")
        vistos = set()
        for p in problemas:
            if p in vistos: continue
            vistos.add(p); print("  - " + p)
        print(f"\n({len(vistos)} verschiedene)")
    else:
        print("keine Probleme")
    import collections
    print("\nSätze je Stufe:", dict(collections.Counter(f["nivel"] for f in frases)))
    print("Sätze je Art:  ", dict(collections.Counter(f["tipo"] for f in frases)))
    print("insgesamt:", len(frases))
    if not problemas:
        json.dump(frases, open(AQUI / "frases.json", "w"), ensure_ascii=False,
                  separators=(",", ":"))
        print("→ frases.json geschrieben")
