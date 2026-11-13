/* FORMULARIO DE CONTACTO
   manda los datos al webhook de Make.
   Make los guarda en Airtable (tabla Contactos) y nos avisa por Telegram */

let urlContacto = "https://hook.eu1.make.com/ghk9t3rywn6dyyc810kgs98mnuhxci4l";

let formularioContacto = document.getElementById("form-contacto");

formularioContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    
    let datos = new URLSearchParams(new FormData(formularioContacto));

    fetch(urlContacto, { method: "POST", mode: "no-cors", body: datos })
        .then(function () {
            formularioContacto.reset();
            document.getElementById("aviso-contacto").style.display = "block";
        });
});
