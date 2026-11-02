/* Spielt alle 110 Kreuzworträtsel durch die echte Oberfläche durch.
 *
 * Gewählt wird jedes Rätsel gezielt: elegirPuzle bevorzugt ungespielte, also
 * setze ich vorher alle anderen auf „gespielt“. Getippt wird auf die echten
 * Tasten, nicht in Variablen hineingeschrieben.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/crucigrama.html";

let fallos = [];
function mal(txt) { fallos.push(txt); }

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 360, height: 640 } });

  const errores = [];
  pagina.on("console", m => { if (m.type() === "error") errores.push(m.text()); });
  pagina.on("pageerror", e => errores.push("pageerror: " + e.message));

  await pagina.goto(URL);
  const niveles = await pagina.evaluate(() =>
    Object.fromEntries(Object.entries(PUZLES).map(([k, v]) => [k, v.length])));
  console.log("Rätsel:", JSON.stringify(niveles));

  // ------------------------------------------------------------ Hilfsmittel
  // Welcher Eintrag ist gerade dran? Aus der Fragezeile und dem Fokusfeld.
  const entradaActiva = () => pagina.evaluate(() => {
    const t = document.getElementById("pista-num").textContent;
    const m = t.match(/^(\d+) ([→↓]) · (\d+)$/);
    if (!m) return null;
    return { n: Number(m[1]), dir: m[2] === "→" ? "h" : "v", largo: Number(m[3]),
             pista: document.getElementById("pista-txt").textContent.trim() };
  });

  // Eine Taste drücken – genau so, wie der Finger es tut
  const tocarTecla = (letra) => pagina.evaluate((L) => {
    const b = [...document.querySelectorAll("#teclado button")].find(x => x.textContent === L);
    if (!b) throw new Error("keine Taste für " + L);
    b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  }, letra);

  const estadoRejilla = () => pagina.evaluate(() => {
    const out = {};
    for (const d of document.getElementById("rejilla").children) {
      out[d.dataset.r + "," + d.dataset.c] = {
        letra: d.lastChild.textContent, lista: d.classList.contains("lista"),
        mala: d.classList.contains("mala"),
      };
    }
    return out;
  });

  // ------------------------------------------------------- Alle durchspielen
  let totalPalabras = 0, totalPistas = 0, conAcento = 0, pequenas = 0;
  const tamanos = {};

  for (const [nivel, cuantos] of Object.entries(niveles)) {
    for (let idx = 0; idx < cuantos; idx++) {
      // Alle anderen als gespielt markieren, damit genau dieses kommt
      await pagina.evaluate(([niv, i, n]) => {
        localStorage.clear();
        const otros = [];
        for (let k = 0; k < n; k++) if (k !== i) otros.push(k);
        localStorage.setItem("cece-crucigrama-hechos", JSON.stringify({ [niv]: otros }));
        localStorage.setItem("cece-coins", "0");
      }, [nivel, idx, cuantos]);
      await pagina.reload();
      await pagina.click(`#inicio button[data-nivel="${nivel}"]`);

      const esperado = await pagina.evaluate(([niv, i]) => PUZLES[niv][i], [nivel, idx]);
      const etq = `${nivel}#${idx}`;

      // -- Gitter: richtige Felder, passt auf den Schirm, Zellen groß genug
      const caja = await pagina.evaluate(() => {
        const r = document.getElementById("rejilla");
        const c = r.children[0];
        return { w: r.getBoundingClientRect().width, h: r.getBoundingClientRect().height,
                 lado: c ? c.getBoundingClientRect().width : 0,
                 campoW: document.getElementById("campo").clientWidth,
                 campoH: document.getElementById("campo").clientHeight,
                 celdas: r.children.length,
                 desborde: document.documentElement.scrollWidth > window.innerWidth + 1 };
      });
      if (caja.celdas !== esperado.celdas.length)
        mal(`${etq}: ${caja.celdas} Felder gezeichnet, ${esperado.celdas.length} erwartet`);
      if (caja.w > caja.campoW + 1 || caja.h > caja.campoH + 1)
        mal(`${etq}: Gitter ${Math.round(caja.w)}x${Math.round(caja.h)} größer als Platz ${caja.campoW}x${caja.campoH}`);
      if (caja.desborde) mal(`${etq}: Seite scrollt waagerecht`);
      if (caja.lado < 24) { pequenas++; if (caja.lado < 20) mal(`${etq}: Felder nur ${caja.lado.toFixed(1)} px`); }
      tamanos[`${esperado.ancho}x${esperado.alto}`] = (tamanos[`${esperado.ancho}x${esperado.alto}`] || 0) + 1;

      // -- Fragenliste: jeder Eintrag steht drin, keine leere Frage
      await pagina.click("#btn-lista");
      const lista = await pagina.evaluate(() =>
        [...document.querySelectorAll("#lista-cuerpo li")].map(li => li.textContent.trim()));
      if (lista.length !== esperado.entradas.length)
        mal(`${etq}: Liste zeigt ${lista.length} von ${esperado.entradas.length} Fragen`);
      for (const t of lista) {
        const limpio = t.replace(/^\d+\s*/, "").replace(/\(\d+\)$/, "").trim();
        if (limpio.length < 2) mal(`${etq}: leere Frage „${t}“`);
      }
      await pagina.click("#btn-cerrar");

      // -- Durchspielen, Wort für Wort
      const resueltas = new Set();
      for (let paso = 0; paso < esperado.entradas.length; paso++) {
        const act = await entradaActiva();
        if (!act) { mal(`${etq}: kein Eintrag aktiv bei Wort ${paso + 1}`); break; }
        const cands = esperado.entradas.filter((e, i) =>
          e.n === act.n && e.dir === act.dir && e.sol.length === act.largo && !resueltas.has(i));
        if (cands.length !== 1) { mal(`${etq}: Fragezeile „${act.n}${act.dir}“ passt auf ${cands.length} Einträge`); break; }
        const e = cands[0];
        const i = esperado.entradas.indexOf(e);
        if (!e.pistas.some(p => p.trim() === act.pista))
          mal(`${etq}: gezeigte Frage „${act.pista}“ steht nicht bei „${e.sol}“`);
        totalPistas += e.pistas.length;
        if (/[áéíóúüñ]/.test(e.sol)) conAcento++;

        // Feste Felder sind die der gelösten Wörter – dort tippe ich nicht
        const fijas = new Set();
        for (const j of resueltas) {
          const x = esperado.entradas[j];
          for (let k = 0; k < x.sol.length; k++)
            fijas.add((x.r + (x.dir === "v" ? k : 0)) + "," + (x.c + (x.dir === "h" ? k : 0)));
        }
        const celdaDe = (k) => (e.r + (e.dir === "v" ? k : 0)) + "," + (e.c + (e.dir === "h" ? k : 0));
        for (let k = 0; k < e.sol.length; k++) {
          if (fijas.has(celdaDe(k))) continue;
          await tocarTecla(e.sol[k]);
        }

        resueltas.add(i);
        totalPalabras++;
        if (paso < esperado.entradas.length - 1) await pagina.waitForTimeout(300);

        // Steht das Wort wirklich und ist es abgehakt?
        const g = await estadoRejilla();
        for (let k = 0; k < e.sol.length; k++) {
          const c = g[celdaDe(k)];
          if (!c) { mal(`${etq}: Feld ${celdaDe(k)} fehlt`); continue; }
          if (c.letra !== e.sol[k]) mal(`${etq}: „${e.sol}“ Feld ${k} zeigt „${c.letra}“`);
          if (!c.lista) mal(`${etq}: „${e.sol}“ Feld ${k} nicht als gelöst markiert`);
        }
      }

      // -- Endbildschirm
      await pagina.waitForSelector("#fin", { state: "visible", timeout: 3000 }).catch(() =>
        mal(`${etq}: kein Endbildschirm`));
      const fin = await pagina.evaluate(() => ({
        sub: document.getElementById("fin-sub").textContent,
        titulo: document.getElementById("fin-titulo").textContent,
        monedas: Number(localStorage.getItem("cece-coins")),
        pts: Number(document.getElementById("pts").textContent),
      }));
      const esperadasMonedas = esperado.entradas.length * 2 + 5;
      if (fin.monedas !== esperadasMonedas)
        mal(`${etq}: ${fin.monedas} Münzen, ${esperadasMonedas} erwartet`);
      if (fin.pts !== esperadasMonedas) mal(`${etq}: Punktanzeige ${fin.pts}`);
      if (!fin.titulo.includes("Perfecto")) mal(`${etq}: „${fin.titulo}“ obwohl fehlerfrei`);
      if (!fin.sub.startsWith(esperado.entradas.length + " Wörter"))
        mal(`${etq}: Endtext „${fin.sub}“`);
    }
    process.stdout.write(`  ${nivel} fertig\n`);
  }

  console.log(`\n${totalPalabras} Wörter getippt, ${conAcento} davon mit Akzent`);
  console.log(`Gittergrößen: ${JSON.stringify(tamanos)}`);
  console.log(`Rätsel mit Feldern unter 24 px: ${pequenas}`);
  if (errores.length) mal(`Konsolenfehler: ${[...new Set(errores)].slice(0, 5).join(" | ")}`);

  await navegador.close();
  console.log(fallos.length ? `\n${fallos.length} MÄNGEL:\n` + fallos.slice(0, 40).map(f => "  - " + f).join("\n")
                            : "\nkeine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
