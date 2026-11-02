/* Randfälle: Akzentpflicht, Tipp-Knopf, Überschreibschutz, Löschen,
   Kreuzungsbuchstaben, Richtungswechsel per Fingertipp. */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/crucigrama.html";

let fallos = [];
const mal = (t) => fallos.push(t);
const ok = (c, t) => { if (!c) mal(t); };

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
  const errores = [];
  p.on("pageerror", e => errores.push(e.message));
  p.on("console", m => { if (m.type() === "error") errores.push(m.text()); });

  const tecla = (L) => p.evaluate((x) => {
    const b = [...document.querySelectorAll("#teclado button")].find(y => y.textContent === x);
    if (!b) throw new Error("keine Taste " + x);
    b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  }, L);
  const celda = (r, c) => p.evaluate(([rr, cc]) => {
    const d = [...document.getElementById("rejilla").children]
      .find(x => x.dataset.r == rr && x.dataset.c == cc);
    if (!d) return null;
    return { letra: d.lastChild.textContent, lista: d.classList.contains("lista"),
             foco: d.classList.contains("foco"), mala: d.classList.contains("mala") };
  }, [r, c]);
  const tocarCelda = (r, c) => p.evaluate(([rr, cc]) => {
    const d = [...document.getElementById("rejilla").children]
      .find(x => x.dataset.r == rr && x.dataset.c == cc);
    d.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  }, [r, c]);
  const pistaNum = () => p.evaluate(() => document.getElementById("pista-num").textContent);
  const monedas = () => p.evaluate(() => Number(localStorage.getItem("cece-coins")));

  // Gezielt ein Rätsel aufrufen, dessen erstes Wort einen Akzent hat
  async function abrir(nivel, idx, coins) {
    await p.goto(URL);
    await p.evaluate(([niv, i, c]) => {
      localStorage.clear();
      const n = PUZLES[niv].length, otros = [];
      for (let k = 0; k < n; k++) if (k !== i) otros.push(k);
      localStorage.setItem("cece-crucigrama-hechos", JSON.stringify({ [niv]: otros }));
      localStorage.setItem("cece-coins", String(c));
    }, [nivel, idx, coins]);
    await p.reload();
    await p.click(`#inicio button[data-nivel="${nivel}"]`);
    return p.evaluate(([niv, i]) => PUZLES[niv][i], [nivel, idx]);
  }

  await p.goto(URL);
  // Ein Rätsel suchen, dessen Eintrag 1 einen Akzent enthält
  const elegido = await p.evaluate(() => {
    for (const niv of Object.keys(PUZLES))
      for (let i = 0; i < PUZLES[niv].length; i++) {
        const e = PUZLES[niv][i].entradas[0];
        if (/[áéíóúñ]/.test(e.sol)) return { niv, i, sol: e.sol };
      }
    return null;
  });
  ok(elegido, "kein Rätsel mit Akzent im ersten Wort gefunden");

  // ---------------------------------------------------- 1. Akzentpflicht
  let pz = await abrir(elegido.niv, elegido.i, 0);
  const e0 = pz.entradas[0];
  const pos = (e, k) => [e.r + (e.dir === "v" ? k : 0), e.c + (e.dir === "h" ? k : 0)];
  const sinAcento = e0.sol.replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i")
                          .replace(/ó/g, "o").replace(/ú/g, "u").replace(/ñ/g, "n");
  for (const L of sinAcento) await tecla(L);
  await p.waitForTimeout(100);
  let c0 = await celda(...pos(e0, 0));
  ok(!c0.lista, `„${sinAcento}“ statt „${e0.sol}“ wurde als richtig gewertet`);
  ok((await monedas()) === 0, "falsche Eingabe hat Münzen gegeben");
  // Rot markiert wird genau der Buchstabe, der nicht stimmt – hier das fehlende
  // Akzentzeichen – damit sie sieht, wo es hakt, und nicht nur, dass es hakt.
  for (let k = 0; k < e0.sol.length; k++) {
    const c = await celda(...pos(e0, k));
    const deberia = sinAcento[k] !== e0.sol[k];
    if (deberia && !c.mala) mal(`fehlender Akzent an Stelle ${k} wird nicht rot markiert`);
    if (!deberia && c.mala) mal(`richtiger Buchstabe an Stelle ${k} wird rot markiert`);
  }
  await p.waitForTimeout(800);

  // Jetzt richtig: zuerst löschen, dann mit Akzent
  for (let k = 0; k < e0.sol.length; k++) await tecla("⌫");
  for (const L of e0.sol) await tecla(L);
  await p.waitForTimeout(100);
  c0 = await celda(...pos(e0, 0));
  ok(c0.lista, `„${e0.sol}“ mit Akzent wurde nicht angenommen`);
  ok((await monedas()) === 2, `nach erstem Wort ${await monedas()} Münzen statt 2`);

  // ------------------------------------------- 2. Überschreibschutz
  // Ein Wort, das das gelöste kreuzt, auswählen und am Kreuzungsfeld Unsinn tippen
  const cruce = pz.entradas.find((e, i) => {
    if (i === 0) return false;
    for (let k = 0; k < e.sol.length; k++) {
      const [r, c] = pos(e, k);
      for (let j = 0; j < e0.sol.length; j++) {
        const [r0, c0b] = pos(e0, j);
        if (r === r0 && c === c0b) return true;
      }
    }
    return false;
  });
  ok(cruce, "kein kreuzendes Wort gefunden");
  if (cruce) {
    // Kreuzungsstelle bestimmen
    let kCruce = -1, celdaCruce = null;
    for (let k = 0; k < cruce.sol.length; k++) {
      const [r, c] = pos(cruce, k);
      for (let j = 0; j < e0.sol.length; j++) {
        const [r0, c0b] = pos(e0, j);
        if (r === r0 && c === c0b) { kCruce = k; celdaCruce = [r, c]; }
      }
    }
    await tocarCelda(...pos(cruce, kCruce === 0 ? 1 : 0));
    const antes = await celda(...celdaCruce);
    ok(antes.letra === cruce.sol[kCruce],
       `Kreuzungsbuchstabe fehlt im zweiten Wort: „${antes.letra}“ statt „${cruce.sol[kCruce]}“`);
    // Alle Felder des kreuzenden Wortes vollschreiben, Kreuzung darf nicht kippen
    for (let k = 0; k < cruce.sol.length; k++) {
      if (k === kCruce) continue;
      await tecla(cruce.sol[k] === "a" ? "o" : "a");      // absichtlich falsch
    }
    await p.waitForTimeout(100);
    const despues = await celda(...celdaCruce);
    ok(despues.letra === cruce.sol[kCruce],
       `Kreuzungsbuchstabe überschrieben: „${despues.letra}“ statt „${cruce.sol[kCruce]}“`);
    const g0 = await celda(...pos(e0, 0));
    ok(g0.lista, "gelöstes Wort hat seine Markierung verloren");
    await p.waitForTimeout(800);
  }

  // --------------- 2b. Keine Sackgasse am letzten Feld
  // Wer das letzte Feld eines Wortes antippt, muss es trotzdem schreiben
  // können. Der Cursor gehört an die erste Lücke, nicht unter den Finger.
  pz = await abrir(elegido.niv, elegido.i, 0);
  const largo = pz.entradas.find(e => e.sol.length >= 3);
  await tocarCelda(...pos(largo, largo.sol.length - 1));
  let act = await pistaNum();
  if (!act.startsWith(largo.n + " " + (largo.dir === "h" ? "→" : "↓"))) {
    // Durch das letzte Feld läuft noch ein zweites Wort – einmal mehr tippen
    await tocarCelda(...pos(largo, largo.sol.length - 1));
    act = await pistaNum();
  }
  if (act.startsWith(largo.n + " " + (largo.dir === "h" ? "→" : "↓"))) {
    const fij = new Set();
    for (const L of largo.sol) await tecla(L);
    await p.waitForTimeout(150);
    const fin0 = await celda(...pos(largo, 0));
    ok(fin0.lista,
       `„${largo.sol}“ nach Tipp auf das letzte Feld nicht lösbar (Feld 0 zeigt „${fin0.letra}“)`);
  } else {
    mal("konnte das Wort über sein letztes Feld nicht auswählen");
  }

  // --------------- 2c. Falsches Wort neu tippen, ohne Dauerwackeln
  pz = await abrir(elegido.niv, elegido.i, 0);
  const w = pz.entradas[0];
  const falso = w.sol.split("").map(L => (L === "o" ? "a" : "o")).join("");
  for (const L of falso) await tecla(L);
  await p.waitForTimeout(900);                 // Wackeln abwarten
  // Der Versuch bleibt zum Vergleich stehen
  const quedo = await celda(...pos(w, 0));
  ok(quedo.letra === falso[0], "falscher Versuch verschwindet statt stehenzubleiben");
  // Jetzt das Wort neu auswählen und richtig tippen – dabei darf zwischendurch
  // nichts rot werden, erst am letzten Buchstaben wird wieder geprüft
  const flecha = w.dir === "h" ? "→" : "↓";
  await tocarCelda(...pos(w, 0));
  if (!(await pistaNum()).startsWith(w.n + " " + flecha)) await tocarCelda(...pos(w, 0));
  ok((await pistaNum()).startsWith(w.n + " " + flecha),
     `„${w.sol}“ ließ sich zum Neutippen nicht auswählen`);
  let rojoEntre = 0;
  for (let k = 0; k < w.sol.length; k++) {
    await tecla(w.sol[k]);
    if (k < w.sol.length - 1) {
      const r = await p.evaluate(() =>
        document.querySelectorAll("#rejilla .mala").length);
      rojoEntre += r;
    }
  }
  await p.waitForTimeout(150);
  ok(rojoEntre === 0, `beim Neutippen wurde ${rojoEntre}x zwischendurch rot markiert`);
  const arreglado = await celda(...pos(w, 0));
  ok(arreglado.lista, `„${w.sol}“ nach dem Neutippen nicht angenommen`);

  // ------------------------------------------- 3. Tipp-Knopf
  pz = await abrir(elegido.niv, elegido.i, 10);
  const antesM = await monedas();
  await p.evaluate(() => document.getElementById("btn-ayuda")
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));
  await p.waitForTimeout(100);
  const tras = await celda(...pos(pz.entradas[0], 0));
  ok(tras.letra === pz.entradas[0].sol[0], `Tipp deckt „${tras.letra}“ auf statt „${pz.entradas[0].sol[0]}“`);
  ok((await monedas()) === antesM - 3, `Tipp kostet ${antesM - (await monedas())} statt 3 Münzen`);

  // Ohne Geld darf nichts aufgedeckt werden
  pz = await abrir(elegido.niv, elegido.i, 2);
  await p.evaluate(() => document.getElementById("btn-ayuda")
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));
  await p.waitForTimeout(100);
  const pobre = await celda(...pos(pz.entradas[0], 0));
  ok(pobre.letra === "", "Tipp hat ohne genug Münzen aufgedeckt");
  ok((await monedas()) === 2, "Münzen trotz abgelehntem Tipp abgezogen");

  // ------------------------------------------- 4. Richtungswechsel per Tipp
  pz = await abrir(elegido.niv, elegido.i, 0);
  // Ein Feld suchen, durch das zwei Wörter laufen
  const mapa = {};
  pz.entradas.forEach((e, i) => {
    for (let k = 0; k < e.sol.length; k++) {
      const key = pos(e, k).join(",");
      (mapa[key] = mapa[key] || []).push(i);
    }
  });
  const doble = Object.entries(mapa).find(([, v]) => v.length === 2);
  ok(doble, "kein Feld mit zwei Wörtern");
  if (doble) {
    const [r, c] = doble[0].split(",").map(Number);
    await tocarCelda(r, c);
    const uno = await pistaNum();
    await tocarCelda(r, c);
    const dos = await pistaNum();
    ok(uno !== dos, `zweimal tippen wechselt die Richtung nicht (beide „${uno}“)`);
  }

  // ------------------------------------------- 5. Löschen
  await tecla("a"); await tecla("e");
  await tecla("⌫");
  const borrado = await p.evaluate(() =>
    [...document.getElementById("rejilla").children].filter(d => d.lastChild.textContent).length);
  ok(borrado === 1, `nach zwei Buchstaben und einmal Löschen stehen ${borrado} Buchstaben`);

  // ------------------------------------------- 6. Zurück-Weg
  await p.goto(URL);
  const atras = await p.evaluate(() => document.querySelector('.top a[href="index.html"]') !== null);
  ok(atras, "kein Zurück-Knopf oben links");

  if (errores.length) mal("Konsolenfehler: " + [...new Set(errores)].slice(0, 4).join(" | "));
  await nav.close();
  console.log(fallos.length ? `${fallos.length} MÄNGEL:\n` + fallos.map(f => "  - " + f).join("\n")
                            : "keine Mängel");
  process.exit(fallos.length ? 1 : 0);
})();
