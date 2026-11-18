# -*- coding: utf-8 -*-
"""Die Sätze fürs Lückentext-Spiel.

Hier steht so wenig wie möglich von Hand, weil hier am meisten schiefgehen
kann: ein falsch abgetippter Satz lehrt sie falsches Spanisch, und das fällt
niemandem auf.

  * Bei Verblücken schreibe ich nur Satzrahmen, Verb und Person. Die Lösung
    und die drei falschen Antworten holt das Skript aus verbos_tabla.json –
    derselben Tabelle, die das Verbenspiel benutzt und die gegen den Anhang
    ihres Buches geprüft ist. Eine falsche Form kann so gar nicht entstehen.
  * Bei Artikellücken schreibe ich nur den Satz und das Nomen. Welcher Artikel
    richtig ist, steht als Genus im Wortschatz.
  * Nur bei Bedeutungslücken stehen die Antworten von Hand da – dort gibt es
    keine Regel, die man nachrechnen könnte. Dafür prüft der Prüfer, dass alle
    vier Wörter im Wortschatz stehen und verschieden sind.

Die Stufe wird NICHT von Hand vergeben, sondern aus den benutzten Wörtern
berechnet: ein Satz gehört zur höchsten Stufe, die in ihm vorkommt. Damit kann
kein Satz in einer Stufe landen, für die er zu schwer ist.

Person: 0=yo 1=tú 2=él/ella 3=nosotros 4=vosotros 5=ellos
"""

# ---------------------------------------------------------------- Funktionswörter
# Alles, was nicht im Vokabelverzeichnis steht, aber im Buch vorkommt – mit der
# Stufe, ab der sie es kennt. Was hier fehlt, meldet der Prüfer als unbekannt.
FUNCION = {
    # Vorkurs
    "y": "vorkurs", "o": "vorkurs", "es": "vorkurs", "son": "vorkurs",
    "me": "vorkurs", "llamo": "vorkurs", "se": "vorkurs", "llama": "vorkurs",
    "qué": "vorkurs", "cómo": "vorkurs", "dónde": "vorkurs", "quién": "vorkurs",
    "a": "vorkurs", "del": "vorkurs", "al": "vorkurs", "más": "vorkurs",
    "bien": "vorkurs", "no": "vorkurs",
    # Unidad 1
    "el": "u1", "la": "u1", "los": "u1", "las": "u1", "que": "u1",
    "eres": "u1", "somos": "u1", "sois": "u1", "mucho": "u1", "mucha": "u1",
    "muchos": "u1", "muchas": "u1", "todos": "u1", "todas": "u1",
    "este": "u1", "esta": "u1", "estos": "u1", "estas": "u1",
    # Unidad 2
    "un": "u2", "una": "u2", "unos": "u2", "unas": "u2",
    "mi": "u2", "mis": "u2", "tu": "u2", "tus": "u2", "su": "u2", "sus": "u2",
    "porque": "u2", "cuántos": "u2", "cuántas": "u2", "tengo": "u2",
    "años": "u2", "está": "u2", "están": "u2", "estoy": "u2", "estás": "u2",
    "estamos": "u2", "estáis": "u2",
}

# Regelmäßige Verben aus ihrem Wortschatz, die im Verbenspiel nicht
# vorkommen und darum nicht in verbos_tabla.json stehen. Konjugiert wird nach
# Regel – aber nur, wenn die hier von Hand eingetragene ich-Form dazu passt.
# Genau dort zeigt sich jede Unregelmäßigkeit: hago, salgo, quiero, puedo.
# Stimmt sie nicht überein, bricht der Bauer ab.
REGULARES_EXTRA = {
    "bailar":    "bailo",
    "comprar":   "compro",
    "dibujar":   "dibujo",
    "patinar":   "patino",
    "practicar": "practico",
    "olvidar":   "olvido",
}

# Nomen, deren Mehrzahl im Spiel vorkommt (von Hand, weil die Regel Ausnahmen hat)
PLURALES = {
    "libro": "libros", "deberes": "deberes", "tijeras": "tijeras",
    "lápiz": "lápices", "chico": "chicos", "chica": "chicas",
}

