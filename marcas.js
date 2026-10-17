/* Bestmarken für alle Spiele an einer Stelle.
 *
 *   <script src="marcas.js"></script>
 *   const batidos = Marcas.registrar("hora", {puntos: 24, serie: 9, aciertos: 31});
 *   Marcas.mejor("hora", "puntos")      // beste Runde, oder null
 *   Marcas.lista("hora", batidos)       // fertiges HTML für den Endbildschirm
 *
 * Liegt im localStorage unter "cece-marcas":
 *   { spiel: { puntos, serie, aciertos, rapido } }
 * Die alten Einzelschlüssel (cece-hora-rec und so weiter) werden beim ersten
 * Laden übernommen, damit nichts verlorengeht.
 */
const Marcas = (function () {
  const CLAVE = "cece-marcas";

  // mejor: "max" = größer ist besser, "min" = kleiner ist besser
  const CAMPOS = {
    puntos:   { nombre: "Beste Runde",        mejor: "max", moneda: true },
    serie:    { nombre: "Längste Serie",      mejor: "max" },
    aciertos: { nombre: "Meiste richtig",     mejor: "max" },
    rapido:   { nombre: "Schnellste Antwort", mejor: "min", sufijo: " s", decimales: 2 },
  };

  const JUEGOS = [
    { id: "verbos",     nombre: "Verben",            icono: "🎣",  url: "verbos.html",
      campos: ["puntos", "serie", "aciertos"] },
    { id: "einmaleins", nombre: "Einmaleins",        icono: "✖️",  url: "einmaleins.html",
      campos: ["puntos", "serie", "aciertos", "rapido"] },
    { id: "hora",       nombre: "Uhrzeit",           icono: "🕰️",  url: "hora.html",
      campos: ["puntos", "serie", "aciertos"] },
    { id: "estar",      nombre: "ser · estar · hay", icono: "📍",  url: "estar.html",
      campos: ["puntos", "serie", "aciertos"] },
  ];

  let datos = null;

  // Was früher in eigenen Schlüsseln lag, einmalig übernehmen
  function migrar(d) {
    const viejos = { einmaleins: "cece-einmaleins-rec", hora: "cece-hora-rec", estar: "cece-estar-rec" };
    for (const id in viejos) {
      try {
        const s = localStorage.getItem(viejos[id]);
        if (!s) continue;
        const v = JSON.parse(s) || {};
        d[id] = d[id] || {};
        for (const k of ["serie", "aciertos", "rapido"]) {
          if (typeof v[k] === "number" && !(k in d[id])) d[id][k] = v[k];
        }
        localStorage.removeItem(viejos[id]);
      } catch (e) {}
    }
  }

  function cargar() {
    if (datos) return datos;
    datos = {};
    try {
      const s = localStorage.getItem(CLAVE);
      if (s) datos = JSON.parse(s) || {};
    } catch (e) { datos = {}; }
    const antes = JSON.stringify(datos);
    migrar(datos);
    if (JSON.stringify(datos) !== antes) guardar();
    return datos;
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) {}
  }

  return {
    CAMPOS, JUEGOS,

    juego(id) { return JUEGOS.find(j => j.id === id) || null; },

    leer(id) { return cargar()[id] || {}; },

    mejor(id, campo) {
      const v = this.leer(id)[campo];
      return (v === undefined || v === null) ? null : v;
    },

    // Neue Werte eintragen. Zurück kommt, welche Bestmarken gefallen sind.
    registrar(id, valores) {
      const d = cargar();
      const m = d[id] = d[id] || {};
      const batidos = {};
      for (const k in valores) {
        const c = CAMPOS[k], v = valores[k];
        if (!c || typeof v !== "number" || !isFinite(v)) continue;
        const hay = (k in m);
        const mejorQue = c.mejor === "min" ? v < m[k] : v > m[k];
        if (!hay || mejorQue) { m[k] = v; batidos[k] = true; }
      }
      guardar();
      return batidos;
    },

    texto(campo, valor) {
      const c = CAMPOS[campo];
      if (valor === null || valor === undefined) return "–";
      let t = c.decimales ? valor.toFixed(c.decimales) : String(valor);
      if (c.sufijo) t += c.sufijo;
      if (c.moneda) t += ' <img class="coin" src="coin.svg" alt="">';
      return t;
    },

    // Fertige Liste für den Endbildschirm. "batidos" markiert das Neue.
    lista(id, batidos) {
      const j = this.juego(id);
      if (!j) return "";
      const m = this.leer(id);
      return j.campos.map(k =>
        "<div><span>" + CAMPOS[k].nombre + "</span><b>" + this.texto(k, m[k]) +
        (batidos && batidos[k] ? ' <span class="nuevo">neu!</span>' : "") + "</b></div>"
      ).join("");
    },

    // Hat sie dieses Spiel schon einmal gespielt?
    jugado(id) { return Object.keys(this.leer(id)).length > 0; },
  };
})();
