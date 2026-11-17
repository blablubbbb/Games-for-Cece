/* Randfälle des Buchstabensalats. */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/sopa.html";

const fallos = [];
const mal = (t) => fallos.push(t);
const ok = (c, t) => { if (!c) mal(t); };

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });

  async function abrir(nivel, idx, monedas) {
    await p.goto(URL);
    await p.evaluate(([niv, i, c]) => {
      localStorage.clear();
      const n = SOPAS[niv].length, otros = [];
      for (let k = 0; k < n; k++) if (k !== i) otros.push(k);
      localStorage.setItem("cece-sopa-hechos", JSON.stringify({ [niv]: otros }));
      localStorage.setItem("cece-coins", String(c));
    }, [nivel, idx, monedas]);
    await p.reload();
    await p.click(`#inicio button[data-nivel="${nivel}"]`);
    return p.evaluate(([niv, i]) => SOPAS[niv][i], [nivel, idx]);
  }

  const centro = (r, c) => p.evaluate(([rr, cc]) => {
    const el = document.getElementById("rejilla");
    const caja = el.getBoundingClientRect();
    const lado = caja.width / Math.round(Math.sqrt(document.querySelectorAll(".celda").length));
    return { x: caja.left + (cc + 0.5) * lado, y: caja.top + (rr + 0.5) * lado };
  }, [r, c]);

  async function wischen(r0, c0, r1, c1) {
    const a = await centro(r0, c0), b = await centro(r1, c1);
    await p.mouse.move(a.x, a.y);
    await p.mouse.down();
    await p.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2);
    await p.mouse.move(b.x, b.y);
    await p.mouse.up();
  }

  const monedas = () => p.evaluate(() => Number(localStorage.getItem("cece-coins")));
  const hallados = () => p.evaluate(() =>
    [...document.querySelectorAll("#preguntas div.ok b")].map(s => s.textContent));
  const pista = () => p.evaluate(() => document.getElementById("pista-txt").textContent.trim());
  const resaltadas = () => p.evaluate(() =>
    [...document.querySelectorAll(".celda.pista-ayuda")].length);
  const fallosGuardados = () => p.evaluate(() => {
    try { return JSON.parse(localStorage.getItem("cece-fallos") || "{}"); } catch (e) { return {}; }
  });
  const fin = (p0) => p.evaluate(() => ({
    visible: getComputedStyle(document.getElementById("fin")).display !== "none",
    titulo: document.getElementById("fin-titulo").textContent,
  }));

  const NIV = "u1", IDX = 0;

  // ------------------------------------------------ 1. Daneben gewischt
  let s = await abrir(NIV, IDX, 0);
  const lado = s.lado;
  // Zwei Felder, die zusammen sicher kein Wort ergeben: eine Ecke zur anderen
  await wischen(0, 0, 0, 1);
  ok((await hallados()).length === 0, "Fehlgriff wurde als Fund gewertet");
  ok((await monedas()) === 0, "Fehlgriff hat Münzen gegeben");
  // Suchen ist kein Fehler – das Fehlergedächtnis darf davon nichts mitbekommen
  const f1 = await fallosGuardados();
  ok(!f1.sopa || Object.keys(f1.sopa).length === 0,
     "Fehlgriff landet im Fehlergedächtnis: " + JSON.stringify(f1.sopa));

  // ------------------------------------------------ 2. Ein Feld antippen
  await wischen(3, 3, 3, 3);
  ok((await hallados()).length === 0, "Einzelnes Feld wurde als Wort gewertet");

  // ------------------------------------------------ 3. Nicht das aktive Wort
  // Erst die Frage weiterschalten, dann trotzdem das erste Wort suchen
  const antesPista = await pista();
  await p.click("#pista-txt");
  ok((await pista()) !== antesPista, "Tipp auf die Frage schaltet nicht weiter");
  const x0 = s.palabras[0];
  await wischen(x0.r, x0.c,
                x0.r + x0.dr * (x0.p.length - 1), x0.c + x0.dc * (x0.p.length - 1));
  ok((await hallados()).includes(x0.p),
     `„${x0.p}“ zählt nicht, weil gerade eine andere Frage aktiv war`);

  // ------------------------------------------------ 4. Auswahl über den Rand
  // Vom Rand nach außen ziehen darf nicht abstürzen und nichts auswählen
  const borde = await centro(0, lado - 1);
  await p.mouse.move(borde.x, borde.y);
  await p.mouse.down();
  await p.mouse.move(borde.x + 400, borde.y);
  await p.mouse.up();
  ok(errores.length === 0, "Ziehen über den Rand wirft einen Fehler: " + errores[0]);

  // ------------------------------------------------ 5. Tipp-Knopf
  s = await abrir(NIV, IDX, 10);
  const antes = await monedas();
  await p.click("#pista-txt");          // irgendeine Frage aktiv machen
  const activaAntes = await pista();
  await p.evaluate(() => document.getElementById("btn-ayuda")
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));
  ok((await monedas()) === antes - 3, `Tipp kostet ${antes - (await monedas())} statt 3`);
  ok((await resaltadas()) === 1, `Tipp hebt ${await resaltadas()} Felder hervor statt einem`);
  // Das hervorgehobene Feld muss der Anfang des aktiven Wortes sein
  const bien = await p.evaluate(([niv, i]) => {
    const s = SOPAS[niv][i];
    const d = document.querySelector(".celda.pista-ayuda");
    if (!d) return false;
    const n = [...document.querySelectorAll(".celda")].indexOf(d);
    const r = Math.floor(n / s.lado), c = n % s.lado;
    return s.palabras.some(x => x.r === r && x.c === c);
  }, [NIV, IDX]);
  ok(bien, "Der Tipp zeigt nicht auf den Anfang eines Wortes");
  // Hilfe zählt als Fehler im Gedächtnis
  const f2 = await fallosGuardados();
  ok(f2.sopa && Object.keys(f2.sopa).length === 1,
     "Hilfe wird nicht im Fehlergedächtnis vermerkt: " + JSON.stringify(f2.sopa));

  // ------------------------------------------------ 6. Tipp ohne Geld
  s = await abrir(NIV, IDX, 2);
  await p.evaluate(() => document.getElementById("btn-ayuda")
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));
  ok((await resaltadas()) === 0, "Tipp hat ohne genug Münzen aufgedeckt");
  ok((await monedas()) === 2, "Münzen trotz abgelehntem Tipp abgezogen");

  // ------------------------------------------------ 7. Frage aus der Liste wählen
  s = await abrir(NIV, IDX, 0);
  await p.click("#btn-lista");
  await p.click("#lista-cuerpo li:nth-child(3)");
  const esperada = await p.evaluate(([niv, i]) => {
    const x = SOPAS[niv][i].palabras[2];
    return x.pistas[(2 * 5 + x.p.length) % x.pistas.length];
  }, [NIV, IDX]);
  ok((await pista()) === esperada,
     `Liste wählt die falsche Frage: „${await pista()}“ statt „${esperada}“`);

  // ------------------------------------------------ 8. Mit Hilfe kein „Perfecto“
  s = await abrir(NIV, IDX, 20);
  await p.evaluate(() => document.getElementById("btn-ayuda")
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));
  for (const x of s.palabras) {
    await wischen(x.r, x.c, x.r + x.dr * (x.p.length - 1), x.c + x.dc * (x.p.length - 1));
  }
  await p.waitForTimeout(700);
  const e = await fin();
  ok(e.visible, "kein Endbildschirm");
  ok(!e.titulo.includes("Perfecto"), `„${e.titulo}“ obwohl Hilfe benutzt wurde`);

  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));
  await nav.close();
  console.log(fallos.length ? `${fallos.length} MÄNGEL:\n` + fallos.map(f => "  - " + f).join("\n")
                            : "keine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
