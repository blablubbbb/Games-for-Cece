/* Spielt alle 90 Buchstabensalate durch die echte Oberfläche durch.
 *
 * Gewischt wird mit der echten Maus, nicht mit nachgebauten Ereignissen: so
 * laufen Zeigererfassung, Einrasten und Längenberechnung wirklich mit.
 * Jedes zweite Wort wird rückwärts gewischt und jedes dritte mit einem
 * Versatz, damit auch der unpräzise Kinderfinger geprüft ist.
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
  const niveles = await p.evaluate(() =>
    Object.fromEntries(Object.entries(SOPAS).map(([k, v]) => [k, v.length])));
  console.log("Salate:", JSON.stringify(niveles));

  // Mittelpunkt eines Feldes in Bildschirmkoordinaten
  const centro = (r, c) => p.evaluate(([rr, cc]) => {
    const rej = document.getElementById("rejilla").getBoundingClientRect();
    const lado = rej.width / Number(document.getElementById("rejilla").dataset.lado || 11);
    return { x: rej.left + (cc + 0.5) * lado, y: rej.top + (rr + 0.5) * lado, lado };
  }, [r, c]);

  async function wischen(r0, c0, r1, c1, desvio) {
    const a = await centro(r0, c0), b = await centro(r1, c1);
    await p.mouse.move(a.x, a.y);
    await p.mouse.down();
    // Zwischenschritt, damit pointermove wirklich feuert
    await p.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2);
    await p.mouse.move(b.x + (desvio ? desvio.dx : 0), b.y + (desvio ? desvio.dy : 0));
    await p.mouse.up();
  }

  const estado = () => p.evaluate(() => ({
    cuenta: document.getElementById("cuenta").textContent,
    pista: document.getElementById("pista-txt").textContent.trim(),
    hallados: [...document.querySelectorAll("#preguntas div.ok b")].map(s => s.textContent),
    monedas: Number(localStorage.getItem("cece-coins")),
    pts: Number(document.getElementById("pts").textContent),
    colores: [...document.querySelectorAll(".celda")].filter(d => d.style.background).length,
  }));

  let totalPalabras = 0, diagonales = 0, atras = 0, conDesvio = 0;
  let minLado = 999;

  for (const [nivel, cuantos] of Object.entries(niveles)) {
    for (let idx = 0; idx < cuantos; idx++) {
      // Gezielt diesen Salat: alle anderen als gespielt markieren
      await p.evaluate(([niv, i, n]) => {
        localStorage.clear();
        const otros = [];
        for (let k = 0; k < n; k++) if (k !== i) otros.push(k);
        localStorage.setItem("cece-sopa-hechos", JSON.stringify({ [niv]: otros }));
        localStorage.setItem("cece-coins", "0");
      }, [nivel, idx, cuantos]);
      await p.reload();
      await p.click(`#inicio button[data-nivel="${nivel}"]`);
      await p.evaluate(() => {
        document.getElementById("rejilla").dataset.lado =
          String(Math.round(Math.sqrt(document.querySelectorAll(".celda").length)));
      });

      const s = await p.evaluate(([niv, i]) => SOPAS[niv][i], [nivel, idx]);
      const etq = `${nivel}#${idx}`;

      // --- Gitter: Größe, Feldanzahl, passt auf den Schirm
      const caja = await p.evaluate(() => {
        const rej = document.getElementById("rejilla").getBoundingClientRect();
        const campo = document.getElementById("campo");
        return { w: rej.width, h: rej.height, celdas: document.querySelectorAll(".celda").length,
                 campoW: campo.clientWidth, campoH: campo.clientHeight,
                 desborde: document.documentElement.scrollWidth > window.innerWidth + 1 ||
                           document.documentElement.scrollHeight > window.innerHeight + 1 };
      });
      if (caja.celdas !== s.lado * s.lado)
        mal(`${etq}: ${caja.celdas} Felder statt ${s.lado * s.lado}`);
      if (caja.w > caja.campoW + 1 || caja.h > caja.campoH + 1)
        mal(`${etq}: Gitter ${Math.round(caja.w)}px passt nicht in ${caja.campoW}x${caja.campoH}`);
      if (caja.desborde) mal(`${etq}: Seite scrollt`);
      minLado = Math.min(minLado, caja.w / s.lado);

      // --- Fragenliste darf die Wörter nicht verraten
      const leiste = await p.evaluate(() =>
        [...document.querySelectorAll("#preguntas div")].map(d => d.textContent.trim()));
      if (leiste.length !== s.palabras.length)
        mal(`${etq}: Leiste zeigt ${leiste.length} von ${s.palabras.length}`);
      for (const x of s.palabras) {
        if (leiste.some(t => t.includes(x.p)))
          mal(`${etq}: Fragenleiste verrät „${x.p}“, bevor es gefunden ist`);
      }
      await p.click("#btn-lista");
      const lista = await p.evaluate(() =>
        [...document.querySelectorAll("#lista-cuerpo li")].map(li => li.textContent.trim()));
      if (lista.length !== s.palabras.length)
        mal(`${etq}: Liste zeigt ${lista.length} von ${s.palabras.length}`);
      for (const x of s.palabras) {
        if (lista.some(t => t.includes(x.p)))
          mal(`${etq}: Liste verrät „${x.p}“, bevor es gefunden ist`);
      }
      await p.click("#btn-cerrar");

      // --- Jedes Wort suchen
      for (let w = 0; w < s.palabras.length; w++) {
        const x = s.palabras[w];
        const fin = { r: x.r + x.dr * (x.p.length - 1), c: x.c + x.dc * (x.p.length - 1) };
        const alReves = w % 2 === 1;           // jedes zweite rückwärts wischen
        const desviar = w % 3 === 2;           // jedes dritte mit unpräzisem Finger
        if (x.dr !== 0 && x.dc !== 0) diagonales++;
        if (alReves) atras++;
        if (desviar) conDesvio++;

        const lado = caja.w / s.lado;
        const desvio = desviar ? { dx: lado * 0.3, dy: -lado * 0.28 } : null;
        if (alReves) await wischen(fin.r, fin.c, x.r, x.c, desvio);
        else await wischen(x.r, x.c, fin.r, fin.c, desvio);
        totalPalabras++;

        const e = await estado();
        if (!e.hallados.includes(x.p))
          mal(`${etq}: „${x.p}“ (${x.dr},${x.dc}${alReves ? ", rückwärts" : ""}` +
              `${desviar ? ", versetzt" : ""}) nicht erkannt — gefunden: ${e.hallados.join(",")}`);
        if (e.cuenta !== `${w + 1}/${s.palabras.length}`)
          mal(`${etq}: Zähler steht auf ${e.cuenta} nach ${w + 1} Wörtern`);
      }

      // --- Endbildschirm
      await p.waitForSelector("#fin", { state: "visible", timeout: 3000 })
        .catch(() => mal(`${etq}: kein Endbildschirm`));
      const fin = await p.evaluate(() => ({
        titulo: document.getElementById("fin-titulo").textContent,
        sub: document.getElementById("fin-sub").textContent,
        monedas: Number(localStorage.getItem("cece-coins")),
      }));
      const esperado = s.palabras.length * 2 + 5;
      if (fin.monedas !== esperado) mal(`${etq}: ${fin.monedas} Münzen statt ${esperado}`);
      if (!fin.titulo.includes("Perfecto")) mal(`${etq}: „${fin.titulo}“ obwohl ohne Hilfe`);
      if (!fin.sub.startsWith(s.palabras.length + " Wörter")) mal(`${etq}: Endtext „${fin.sub}“`);
    }
    process.stdout.write(`  ${nivel} fertig\n`);
  }

  console.log(`\n${totalPalabras} Wörter gewischt: ${diagonales} diagonal, ` +
              `${atras} rückwärts, ${conDesvio} mit unpräzisem Finger`);
  console.log(`kleinstes Feld: ${minLado.toFixed(1)} px`);
  if (minLado < 24) mal(`Felder nur ${minLado.toFixed(1)} px groß`);
  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));

  await nav.close();
  console.log(fallos.length
    ? `\n${fallos.length} MÄNGEL:\n` + fallos.slice(0, 25).map(f => "  - " + f).join("\n")
    : "\nkeine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
