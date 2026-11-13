/* ----- CARRITO DE WAVE RIDERS ------*/


// url del webhook de Make para los pedidos (Make lo guarda en Airtable y me avisa por Telegram)
let urlPedido = "https://hook.eu1.make.com/5mnp9fvzzpxdmlkn6dydfkc369mg6dia";


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
function anadirMoto(boton) {
    let carrito = leerCarrito();
    let posicion = buscarMoto(carrito, boton.dataset.id);

    if (posicion == -1) {
        carrito.push({
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: Number(boton.dataset.precio),
            foto: boton.dataset.foto,
            cantidad: 1
        });
    } else {
        carrito[posicion].cantidad++;
    }

    guardarCarrito(carrito);

  
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


function quitarMoto(id) {
    let carrito = leerCarrito();
    let posicion = buscarMoto(carrito, id);
    carrito.splice(posicion, 1);
    guardarCarrito(carrito);
    pintarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContador();
    pintarCarrito();
}


/*-----esto se ejecuta al cargar cualquier pagina-----*/
actualizarContador();
pintarCarrito();


let botonesComprar = document.querySelectorAll(".comprar");
for (let i = 0; i < botonesComprar.length; i++) {
    botonesComprar[i].addEventListener("click", function () {
        anadirMoto(botonesComprar[i]);
    });
}


let formularioPedido = document.getElementById("form-pedido");
if (formularioPedido != null) {
    formularioPedido.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let carrito = leerCarrito();
        let productos = [];
        let total = 0;
        let unidades = 0;
        for (let i = 0; i < carrito.length; i++) {
            productos.push(carrito[i].nombre + " x" + carrito[i].cantidad);
            total = total + carrito[i].precio * carrito[i].cantidad;
            unidades = unidades + carrito[i].cantidad;
        }


        let datos = new URLSearchParams(new FormData(formularioPedido));
        datos.append("producto", productos.join(", "));
        datos.append("precio", total);
        datos.append("unidades", unidades);

        fetch(urlPedido, { method: "POST", mode: "no-cors", body: datos })
            .then(pedidoHecho)
            .catch(pedidoHecho);
    });
}


function pedidoHecho() {
    localStorage.removeItem("carrito");
    window.location.href = "pedido.html";
}

let botonVaciar = document.getElementById("vaciar");
if (botonVaciar != null) {
    botonVaciar.addEventListener("click", vaciarCarrito);
}


window.addEventListener("pageshow", actualizarContador);