# --------------------------------------------------------------------- Verblücken
# (Satz mit ___, Verb, Person, deutsche Übersetzung)
VERBO = [
    # -- regelmäßige -ar
    ("Yo ___ español en el instituto.", "hablar", 0, "Ich spreche Spanisch in der Schule."),
    ("¿___ tú español?", "hablar", 1, "Sprichst du Spanisch?"),
    ("Mi hermano ___ con el profesor.", "hablar", 2, "Mein Bruder spricht mit dem Lehrer."),
    ("Nosotros ___ español en clase.", "hablar", 3, "Wir sprechen Spanisch im Unterricht."),
    ("¿Vosotros ___ español?", "hablar", 4, "Sprecht ihr Spanisch?"),
    ("Los chicos ___ con la profesora.", "hablar", 5, "Die Jungen sprechen mit der Lehrerin."),
    ("Yo ___ música en mi habitación.", "escuchar", 0, "Ich höre Musik in meinem Zimmer."),
    ("Mi hermana ___ música.", "escuchar", 2, "Meine Schwester hört Musik."),
    ("Nosotros ___ música en el salón.", "escuchar", 3, "Wir hören Musik im Wohnzimmer."),
    ("Ellos ___ música en el patio.", "escuchar", 5, "Sie hören Musik auf dem Hof."),
    ("Yo ___ el mapa.", "mirar", 0, "Ich schaue mir die Karte an."),
    ("¿Tú ___ la foto?", "mirar", 1, "Schaust du dir das Foto an?"),
    ("Ella ___ una foto.", "mirar", 2, "Sie schaut sich ein Foto an."),
    ("Vosotros ___ el vídeo.", "mirar", 4, "Ihr schaut das Video an."),
    ("Yo ___ la guitarra.", "tocar", 0, "Ich spiele Gitarre."),
    ("Mi amigo ___ la guitarra muy bien.", "tocar", 2, "Mein Freund spielt sehr gut Gitarre."),
    ("Nosotros ___ música en la fiesta.", "tocar", 3, "Wir machen Musik auf dem Fest."),
    ("Yo ___ mi mochila.", "buscar", 0, "Ich suche meinen Rucksack."),
    ("¿Tú ___ el libro?", "buscar", 1, "Suchst du das Buch?"),
    ("Ellos ___ la llave.", "buscar", 5, "Sie suchen den Schlüssel."),
    ("Yo ___ con mis amigos.", "charlar", 0, "Ich plaudere mit meinen Freunden."),
    ("Las chicas ___ en el patio.", "charlar", 5, "Die Mädchen plaudern auf dem Hof."),
    ("Yo ___ un zumo.", "tomar", 0, "Ich trinke einen Saft."),
    ("Mi hermana ___ un helado.", "tomar", 2, "Meine Schwester isst ein Eis."),
    ("Nosotros ___ un bocadillo.", "tomar", 3, "Wir essen ein belegtes Brot."),
    ("Yo ___ en casa.", "descansar", 0, "Ich ruhe mich zu Hause aus."),
    ("Vosotros ___ en el jardín.", "descansar", 4, "Ihr ruht euch im Garten aus."),
    ("Yo ___ el día en el parque.", "pasar", 0, "Ich verbringe den Tag im Park."),
    ("Yo ___ con mis amigos en la plaza.", "quedar", 0, "Ich verabrede mich mit meinen Freunden auf dem Platz."),
    ("Yo ___ español todos los días.", "estudiar", 0, "Ich lerne jeden Tag Spanisch."),
    ("¿Tú ___ en la biblioteca?", "estudiar", 1, "Lernst du in der Bibliothek?"),
    ("Mi vecino ___ en el instituto.", "estudiar", 2, "Mein Nachbar lernt in der Schule."),
    ("Nosotros ___ con el portátil.", "estudiar", 3, "Wir lernen mit dem Laptop."),
    ("Los alumnos ___ mucho.", "estudiar", 5, "Die Schüler lernen viel."),
    ("Yo ___ en mi habitación.", "bailar", 0, "Ich tanze in meinem Zimmer."),
    ("Nosotros ___ en la fiesta.", "bailar", 3, "Wir tanzen auf dem Fest."),
    ("Yo ___ un gato en mi cuaderno.", "dibujar", 0, "Ich zeichne eine Katze in mein Heft."),
    ("Ella ___ muy bien.", "dibujar", 2, "Sie zeichnet sehr gut."),
    ("Yo ___ un regalo en el mercado.", "comprar", 0, "Ich kaufe ein Geschenk auf dem Markt."),
    ("Mi mamá ___ en el supermercado.", "comprar", 2, "Meine Mama kauft im Supermarkt ein."),
    ("Nosotros ___ en el mercado.", "comprar", 3, "Wir kaufen auf dem Markt ein."),
    ("Yo ___ el español en el instituto.", "practicar", 0, "Ich übe Spanisch in der Schule."),
    ("Yo ___ en el parque.", "patinar", 0, "Ich fahre im Park Skateboard."),
    ("Los chicos ___ en la plaza.", "patinar", 5, "Die Jungen fahren auf dem Platz Skateboard."),
    ("Yo ___ la llave en casa.", "olvidar", 0, "Ich vergesse den Schlüssel zu Hause."),

    # -- regelmäßige -er
    ("Yo ___ un bocadillo.", "comer", 0, "Ich esse ein belegtes Brot."),
    ("¿Tú ___ en casa?", "comer", 1, "Isst du zu Hause?"),
    ("Mi hermano ___ un helado.", "comer", 2, "Mein Bruder isst ein Eis."),
    ("Nosotros ___ en la cocina.", "comer", 3, "Wir essen in der Küche."),
    ("¿Vosotros ___ en el jardín?", "comer", 4, "Esst ihr im Garten?"),
    ("Los chicos ___ en el patio.", "comer", 5, "Die Jungen essen auf dem Hof."),
    ("Yo ___ mucha agua.", "beber", 0, "Ich trinke viel Wasser."),
    ("Ella ___ agua.", "beber", 2, "Sie trinkt Wasser."),
    ("Nosotros ___ agua.", "beber", 3, "Wir trinken Wasser."),
    ("Yo ___ un libro.", "leer", 0, "Ich lese ein Buch."),
    ("¿Tú ___ el cómic?", "leer", 1, "Liest du den Comic?"),
    ("Mi amiga ___ una revista.", "leer", 2, "Meine Freundin liest eine Zeitschrift."),
    ("Nosotros ___ en la biblioteca.", "leer", 3, "Wir lesen in der Bibliothek."),
    ("Ellos ___ muchos libros.", "leer", 5, "Sie lesen viele Bücher."),
    ("Yo ___ español.", "aprender", 0, "Ich lerne Spanisch."),
    ("Mi hermana ___ el alfabeto.", "aprender", 2, "Meine Schwester lernt das Alphabet."),
    ("Nosotros ___ muchas letras.", "aprender", 3, "Wir lernen viele Buchstaben."),
    ("Yo ___ la pregunta del profesor.", "responder", 0, "Ich beantworte die Frage des Lehrers."),
    ("Ella ___ la pregunta.", "responder", 2, "Sie beantwortet die Frage."),
    ("Yo ___ el regalo en el armario.", "esconder", 0, "Ich verstecke das Geschenk im Schrank."),

    # -- regelmäßige -ir
    ("Yo ___ en Madrid.", "vivir", 0, "Ich wohne in Madrid."),
    ("¿Tú ___ en Valencia?", "vivir", 1, "Wohnst du in Valencia?"),
    ("Mi vecino ___ en el centro.", "vivir", 2, "Mein Nachbar wohnt im Zentrum."),
    ("Nosotros ___ en un piso nuevo.", "vivir", 3, "Wir wohnen in einer neuen Wohnung."),
    ("¿Vosotros ___ aquí?", "vivir", 4, "Wohnt ihr hier?"),
    ("Mis amigos ___ en Alemania.", "vivir", 5, "Meine Freunde wohnen in Deutschland."),
    ("Yo ___ una nota en mi agenda.", "escribir", 0, "Ich schreibe eine Notiz in meinen Kalender."),
    ("¿Tú ___ en el cuaderno?", "escribir", 1, "Schreibst du ins Heft?"),
    ("Ella ___ la fecha en la pizarra.", "escribir", 2, "Sie schreibt das Datum an die Tafel."),
    ("Nosotros ___ en el diario.", "escribir", 3, "Wir schreiben ins Tagebuch."),
    ("Yo ___ la ventana.", "abrir", 0, "Ich öffne das Fenster."),
    ("Mi hermano ___ la puerta.", "abrir", 2, "Mein Bruder öffnet die Tür."),
    ("Ellos ___ la entrada.", "abrir", 5, "Sie öffnen den Eingang."),
    ("Yo ___ la habitación con mi hermana.", "compartir", 0, "Ich teile das Zimmer mit meiner Schwester."),
    ("Nosotros ___ el bocadillo.", "compartir", 3, "Wir teilen das belegte Brot."),
    ("Yo ___ con mi hermano.", "discutir", 0, "Ich streite mich mit meinem Bruder."),

    # -- unregelmäßige
    ("Yo ___ de Alemania.", "ser", 0, "Ich bin aus Deutschland."),
    ("¿Tú ___ de España?", "ser", 1, "Bist du aus Spanien?"),
    ("Mi amiga ___ de Italia.", "ser", 2, "Meine Freundin ist aus Italien."),
    ("Nosotros ___ de Austria.", "ser", 3, "Wir sind aus Österreich."),
    ("¿Vosotros ___ de Francia?", "ser", 4, "Seid ihr aus Frankreich?"),
    ("Los chicos ___ de Portugal.", "ser", 5, "Die Jungen sind aus Portugal."),
    ("Yo ___ al parque.", "ir", 0, "Ich gehe in den Park."),
    ("¿Tú ___ al cine?", "ir", 1, "Gehst du ins Kino?"),
    ("Mi hermana ___ a la piscina.", "ir", 2, "Meine Schwester geht ins Schwimmbad."),
    ("Nosotros ___ al museo.", "ir", 3, "Wir gehen ins Museum."),
    ("¿Vosotros ___ al estadio?", "ir", 4, "Geht ihr ins Stadion?"),
    ("Ellos ___ a la fiesta.", "ir", 5, "Sie gehen auf das Fest."),
    ("Yo ___ los deberes en mi habitación.", "hacer", 0, "Ich mache die Hausaufgaben in meinem Zimmer."),
    ("¿Tú ___ los deberes?", "hacer", 1, "Machst du die Hausaufgaben?"),
    ("Mi hermano ___ una foto.", "hacer", 2, "Mein Bruder macht ein Foto."),
    ("Nosotros ___ un pícnic en el parque.", "hacer", 3, "Wir machen ein Picknick im Park."),
    ("Yo ___ de casa a las ocho.", "salir", 0, "Ich gehe um acht aus dem Haus."),
    ("Ella ___ con sus amigas.", "salir", 2, "Sie geht mit ihren Freundinnen aus."),
    ("Yo ___ una película.", "ver", 0, "Ich sehe einen Film."),
    ("¿Tú ___ la televisión?", "ver", 1, "Siehst du fern?"),
    ("Mi mamá ___ el vídeo.", "ver", 2, "Meine Mama sieht das Video."),
    ("Nosotros ___ una película en casa.", "ver", 3, "Wir sehen einen Film zu Hause."),

    # -- Verben mit Diphthong
    ("Yo ___ un helado.", "querer", 0, "Ich möchte ein Eis."),
    ("¿Tú ___ un zumo?", "querer", 1, "Möchtest du einen Saft?"),
    ("Mi hermana ___ un regalo.", "querer", 2, "Meine Schwester möchte ein Geschenk."),
    ("Nosotros ___ ir al cine.", "querer", 3, "Wir wollen ins Kino gehen."),
    ("Ellos ___ bailar.", "querer", 5, "Sie wollen tanzen."),
    ("Yo ___ los deberes.", "empezar", 0, "Ich fange mit den Hausaufgaben an."),
    ("La película ___ a las ocho.", "empezar", 2, "Der Film beginnt um acht."),
    ("Yo no ___ la pregunta.", "entender", 0, "Ich verstehe die Frage nicht."),
    ("¿Tú ___ el español?", "entender", 1, "Verstehst du Spanisch?"),
    ("Ella no ___ la respuesta.", "entender", 2, "Sie versteht die Antwort nicht."),
    ("Yo ___ el zumo al agua.", "preferir", 0, "Ich mag den Saft lieber als das Wasser."),
    ("Mi hermano ___ el cine.", "preferir", 2, "Mein Bruder mag das Kino lieber."),
    ("Yo ___ patinar muy bien.", "poder", 0, "Ich kann sehr gut Skateboard fahren."),
    ("¿Tú ___ abrir la puerta?", "poder", 1, "Kannst du die Tür öffnen?"),
    ("Mi amiga no ___ salir hoy.", "poder", 2, "Meine Freundin kann heute nicht rausgehen."),
    ("Yo ___ a casa a las seis.", "volver", 0, "Ich komme um sechs nach Hause zurück."),
    ("Ella ___ del instituto.", "volver", 2, "Sie kommt von der Schule zurück."),
    ("Yo ___ los libros de la estantería.", "contar", 0, "Ich zähle die Bücher im Regal."),
    ("Yo no ___ mi móvil.", "encontrar", 0, "Ich finde mein Handy nicht."),
    ("Mi hermana no ___ las llaves.", "encontrar", 2, "Meine Schwester findet die Schlüssel nicht."),
    ("Yo ___ en el libro.", "pensar", 0, "Ich denke an das Buch."),
]

