# -*- coding: utf-8 -*-
"""Prüft frases.json nach, ohne construir_frases.py zu benutzen.

Der wichtigste Test steht in subjeto_de(): Er liest aus dem Satzanfang ab,
welche Person gemeint ist, und vergleicht sie mit der Form, die im Spiel als
Lösung steht. Eine vertauschte Person – „Mi hermana vivo en Madrid“ – fällt
keinem Wortschatztest auf, wäre aber genau der Fehler, den sie dann lernt.
"""
import collections, json, pathlib, re, sys

AQUI = pathlib.Path(__file__).parent
sys.path.insert(0, str(AQUI))
from frases import FUNCION, PLURALES, REGULARES_EXTRA

ORDEN = {"vorkurs": 0, "u1": 1, "u2": 2}
ARTICULOS = {"el", "la", "los", "las", "un", "una"}

fallos = []
mal = fallos.append

# Woran man die Person erkennt. Reihenfolge zählt: „Mis amigos“ vor „Mi“.
SUJETOS = [
    (r"^¿?\s*yo\b", 0), (r"^¿?\s*tú\b", 1),
    (r"^¿?\s*nosotros\b", 3), (r"^¿?\s*vosotros\b", 4),
    (r"^¿?\s*(ellos|ellas)\b", 5),
    (r"^¿?\s*(mis|los|las)\s+\w+", 5),
    (r"^¿?\s*(él|ella)\b", 2),
    (r"^¿?\s*(mi|el|la)\s+\w+", 2),
]


PRONOMBRES = {"yo": 0, "tú": 1, "él": 2, "ella": 2,
              "nosotros": 3, "vosotros": 4, "ellos": 5, "ellas": 5}


def subjeto_de(frase):
    """Welche Person verlangt dieser Satz? None, wenn unklar.

    Zuerst nach einem Personalpronomen irgendwo im Satz suchen: bei
    „¿___ tú español?“ steht das Subjekt hinter der Lücke, ein Blick nur auf
    den Satzanfang ginge daneben.
    """
    t = frase.strip().lower()
    for w in re.findall(r"[a-záéíóúüñ]+", t):
        if w in PRONOMBRES: return PRONOMBRES[w]
    t2 = re.sub(r"^¿\s*", "¿", t.replace("¿", "¿ "))
    for patron, persona in SUJETOS:
        if re.match(patron, t2): return persona
    return None


