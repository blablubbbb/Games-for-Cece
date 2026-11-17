/* Prüft die Stimmenauswahl, indem dem Spiel verschiedene Gerätezustände
 * untergeschoben werden.
 *
 * Der gefährliche Fall ist nicht „keine Stimme“, sondern „deutsche Stimmen,
 * aber keine spanische“: setzt man dann nur utterance.lang = "es-ES", liest
 * das Gerät „jardín“ mit deutscher Aussprache vor. Sie lernte die falsche
 * Aussprache, ohne dass irgendwo ein Fehler sichtbar würde.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:8777/parejas.html";

const fallos = [];
const mal = (t) => fallos.push(t);
const ok = (c, t) => { if (!c) mal(t); };

// Baut ein gefälschtes speechSynthesis mit den angegebenen Stimmen
function guion(voces, tarde) {
  return `
    (() => {
      const voces = ${JSON.stringify(voces)}.map(v => ({ name: v.name, lang: v.lang,
        voiceURI: v.name, localService: true, default: false }));
      let entregadas = ${tarde ? "[]" : "voces"};
      const oyentes = [];
      window.__hablado = [];
      // window.speechSynthesis ist ein nur lesbarer Zugriffspunkt: eine
      // einfache Zuweisung verpufft lautlos, und der Test wäre aus dem
      // falschen Grund grün. Darum defineProperty.
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: {
          getVoices: () => entregadas,
          speak: (u) => { window.__hablado.push({ texto: u.text, lang: u.lang,
                           voz: u.voice ? u.voice.name : null,
                           vozLang: u.voice ? u.voice.lang : null, rate: u.rate }); },
          cancel: () => {},
          addEventListener: (n, f) => { if (n === "voiceschanged") oyentes.push(f); },
          set onvoiceschanged(f) { oyentes.push(f); },
        },
      });
      Object.defineProperty(window, "__esFalso", { value: true });
      window.SpeechSynthesisUtterance = function (t) {
        this.text = t; this.lang = ""; this.voice = null; this.rate = 1; this.pitch = 1;
      };
      ${tarde ? `setTimeout(() => { entregadas = voces;
                   oyentes.forEach(f => { try { f(); } catch (e) {} }); }, 400);` : ""}
    })();
  `;
}

const DE = [{ name: "Deutsch Deutschland", lang: "de-DE" },
            { name: "Google Deutsch", lang: "de_DE" }];
const ES_ES = { name: "Google español", lang: "es-ES" };
const ES_MX = { name: "Google español de Estados Unidos", lang: "es-MX" };
const ES_GUION_BAJO = { name: "Android español", lang: "es_ES" };

(async () => {
  const nav = await chromium.launch();

  async function conVoces(voces, tarde) {
    const p = await nav.newPage({ viewport: { width: 360, height: 640 } });
    await p.addInitScript(guion(voces, tarde));
    await p.goto(URL);
    await p.waitForFunction(() => window.Voz && Voz.estaLista(), null, { timeout: 6000 })
      .catch(() => {});
    // Ohne diese Gegenprobe wäre ein nicht greifender Stub unsichtbar: die
    // Tests wären grün, weil der Testbrowser selbst keine Stimmen hat.
    const falso = await p.evaluate(() => window.__esFalso === true);
    if (!falso) mal("Der Stimmen-Stub hat nicht gegriffen — Test wertlos");
    return p;
  }

  // ---------------------------------------- 1. Gar keine Stimmen
  let p = await conVoces([]);
  let r = await p.evaluate(() => ({ hay: Voz.hay(), dijo: Voz.decir("jardín"),
                                    hablado: window.__hablado.length }));
  ok(!r.hay, "ohne Stimmen meldet Voz trotzdem eine Stimme");
  ok(!r.dijo && r.hablado === 0, "ohne Stimmen wurde gesprochen");
  // Der Hören-Modus darf dann nicht wählbar sein
  let oir = await p.evaluate(() => document.getElementById("btn-modo-oir").disabled);
  ok(oir, "Hören-Modus ist ohne Stimme anwählbar");
  await p.close();

  // ------------------- 2. Deutsche Stimmen, keine spanische – der Ernstfall
  p = await conVoces(DE);
  r = await p.evaluate(() => ({ hay: Voz.hay(), dijo: Voz.decir("jardín"),
                                hablado: window.__hablado }));
  ok(!r.hay, "deutsche Stimmen werden als spanische Stimme gemeldet");
  ok(!r.dijo && r.hablado.length === 0,
     "„jardín“ würde mit deutscher Stimme vorgelesen: " + JSON.stringify(r.hablado));
  oir = await p.evaluate(() => document.getElementById("btn-modo-oir").disabled);
  ok(oir, "Hören-Modus ist mit nur deutschen Stimmen anwählbar");
  // Und der Hinweis muss erklären, was zu tun ist
  const nota = await p.evaluate(() => document.getElementById("nota-voz").textContent);
  ok(/spanische Stimme/i.test(nota) && /Android/i.test(nota),
     "kein brauchbarer Hinweis, wie man eine Stimme nachinstalliert: " + nota);
  await p.close();

  // ---------------------------------------- 3. Nur lateinamerikanisches Spanisch
  p = await conVoces([...DE, ES_MX]);
  r = await p.evaluate(() => { Voz.decir("jardín"); return { hay: Voz.hay(), h: window.__hablado }; });
  ok(r.hay, "es-MX wird nicht als spanische Stimme erkannt");
  ok(r.h.length === 1 && r.h[0].vozLang === "es-MX",
     "es-MX wurde nicht benutzt: " + JSON.stringify(r.h));
  await p.close();

  // ---------------------------------------- 4. Spanien wird bevorzugt
  p = await conVoces([...DE, ES_MX, ES_ES]);
  r = await p.evaluate(() => { Voz.decir("jardín"); return window.__hablado; });
  ok(r.length === 1 && r[0].vozLang === "es-ES",
     "bei mehreren spanischen Stimmen wurde nicht Spanien gewählt: " + JSON.stringify(r));
  ok(r[0].voz === "Google español", "falsche Stimme gesetzt");
  ok(r[0].rate && r[0].rate < 1, "nicht etwas langsamer vorgelesen: rate=" + r[0].rate);
  ok(r[0].texto === "jardín", "falscher Text gesprochen: " + r[0].texto);
  await p.close();

  // ------------------- 5. Android schreibt die Kennung mit Unterstrich
  p = await conVoces([...DE, ES_GUION_BAJO]);
  r = await p.evaluate(() => { Voz.decir("jardín"); return { hay: Voz.hay(), h: window.__hablado }; });
  ok(r.hay, "es_ES mit Unterstrich wird nicht erkannt — auf Android bliebe alles stumm");
  ok(r.h.length === 1 && r.h[0].vozLang === "es_ES", "es_ES wurde nicht benutzt");
  await p.close();

  // ------------------- 6. Stimmen kommen verspätet (so macht es Android)
  p = await conVoces([...DE, ES_ES], true);
  r = await p.evaluate(() => ({ hay: Voz.hay(), nombre: Voz.nombre(),
                                oir: document.getElementById("btn-modo-oir").disabled }));
  ok(r.hay, "verspätet gelieferte Stimmen werden nicht bemerkt");
  ok(!r.oir, "Hören-Modus bleibt gesperrt, obwohl eine Stimme kam");
  ok(/español/.test(r.nombre || ""), "Stimmenname wird nicht angezeigt: " + r.nombre);
  await p.close();

  // ------------------- 7. Im Hören-Modus wird beim Antippen gesprochen
  p = await conVoces([...DE, ES_ES]);
  await p.evaluate(() => { localStorage.clear(); });
  await p.click('#inicio .modos button[data-modo="oir"]');
  await p.click('#inicio button[data-nivel="u1"]');
  const hablado = await p.evaluate(() => {
    window.__hablado = [];
    const audio = [...document.querySelectorAll(".ficha")].find(b => b.textContent === "🔊");
    audio.click();
    return window.__hablado;
  });
  ok(hablado.length === 1, `Tippen auf 🔊 spricht ${hablado.length}x statt einmal`);
  ok(hablado[0] && hablado[0].vozLang === "es-ES", "beim Spielen falsche Stimme");
  ok(hablado[0] && /^[a-záéíóúñü]+$/i.test(hablado[0].texto),
     "gesprochen wurde nicht das spanische Wort: " + (hablado[0] || {}).texto);
  await p.close();

  // ------------------- 8. Vorlesen abschalten hält den Mund
  p = await conVoces([...DE, ES_ES]);
  await p.evaluate(() => localStorage.clear());
  await p.click("#btn-voz-inicio");                // auf dem Startbildschirm ausschalten
  await p.click('#inicio button[data-nivel="u1"]');
  const callado = await p.evaluate(() => {
    window.__hablado = [];
    document.querySelector(".ficha").click();
    return window.__hablado.length;
  });
  ok(callado === 0, "trotz abgeschaltetem Vorlesen wurde gesprochen");
  await p.close();

  await nav.close();
  console.log(fallos.length ? `${fallos.length} MÄNGEL:\n` + fallos.map(f => "  - " + f).join("\n")
                            : "keine Mängel — Stimmenauswahl sitzt");
  process.exit(fallos.length ? 1 : 0);
})();
