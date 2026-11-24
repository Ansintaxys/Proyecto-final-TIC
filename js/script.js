// ==========================================
// 1. SALAS DE PRÁCTICA (OBJETOS + ALEATORIO)
// Simulación: cada sala está libre o en uso y se libera sola
// ==========================================
var laboratorio = {
  nombre: 'Laboratorio virtual',
  salas: 9,
  activo: true
};
laboratorio.conexionWeb = true;
delete laboratorio.activo;

var salas = [
  { id: 'algoritmo',  nombre: 'Taller de algoritmos',   detalle: 'Qué es y sus fases',            url: 'paginas/fundamentos/algoritmo.html' },
  { id: 'pseudo',     nombre: 'Laboratorio de PSeInt',  detalle: 'Variables y pseudocódigo',      url: 'paginas/fundamentos/pseudocodigo.html' },
  { id: 'diagramas',  nombre: 'Sala de diagramas',      detalle: 'Símbolos y reglas',             url: 'paginas/fundamentos/diagramas.html' },
  { id: 'python',     nombre: 'Laboratorio de Python',  detalle: 'if, bucles y funciones',        url: 'paginas/python/python_basico.html' },
  { id: 'pandas',     nombre: 'Sala de datos (pandas)', detalle: 'Series y DataFrame',            url: 'paginas/python/python_pandas.html' },
  { id: 'js',         nombre: 'Taller de JavaScript',   detalle: 'Variables, listas y funciones', url: 'paginas/web/javascript.html' },
  { id: 'jscanvas',   nombre: 'Taller de Canvas',       detalle: 'Dibujo y animación',            url: 'paginas/web/js_canvas.html' },
  { id: 'jsdatos',    nombre: 'Sala de datos web',      detalle: 'localStorage y FileReader',     url: 'paginas/web/js_datos.html' },
  { id: 'htmlcss',    nombre: 'Taller de HTML y CSS',   detalle: 'Etiquetas y estilos',           url: 'paginas/web/html_css.html' }
];

var CLAVE = 'salas-estado-v1';
var MIN_MS = 2 * 60 * 1000;          // una sala en uso se libera como mínimo en 2 min
var MAX_MS = 90 * 60 * 1000;         // y como máximo en 90 min

var listaSalas = document.getElementById('listaSalas');
var resumen = document.getElementById('resumen');
document.getElementById('laboratorioNombre').textContent = laboratorio.nombre;

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// estado[id] = 0 (libre) o timestamp en que se libera
function generarEstado() {
  var estado = {};
  var ahora = Date.now();
  salas.forEach(function (c) {
    estado[c.id] = Math.random() < 0.6 ? 0 : ahora + aleatorio(MIN_MS, MAX_MS);
  });
  // al menos una sala siempre libre
  var alguna = salas.some(function (c) { return estado[c.id] === 0; });
  if (!alguna) estado[salas[aleatorio(0, salas.length - 1)].id] = 0;
  return estado;
}

function cargarEstado() {
  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && salas.every(function (c) { return c.id in guardado; })) return guardado;
  } catch (e) { /* sin localStorage: se genera en memoria */ }
  return null;
}

function guardarEstado() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
}

function formatear(ms) {
  var s = Math.max(0, Math.floor(ms / 1000));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var seg = s % 60;
  var dos = function (n) { return String(n).padStart(2, '0'); };
  return h > 0 ? h + 'h ' + dos(m) + 'm ' + dos(seg) + 's' : dos(m) + 'm ' + dos(seg) + 's';
}

var estado = cargarEstado() || generarEstado();
guardarEstado();

