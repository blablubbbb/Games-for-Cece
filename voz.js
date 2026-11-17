/* Spanische Sprachausgabe über die Stimmen des Geräts.
 *
 *   <script src="voz.js"></script>
 *   Voz.alEstarLista(() => { if (Voz.hay()) ... });
 *   Voz.decir("jardín");
 *
 * Der Browser bringt keine Stimmen mit, er reicht die des Betriebssystems
 * durch. Daraus folgen vier Dinge, die hier alle abgefangen werden:
 *
 *   1. Die Liste kommt verzögert. Auf Android gibt getVoices() beim ersten
 *      Aufruf eine leere Liste zurück; erst das Ereignis voiceschanged
 *      bringt sie. Darum alEstarLista() statt sofort fragen.
 *   2. Android schreibt die Sprachkennung mit Unterstrich – es_ES statt
 *      es-ES. Wer nur auf Bindestrich prüft, findet die Stimme nicht.
 *   3. Ohne spanische Stimme darf NICHT gesprochen werden. Setzt man nur
 *      utterance.lang = "es-ES" und es gibt keine spanische Stimme, nimmt
 *      das Gerät die deutsche und liest „jardín" deutsch vor. Das wäre
 *      schlimmer als Stille: sie lernte die falsche Aussprache. Deshalb
 *      wird die Stimme ausdrücklich gesetzt und sonst geschwiegen.
 *   4. Vor dem ersten Sprechen braucht es eine Berührung. Das Spiel wird
 *      sowieso angetippt, aber decir() wird nur aus Tippereignissen heraus
 *      aufgerufen.
 *
 * Bevorzugt wird Spanien-Spanisch: ihr Buch ist auf Spanien ausgerichtet
 * (vosotros gibt es in Lateinamerika nicht).
 */
const Voz = (function () {
  const soportado = typeof window !== "undefined" && "speechSynthesis" in window;
  let laVoz = null, lista = false;
  const esperando = [];

  function esEspanola(v) { return /^es([-_]|$)/i.test(v.lang || ""); }

  function buscar() {
    if (!soportado) return null;
    let voces = [];
    try { voces = window.speechSynthesis.getVoices() || []; } catch (e) { voces = []; }
    const es = voces.filter(esEspanola);
    if (!es.length) return null;
    // Spanien zuerst, dann irgendein Spanisch
    return es.find(v => /^es[-_]ES/i.test(v.lang)) || es[0];
  }

  function resolver() {
    if (lista) return;
    laVoz = buscar();
    lista = true;
    while (esperando.length) { try { esperando.shift()(); } catch (e) {} }
  }

  if (soportado) {
    // Erst fragen, dann auf das Ereignis warten, und zur Sicherheit ein paar
    // Mal nachsehen: manche Geräte feuern voiceschanged nicht zuverlässig.
    if (buscar()) { resolver(); }
    else {
      try { window.speechSynthesis.addEventListener("voiceschanged", () => {
        laVoz = buscar(); if (laVoz) resolver();
      }); } catch (e) {}
      let intentos = 0;
      const reloj = setInterval(() => {
        laVoz = buscar();
        if (laVoz || ++intentos >= 10) { clearInterval(reloj); resolver(); }
      }, 250);
    }
  } else {
    lista = true;
  }

  return {
    soportado,

    // Ist eine spanische Stimme da? Vorher alEstarLista abwarten.
    hay() { return !!laVoz; },

    estaLista() { return lista; },

    nombre() { return laVoz ? (laVoz.name + " · " + laVoz.lang) : null; },

    alEstarLista(fn) { if (lista) fn(); else esperando.push(fn); },

    // Sprechen – aber nur mit echter spanischer Stimme.
    decir(texto, opciones) {
      if (!soportado || !laVoz || !texto) return false;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(texto));
        u.voice = laVoz;               // ausdrücklich, nicht dem Gerät überlassen
        u.lang = laVoz.lang;
        u.rate = (opciones && opciones.rate) || 0.9;   // etwas langsamer zum Lernen
        u.pitch = 1;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) { return false; }
    },

    callar() { try { if (soportado) window.speechSynthesis.cancel(); } catch (e) {} },

    // Was dem Benutzer zu sagen ist, wenn nichts geht
    porQueNo() {
      if (!soportado) return "Dieser Browser kann keine Wörter vorlesen.";
      return "Auf diesem Gerät ist keine spanische Stimme installiert. " +
             "Unter Android: Einstellungen → Sprachen & Eingabe → " +
             "Text-in-Sprache-Ausgabe → Google Sprachausgabe → Sprachdaten " +
             "→ Spanisch herunterladen. Danach die Seite neu laden.";
    },
  };
})();
