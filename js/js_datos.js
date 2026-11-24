// ===== Ejemplos de localStorage, fechas y FileReader (capítulo 14) =====

// localStorage puede estar bloqueado (modo privado): por eso se usa try/catch
function leerDato(clave) {
  try { return localStorage.getItem(clave); } catch (e) { return null; }
}
function guardarDato(clave, valor) {
  try { localStorage.setItem(clave, valor); } catch (e) { }
}
function borrarDato(clave) {
  try { localStorage.removeItem(clave); } catch (e) { }
}

// ---------- 1. Recordar el nombre ----------
var campoNombre = document.getElementById("nombre");
var saludoNombre = document.getElementById("saludo-nombre");

function mostrarNombre() {
  var nombre = leerDato("nombre");
  if (nombre) {
    saludoNombre.textContent = "Hola, " + nombre + ". Te recuerdo aunque recargues la página.";
  } else {
    saludoNombre.textContent = "Todavía no te conozco. Escribe tu nombre y pulsa Guardar.";
  }
}

document.getElementById("guardar-nombre").addEventListener("click", function () {
  if (campoNombre.value.trim() !== "") {
    guardarDato("nombre", campoNombre.value.trim());
    mostrarNombre();
  }
});
document.getElementById("borrar-nombre").addEventListener("click", function () {
  borrarDato("nombre");
  campoNombre.value = "";
  mostrarNombre();
});
mostrarNombre();

// ---------- 2. Cuenta regresiva guardada ----------
var campoFecha = document.getElementById("fecha");
var mensajeFecha = document.getElementById("mensaje-fecha");
var relojFecha = null;

function ponerTiempo(d, h, m, s) {
  document.getElementById("t-dias").textContent = d;
  document.getElementById("t-horas").textContent = h;
  document.getElementById("t-minutos").textContent = m;
  document.getElementById("t-segundos").textContent = s;
}

function iniciarCuenta(valor) {
  clearInterval(relojFecha);
  if (!valor) {
    ponerTiempo(0, 0, 0, 0);
    mensajeFecha.textContent = "Elige una fecha para empezar.";
    return;
  }
  var fin = new Date(valor + "T00:00:00");          // medianoche, hora local
  function actualizar() {
    var ms = fin - new Date();
    if (ms <= 0) {
      ponerTiempo(0, 0, 0, 0);
      mensajeFecha.textContent = "¡Llegó la fecha!";
      clearInterval(relojFecha);
      return;
    }
    ponerTiempo(
      Math.floor(ms / (1000 * 60 * 60 * 24)),
      Math.floor(ms / (1000 * 60 * 60)) % 24,
      Math.floor(ms / (1000 * 60)) % 60,
      Math.floor(ms / 1000) % 60
    );
    mensajeFecha.textContent = "Falta para el " + fin.toLocaleDateString("es-PE") + ".";
  }
  actualizar();
  relojFecha = setInterval(actualizar, 1000);
}

var fechaGuardada = leerDato("cuentaRegresiva");
if (fechaGuardada) { campoFecha.value = fechaGuardada; }
iniciarCuenta(fechaGuardada);

campoFecha.addEventListener("change", function () {
  guardarDato("cuentaRegresiva", campoFecha.value);
  iniciarCuenta(campoFecha.value);
});

// ---------- 3. Leer un archivo con FileReader ----------
var campoArchivo = document.getElementById("archivo");
var infoArchivo = document.getElementById("info-archivo");
var vistaArchivo = document.getElementById("vista-archivo");
var LIMITE = 1024 * 1024;   // 1 MB

function mostrarContenido(nombre, texto) {
  var lineas = texto.split(/\r?\n/).filter(function (l) { return l.length > 0; });
  var primeras = lineas.slice(0, 5);                 // como head() en pandas
  infoArchivo.textContent = nombre + " · " + lineas.length + " líneas (se muestran las primeras " + primeras.length + ")";
  vistaArchivo.innerHTML = "";

  if (/\.csv$/i.test(nombre)) {
    var tabla = document.createElement("table");
    primeras.forEach(function (linea, i) {
      var fila = document.createElement("tr");
      linea.split(",").forEach(function (celda) {
        var c = document.createElement(i === 0 ? "th" : "td");
        c.textContent = celda;                       // textContent: no interpreta HTML
        fila.appendChild(c);
      });
      tabla.appendChild(fila);
    });
    vistaArchivo.appendChild(tabla);
  } else {
    var pre = document.createElement("pre");
    var codigo = document.createElement("code");
    codigo.textContent = primeras.join("\n");
    pre.appendChild(codigo);
    vistaArchivo.appendChild(pre);
  }
}

campoArchivo.addEventListener("change", function () {
  var archivo = campoArchivo.files[0];
  if (!archivo) { return; }
  if (archivo.size > LIMITE) {
    infoArchivo.textContent = "El archivo pesa más de 1 MB; elige uno más pequeño.";
    vistaArchivo.innerHTML = "";
    return;
  }
  var lector = new FileReader();
  lector.onload = function () { mostrarContenido(archivo.name, lector.result); };
  lector.onerror = function () { infoArchivo.textContent = "No se pudo leer el archivo."; };
  lector.readAsText(archivo);
});

document.getElementById("ejemplo-csv").addEventListener("click", function () {
  // Los mismos datos del DataFrame de la página de pandas
  mostrarContenido("alumnos.csv", "Nombre,Nota\nAna,15\nLuis,12\nCarla,18");
});
