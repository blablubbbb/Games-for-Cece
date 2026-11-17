/* Spielt das Paarspiel in allen drei Arten und allen Stufen durch.
 *
 * Mehrere Runden hintereinander OHNE Neuladen – das war die Lücke, durch die
 * beim Buchstabensalat das leere Gitter geschlüpft ist.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/parejas.html";

const fallos = [];
const mal = (t) => fallos.push(t);
const ok = (c, t) => { if (!c) mal(t); };

// Ein Gerät mit spanischer Stimme vortäuschen, damit auch „Hören“ läuft
const VOCES = `
  (() => {
    const voces = [{ name: "Google español", lang: "es-ES" },
                   { name: "Deutsch", lang: "de-DE" }];
    window.__hablado = [];
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => voces,
      speak: (u) => window.__hablado.push(u.voice ? u.voice.lang : "ohne Stimme"),
      cancel: () => {}, addEventListener: () => {},
    }});
    window.SpeechSynthesisUtterance = function (t) {
      this.text = t; this.lang = ""; this.voice = null; this.rate = 1; this.pitch = 1; };
  })();`;

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  await p.addInitScript(VOCES);
  await p.goto(URL);
  await p.evaluate(() => localStorage.clear());
  await p.reload();                        // nur einmal, danach nie wieder

  const estado = () => p.evaluate(() => ({
    fichas: fichas.map(f => ({ par: f.par, tipo: f.tipo, es: f.es, de: f.de,
                               texto: f.el.textContent, clase: f.el.className })),
    cuenta: document.getElementById("cuenta").textContent,
    modo: document.getElementById("modo-txt").textContent,
    pts: Number(document.getElementById("pts").textContent),
    monedas: Number(localStorage.getItem("cece-coins")),
    errores: document.getElementById("fallos-txt").textContent,
    nivelGuardado: localStorage.getItem("cece-parejas-nivel"),
  }));

  const tocar = (i) => p.evaluate((n) => document.querySelectorAll(".ficha")[n].click(), i);

  const grupos = await p.evaluate(() => {
    const g = {};
    for (const niv of Object.keys(PAREJAS))
      for (const x of PAREJAS[niv]) g[x.es] = { g: x.g, de: x.de, nivel: niv };
    return g;
  });

  let rondas = 0, paresJugados = 0, conAudio = 0;

  async function jugarRonda(etq, modo, nivel, monedasAntes) {
    const e = await estado();
    const f = e.fichas;

    // --- Aufbau
    if (f.length !== 12) mal(`${etq}: ${f.length} Kästchen statt 12`);
    if (e.cuenta !== "0/6") mal(`${etq}: Zähler ${e.cuenta}`);
    if (e.pts !== 0) mal(`${etq}: Rundenpunkte ${e.pts}`);
    const porPar = {};
    for (const x of f) (porPar[x.par] = porPar[x.par] || []).push(x);
    if (Object.keys(porPar).length !== 6) mal(`${etq}: ${Object.keys(porPar).length} Paare statt 6`);
    for (const [par, lista] of Object.entries(porPar)) {
      if (lista.length !== 2) mal(`${etq}: Paar ${par} hat ${lista.length} Kästchen`);
      const tipos = lista.map(x => x.tipo).sort().join("+");
      const esperado = modo === "oir" ? "audio+de" : "de+es";
      if (tipos !== esperado) mal(`${etq}: Paar ${par} ist „${tipos}“ statt „${esperado}“`);
      if (lista[0].es !== lista[1].es) mal(`${etq}: Paar ${par} hat zwei verschiedene Wörter`);
    }

    // --- Keine zwei Wörter aus derselben Konfliktgruppe
    const vistos = {};
    for (const x of Object.values(porPar).map(l => l[0])) {
      const info = grupos[x.es];
      if (!info) { mal(`${etq}: „${x.es}“ steht nicht in den Wortpaaren`); continue; }
      if (nivel !== "todo" && info.nivel !== nivel)
        mal(`${etq}: „${x.es}“ gehört zu ${info.nivel}, nicht ${nivel}`);
      if (x.de !== info.de) mal(`${etq}: „${x.es}“ zeigt „${x.de}“ statt „${info.de}“`);
      if (info.g) {
        if (vistos[info.g])
          mal(`${etq}: „${x.es}“ und „${vistos[info.g]}“ sind beide Gruppe ${info.g} — zwei richtige Antworten`);
        vistos[info.g] = x.es;
      }
    }

    // --- Verdeckt oder offen?
    for (const x of f) {
      const tapada = x.clase.includes("tapada");
      if (modo === "memoria" && !tapada) mal(`${etq}: Kästchen offen, obwohl Memory`);
      if (modo !== "memoria" && tapada) mal(`${etq}: Kästchen verdeckt, obwohl ${modo}`);
      if (modo === "memoria" && x.texto !== "?") mal(`${etq}: verdecktes Kästchen zeigt „${x.texto}“`);
      if (modo === "oir" && x.tipo === "audio" && x.texto !== "🔊")
        mal(`${etq}: Hörkästchen zeigt „${x.texto}“`);
      if (modo === "texto" && x.tipo === "es" && x.texto !== x.es)
        mal(`${etq}: Kästchen zeigt „${x.texto}“ statt „${x.es}“`);
    }

    // --- Einmal absichtlich daneben
    const a = f.findIndex(x => x.par === 0);
    const b = f.findIndex(x => x.par === 1);
    await tocar(a); await tocar(b);
    await p.waitForTimeout(modo === "memoria" ? 1000 : 700);
    let e2 = await estado();
    if (e2.cuenta !== "0/6") mal(`${etq}: Fehlgriff wurde als Paar gewertet`);
    if (e2.monedas !== monedasAntes) mal(`${etq}: Fehlgriff hat Münzen gegeben`);
    if (!/daneben/.test(e2.errores)) mal(`${etq}: Fehlgriff nicht gezählt: „${e2.errores}“`);
    if (modo === "memoria") {
      const abiertas = e2.fichas.filter(x => !x.clase.includes("tapada")).length;
      if (abiertas) mal(`${etq}: nach dem Fehlgriff bleiben ${abiertas} Kästchen offen`);
    }

    // --- Alle sechs Paare lösen
    for (let par = 0; par < 6; par++) {
      const e3 = await estado();
      const idx = e3.fichas.map((x, i) => [x, i]).filter(([x]) => x.par === par).map(([, i]) => i);
      await tocar(idx[0]); await tocar(idx[1]);
      await p.waitForTimeout(120);
      paresJugados++;
    }
    await p.waitForTimeout(900);

    const fin = await p.evaluate(() => ({
      visible: getComputedStyle(document.getElementById("fin")).display !== "none",
      titulo: document.getElementById("fin-titulo").textContent,
      sub: document.getElementById("fin-sub").textContent,
      monedas: Number(localStorage.getItem("cece-coins")),
    }));
    if (!fin.visible) mal(`${etq}: kein Endbildschirm`);
    if (fin.titulo.includes("Perfecto")) mal(`${etq}: „Perfecto“ trotz Fehlgriff`);
    if (!/6 Paare in/.test(fin.sub)) mal(`${etq}: Endtext „${fin.sub}“`);
    const esperado = monedasAntes + 6 * 2 + 5;
    if (fin.monedas !== esperado) mal(`${etq}: ${fin.monedas} Münzen statt ${esperado}`);

    // --- Beim Hören muss jetzt das geschriebene Wort dastehen
    if (modo === "oir") {
      const e4 = await estado();
      for (const x of e4.fichas.filter(x => x.tipo === "audio")) {
        if (x.texto !== x.es) mal(`${etq}: Hörkästchen zeigt nach dem Fund „${x.texto}“ statt „${x.es}“`);
        conAudio++;
      }
    }
    rondas++;
    return fin.monedas;
  }

  // ---- Durchlauf: jede Art, jede Stufe, ohne Neuladen ----
  let monedas = 0;
  for (const modo of ["texto", "oir", "memoria"]) {
    for (const nivel of ["vorkurs", "u1", "u2", "todo"]) {
      // Zum Startbildschirm: beim ersten Mal ist er schon da
      if (rondas > 0) await p.click("#btn-nivel");
      await p.click(`#inicio .modos button[data-modo="${modo}"]`);
      await p.click(`#inicio button[data-nivel="${nivel}"]`);
      monedas = await jugarRonda(`${modo}/${nivel}`, modo, nivel, monedas);
    }
    // Noch eine Runde über „Noch eine Runde“, ohne Umweg über den Start
    await p.click("#btn-otra");
    monedas = await jugarRonda(`${modo}/nochmal`, modo, "todo", monedas);
  }

  // ---- Fehlerfreie Runde muss „Perfecto“ sagen ----
  await p.click("#btn-nivel");
  await p.click('#inicio .modos button[data-modo="texto"]');
  await p.click('#inicio button[data-nivel="u1"]');
  for (let par = 0; par < 6; par++) {
    const e = await estado();
    const idx = e.fichas.map((x, i) => [x, i]).filter(([x]) => x.par === par).map(([, i]) => i);
    await tocar(idx[0]); await tocar(idx[1]);
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(900);
  const limpio = await p.evaluate(() => document.getElementById("fin-titulo").textContent);
  ok(limpio.includes("Perfecto"), `fehlerfreie Runde meldet „${limpio}“`);

  // ---- Größen ----
  // Eine Runde läuft lassen und nur noch die Bildschirmgröße ändern: „Noch
  // eine Runde“ gibt es nur auf dem Endbildschirm.
  await p.click("#btn-otra");
  for (const [w, h] of [[320, 568], [360, 640], [414, 896]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const fs = [...document.querySelectorAll(".ficha")];
      const cajas = fs.map(b => b.getBoundingClientRect());
      return { n: fs.length,
               minW: Math.min(...cajas.map(c => c.width)),
               minH: Math.min(...cajas.map(c => c.height)),
               desborde: fs.some(b => b.scrollWidth > b.clientWidth + 1 ||
                                      b.scrollHeight > b.clientHeight + 1),
               scroll: document.documentElement.scrollHeight > window.innerHeight + 1 ||
                       document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    if (r.n !== 12) mal(`${w}x${h}: ${r.n} Kästchen`);
    if (r.minW < 60 || r.minH < 48) mal(`${w}x${h}: Kästchen nur ${r.minW.toFixed(0)}x${r.minH.toFixed(0)} px`);
    if (r.desborde) mal(`${w}x${h}: Text läuft aus einem Kästchen heraus`);
    if (r.scroll) mal(`${w}x${h}: Seite scrollt`);
    console.log(`  ${w}x${h}: Kästchen ${r.minW.toFixed(0)}x${r.minH.toFixed(0)} px`);
  }

  console.log(`\n${rondas} Runden gespielt, ${paresJugados} Paare zugeordnet, ` +
              `${conAudio} Hörkästchen geprüft`);
  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));
  await nav.close();
  console.log(fallos.length ? `\n${fallos.length} MÄNGEL:\n` + fallos.slice(0, 20).map(f => "  - " + f).join("\n")
                            : "\nkeine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
