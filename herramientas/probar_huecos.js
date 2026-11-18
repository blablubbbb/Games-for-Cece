/* Spielt den Lückentext durch, bis jeder der 182 Sätze einmal drankam.
 *
 * Ohne Neuladen zwischen den Runden – das war die Lücke, durch die beim
 * Buchstabensalat das leere Gitter geschlüpft ist.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/huecos.html";

const fallos = [];
const mal = (t) => fallos.push(t);
const ok = (c, t) => { if (!c) mal(t); };

const VOCES = `
  (() => {
    const voces = [{ name: "Google español", lang: "es-ES" },
                   { name: "Deutsch", lang: "de-DE" }];
    window.__hablado = [];
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => voces,
      speak: (u) => window.__hablado.push({ texto: u.text, voz: u.voice && u.voice.lang }),
      cancel: () => {}, addEventListener: () => {},
    }});
    Object.defineProperty(window, "__esFalso", { value: true });
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
  ok(await p.evaluate(() => window.__esFalso === true), "Stimmen-Attrappe hat nicht gegriffen");
  await p.evaluate(() => localStorage.clear());
  await p.reload();

  const total = await p.evaluate(() => FRASES.length);
  console.log(`${total} Sätze im Spiel`);

  const actual = () => p.evaluate(() => {
    const f = ronda[paso];
    return { frase: f.frase, sol: f.sol, malas: f.malas, de: f.de, tipo: f.tipo,
             nivel: f.nivel, porque: f.porque,
             paso: paso, largo: ronda.length,
             opciones: [...document.querySelectorAll("#opciones button")].map(b => b.textContent),
             textoFrase: document.getElementById("frase").textContent,
             textoAlem: document.getElementById("alem").textContent,
             textoPorque: document.getElementById("porque").textContent,
             alemVisible: document.getElementById("alem").classList.contains("visible"),
             seguirVisible: document.getElementById("seguir").classList.contains("visible"),
             cuenta: document.getElementById("cuenta").textContent,
             monedas: Number(localStorage.getItem("cece-coins")),
             pts: Number(document.getElementById("pts").textContent) };
  });

  const pulsar = (palabra) => p.evaluate((w) => {
    const b = [...document.querySelectorAll("#opciones button")].find(x => x.textContent === w);
    if (!b) throw new Error("keine Taste für " + w);
    b.click();
  }, palabra);

  const vistas = new Set();
  let preguntas = 0, conError = 0, rondas = 0;

  async function jugarRonda(clase, nivel, conFallo) {
    const n = await p.evaluate(() => ronda.length);
    for (let i = 0; i < n; i++) {
      const a = await actual();
      preguntas++;
      vistas.add(a.frase);
      const etq = `„${a.frase}“`;

      // --- Aufbau der Frage
      if (a.opciones.length !== 4) mal(`${etq}: ${a.opciones.length} Antworten statt vier`);
      const esperadas = [a.sol].concat(a.malas).sort().join("|");
      if (a.opciones.slice().sort().join("|") !== esperadas)
        mal(`${etq}: Antworten ${a.opciones} statt ${[a.sol].concat(a.malas)}`);
      if (a.alemVisible) mal(`${etq}: Übersetzung steht schon vor der Antwort da`);
      if (a.seguirVisible) mal(`${etq}: „Weiter“ steht schon vor der Antwort da`);
      if (a.textoFrase.includes(a.sol) && a.frase.split("___")[0].includes(a.sol) === false
          && a.frase.split("___")[1].includes(a.sol) === false)
        mal(`${etq}: die Lösung steht schon im Satz`);
      if (a.cuenta !== `${i + 1}/${n}`) mal(`${etq}: Zähler ${a.cuenta} statt ${i + 1}/${n}`);
      if (nivel !== "todo" && a.nivel !== nivel) mal(`${etq}: Stufe ${a.nivel} in Runde ${nivel}`);
      if (clase === "gram" && a.tipo === "palabra") mal(`${etq}: Bedeutungssatz in Grammatikrunde`);
      if (clase === "sentido" && a.tipo !== "palabra") mal(`${etq}: ${a.tipo} in Bedeutungsrunde`);

      const monedasAntes = a.monedas;

      // --- Erst daneben, bei jeder dritten Frage
      if (conFallo && i % 3 === 1) {
        conError++;
        await pulsar(a.malas[0]);
        const b = await actual();
        if (b.alemVisible) mal(`${etq}: Übersetzung nach falscher Antwort`);
        if (b.monedas !== monedasAntes) mal(`${etq}: falsche Antwort gab Münzen`);
        const fuera = await p.evaluate(() =>
          [...document.querySelectorAll("#opciones button.fuera")].length);
        await p.waitForTimeout(550);
      }

      // --- Richtige Antwort
      await pulsar(a.sol);
      const c = await actual();
      if (!c.alemVisible) mal(`${etq}: keine Übersetzung nach der richtigen Antwort`);
      if (!c.seguirVisible) mal(`${etq}: kein „Weiter“ nach der richtigen Antwort`);
      if (!c.textoFrase.includes(a.sol)) mal(`${etq}: Lösung steht nicht im Satz`);
      if (c.textoAlem !== a.de) mal(`${etq}: Übersetzung „${c.textoAlem}“ statt „${a.de}“`);
      if (a.porque && c.textoPorque !== a.porque)
        mal(`${etq}: Erklärung „${c.textoPorque}“ statt „${a.porque}“`);
      const esperado = (conFallo && i % 3 === 1) ? monedasAntes : monedasAntes + 2;
      if (c.monedas !== esperado)
        mal(`${etq}: ${c.monedas} Münzen statt ${esperado}`);
      if (a.tipo !== "palabra" && !a.porque) mal(`${etq}: ${a.tipo} ohne Erklärung`);

      // --- Vorgelesen wird der fertige Satz, mit spanischer Stimme
      const hablado = await p.evaluate(() => window.__hablado.slice(-1)[0] || null);
      if (!hablado) mal(`${etq}: nichts vorgelesen`);
      else {
        if (hablado.voz !== "es-ES") mal(`${etq}: vorgelesen mit ${hablado.voz}`);
        const esperadoTexto = a.frase.replace("___", a.sol).replace(/[¿¡]/g, "");
        if (hablado.texto !== esperadoTexto)
          mal(`${etq}: vorgelesen „${hablado.texto}“ statt „${esperadoTexto}“`);
      }

      await pulsar.name;                      // nichts
      await p.click("#seguir");
      await p.waitForTimeout(30);
    }
    rondas++;
    await p.waitForSelector("#fin", { state: "visible", timeout: 3000 })
      .catch(() => mal(`Runde ${rondas}: kein Endbildschirm`));
  }

  // ---- Alle Sätze durchspielen, Stufe für Stufe ----
  for (const [clase, nivel] of [["todo", "u1"], ["todo", "u2"],
                                ["gram", "todo"], ["sentido", "todo"], ["todo", "todo"]]) {
    const cuantas = await p.evaluate(([c, nv]) => {
      clase = c; nivel = nv;
      return FRASES.filter(f => (nv === "todo" || f.nivel === nv) &&
        (c === "gram" ? (f.tipo === "verbo" || f.tipo === "articulo")
         : c === "sentido" ? f.tipo === "palabra" : true)).length;
    }, [clase, nivel]);
    const rondasNecesarias = Math.ceil(cuantas / 8) + 2;
    for (let r = 0; r < rondasNecesarias; r++) {
      if (rondas > 0) await p.click("#btn-nivel");
      await p.click(`#inicio .clases button[data-clase="${clase}"]`);
      const disponible = await p.evaluate((nv) =>
        !document.querySelector(`#inicio button[data-nivel="${nv}"]`).disabled, nivel);
      if (!disponible) { mal(`${clase}/${nivel}: Stufe ist gesperrt`); break; }
      await p.click(`#inicio button[data-nivel="${nivel}"]`);
      await jugarRonda(clase, nivel, r % 2 === 0);
    }
    console.log(`  ${clase}/${nivel}: ${vistas.size} verschiedene Sätze bisher gesehen`);
  }

  // ---- Haben wir alle erwischt? ----
  const faltan = await p.evaluate((v) => FRASES.filter(f => !v.includes(f.frase))
    .map(f => f.frase).slice(0, 10), [...vistas]);
  ok(faltan.length === 0, `${faltan.length} Sätze kamen nie dran, z. B. ${faltan.slice(0,3).join(" | ")}`);

  // ---- Bestmarken ----
  const marcas = await p.evaluate(() => JSON.parse(localStorage.getItem("cece-marcas") || "{}").huecos);
  ok(marcas && marcas.puntos > 0, "keine Bestmarke für Punkte");
  ok(marcas && marcas.serie > 0, "keine Bestmarke für die Serie");

  // ---- Größen ----
  await p.click("#btn-nivel");
  await p.click('#inicio button[data-nivel="todo"]');
  for (const [w, h] of [[320, 568], [360, 640], [414, 896]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => ({
      scroll: document.documentElement.scrollHeight > window.innerHeight + 1 ||
              document.documentElement.scrollWidth > window.innerWidth + 1,
      botones: [...document.querySelectorAll("#opciones button")].map(b => ({
        w: b.getBoundingClientRect().width, corta: b.scrollWidth > b.clientWidth + 1 })),
    }));
    if (r.scroll) mal(`${w}x${h}: Seite scrollt`);
    const cortadas = r.botones.filter(b => b.corta).length;
    if (cortadas) mal(`${w}x${h}: ${cortadas} Antworten abgeschnitten`);
    console.log(`  ${w}x${h}: Antwortknopf ${Math.round(r.botones[0].w)} px, ` +
                `abgeschnitten: ${cortadas}`);
  }

  console.log(`\n${rondas} Runden, ${preguntas} Fragen, davon ${conError} mit Fehlversuch`);
  console.log(`${vistas.size} von ${total} Sätzen gespielt`);
  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));
  await nav.close();
  console.log(fallos.length ? `\n${fallos.length} MÄNGEL:\n` +
    fallos.slice(0, 20).map(f => "  - " + f).join("\n") : "\nkeine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