def main():
    frases = json.load(open(AQUI / "frases.json"))
    pool = {p["es"]: p for p in json.load(open(AQUI / "pool.json"))}
    tabla = {v["inf"]: v for v in json.load(open(AQUI / "verbos_tabla.json"))}
    # Die Zusatzverben noch einmal selbst bilden, nicht übernehmen
    TERM = {"ar": ["o","as","a","amos","áis","an"], "er": ["o","es","e","emos","éis","en"],
            "ir": ["o","es","e","imos","ís","en"]}
    for inf, yo in REGULARES_EXTRA.items():
        formas = [inf[:-2] + x for x in TERM[inf[-2:]]]
        if formas[0] != yo: mal(f"{inf}: ich-Form „{yo}“ passt nicht zur Regel „{formas[0]}“")
        tabla[inf] = {"inf": inf, "formas": formas}
    todas_formas = {}
    for v in tabla.values():
        for i, f in enumerate(v["formas"]): todas_formas.setdefault(f, []).append((v["inf"], i))

    # --- Wortschatzprüfung noch einmal eigenständig
    def conocida(w):
        if w in pool or w in FUNCION or w in tabla or w in todas_formas: return True
        if w in PLURALES.values(): return True
        for base, d in pool.items():
            if len(base) < 3: continue
            fs = {base, base + ("s" if base[-1] in "aeiouáéíóú" else "es")}
            if base.endswith("o"): fs |= {base[:-1] + "a", base[:-1] + "as", base + "s"}
            elif base[-1] not in "aeiouáéíóú": fs |= {base + "a", base + "as"}
            if w in fs: return True
        return False

    def nivel_palabra(w):
        if w in pool: return pool[w]["nivel"]
        if w in FUNCION: return FUNCION[w]
        if w in tabla or w in todas_formas: return "u1"
        for sing, plu in PLURALES.items():
            if w == plu: return pool[sing]["nivel"] if sing in pool else "u1"
        for base, d in pool.items():
            if len(base) < 3: continue
            fs = {base, base + ("s" if base[-1] in "aeiouáéíóú" else "es")}
            if base.endswith("o"): fs |= {base[:-1] + "a", base[:-1] + "as", base + "s"}
            elif base[-1] not in "aeiouáéíóú": fs |= {base + "a", base + "as"}
            if w in fs: return d["nivel"]
        return None

    marcos = {}
    por_tipo = collections.Counter()
    por_nivel = collections.Counter()
    personas = collections.Counter()

    for i, f in enumerate(frases):
        etq = f"#{i} „{f['frase']}“"
        por_tipo[f["tipo"]] += 1
        por_nivel[f["nivel"]] += 1

        # --- Form
        if f["frase"].count("___") != 1: mal(f"{etq}: nicht genau eine Lücke")
        # Eine Lücke am Satzanfang stünde nach dem Einsetzen klein da
        if f["frase"].lstrip().startswith("___"):
            mal(f"{etq}: Lücke am Satzanfang — die Antwort stünde klein")
        if not f["de"].strip(): mal(f"{etq}: keine Übersetzung")
        elif not f["de"][0].isupper(): mal(f"{etq}: Übersetzung beginnt klein: „{f['de']}“")
        elif not f["de"].strip().endswith((".", "?", "!")):
            mal(f"{etq}: Übersetzung ohne Satzzeichen: „{f['de']}“")
        if f["sol"] in f["malas"]: mal(f"{etq}: Lösung steht bei den falschen Antworten")
        if len(set(f["malas"])) != 3: mal(f"{etq}: {len(set(f['malas']))} verschiedene falsche Antworten")

        lleno = f["frase"].replace("___", f["sol"])
        if "___" in lleno: mal(f"{etq}: Lücke bleibt nach dem Einsetzen")

        # --- Ein Fragesatz im Spanischen braucht beide Fragezeichen
        if lleno.strip().endswith("?") and not lleno.strip().startswith("¿"):
            mal(f"{etq}: Frage ohne ¿")

        # --- Wortschatz und Stufe
        peor = "vorkurs"
        for w in re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+", lleno.lower()):
            n = nivel_palabra(w)
            if n is None: mal(f"{etq}: unbekanntes Wort „{w}“")
            elif ORDEN[n] > ORDEN[peor]: peor = n
        for w in f["malas"]:
            if f["tipo"] == "palabra" and not conocida(w.lower()):
                mal(f"{etq}: falsche Antwort „{w}“ steht nicht im Wortschatz")
        if peor != f["nivel"]: mal(f"{etq}: als {f['nivel']} eingestuft, benutzt aber {peor}")
        # Keine falsche Antwort darf über der Stufe der Aufgabe liegen
        for m in f["malas"]:
            for w in re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+", m.lower()):
                n = nivel_palabra(w)
                if n is None: mal(f"{etq}: falsche Antwort „{m}“ unbekannt")
                elif ORDEN[n] > ORDEN[f["nivel"]]:
                    mal(f"{etq}: falsche Antwort „{m}“ ist {n}, Aufgabe aber {f['nivel']}")

        # --- Je nach Art
        if f["tipo"] == "verbo":
            if f["sol"] not in todas_formas:
                mal(f"{etq}: „{f['sol']}“ ist keine Form eines bekannten Verbs"); continue
            lemas = {l for l, _ in todas_formas[f["sol"]]}
            personas_sol = {pp for _, pp in todas_formas[f["sol"]]}
            # Die falschen Antworten müssen Formen DESSELBEN Verbs sein
            for m in f["malas"]:
                if m not in todas_formas:
                    mal(f"{etq}: falsche Antwort „{m}“ ist keine echte Verbform"); continue
                if not ({l for l, _ in todas_formas[m]} & lemas):
                    mal(f"{etq}: falsche Antwort „{m}“ gehört zu einem anderen Verb")
            # Und die Person muss zum Subjekt passen
            esperada = subjeto_de(f["frase"])
            if esperada is None:
                mal(f"{etq}: Subjekt nicht erkennbar — Person nicht prüfbar")
            elif esperada not in personas_sol:
                mal(f"{etq}: Satzanfang verlangt Person {esperada}, "
                    f"„{f['sol']}“ ist aber Person {sorted(personas_sol)}")
            else:
                personas[esperada] += 1

        elif f["tipo"] == "articulo":
            if f["sol"] not in ARTICULOS: mal(f"{etq}: „{f['sol']}“ ist kein Artikel")
            for m in f["malas"]:
                if m not in ARTICULOS: mal(f"{etq}: falsche Antwort „{m}“ ist kein Artikel")
            # Das Nomen muss direkt hinter der Lücke stehen
            resto = f["frase"].split("___", 1)[1].strip()
            sust = re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+", resto)
            if not sust: mal(f"{etq}: hinter dem Artikel steht kein Wort"); continue
            sust = sust[0].lower()
            if sust not in pool or not pool[sust].get("art"):
                mal(f"{etq}: „{sust}“ hat kein Genus im Wortschatz"); continue
            art = pool[sust]["art"]
            esperado = art if f["sol"] in ("el", "la") else ("un" if art == "el" else "una")
            if f["sol"] != esperado:
                mal(f"{etq}: „{sust}“ ist {art}, Lösung müsste „{esperado}“ sein, nicht „{f['sol']}“")

        else:   # palabra
            if f["sol"] not in pool:
                mal(f"{etq}: Lösung „{f['sol']}“ steht nicht im Wortschatz")

        # --- Kein Satzrahmen darf zweimal mit verschiedenen Lösungen vorkommen
        clave = f["frase"]
        if clave in marcos and marcos[clave] != f["sol"]:
            mal(f"{etq}: derselbe Satz hat anderswo die Lösung „{marcos[clave]}“ — zweideutig")
        marcos[clave] = f["sol"]

    # --- Doppelte Sätze
    cuenta = collections.Counter(f["frase"] + "|" + f["sol"] for f in frases)
    for k, n in cuenta.items():
        if n > 1: mal(f"Satz kommt {n}x vor: „{k.split('|')[0]}“")

    print(f"{len(frases)} Sätze — {dict(por_tipo)}")
    print(f"Stufen: {dict(por_nivel)}")
    print(f"Verblücken je Person: {dict(sorted(personas.items()))}  "
          f"(0=yo 1=tú 2=él 3=nosotros 4=vosotros 5=ellos)")
    print()
    print(f"{len(fallos)} MÄNGEL:\n" + "\n".join("  - " + f for f in fallos[:30])
          if fallos else "keine Mängel")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
