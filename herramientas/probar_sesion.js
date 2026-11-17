/* Kreuzworträtsel: mehrere Rätsel hintereinander ohne Neuladen.
   Dieselbe Lücke wie beim Buchstabensalat – dort blieb das Gitter beim
   zweiten Rätsel leer, weil die Feldgröße nicht neu geschrieben wurde. */
const { chromium } = require("playwright");
const fallos = [];
const mal = (t) => fallos.push(t);

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
  const errores = [];
  p.on("pageerror", e => errores.push(e.message));
  await p.goto("http://127.0.0.1:8777/crucigrama.html");
  await p.evaluate(() => localStorage.clear());
  await p.reload();

  async function revisar(etq) {
    const r = await p.evaluate(() => {
      const cel = [...document.querySelectorAll(".celda")];
      const cajas = cel.map(d => d.getBoundingClientRect());
      const sitios = new Set(cajas.map(b => Math.round(b.left) + "," + Math.round(b.top)));
      return { n: cel.length, sitios: sitios.size,
               minW: cel.length ? Math.min(...cajas.map(b => b.width)) : 0,
               sinSitio: cel.filter(d => !d.style.left || !d.style.width).length,
               letras: cel.filter(d => d.lastChild && d.lastChild.textContent.trim()).length,
               listas: document.querySelectorAll(".celda.lista").length,
               pts: Number(document.getElementById("pts").textContent) };
    });
    if (!r.n) mal(`${etq}: gar keine Felder`);
    if (r.sinSitio) mal(`${etq}: ${r.sinSitio} Felder ohne Position oder Größe`);
    if (r.sitios !== r.n) mal(`${etq}: nur ${r.sitios} Positionen bei ${r.n} Feldern — gestapelt`);
    if (r.minW < 24) mal(`${etq}: kleinstes Feld ${r.minW.toFixed(1)} px`);
    if (r.letras) mal(`${etq}: ${r.letras} Buchstaben vom letzten Rätsel übrig`);
    if (r.listas) mal(`${etq}: ${r.listas} Felder noch als gelöst markiert`);
    if (r.pts !== 0) mal(`${etq}: Rundenpunkte ${r.pts} statt 0`);
    return r;
  }

  const tecla = (L) => p.evaluate(x => [...document.querySelectorAll("#teclado button")]
    .find(y => y.textContent === x)
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })), L);

  async function durchspielen(niv) {
    const pz = await p.evaluate((n) => {
      const h = JSON.parse(localStorage.getItem("cece-crucigrama-hechos") || "{}");
      const l = h[n] || [];
      return PUZLES[n][l[l.length - 1]];
    }, niv);
    const resueltas = new Set();
    for (let paso = 0; paso < pz.entradas.length; paso++) {
      const act = await p.evaluate(() => document.getElementById("pista-num").textContent);
      const m = act.match(/^(\d+) ([→↓]) · (\d+)$/);
      const e = pz.entradas.find((x, i) => x.n === Number(m[1]) &&
        x.dir === (m[2] === "→" ? "h" : "v") && x.sol.length === Number(m[3]) && !resueltas.has(i));
      if (!e) { mal(`${niv}: aktiver Eintrag „${act}“ nicht zuzuordnen`); break; }
      const i = pz.entradas.indexOf(e);
      const fijas = new Set();
      for (const j of resueltas) {
        const x = pz.entradas[j];
        for (let k = 0; k < x.sol.length; k++)
          fijas.add((x.r + (x.dir === "v" ? k : 0)) + "," + (x.c + (x.dir === "h" ? k : 0)));
      }
      for (let k = 0; k < e.sol.length; k++) {
        const cl = (e.r + (e.dir === "v" ? k : 0)) + "," + (e.c + (e.dir === "h" ? k : 0));
        if (!fijas.has(cl)) await tecla(e.sol[k]);
      }
      resueltas.add(i);
      await p.waitForTimeout(300);
    }
    await p.waitForSelector("#fin", { state: "visible", timeout: 3000 })
      .catch(() => mal(`${niv}: kein Endbildschirm`));
  }

  await p.click('#inicio button[data-nivel="vorkurs"]');
  await revisar("1. Rätsel");
  await durchspielen("vorkurs");

  await p.click("#btn-otra");
  await revisar("2. Rätsel über „Nächstes Rätsel“");
  await durchspielen("vorkurs");

  await p.click("#btn-nivel");
  await p.click('#inicio button[data-nivel="u1"]');
  await revisar("3. Rätsel nach Levelwechsel");
  await durchspielen("u1");

  await p.click("#btn-nivel");
  await p.click('#inicio button[data-nivel="u2"]');
  await revisar("4. Rätsel, nächster Levelwechsel");

  await p.setViewportSize({ width: 414, height: 896 });
  await p.waitForTimeout(300);
  await revisar("nach Drehen");

  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 3).join(" | "));
  await nav.close();
  console.log(fallos.length ? `${fallos.length} MÄNGEL:\n` + fallos.map(f => "  - " + f).join("\n")
                            : "keine Mängel — Kreuzworträtsel übersteht den Rundenwechsel");
  process.exit(fallos.length ? 1 : 0);
})();
