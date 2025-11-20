// ======== script.js (corregido y robusto) ========

// ---------- CARRUSEL (seguro: solo si existe) ----------
const track = document.querySelector('.carousel-track');
const slides = track ? Array.from(track.children) : [];
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let index = 0;

function updateCarousel() {
    if (!track || slides.length === 0) return;
    const width = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(${-index * width}px)`;
}

if (track && slides.length > 0) {
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            index = (index + 1) % slides.length;
            updateCarousel();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            index = (index - 1 + slides.length) % slides.length;
            updateCarousel();
        });
    }

    window.addEventListener('resize', updateCarousel);
    updateCarousel();

    setInterval(() => {
        if (slides.length > 0) {
            index = (index + 1) % slides.length;
            updateCarousel();
        }
    }, 3000);
}


// ============================================================
// ================== SISTEMA DE CARRITO (robusto) ============
// ============================================================

// Cargar carrito desde localStorage si existe
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Util: formatea precio con separador de miles (opcional visual)
function formatoPrecio(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Actualizar número del carrito en pantalla (si existe el contador)
function actualizarContador() {
    const contador = document.querySelector(".contador-carrito");
    if (!contador) return;
    const totalCant = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalCant;
}
actualizarContador();

// Referencias seguras al DOM del carrito
const carritoContainer = document.querySelector('.carrito-container');
const carritoLista = document.querySelector('.carrito-lista');
const contenedorItems = document.querySelector('.carrito-items');

// Toggle mostrar/ocultar lista (si el HTML tiene el contenedor)
if (carritoContainer && carritoLista) {
    carritoContainer.addEventListener('click', (e) => {
        // evita que click dentro del cuadro lo cierre si lo necesitas
        carritoLista.style.display = carritoLista.style.display === 'block' ? 'none' : 'block';
        renderCarrito();
    });
}

// Renderizar contenido del carrito (si existe contenedor)
function renderCarrito() {
    const contenedor = document.querySelector('.carrito-items');
    const totalTexto = document.querySelector('#total-carrito') || document.querySelector('.carrito-total');

    if (!contenedor || !totalTexto) return;

    contenedor.innerHTML = '';
    let total = 0;

    carrito.forEach((item, i) => {
        const div = document.createElement('div');
        div.classList.add('carrito-item');

        // mostrar precio formateado y cantidad
        const subtotal = item.precio * item.cantidad;
        div.innerHTML = `
            <span>${item.nombre} (x${item.cantidad})</span>
            <div style="display:flex;gap:8px;align-items:center">
                <span>$${formatoPrecio(subtotal)}</span>
                <button class="btn-eliminar" data-index="${i}">X</button>
            </div>
        `;

        total += subtotal;
        contenedor.appendChild(div);
    });

    totalTexto.textContent = `Total: $${formatoPrecio(total)} COP`;

    // agregar listeners eliminar (si hay botones)
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = Number(btn.dataset.index);
            if (!Number.isNaN(i)) {
                carrito.splice(i, 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarContador();
                renderCarrito();
            }
        });
    });
}

// Función para agregar productos al carrito
function agregarAlCarrito(producto) {
    if (!producto || !producto.id) return;
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

// Botones "Agregar" (si hay)
const botonesAgregar = document.querySelectorAll(".btn-agregar");
if (botonesAgregar && botonesAgregar.length > 0) {
    botonesAgregar.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const nombre = btn.dataset.nombre;
            const precio = Number(btn.dataset.precio);
            if (!id || !nombre || isNaN(precio)) {
                console.warn("Botón agregar sin datos completos:", btn);
                return;
            }
            agregarAlCarrito({ id, nombre, precio });
        });
    });
}

// Vaciar carrito (si existe botón)
const btnVaciar = document.querySelector("#vaciar-carrito");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        carrito = [];
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarContador();
        renderCarrito();
    });
}

// Al cargar la página, si el cuadro ya está abierto, renderizamos
if (carritoLista && carritoLista.style.display === 'block') {
    renderCarrito();
}
