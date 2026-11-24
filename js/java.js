var colores = ["#c9dce8", "#d6e8d4", "#f3e3c3", "#e8d4e6", "#d4e8e6", "#f0d4d4"];
var segundos = 0;

function obtenerSaludo(hora) {
  if (hora < 5) { return "Buenas noches"; }
  else if (hora < 12) { return "Buenos días"; }
  else if (hora < 19) { return "Buenas tardes"; }
  else { return "Buenas noches"; }
}

function mostrarSaludo() {
  var saludo = obtenerSaludo(new Date().getHours());
  var caja = document.getElementById("saludo-texto");
  var mensaje = caja.getAttribute("data-mensaje");
  if (mensaje) {
    caja.innerHTML = saludo + ". " + mensaje;
  } else {
    var tema = document.querySelector("h1").innerHTML;
    caja.innerHTML = saludo + ". Tema de esta página: <strong>" + tema + "</strong>";
  }
}

function cambiarColor() {
  var i = Math.floor(Math.random() * colores.length);
  document.querySelector("#saludo").style.backgroundColor = colores[i];
}

document.getElementById("anio").innerHTML = new Date().getFullYear();

mostrarSaludo();
setInterval(mostrarSaludo, 60000);

if (document.querySelector("#saludo")) {
  setInterval(function () {
    segundos = segundos + 1;
    document.getElementById("contador").innerHTML =
      "Llevas " + segundos + " segundos en esta página.";
  }, 1000);
}


// Los bloques de código que se desplazan se pueden recorrer con el teclado (Tab y flechas)
function hacerPreFocusables() {
  document.querySelectorAll("pre").forEach(function (pre) {
    if (pre.scrollWidth > pre.clientWidth) { pre.setAttribute("tabindex", "0"); }
    else { pre.removeAttribute("tabindex"); }
  });
}
window.addEventListener("load", hacerPreFocusables);
window.addEventListener("resize", hacerPreFocusables);
