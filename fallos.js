/* Gemeinsames Fehlergedächtnis für alle Spiele in diesem Repo.
 *
 * Liegt im localStorage unter "cece-fallos":
 *   { spiel: { schlüssel: { mal, bien, t, etq } } }
 *   mal = wie oft falsch, bien = wie oft richtig,
 *   t   = wann zuletzt dran, etq = lesbarer Text für Listen
 *
 * Ein Spiel braucht nur zwei Zeilen:
 *   nach jeder Aufgabe:   Fallos.anotar("tablas", "7x8", richtig, "7 × 8 = 56")
 *   beim Aussuchen:       Fallos.peso("tablas", "7x8")   -> 1 (sitzt) bis 5 (wackelt)
 *
 * Dazu holt das Gedächtnis verpasste Aufgaben von selbst zurück:
 *   const otra = Fallos.pendiente("tablas");   // oder null
 * gibt ein paar Aufgaben später den Schlüssel zurück, der danebenging.
 */
const Fallos = (function () {
  const CLAVE = "cece-fallos";
  const MAX_POR_JUEGO = 400;      // damit der Speicher nicht endlos wächst
  const PRONTO_MIN = 3;           // frühestens so viele Aufgaben später
  const PRONTO_MAX = 7;           // spätestens so viele Aufgaben später

  let datos = null;
  const cola = {};                // offene Wiedervorlagen, nur für diese Sitzung
  const reloj = {};               // Aufgabenzähler pro Spiel

  function cargar() {
    if (datos) return datos;
    datos = {};
    try {
      const s = localStorage.getItem(CLAVE);
      if (s) datos = JSON.parse(s) || {};
    } catch (e) { datos = {}; }
    return datos;
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) {}
  }

  // Wenn ein Spiel zu viele Einträge hat, die ältesten rauswerfen
  function podar(juego) {
    const d = datos[juego];
    const claves = Object.keys(d);
    if (claves.length <= MAX_POR_JUEGO) return;
    claves.sort((a, b) => (d[a].t || 0) - (d[b].t || 0));
    for (let i = 0; i < claves.length - MAX_POR_JUEGO; i++) delete d[claves[i]];
  }

  return {
    // Ergebnis einer Aufgabe festhalten
    anotar(juego, clave, bien, etiqueta) {
      const d = cargar();
      if (!d[juego]) d[juego] = {};
      const r = d[juego][clave] || { mal: 0, bien: 0, t: 0, etq: "" };
      if (bien) r.bien++; else r.mal++;
      r.t = Date.now();
      if (etiqueta) r.etq = etiqueta;
      d[juego][clave] = r;
      podar(juego);
      guardar();

      reloj[juego] = (reloj[juego] || 0) + 1;
      if (!cola[juego]) cola[juego] = [];
      if (!bien) {
        // Danebengegangen: in ein paar Aufgaben nochmal bringen
        const espera = PRONTO_MIN + Math.floor(Math.random() * (PRONTO_MAX - PRONTO_MIN + 1));
        cola[juego] = cola[juego].filter(p => p.clave !== clave);
        cola[juego].push({ clave, cuando: reloj[juego] + espera });
      }
    },

    // Wie oft soll diese Aufgabe drankommen? 1 = sitzt, bis 5 = wackelt sehr
    peso(juego, clave) {
      const d = cargar();
      const r = d[juego] && d[juego][clave];
      if (!r) return 2;                       // noch nie dran: etwas bevorzugen
      const total = r.mal + r.bien;
      if (!total) return 2;
      return 1 + 4 * (r.mal / total);
    },

    // Einen Schlüssel aus einer Liste ziehen, Wackelkandidaten häufiger
    elegir(juego, claves) {
      let suma = 0;
      const pesos = claves.map(c => { const p = this.peso(juego, c); suma += p; return p; });
      let r = Math.random() * suma;
      for (let i = 0; i < claves.length; i++) { r -= pesos[i]; if (r < 0) return claves[i]; }
      return claves[claves.length - 1];
    },

    // Fällige Wiedervorlage abholen (oder null)
    pendiente(juego) {
      const q = cola[juego];
      if (!q || !q.length) return null;
      const ahora = reloj[juego] || 0;
      const i = q.findIndex(p => p.cuando <= ahora);
      if (i < 0) return null;
      return q.splice(i, 1)[0].clave;
    },

    // Die wackeligsten Aufgaben, für Listen am Rundenende
    debiles(juego, cuantos) {
      const d = cargar();
      if (!d[juego]) return [];
      return Object.entries(d[juego])
        .filter(([, r]) => r.mal > 0)
        .sort((a, b) => (b[1].mal / (b[1].mal + b[1].bien)) - (a[1].mal / (a[1].mal + a[1].bien))
                        || b[1].mal - a[1].mal)
        .slice(0, cuantos || 6)
        .map(([clave, r]) => ({ clave, etq: r.etq || clave, mal: r.mal, bien: r.bien }));
    },

    // Wie oft war diese Aufgabe schon dran? { mal, bien }
    intentos(juego, clave) {
      const d = cargar();
      const r = d[juego] && d[juego][clave];
      return r ? { mal: r.mal, bien: r.bien } : { mal: 0, bien: 0 };
    },

    // Wie sicher sitzt diese Aufgabe? 0 = gar nicht, 1 = sitzt. null = nie dran gewesen
    dominio(juego, clave) {
      const d = cargar();
      const r = d[juego] && d[juego][clave];
      if (!r || !(r.mal + r.bien)) return null;
      return r.bien / (r.mal + r.bien);
    },

    // Alles zu einem Spiel vergessen
    olvidar(juego) {
      const d = cargar();
      delete d[juego];
      delete cola[juego];
      guardar();
    },
  };
})();
