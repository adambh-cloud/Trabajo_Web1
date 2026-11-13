/* ===== CARRITO DE WAVE RIDERS =====
   las motos se guardan en el localStorage del navegador,
   asi no se pierden al cambiar de pagina.
   el carrito es una lista de motos asi:
   [ { id, nombre, precio, foto, cantidad }, ... ] */


/*-----leer y guardar el carrito-----*/

// coge el carrito guardado. si no hay nada devuelve una lista vacia
function leerCarrito() {
    let guardado = localStorage.getItem("carrito");
    if (guardado == null) {
        return [];
    }
    return JSON.parse(guardado);
}

// guarda el carrito y actualiza el numerito del menu
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

// busca una moto en el carrito por su id. si no esta devuelve -1
function buscarMoto(carrito, id) {
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id == id) {
            return i;
        }
    }
    return -1;
}

// pone el punto de los miles: 21000 -> 21.000
// (en aleman tambien lo pone en los numeros de 4 cifras, en español no)
function ponerPuntos(numero) {
    return numero.toLocaleString("de-DE");
}


/*-----numerito rojo al lado de Carrito en el menu-----*/
function actualizarContador() {
    let contador = document.getElementById("contador");
    if (contador == null) {
        return;
    }

    let carrito = leerCarrito();
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
        total = total + carrito[i].cantidad;
    }

    if (total > 0) {
        contador.textContent = total;
        contador.style.display = "inline-block";
    } else {
        contador.style.display = "none";
    }
}


/*-----boton comprar del catalogo-----*/
// los datos de la moto van en el propio boton (data-id, data-nombre...)
function anadirMoto(boton) {
    let carrito = leerCarrito();
    let posicion = buscarMoto(carrito, boton.dataset.id);

    if (posicion == -1) {
        // no estaba, la metemos con cantidad 1
        carrito.push({
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: Number(boton.dataset.precio),
            foto: boton.dataset.foto,
            cantidad: 1
        });
    } else {
        // ya estaba, le sumamos una
        carrito[posicion].cantidad++;
    }

    guardarCarrito(carrito);

    // el boton cambia un momento para que se vea que se ha añadido
    boton.textContent = "Añadida";
    boton.classList.add("anadida");
    setTimeout(function () {
        boton.textContent = "Comprar";
        boton.classList.remove("anadida");
    }, 1200);
}


/*-----pagina del carrito: pintar las motos elegidas-----*/
function pintarCarrito() {
    let lista = document.getElementById("lista-carrito");
    if (lista == null) {
        return; // no estamos en carrito.html
    }

    let carrito = leerCarrito();
    let total = 0;
    let unidades = 0;
    lista.innerHTML = "";

    // una fila por cada moto
    for (let i = 0; i < carrito.length; i++) {
        let moto = carrito[i];
        let subtotal = moto.precio * moto.cantidad;
        total = total + subtotal;
        unidades = unidades + moto.cantidad;

        lista.innerHTML += `
            <div class="fila">
                <img src="${moto.foto}" alt="${moto.nombre}">
                <div class="fila-info">
                    <h3>${moto.nombre}</h3>
                    <p>${ponerPuntos(moto.precio)} €</p>
                    <div class="cantidad">
                        <button type="button" onclick="cambiarCantidad('${moto.id}', -1)">-</button>
                        <span>${moto.cantidad}</span>
                        <button type="button" onclick="cambiarCantidad('${moto.id}', 1)">+</button>
                    </div>
                </div>
                <span class="subtotal">${ponerPuntos(subtotal)} €</span>
                <button type="button" class="quitar" onclick="quitarMoto('${moto.id}')">Quitar</button>
            </div>`;
    }

    document.getElementById("total").textContent = ponerPuntos(total) + " €";
    document.getElementById("unidades").textContent = unidades;

    // si no hay motos sale el aviso y se esconde el resumen
    if (carrito.length == 0) {
        document.getElementById("vacio").style.display = "block";
        document.getElementById("resumen").style.display = "none";
    } else {
        document.getElementById("vacio").style.display = "none";
        document.getElementById("resumen").style.display = "block";
    }
}

// botones - y + (minimo 1 y maximo 5 de cada moto)
function cambiarCantidad(id, cambio) {
    let carrito = leerCarrito();
    let posicion = buscarMoto(carrito, id);
    let nueva = carrito[posicion].cantidad + cambio;

    if (nueva >= 1 && nueva <= 5) {
        carrito[posicion].cantidad = nueva;
        guardarCarrito(carrito);
        pintarCarrito();
    }
}

// boton quitar de cada fila
function quitarMoto(id) {
    let carrito = leerCarrito();
    let posicion = buscarMoto(carrito, id);
    carrito.splice(posicion, 1);
    guardarCarrito(carrito);
    pintarCarrito();
}

// boton vaciar carrito
function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContador();
    pintarCarrito();
}


/*-----esto se ejecuta al cargar cualquier pagina-----*/
actualizarContador();
pintarCarrito();

// a todos los botones de comprar les ponemos el click
let botonesComprar = document.querySelectorAll(".comprar");
for (let i = 0; i < botonesComprar.length; i++) {
    botonesComprar[i].addEventListener("click", function () {
        anadirMoto(botonesComprar[i]);
    });
}

// al confirmar el pedido se vacia el carrito y se va a pedido.html
let formularioPedido = document.getElementById("form-pedido");
if (formularioPedido != null) {
    formularioPedido.addEventListener("submit", function () {
        localStorage.removeItem("carrito");
    });
}

let botonVaciar = document.getElementById("vaciar");
if (botonVaciar != null) {
    botonVaciar.addEventListener("click", vaciarCarrito);
}

// si vuelves atras con el navegador se actualiza el numerito
window.addEventListener("pageshow", actualizarContador);