# ------------------------------------------------------------------ Artikellücken
# (Satz mit ___, Nomen, "def" oder "indef", deutsche Übersetzung)
ARTICULO = [
    ("Busco ___ libro en la estantería.", "libro", "def", "Ich suche das Buch im Regal."),
    ("Abro ___ puerta de la cocina.", "puerta", "def", "Ich öffne die Tür der Küche."),
    ("Abro ___ ventana del salón.", "ventana", "def", "Ich öffne das Fenster des Wohnzimmers."),
    ("Escribo en ___ cuaderno.", "cuaderno", "def", "Ich schreibe ins Heft."),
    ("Miro ___ mapa en la pared.", "mapa", "def", "Ich schaue mir die Karte an der Wand an."),
    ("En el instituto ___ clase empieza a las ocho.", "clase", "def", "In der Schule beginnt der Unterricht um acht."),
    ("Escucho ___ música en el salón.", "música", "def", "Ich höre die Musik im Wohnzimmer."),
    ("Leo ___ revista en el sofá.", "revista", "def", "Ich lese die Zeitschrift auf dem Sofa."),
    ("Busco ___ sacapuntas en el estuche.", "sacapuntas", "def", "Ich suche den Spitzer im Mäppchen."),
    ("Veo ___ televisión en el salón.", "televisión", "def", "Ich sehe den Fernseher im Wohnzimmer."),
    ("Abro ___ armario de mi habitación.", "armario", "def", "Ich öffne den Schrank in meinem Zimmer."),
    ("Busco ___ agenda en la mochila.", "agenda", "def", "Ich suche den Kalender im Rucksack."),
    ("Tomo ___ merienda en el jardín.", "merienda", "def", "Ich esse den Nachmittagssnack im Garten."),
    ("Mi hermano busca ___ lápiz en el escritorio.", "lápiz", "def", "Mein Bruder sucht den Bleistift auf dem Schreibtisch."),
    ("Veo ___ película en el cine.", "película", "def", "Ich sehe den Film im Kino."),
    ("En mi habitación hay ___ armario.", "armario", "indef", "In meinem Zimmer gibt es einen Schrank."),
    ("En el salón hay ___ sofá.", "sofá", "indef", "Im Wohnzimmer gibt es ein Sofa."),
    ("En la cocina hay ___ nevera.", "nevera", "indef", "In der Küche gibt es einen Kühlschrank."),
    ("En el jardín hay ___ hamaca.", "hamaca", "indef", "Im Garten gibt es eine Hängematte."),
    ("En mi barrio hay ___ piscina.", "piscina", "indef", "In meinem Stadtviertel gibt es ein Schwimmbad."),
    ("En la plaza hay ___ quiosco.", "quiosco", "indef", "Auf dem Platz gibt es einen Kiosk."),
    ("En el pasillo hay ___ espejo.", "espejo", "indef", "Im Flur gibt es einen Spiegel."),
    ("En mi mochila hay ___ botella.", "botella", "indef", "In meinem Rucksack ist eine Flasche."),
    ("Quiero comprar ___ regalo en la tienda.", "regalo", "indef", "Ich möchte ein Geschenk im Laden kaufen."),
    ("Mi hermana escribe ___ nota.", "nota", "indef", "Meine Schwester schreibt eine Notiz."),
    ("En el instituto hay ___ biblioteca.", "biblioteca", "indef", "In der Schule gibt es eine Bibliothek."),
    ("En la terraza hay ___ planta.", "planta", "indef", "Auf der Terrasse steht eine Pflanze."),
]

