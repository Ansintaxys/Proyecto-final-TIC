// ===== Ejemplos de Canvas (capítulo 14) =====
// Se usa var y function para ser coherente con la página de JavaScript del sitio.

// ---------- 1. Formas y texto ----------
var formas = document.getElementById("c-formas");
var ctx1 = formas.getContext("2d");

ctx1.fillStyle = "#3e5c76";
ctx1.fillRect(20, 20, 120, 80);          // rectángulo: x, y, ancho, alto

ctx1.beginPath();
ctx1.arc(220, 60, 40, 0, Math.PI * 2);   // círculo: x, y, radio, ángulo inicial y final
ctx1.fillStyle = "#8aa9c4";
ctx1.fill();

ctx1.fillStyle = "#1d2d44";
ctx1.font = "20px Arial";
ctx1.fillText("Hola canvas", 20, 130);   // texto: contenido, x, y

// ---------- 2. Dibujar con el mouse (o el dedo) ----------
var lienzo = document.getElementById("c-dibujo");
var ctx2 = lienzo.getContext("2d");
var color = document.getElementById("color");
var grosor = document.getElementById("grosor");
var pos = { x: 0, y: 0 };

function limpiarLienzo() {
  ctx2.fillStyle = "#ffffff";
  ctx2.fillRect(0, 0, lienzo.width, lienzo.height);
}

function guardarPosicion(e) {
  // offsetX/offsetY son relativas al canvas; se ajustan por si la página lo reduce de tamaño
  pos.x = e.offsetX * lienzo.width / lienzo.clientWidth;
  pos.y = e.offsetY * lienzo.height / lienzo.clientHeight;
}

function dibujar(e) {
  if (e.buttons !== 1) { return; }       // solo con el botón izquierdo (o el dedo) presionado
  ctx2.beginPath();
  ctx2.moveTo(pos.x, pos.y);             // desde donde estaba...
  guardarPosicion(e);
  ctx2.lineTo(pos.x, pos.y);             // ...hasta donde está ahora
  ctx2.strokeStyle = color.value;
  ctx2.lineWidth = grosor.value;
  ctx2.lineCap = "round";
  ctx2.stroke();
}

lienzo.addEventListener("pointerenter", guardarPosicion);
lienzo.addEventListener("pointerdown", function (e) { guardarPosicion(e); dibujar(e); });
lienzo.addEventListener("pointermove", dibujar);

document.getElementById("borrar").addEventListener("click", limpiarLienzo);

// ---------- 3. Guardar el dibujo como imagen ----------
document.getElementById("guardar").addEventListener("click", function () {
  var enlace = document.createElement("a");
  enlace.href = lienzo.toDataURL("image/png");
  enlace.download = "mi-dibujo.png";
  enlace.click();
});

limpiarLienzo();

// ---------- 4. Animación sencilla ----------
var anim = document.getElementById("c-anim");
var ctx3 = anim.getContext("2d");
var x = 30;
var dx = 4;
var reloj = null;
var botonAnim = document.getElementById("pausa");

function cuadro() {
  ctx3.clearRect(0, 0, anim.width, anim.height);   // borra el cuadro anterior
  x = x + dx;
  if (x > anim.width - 20 || x < 20) { dx = -dx; } // rebota en los bordes
  ctx3.beginPath();
  ctx3.arc(x, 60, 20, 0, Math.PI * 2);
  ctx3.fillStyle = "#3e5c76";
  ctx3.fill();
}

function reanudar() {
  reloj = setInterval(cuadro, 30);                  // unos 33 cuadros por segundo
  botonAnim.textContent = "Pausar";
}

function pausar() {
  clearInterval(reloj);
  reloj = null;
  botonAnim.textContent = "Reanudar";
}

botonAnim.addEventListener("click", function () {
  if (reloj === null) { reanudar(); } else { pausar(); }
});

cuadro();
// Respeta a quien prefiere menos movimiento: empieza en pausa
if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  pausar();
} else {
  reanudar();
}
