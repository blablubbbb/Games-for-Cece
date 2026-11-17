/* Mehrere Salate hintereinander in derselben Sitzung.
 *
 * Diese Lücke hatte die erste Testrunde: dort wurde vor jedem Salat die Seite
 * neu geladen, und genau dadurch blieb unbemerkt, dass beim zweiten Salat das
 * Gitter leer blieb – die Feldgröße wurde nicht neu geschrieben, weil sie
 * zufällig dieselbe war wie beim vorigen.
 *
 * Geprüft wird deshalb ohne jedes Neuladen: „Nächster Salat“, Levelwechsel
 * über den Endbildschirm, und nach jedem Wechsel, dass wirklich ein Gitter
 * dasteht und der alte Zustand weg ist.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/sopa.html";

const fallos = [];
const mal = (t) => fallos.push(t);

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });

  await p.goto(URL);
  await p.evaluate(() => localStorage.clear());
  await p.reload();                       // einmal am Anfang, danach nie wieder

  const centro = (r, c) => p.evaluate(([rr, cc]) => {
    const el = document.getElementById("rejilla"), b = el.getBoundingClientRect();
    const lado = b.width / Math.round(Math.sqrt(document.querySelectorAll(".celda").length));
    return { x: b.left + (cc + 0.5) * lado, y: b.top + (rr + 0.5) * lado };
  }, [r, c]);

  async function wischen(r0, c0, r1, c1) {
    const a = await centro(r0, c0), b = await centro(r1, c1);
    await p.mouse.move(a.x, a.y); await p.mouse.down();
    await p.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2);
    await p.mouse.move(b.x, b.y); await p.mouse.up();
  }

  // Den gerade laufenden Salat aus dem Spielstand holen
  const sopaActual = (niv) => p.evaluate((n) => {
    const h = JSON.parse(localStorage.getItem("cece-sopa-hechos") || "{}");
    const lista = h[n] || [];
    return SOPAS[n][lista[lista.length - 1]];
  }, niv);

  // Steht wirklich ein Gitter da, und ist der alte Zustand weg?
  async function revisarGitter(etq, esperaMonedas) {
    const r = await p.evaluate(() => {
      const celdas = [...document.querySelectorAll(".celda")];
      const rej = document.getElementById("rejilla").getBoundingClientRect();
      const n = Math.round(Math.sqrt(celdas.length));
      const sinSitio = celdas.filter(d => !d.style.left || !d.style.top ||
                                          !d.style.width || !d.style.height).length;
      const cajas = celdas.map(d => d.getBoundingClientRect());
      const minW = Math.min(...cajas.map(b => b.width));
      const minH = Math.min(...cajas.map(b => b.height));
      // Liegen alle Felder an verschiedenen Stellen? Gestapelte Felder wären
      // genau der Fehler, der gemeldet wurde.
      const sitios = new Set(cajas.map(b => Math.round(b.left) + "," + Math.round(b.top)));
      return {
        celdas: celdas.length, n, sinSitio, minW, minH, sitios: sitios.size,
        anchoGitter: rej.width, altoGitter: rej.height,
        conColor: celdas.filter(d => d.style.background).length,
        resaltadas: document.querySelectorAll(".celda.pista-ayuda").length,
        cuenta: document.getElementById("cuenta").textContent,
        hallados: document.querySelectorAll("#preguntas div.ok").length,
        preguntas: document.querySelectorAll("#preguntas div").length,
        pts: Number(document.getElementById("pts").textContent),
        monedas: Number(localStorage.getItem("cece-coins")),
        letras: celdas.filter(d => d.textContent.trim()).length,
      };
    });
    if (r.celdas !== 121) mal(`${etq}: ${r.celdas} Felder statt 121`);
    if (r.sinSitio) mal(`${etq}: ${r.sinSitio} Felder ohne Position oder Größe — leeres Gitter`);
    if (r.sitios !== r.celdas) mal(`${etq}: nur ${r.sitios} verschiedene Positionen bei ${r.celdas} Feldern — gestapelt`);
    if (r.minW < 24 || r.minH < 24) mal(`${etq}: kleinstes Feld ${r.minW.toFixed(1)}x${r.minH.toFixed(1)} px`);
    if (Math.abs(r.anchoGitter - r.minW * r.n) > 2)
      mal(`${etq}: Gitter ${Math.round(r.anchoGitter)} px passt nicht zu ${r.n} Feldern à ${r.minW.toFixed(1)}`);
    if (r.letras !== 121) mal(`${etq}: ${r.letras} Felder mit Buchstaben statt 121`);
    if (r.conColor) mal(`${etq}: ${r.conColor} Felder noch vom letzten Salat eingefärbt`);
    if (r.resaltadas) mal(`${etq}: Tipp-Markierung vom letzten Salat übrig`);
    if (r.cuenta !== "0/8") mal(`${etq}: Zähler steht auf ${r.cuenta} statt 0/8`);
    if (r.hallados) mal(`${etq}: ${r.hallados} Fragen noch als gefunden markiert`);
    if (r.preguntas !== 8) mal(`${etq}: ${r.preguntas} Fragen statt 8`);
    if (r.pts !== 0) mal(`${etq}: Rundenpunkte stehen auf ${r.pts} statt 0`);
    if (esperaMonedas !== null && r.monedas !== esperaMonedas)
      mal(`${etq}: ${r.monedas} Münzen statt ${esperaMonedas}`);
  }

  async function durchspielen(niv) {
    const s = await sopaActual(niv);
    for (const x of s.palabras) {
      await wischen(x.r, x.c, x.r + x.dr * (x.p.length - 1), x.c + x.dc * (x.p.length - 1));
    }
    await p.waitForSelector("#fin", { state: "visible", timeout: 3000 })
      .catch(() => mal(`${niv}: kein Endbildschirm`));
    return s.palabras.length * 2 + 5;
  }

  // ---- Ein Durchlauf, wie sie ihn wirklich macht ----
  let monedas = 0;
  await p.click('#inicio button[data-nivel="vorkurs"]');
  await revisarGitter("1. Vorkurs", 0);
  monedas += await durchspielen("vorkurs");

  // „Nächster Salat“ – derselbe Weg ohne Levelwechsel
  await p.click("#btn-otra");
  await revisarGitter("2. Vorkurs über „Nächster Salat“", monedas);
  monedas += await durchspielen("vorkurs");

  // „Anderes Level“ → Unidad 1: der gemeldete Fehler
  await p.click("#btn-nivel");
  await p.click('#inicio button[data-nivel="u1"]');
  await revisarGitter("3. Unidad 1 nach Levelwechsel", monedas);
  monedas += await durchspielen("u1");

  // Weiter durch die übrigen Stufen
  for (const niv of ["u2", "todo", "vorkurs"]) {
    await p.click("#btn-nivel");
    await p.click(`#inicio button[data-nivel="${niv}"]`);
    await revisarGitter(`Levelwechsel zu ${niv}`, monedas);
    monedas += await durchspielen(niv);
  }

  // Mitten im Salat gibt es kein „Anderes Level“ – der Knopf steht nur auf
  // dem Endbildschirm. Stattdessen: übersteht das Gitter einen Fehlgriff und
  // die Fragenüberlagerung?
  await p.click("#btn-nivel");
  await p.click('#inicio button[data-nivel="u1"]');
  await wischen(0, 0, 0, 3);                      // danebengegriffen
  await p.waitForTimeout(400);
  await p.click("#btn-lista");
  await p.click("#btn-cerrar");
  await revisarGitter("nach Fehlgriff und Fragenliste", null);

  // Auch nach einer Größenänderung muss das Gitter stehen
  await p.setViewportSize({ width: 414, height: 896 });
  await p.waitForTimeout(300);
  await revisarGitter("nach Drehen auf 414x896", null);
  await p.setViewportSize({ width: 360, height: 640 });
  await p.waitForTimeout(300);
  await revisarGitter("zurück auf 360x640", null);

  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));
  await nav.close();
  console.log(fallos.length
    ? `${fallos.length} MÄNGEL:\n` + fallos.map(f => "  - " + f).join("\n")
    : "keine Mängel — Gitter steht nach jedem Wechsel");
  process.exit(fallos.length ? 1 : 0);
})();