# ------------------------------------------------------------- Bedeutungslücken
# (Satz mit ___, richtiges Wort, drei falsche, deutsche Übersetzung)
PALABRA = [
    ("En la ___ hay muchos libros.", "biblioteca",
     ["panadería", "piscina", "cocina"], "In der Bibliothek gibt es viele Bücher."),
    ("Compro el cuaderno en la ___.", "librería",
     ["heladería", "piscina", "panadería"], "Ich kaufe das Heft in der Buchhandlung."),
    ("Escribo con el ___ en el cuaderno.", "bolígrafo",
     ["mapa", "reloj", "táper"], "Ich schreibe mit dem Kugelschreiber ins Heft."),
    ("Los lápices están en el ___.", "estuche",
     ["balcón", "helado", "reloj"], "Die Bleistifte sind im Mäppchen."),
    ("El ___ de la pared es nuevo.", "reloj",
     ["mapa", "bocadillo", "jardín"], "Die Uhr an der Wand ist neu."),
    ("Los libros están en la ___.", "mochila",
     ["pizarra", "ventana", "merienda"], "Die Bücher sind im Rucksack."),
    ("El profesor escribe en la ___.", "pizarra",
     ["mochila", "regla", "silla"], "Der Lehrer schreibt an die Tafel."),
    ("Voy a la ___ con mis amigos.", "piscina",
     ["papelera", "estantería", "silla"], "Ich gehe mit meinen Freunden ins Schwimmbad."),
    ("Compro la entrada del ___.", "cine",
     ["lavabo", "armario", "cuaderno"], "Ich kaufe die Eintrittskarte fürs Kino."),
    ("Compro la merienda en el ___.", "supermercado",
     ["espejo", "pasillo", "rincón"], "Ich kaufe den Nachmittagssnack im Supermarkt."),
    ("Descanso en la ___ de mi habitación.", "cama",
     ["mesa", "puerta", "pared"], "Ich ruhe mich im Bett in meinem Zimmer aus."),
    ("La ropa está en el ___.", "armario",
     ["espejo", "zumo", "helado"], "Die Kleidung ist im Schrank."),
    ("El ___ del baño es nuevo.", "espejo",
     ["sillón", "jardín", "bocadillo"], "Der Spiegel im Bad ist neu."),
    ("El gato está en la ___.", "jaula",
     ["botella", "llave", "entrada"], "Die Katze ist im Käfig."),
    ("Bebo un ___ en la cocina.", "zumo",
     ["helado", "espejo", "armario"], "Ich trinke einen Saft in der Küche."),
    ("Tomo un ___ en la heladería.", "helado",
     ["bocadillo", "zumo", "balcón"], "Ich esse ein Eis in der Eisdiele."),
    ("El agua está en la ___.", "nevera",
     ["alfombra", "almohada", "lámpara"], "Das Wasser ist im Kühlschrank."),
    ("Abro la puerta con la ___.", "llave",
     ["regla", "botella", "revista"], "Ich öffne die Tür mit dem Schlüssel."),
    ("Escucho música con el ___.", "altavoz",
     ["espejo", "armario", "jardín"], "Ich höre Musik über den Lautsprecher."),
    ("Hago una foto con el ___.", "móvil",
     ["sofá", "lavabo", "pasillo"], "Ich mache ein Foto mit dem Handy."),
    ("Hago los deberes con el ___.", "portátil",
     ["bocadillo", "helado", "espejo"], "Ich mache die Hausaufgaben mit dem Laptop."),
    ("En el ___ de mi casa hay muchas plantas.", "jardín",
     ["pasillo", "lavabo", "espejo"], "Im Garten meines Hauses gibt es viele Pflanzen."),
    ("El día después del sábado es el ___.", "domingo",
     ["lunes", "martes", "jueves"], "Der Tag nach dem Samstag ist der Sonntag."),
    ("El año empieza en ___.", "enero",
     ["julio", "octubre", "abril"], "Das Jahr beginnt im Januar."),
    ("Después de noviembre es ___.", "diciembre",
     ["marzo", "junio", "septiembre"], "Nach November ist Dezember."),
    ("Escribo la ___ en mi agenda.", "fecha",
     ["llave", "jaula", "terraza"], "Ich schreibe das Datum in meinen Kalender."),
    ("En una ___ hay siete días.", "semana",
     ["fecha", "nota", "letra"], "Eine Woche hat sieben Tage."),
    ("Busco las ___ en el estuche.", "tijeras",
     ["reglas", "sillas", "mesas"], "Ich suche die Schere im Mäppchen."),
    ("El ___ está en la mesa.", "pegamento",
     ["rotulador", "sacapuntas", "cuaderno"], "Der Kleber liegt auf dem Tisch."),
    ("Dibujo con la ___.", "regla",
     ["mochila", "papelera", "silla"], "Ich zeichne mit dem Lineal."),
    ("Mi ___ y yo compartimos la habitación.", "hermana",
     ["profesora", "vecina", "chica"], "Meine Schwester und ich teilen das Zimmer."),
]
