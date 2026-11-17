/* Passt der Salat auf verschiedene Bildschirme, und bleiben die Felder
   groß genug, um sie mit dem Finger zu treffen? Geprüft wird der Salat mit
   den längsten Fragen, weil der die Fragenleiste am höchsten macht. */
const { chromium } = require("playwright");
(async () => {
  const nav = await chromium.launch();
  const fallos = [];
  // Den Salat mit dem meisten Text suchen
  const p0 = await nav.newPage();
  await p0.goto("http://127.0.0.1:8777/sopa.html");
  const peor = await p0.evaluate(() => {
    let mejor = null, max = -1;
    for (const niv of Object.keys(SOPAS))
      SOPAS[niv].forEach((s, i) => {
        const n = s.palabras.reduce((a, x) =>
          a + x.pistas[(s.palabras.indexOf(x) * 5 + x.p.length) % x.pistas.length].length, 0);
        if (n > max) { max = n; mejor = { niv, i, n }; }
      });
    return mejor;
  });
  await p0.close();
  console.log(`längster Salat: ${peor.niv}#${peor.i} mit ${peor.n} Zeichen Fragetext`);

  for (const [w, h] of [[320,568],[360,640],[390,844],[414,896],[360,780]]) {
    const p = await nav.newPage({ viewport: { width: w, height: h } });
    await p.goto("http://127.0.0.1:8777/sopa.html");
    await p.evaluate(([niv, i]) => {
      localStorage.clear();
      const n = SOPAS[niv].length, o = [];
      for (let k = 0; k < n; k++) if (k !== i) o.push(k);
      localStorage.setItem("cece-sopa-hechos", JSON.stringify({ [niv]: o }));
    }, [peor.niv, peor.i]);
    await p.reload();
    await p.click(`#inicio button[data-nivel="${peor.niv}"]`);
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const rej = document.getElementById("rejilla").getBoundingClientRect();
      const campo = document.getElementById("campo");
      const n = Math.round(Math.sqrt(document.querySelectorAll(".celda").length));
      return { lado: rej.width / n,
               cabe: rej.width <= campo.clientWidth + 1 && rej.height <= campo.clientHeight + 1,
               scrollY: document.documentElement.scrollHeight > window.innerHeight + 1,
               scrollX: document.documentElement.scrollWidth > window.innerWidth + 1,
               preguntas: document.querySelectorAll("#preguntas div").length };
    });
    console.log(`  ${w}x${h}: Feld ${r.lado.toFixed(1)} px, Fragen ${r.preguntas}, ` +
                `passt ${r.cabe ? "ja" : "NEIN"}`);
    if (!r.cabe) fallos.push(`${w}x${h}: Gitter passt nicht`);
    if (r.lado < 24) fallos.push(`${w}x${h}: Felder nur ${r.lado.toFixed(1)} px`);
    if (r.scrollX || r.scrollY) fallos.push(`${w}x${h}: Seite scrollt`);
    if (r.preguntas !== 8) fallos.push(`${w}x${h}: ${r.preguntas} Fragen statt 8`);
    await p.close();
  }
  await nav.close();
  console.log(fallos.length ? "\nMÄNGEL:\n  " + fallos.join("\n  ") : "\nkeine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
