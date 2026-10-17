/* Ceces Avatar – Teileliste und Zeichnung.
 *
 * Diese Datei ist bewusst eigenständig: Ein anderes Spiel kann sie einfach
 * mitladen und bekommt denselben Avatar, ohne irgendetwas zu wissen.
 *
 *   <script src="avatar.js"></script>
 *   const yo = Avatar.cargar();                  // was sie zusammengestellt hat
 *   el.innerHTML = Avatar.dibujar(yo, "lado");   // "frente" oder "lado"
 *
 * Jedes Teil wird in beiden Ansichten gezeichnet: "frente" von vorne zum
 * Zusammenstellen, "lado" von der Seite (nach rechts schauend) für ein
 * Spiel, in dem die Figur läuft.
 *
 * Gespeichert wird im localStorage:
 *   cece-avatar = { partes: {...}, compradas: [...] }
 *   cece-coins  = Münzen, geteilt mit allen Spielen
 */
const Avatar = (function () {
  const CLAVE = "cece-avatar";

  // ---------- Was es zu haben gibt ----------
  // precio 0 = Grundausstattung, gehört ihr von Anfang an.
  const PARTES = {
    piel: {
      nombre: "Haut", items: [
        { id: "arena", nombre: "Sand",    color: "#f6d0ab", precio: 0 },
        { id: "miel",  nombre: "Honig",   color: "#e3a86f", precio: 0 },
        { id: "cacao", nombre: "Kakao",   color: "#a56a3e", precio: 0 },
        { id: "noche", nombre: "Espresso",color: "#6d4326", precio: 30 },
        { id: "menta", nombre: "Minze",   color: "#9bd9bf", precio: 90 },
        { id: "lila",  nombre: "Flieder", color: "#c7a6e8", precio: 90 },
      ]
    },
    colorPelo: {
      nombre: "Haarfarbe", items: [
        { id: "castano", nombre: "Braun",   color: "#6b3f22", precio: 0 },
        { id: "negro",   nombre: "Schwarz", color: "#241a2e", precio: 0 },
        { id: "rubio",   nombre: "Blond",   color: "#e8c160", precio: 0 },
        { id: "rojo",    nombre: "Rot",     color: "#c2532a", precio: 25 },
        { id: "rosa",    nombre: "Rosa",    color: "#ff79b8", precio: 70 },
        { id: "azul",    nombre: "Blau",    color: "#4f7de0", precio: 70 },
      ]
    },
    pelo: {
      nombre: "Haare", items: [
        { id: "corto",  nombre: "Kurz",    precio: 0 },
        { id: "largo",  nombre: "Lang",    precio: 0 },
        { id: "coleta", nombre: "Zopf",    precio: 40 },
        { id: "rizado", nombre: "Locken",  precio: 60 },
        { id: "mono",   nombre: "Dutt",    precio: 60 },
        { id: "punk",   nombre: "Irokese", precio: 120 },
      ]
    },
    ojos: {
      nombre: "Augen", items: [
        { id: "normal",  nombre: "Normal",   precio: 0 },
        { id: "grandes", nombre: "Groß",     precio: 0 },
        { id: "feliz",   nombre: "Fröhlich", precio: 30 },
        { id: "dormido", nombre: "Verschlafen", precio: 50 },
        { id: "estrella",nombre: "Sterne",   precio: 110 },
      ]
    },
    ropa: {
      nombre: "Kleidung", items: [
        { id: "liso",    nombre: "Einfarbig", color: "#7b3fe4", precio: 0 },
        { id: "rayas",   nombre: "Streifen",  color: "#e4573f", precio: 0 },
        { id: "lunares", nombre: "Punkte",    color: "#2fa5a0", precio: 40 },
        { id: "capucha", nombre: "Kapuze",    color: "#3b5ccc", precio: 70 },
        { id: "estrellas", nombre: "Sterne",  color: "#2b1a4a", precio: 100 },
        { id: "arcoiris", nombre: "Regenbogen", precio: 150 },
      ]
    },
    extra: {
      nombre: "Extra", items: [
        { id: "nada",    nombre: "Nichts",      precio: 0 },
        { id: "gafas",   nombre: "Brille",      precio: 35 },
        { id: "bufanda", nombre: "Schal",       precio: 55 },
        { id: "gorro",   nombre: "Mütze",       precio: 80 },
        { id: "cascos",  nombre: "Kopfhörer",   precio: 110 },
        { id: "flor",    nombre: "Blume",       precio: 140 },
      ]
    },
    fondo: {
      nombre: "Hintergrund", items: [
        { id: "liso",    nombre: "Schlicht", precio: 0,   de: "#ffd9ec", a: "#cfd9ff" },
        { id: "cielo",   nombre: "Himmel",   precio: 60,  de: "#8fd3ff", a: "#dff3ff", deco: "nubes" },
        { id: "playa",   nombre: "Strand",   precio: 90,  de: "#ffe6a8", a: "#9fe0e8", deco: "sol" },
        { id: "bosque",  nombre: "Wald",     precio: 120, de: "#bfe8a8", a: "#5fa86a", deco: "arboles" },
        { id: "noche",   nombre: "Nacht",    precio: 160, de: "#2b1a4a", a: "#6a4ba8", deco: "estrellas", oscuro: true },
        { id: "espacio", nombre: "Weltall",  precio: 220, de: "#140a2e", a: "#3b1d6e", deco: "planeta", oscuro: true },
      ]
    },
  };

  const ORDEN = ["piel", "pelo", "colorPelo", "ojos", "ropa", "extra", "fondo"];

  function buscar(cat, id) {
    const lista = PARTES[cat].items;
    return lista.find(x => x.id === id) || lista[0];
  }

  function porDefecto() {
    const sel = {};
    for (const cat of ORDEN) sel[cat] = PARTES[cat].items[0].id;
    sel.ropa = "liso";
    return sel;
  }

  // ---------- Speichern ----------
  function cargar() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) {}
    const sel = Object.assign(porDefecto(), d.partes || {});
    // Nur Teile zulassen, die es auch gibt
    for (const cat of ORDEN) if (!PARTES[cat].items.some(x => x.id === sel[cat])) sel[cat] = PARTES[cat].items[0].id;
    sel.compradas = d.compradas || [];
    return sel;
  }

  function guardar(sel) {
    const partes = {};
    for (const cat of ORDEN) partes[cat] = sel[cat];
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ partes, compradas: sel.compradas || [] }));
    } catch (e) {}
  }

  // Gehört ihr das Teil schon? Die Grundausstattung immer.
  function tiene(sel, cat, id) {
    const it = buscar(cat, id);
    return it.precio === 0 || (sel.compradas || []).includes(cat + ":" + id);
  }

  // ---------- Zeichnen ----------
  // Kopf: vorne Mitte 50, von der Seite nach rechts verschoben auf 52.
  const R = 25;

  function fondoSVG(f) {
    const id = "g" + Math.random().toString(36).slice(2, 8);
    let s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="' + f.de + '"/>' +
            '<stop offset="1" stop-color="' + f.a + '"/></linearGradient></defs>' +
            '<rect x="0" y="0" width="100" height="130" fill="url(#' + id + ')"/>';
    if (f.deco === "nubes") {
      s += '<g fill="#ffffffcc"><ellipse cx="22" cy="26" rx="14" ry="7"/>' +
           '<ellipse cx="78" cy="48" rx="11" ry="5.5"/></g>';
    } else if (f.deco === "sol") {
      s += '<circle cx="78" cy="22" r="11" fill="#ffd34d"/>' +
           '<rect x="0" y="104" width="100" height="26" fill="#ffe6a8"/>';
    } else if (f.deco === "arboles") {
      s += '<g fill="#2f7a46"><path d="M14 92 l10 -26 l10 26z"/><path d="M78 96 l9 -22 l9 22z"/></g>' +
           '<rect x="0" y="104" width="100" height="26" fill="#4a8f52"/>';
    } else if (f.deco === "estrellas") {
      s += '<g fill="#ffd34d">';
      const p = [[14,20],[32,12],[70,18],[86,34],[24,46],[80,62]];
      for (const [x, y] of p) s += '<circle cx="' + x + '" cy="' + y + '" r="1.8"/>';
      s += '</g><circle cx="78" cy="24" r="8" fill="#fff6d0"/>';
    } else if (f.deco === "planeta") {
      s += '<g fill="#ffffff"><circle cx="16" cy="18" r="1.6"/><circle cx="40" cy="10" r="1.2"/>' +
           '<circle cx="88" cy="40" r="1.6"/><circle cx="26" cy="54" r="1.2"/></g>' +
           '<circle cx="76" cy="26" r="12" fill="#ff9d5c"/>' +
           '<ellipse cx="76" cy="26" rx="19" ry="4.5" fill="none" stroke="#ffd34d" stroke-width="2.2"/>';
    }
    return s;
  }

  // Haare in zwei Lagen, damit sie von der Seite nicht im Gesicht landen:
  //   "detras" – was hinter dem Kopf hängt (lange Strähnen, Zopf)
  //   "encima" – Kappe, Locken, Dutt, Irokese
  // cx/cy ist die Kopfmitte. Von der Seite schaut die Figur nach rechts,
  // die Haarmasse liegt also links.
  function peloSVG(estilo, c, lado, cx, cy, capa) {
    const g = (d) => '<path d="' + d + '" fill="' + c + '"/>';
    let s = "";

    if (capa === "detras") {
      if (estilo === "largo") {
        if (lado) {
          s += g("M" + (cx - R + 2) + " " + (cy - 8) + " q-15 36 -1 48 q13 3 17 -7 q-12 -18 -5 -41 z");
        } else {
          s += g("M" + (cx - R + 1) + " " + (cy - 4) + " q-9 32 1 40 q7 2 9 -5 q-7 -14 -4 -35 z");
          s += g("M" + (cx + R - 1) + " " + (cy - 4) + " q9 32 -1 40 q-7 2 -9 -5 q7 -14 4 -35 z");
        }
      } else if (estilo === "coleta") {
        const px = lado ? cx - R + 1 : cx + R - 2;
        const d = lado ? -1 : 1;
        s += g("M" + px + " " + (cy - 6) + " q" + (16 * d) + " 6 " + (12 * d) + " 24" +
               " q" + (-4 * d) + " 7 " + (-9 * d) + " 4 q" + (5 * d) + " -14 " + (-3 * d) + " -24 z");
      }
      return s;
    }

    // ---- encima ----
    if (estilo === "punk") {
      s += g("M" + (cx - R) + " " + cy + " A" + R + " " + R + " 0 0 1 " + (cx + R) + " " + cy +
             " L" + (cx + 8) + " " + (cy - 10) + " L" + (cx - 8) + " " + (cy - 10) + " Z");
      s += g("M" + (cx - 11) + " " + (cy - 20) + " Q" + cx + " " + (cy - 46) + " " + (cx + 11) + " " + (cy - 20) + " Z");
      return s;
    }
    s += g("M" + (cx - R) + " " + cy + " A" + R + " " + R + " 0 0 1 " + (cx + R) + " " + cy +
           " L" + (cx + R) + " " + (cy - 6) + " Q" + cx + " " + (cy + 9) + " " + (cx - R) + " " + (cy - 6) + " Z");
    if (estilo === "rizado") {
      const pts = lado ? [[-20,-14],[-10,-22],[2,-24],[13,-18],[19,-8]] : [[-19,-13],[-10,-22],[0,-25],[10,-22],[19,-13]];
      for (const [dx, dy] of pts)
        s += '<circle cx="' + (cx + dx) + '" cy="' + (cy + dy) + '" r="9" fill="' + c + '"/>';
    } else if (estilo === "mono") {
      s += '<circle cx="' + (lado ? cx - 13 : cx) + '" cy="' + (cy - R - 4) + '" r="9" fill="' + c + '"/>';
    }
    return s;
  }

  function ojosSVG(estilo, lado, cx, cy) {
    const y = cy - 2;
    const xs = lado ? [cx + 12] : [cx - 9, cx + 9];
    let s = "";
    for (const x of xs) {
      if (estilo === "feliz") {
        s += '<path d="M' + (x - 5) + ' ' + (y + 2) + ' q5 -7 10 0" fill="none" stroke="#2b1a4a" stroke-width="2.4" stroke-linecap="round"/>';
      } else if (estilo === "dormido") {
        s += '<path d="M' + (x - 5) + ' ' + y + ' q5 5 10 0" fill="none" stroke="#2b1a4a" stroke-width="2.4" stroke-linecap="round"/>';
      } else if (estilo === "estrella") {
        s += '<path d="M' + x + ' ' + (y - 6) + ' l1.8 4.2 l4.6 .4 l-3.5 3.1 l1.1 4.5 l-4 -2.4 l-4 2.4 l1.1 -4.5 l-3.5 -3.1 l4.6 -.4 z" fill="#ffd34d" stroke="#2b1a4a" stroke-width="1"/>';
      } else {
        const r = estilo === "grandes" ? 5.2 : 3.6;
        s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2b1a4a"/>';
        s += '<circle cx="' + (x + r * 0.35) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.33) + '" fill="#fff"/>';
      }
    }
    return s;
  }

  // Oberkörper samt Muster. x/w ist je Ansicht anders.
  function ropaSVG(it, lado, x, w, y, h) {
    const id = "r" + Math.random().toString(36).slice(2, 8);
    const base = it.color || "#7b3fe4";
    let s = '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w +
            '" height="' + h + '" rx="13"/></clipPath>';
    if (it.id === "arcoiris") {
      const cols = ["#e4573f", "#ffb03a", "#ffd34d", "#5fbf6a", "#4f7de0", "#9b5de5"];
      s += '<g clip-path="url(#' + id + ')">';
      cols.forEach((c, i) => {
        s += '<rect x="' + x + '" y="' + (y + i * h / cols.length) + '" width="' + w +
             '" height="' + (h / cols.length + 0.6) + '" fill="' + c + '"/>';
      });
      s += "</g>";
      return s;
    }
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="13" fill="' + base + '"/>';
    s += '<g clip-path="url(#' + id + ')">';
    if (it.id === "rayas") {
      for (let i = 0; i < 6; i++)
        s += '<rect x="' + x + '" y="' + (y + 4 + i * 7) + '" width="' + w + '" height="3.4" fill="#ffffffcc"/>';
    } else if (it.id === "lunares") {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++)
        s += '<circle cx="' + (x + 7 + i * (w - 14) / 3) + '" cy="' + (y + 9 + j * 12) + '" r="2.6" fill="#ffffffcc"/>';
    } else if (it.id === "estrellas") {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const sx = x + 9 + i * (w - 18) / 2, sy = y + 12 + j * 16;
        s += '<path d="M' + sx + ' ' + (sy - 4) + ' l1.2 2.8 l3 .3 l-2.3 2 l.7 3 l-2.6 -1.6 l-2.6 1.6 l.7 -3 l-2.3 -2 l3 -.3 z" fill="#ffd34d"/>';
      }
    } else if (it.id === "capucha") {
      s += '<path d="M' + (x + w / 2 - 10) + ' ' + y + ' q10 12 20 0" fill="none" stroke="#ffffffaa" stroke-width="2.4"/>';
    }
    s += "</g>";
    return s;
  }

  function extraSVG(id, lado, cx, cy) {
    if (id === "gafas") {
      if (lado) return '<g fill="none" stroke="#2b1a4a" stroke-width="2.2">' +
        '<circle cx="' + (cx + 12) + '" cy="' + (cy - 2) + '" r="7.5" fill="#ffffff66"/>' +
        '<path d="M' + (cx + 4.5) + ' ' + (cy - 3) + " L" + (cx - 12) + " " + (cy - 5) + '"/></g>';
      return '<g fill="#ffffff66" stroke="#2b1a4a" stroke-width="2.2">' +
        '<circle cx="' + (cx - 9) + '" cy="' + (cy - 2) + '" r="7.5"/>' +
        '<circle cx="' + (cx + 9) + '" cy="' + (cy - 2) + '" r="7.5"/>' +
        '<path d="M' + (cx - 1.5) + ' ' + (cy - 2) + ' h3" fill="none"/></g>';
    }
    if (id === "gorro") {
      const d = "M" + (cx - R - 1) + " " + (cy - 6) + " a" + (R + 1) + " " + (R + 1) + " 0 0 1 " + (2 * R + 2) + " 0 z";
      // Der Rand sitzt bewusst höher als die Mützenkante, sonst
      // verdeckt er die Augen.
      return '<path d="' + d + '" fill="#e4573f"/>' +
             '<rect x="' + (cx - R - 2) + '" y="' + (cy - 13) + '" width="' + (2 * R + 4) + '" height="6" rx="3" fill="#ffd9ec"/>' +
             '<circle cx="' + (lado ? cx - 2 : cx) + '" cy="' + (cy - R - 5) + '" r="5" fill="#ffd9ec"/>';
    }
    if (id === "bufanda") {
      return '<rect x="' + (cx - 17) + '" y="' + (cy + R - 8) + '" width="34" height="9" rx="4.5" fill="#2fa5a0"/>' +
             '<rect x="' + (lado ? cx - 16 : cx + 6) + '" y="' + (cy + R - 4) + '" width="9" height="16" rx="4" fill="#2fa5a0"/>';
    }
    if (id === "cascos") {
      let s = '<path d="M' + (cx - R - 2) + ' ' + (cy - 1) + ' a' + (R + 2) + ' ' + (R + 2) +
              ' 0 0 1 ' + (2 * R + 4) + ' 0" fill="none" stroke="#2b1a4a" stroke-width="4"/>';
      // Von der Seite sitzt die sichtbare Muschel auf dem Ohr, nicht hinter dem Kopf
      s += '<rect x="' + (lado ? cx - 19 : cx - R - 6) + '" y="' + (cy - 5) +
           '" width="9" height="14" rx="4.5" fill="#7b3fe4"/>';
      if (!lado) s += '<rect x="' + (cx + R - 3) + '" y="' + (cy - 5) + '" width="9" height="14" rx="4.5" fill="#7b3fe4"/>';
      return s;
    }
    if (id === "flor") {
      const fx = lado ? cx - 15 : cx + 17, fy = cy - 17;
      let s = "";
      for (let i = 0; i < 5; i++) {
        const a = (i * 72) * Math.PI / 180;
        s += '<circle cx="' + (fx + Math.cos(a) * 5).toFixed(1) + '" cy="' + (fy + Math.sin(a) * 5).toFixed(1) +
             '" r="3.6" fill="#ff79b8"/>';
      }
      return s + '<circle cx="' + fx + '" cy="' + fy + '" r="3" fill="#ffd34d"/>';
    }
    return "";
  }

  // vista: "frente" oder "lado". opt.fondo = false zeichnet ohne Hintergrund.
  function dibujar(sel, vista, opt) {
    opt = opt || {};
    const lado = vista === "lado";
    const piel = buscar("piel", sel.piel).color;
    const pcol = buscar("colorPelo", sel.colorPelo).color;
    const ropa = buscar("ropa", sel.ropa);
    const cx = lado ? 52 : 50, cy = 38;

    let s = '<svg viewBox="0 0 100 130" class="' + (opt.clase || "") + '" xmlns="http://www.w3.org/2000/svg">';
    if (opt.fondo !== false) s += fondoSVG(buscar("fondo", sel.fondo));

    // Beine und Schuhe. Von der Seite stehen sie hintereinander und die
    // Schuhe zeigen nach rechts, in die Blickrichtung.
    if (lado) {
      s += '<rect x="45" y="94" width="9" height="26" rx="4.5" fill="' + piel + '" opacity="0.7"/>';
      s += '<ellipse cx="50" cy="121" rx="9" ry="4.6" fill="#2b1a4a" opacity="0.7"/>';
      s += '<rect x="52" y="94" width="9" height="26" rx="4.5" fill="' + piel + '"/>';
      s += '<ellipse cx="58" cy="121" rx="9" ry="4.6" fill="#2b1a4a"/>';
    } else {
      s += '<rect x="39" y="94" width="9" height="26" rx="4.5" fill="' + piel + '"/>';
      s += '<rect x="52" y="94" width="9" height="26" rx="4.5" fill="' + piel + '"/>';
      s += '<ellipse cx="43.5" cy="121" rx="7.5" ry="4.6" fill="#2b1a4a"/>';
      s += '<ellipse cx="56.5" cy="121" rx="7.5" ry="4.6" fill="#2b1a4a"/>';
    }

    // Arme hinter dem Oberkörper
    if (!lado) {
      s += '<rect x="22" y="64" width="8.5" height="30" rx="4.25" fill="' + piel + '"/>';
      s += '<rect x="69.5" y="64" width="8.5" height="30" rx="4.25" fill="' + piel + '"/>';
    }

    // Hals
    s += '<rect x="' + (cx - 6) + '" y="56" width="12" height="10" fill="' + piel + '"/>';

    // Oberkörper
    if (lado) s += ropaSVG(ropa, true, 37, 30, 62, 40);
    else s += ropaSVG(ropa, false, 28, 44, 62, 40);

    // Arm (nur Seitenansicht). Ein gerader Arm am Körper sieht aus wie ein
    // Streifen auf dem Pullover – deshalb schwingt er nach vorn. Das passt
    // auch besser, wenn die Figur später läuft.
    if (lado) s += '<line x1="53" y1="70" x2="65" y2="92" stroke="' + piel +
                   '" stroke-width="8.5" stroke-linecap="round"/>';

    // Haare, die hinter dem Kopf hängen
    s += peloSVG(sel.pelo, pcol, lado, cx, cy, "detras");

    // Kopf
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + piel + '"/>';
    if (lado) {
      s += '<path d="M' + (cx + R - 2) + ' ' + (cy - 3) + ' q6 5 0 8 z" fill="' + piel + '"/>';  // Nase
      s += '<circle cx="' + (cx - 14) + '" cy="' + (cy + 3) + '" r="4.5" fill="' + piel + '"/>'; // Ohr
    } else {
      s += '<circle cx="' + (cx - R - 1) + '" cy="' + (cy + 3) + '" r="4.5" fill="' + piel + '"/>';
      s += '<circle cx="' + (cx + R + 1) + '" cy="' + (cy + 3) + '" r="4.5" fill="' + piel + '"/>';
    }

    // Gesicht
    s += ojosSVG(sel.ojos, lado, cx, cy);
    if (lado) s += '<path d="M' + (cx + 13) + ' ' + (cy + 11) + ' q5 4 8 -1" fill="none" stroke="#2b1a4a" stroke-width="2" stroke-linecap="round"/>';
    else s += '<path d="M' + (cx - 5) + ' ' + (cy + 10) + ' q5 5 10 0" fill="none" stroke="#2b1a4a" stroke-width="2" stroke-linecap="round"/>';

    // Haare oben drüber
    s += peloSVG(sel.pelo, pcol, lado, cx, cy, "encima");

    // Extra zuletzt
    s += extraSVG(sel.extra, lado, cx, cy);

    return s + "</svg>";
  }

  return { PARTES, ORDEN, buscar, porDefecto, cargar, guardar, tiene, dibujar };
})();
