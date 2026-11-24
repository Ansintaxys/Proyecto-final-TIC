// ==========================================================
// ASISTENTE STICKMAN (páginas hijas)
// ----------------------------------------------------------
// Uso en una página:
//   <body data-asistente="Texto breve que dirá el asistente">
//   <link rel="stylesheet" href="../css/asistente.css">
//   <script src="../js/asistente.js"></script>
//
// AUDIO (opcional): si existe  assets/audio/<nombre-de-la-página>.mp3
// se reproduce solo al pulsar "Explícame". Ej.: pseudocodigo.html
// -> assets/audio/pseudocodigo.mp3. Si el archivo no existe, el
// asistente habla igual solo con el globo de texto.
// ==========================================================
(function () {
  var texto = document.body.getAttribute('data-asistente');
  if (!texto) return;

  var base = new URL('../', document.currentScript.src);            // raíz del sitio
  var pagina = location.pathname.split('/').pop().replace(/\.html?$/i, '') || 'index';
  var urlAudio = new URL('assets/audio/' + pagina + '.mp3', base).href;

  var frames = [1, 2, 3, 4, 5].map(function (i) {
    return new URL('assets/img/stick' + i + '.png', base).href;
  });
  frames.forEach(function (src) { new Image().src = src; });         // precarga

  // ---------- Estructura ----------
  var cont = document.createElement('div');
  cont.className = 'asistente';
  cont.setAttribute('role', 'complementary');
  cont.setAttribute('aria-label', 'Asistente');
  cont.innerHTML =
    '<div class="asistente-globo" id="asistente-globo">' +
      '<button type="button" class="cerrar" aria-label="Ocultar globo">×</button>' +
      '<p id="asistente-texto"></p>' +
    '</div>' +
    '<button type="button" class="asistente-stick" aria-label="Escuchar al asistente">' +
      '<img alt="" src="' + frames[0] + '">' +
    '</button>' +
    '<button type="button" class="asistente-hablar">▶ Explícame</button>';
  // Se coloca dentro de la columna de la derecha (#riel). Si la página no tiene esa columna, va al final del <body>.
  (document.getElementById('riel') || document.body).appendChild(cont);
  document.body.classList.add('tiene-asistente');

  var globo = cont.querySelector('.asistente-globo');
  var p = cont.querySelector('#asistente-texto');
  var stickBtn = cont.querySelector('.asistente-stick');
  var img = stickBtn.querySelector('img');
  var botonHablar = cont.querySelector('.asistente-hablar');
  p.textContent = texto;
  if (window.innerWidth <= 900) globo.classList.add('oculto');       // en móvil empieza oculto

  // ---------- Estado ----------
  var hablando = false, idxFrame = 0;
  var timerFrames = null, timerTexto = null, audio = null;
  var textoListo = false, audioPendiente = false;

  function revisarFin() {
    if (hablando && textoListo && !audioPendiente) detener();
  }

  function hablar() {
    hablando = true;
    textoListo = false;
    globo.classList.remove('oculto');
    stickBtn.classList.add('hablando');
    botonHablar.textContent = '■ Detener';

    // 1) Animación de cuadros (igual que en la portada)
    timerFrames = setInterval(function () {
      idxFrame = (idxFrame + 1) % frames.length;
      img.src = frames[idxFrame];
    }, 250);

    // 2) Texto que se escribe
    var i = 0;
    // Antes de escribir letra por letra, se guarda la altura final del globo
    // para que el stickman no se mueva mientras el texto va apareciendo.
    globo.style.minHeight = globo.offsetHeight + 'px';
    p.textContent = '';
    timerTexto = setInterval(function () {
      i++;
      p.textContent = texto.slice(0, i);
      if (i >= texto.length) {
        clearInterval(timerTexto);
        timerTexto = null;
        textoListo = true;
        revisarFin();
      }
    }, 30);

    // 3) Audio (solo si el archivo existe)
    var a = new Audio(urlAudio);
    audio = a;
    audioPendiente = true;
    function sinAudio() { if (a === audio) { audioPendiente = false; revisarFin(); } }
    a.addEventListener('ended', sinAudio);
    a.addEventListener('error', sinAudio);
    var prom = a.play();
    if (prom && prom.catch) prom.catch(sinAudio);
  }

  function detener() {
    hablando = false;
    clearInterval(timerFrames);
    clearInterval(timerTexto);
    timerFrames = timerTexto = null;
    if (audio) { audio.pause(); audio = null; }
    audioPendiente = false;
    idxFrame = 0;
    img.src = frames[0];
    p.textContent = texto;
    globo.style.minHeight = '';
    stickBtn.classList.remove('hablando');
    botonHablar.textContent = '▶ Explícame';
  }

  function alternar() { if (hablando) detener(); else hablar(); }

  stickBtn.addEventListener('click', alternar);
  botonHablar.addEventListener('click', alternar);
  cont.querySelector('.cerrar').addEventListener('click', function () {
    globo.classList.add('oculto');
  });
})();