function dibujar(nuevas) {
  listaSalas.innerHTML = '';
  salas.forEach(function (c) {
    var libre = estado[c.id] === 0;
    var el = document.createElement(libre ? 'a' : 'div');
    el.className = 'sala ' + (libre ? 'libre' : 'ocupada');
    if (libre) el.href = c.url; else el.setAttribute('aria-disabled', 'true');
    if (nuevas && nuevas.indexOf(c.id) !== -1) el.classList.add('nueva');

    var texto = document.createElement('span');
    texto.innerHTML = '<span class="nombre"></span><span class="detalle"></span>';
    texto.querySelector('.nombre').textContent = c.nombre;
    texto.querySelector('.detalle').textContent = c.detalle;

    var est = document.createElement('span');
    est.className = 'estado';
    est.dataset.id = c.id;
    if (libre) est.textContent = 'Libre';
    else est.innerHTML = '<small>En uso · libre en</small><span class="t">' + formatear(estado[c.id] - Date.now()) + '</span>';

    el.appendChild(texto);
    el.appendChild(est);
    listaSalas.appendChild(el);
  });
  actualizarResumen();
}

function actualizarResumen() {
  var libres = salas.filter(function (c) { return estado[c.id] === 0; }).length;
  var proxima = Infinity;
  salas.forEach(function (c) { if (estado[c.id] && estado[c.id] < proxima) proxima = estado[c.id]; });
  resumen.textContent = libres + ' de ' + salas.length + ' salas libres' +
    (proxima !== Infinity ? ' · próxima liberación en ' + formatear(proxima - Date.now()) : ' · todas libres');
}

// Cuenta regresiva en vivo
setInterval(function () {
  var ahora = Date.now();
  var liberadas = [];
  salas.forEach(function (c) {
    if (estado[c.id] && estado[c.id] <= ahora) { estado[c.id] = 0; liberadas.push(c.id); }
  });
  if (liberadas.length) { guardarEstado(); dibujar(liberadas); return; }
  salas.forEach(function (c) {
    if (!estado[c.id]) return;
    var t = listaSalas.querySelector('.estado[data-id="' + c.id + '"] .t');
    if (t) t.textContent = formatear(estado[c.id] - ahora);
  });
  actualizarResumen();
}, 1000);

document.getElementById('boton-actualizar').addEventListener('click', function () {
  estado = generarEstado();
  guardarEstado();
  dibujar();
});

dibujar();

// ==========================================
// 2. ANIMACIÓN STICKMAN + AUDIO
// ==========================================
var imagenes = [
  'assets/img/stick1.png',
  'assets/img/stick2.png',
  'assets/img/stick3.png',
  'assets/img/stick4.png',
  'assets/img/stick5.png'
];
imagenes.forEach(function (src) { new Image().src = src; });   // precarga

var stickImagen = document.getElementById('stick-imagen');
var botonAnimacion = document.getElementById('boton-animacion');
var audioAsistente = document.getElementById('audio-asistente');
var burbuja = document.getElementById('burbuja');

var indiceActual = 0;
var intervalo = null;

function iniciar() {
  intervalo = setInterval(function () {
    indiceActual = (indiceActual + 1) % imagenes.length;
    stickImagen.src = imagenes[indiceActual];
  }, 250);
  stickImagen.classList.add('hablando');
  botonAnimacion.textContent = '■ Detener';
  botonAnimacion.classList.add('detener');

  audioAsistente.currentTime = 0;
  var p = audioAsistente.play();
  if (p && p.catch) p.catch(function () {
    burbuja.textContent = 'No pude reproducir el audio en este navegador.';
  });
}

function detener() {
  clearInterval(intervalo);
  intervalo = null;
  audioAsistente.pause();
  indiceActual = 0;
  stickImagen.src = imagenes[0];
  stickImagen.classList.remove('hablando');
  botonAnimacion.textContent = '▶ Iniciar animación';
  botonAnimacion.classList.remove('detener');
}

function cambiarAnimacion() {
  if (intervalo === null) iniciar(); else detener();
}

botonAnimacion.addEventListener('click', cambiarAnimacion);
audioAsistente.addEventListener('ended', detener);   // al terminar el audio, se detiene sola

// Año del pie de página
var anioPie = document.getElementById('anio');
if (anioPie) anioPie.textContent = new Date().getFullYear();
