// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let customerData = JSON.parse(localStorage.getItem('customerData')) || null;

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const overlay = document.querySelector('.overlay');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('nav ul');
const customerModal = document.querySelector('.customer-modal');
const customerForm = document.getElementById('customer-form');
const skipDataBtn = document.getElementById('skip-data');
const whatsappContact = document.getElementById('whatsapp-contact');
const individualProductsContainer = document.getElementById('individual-products');
const comboProductsContainer = document.getElementById('combo-products');

// Datos de ejemplo (en producción estos vendrían de productos.json)
let products = [];

// Cargar productos desde JSON
async function loadProducts() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        products = data;
        displayProducts();
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Datos de ejemplo por si falla la carga
        products = [
            {
                id: 1,
                name: "Aguardiente Amarillo Manzanares 750ml",
                description: "Aguardiente premium con sabor a manzana, ideal para compartir.",
                price: 48950,
                image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                stock: 47,
                category: "individual"
            },
            {
                id: 2,
                name: "Ron Viejo de Caldas 750ml",
                description: "Ron añejo con un sabor suave y aromático.",
                price: 55000,
                image: "https://images.unsplash.com/photo-1572494803367-ed5db6d6e7e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                stock: 32,
                category: "individual"
            },
            {
                id: 5,
                name: "Combo Fiesta Amigos",
                description: "Incluye Aguardiente, Ron y snacks para compartir con amigos.",
                price: 120000,
                image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                stock: 15,
                category: "combo"
            },
            {
                id: 6,
                name: "Combo Romántico",
                description: "Vino tinto, chocolates premium y velas aromáticas.",
                price: 85000,
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                stock: 22,
                category: "combo"
            }
        ];
        displayProducts();
    }
}

// Mostrar productos en la página
function displayProducts() {
    // Limpiar contenedores
    individualProductsContainer.innerHTML = '';
    comboProductsContainer.innerHTML = '';
    
    // Filtrar productos por categoría
    const individualProducts = products.filter(p => p.category === 'individual');
    const comboProducts = products.filter(p => p.category === 'combo');
    
    // Crear cards para productos individuales
    individualProducts.forEach(product => {
        const productCard = createProductCard(product);
        individualProductsContainer.appendChild(productCard);
    });
    
    // Crear cards para combos
    comboProducts.forEach(product => {
        const productCard = createProductCard(product);
        comboProductsContainer.appendChild(productCard);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img">
        <div class="product-info">
            <h3 class="product-title text-truncate" title="${product.name}">${product.name}</h3>
            <p class="product-description text-truncate-3" title="${product.description}">${product.description}</p>
            <p class="product-stock">Unidades: ${product.stock}</p>
            <p class="product-price">$${product.price.toLocaleString()}</p>
            <div class="product-actions">
                <button class="add-to-cart" data-id="${product.id}">Agregar</button>
                <button class="buy-now" data-id="${product.id}">Comprar</button>
            </div>
        </div>
    `;
    
    return card;
}

// Inicializar eventos
function initEventListeners() {
    // Carrito
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    
    // Menú móvil
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Navegación suave
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Cerrar menú móvil si está abierto
                navMenu.classList.remove('active');
                
                // Scroll suave
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Actualizar link activo
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', proceedToCheckout);
    clearCartBtn.addEventListener('click', clearCart);
    
    // Formulario de cliente
    customerForm.addEventListener('submit', handleCustomerFormSubmit);
    skipDataBtn.addEventListener('click', skipCustomerData);
    
    // Event delegation para botones de productos
    document.addEventListener('click', function(e) {
        // Agregar al carrito
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
        
        // Comprar ahora
        if (e.target.classList.contains('buy-now')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            buyNow(productId);
        }
        
        // Eliminar item del carrito
        if (e.target.classList.contains('remove-item')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(productId);
        }
        
        // Cambiar cantidad
        if (e.target.classList.contains('quantity-btn')) {
            const productId = parseInt(e.target.parentElement.getAttribute('data-id'));
            const isIncrease = e.target.classList.contains('increase');
            updateQuantity(productId, isIncrease);
        }
    });
    
    // Actualizar carrito al cargar
    updateCart();
}

// Funciones del carrito
function openCart() {
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('Producto agregado al carrito');
}

function buyNow(productId) {
    addToCart(productId);
    openCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, isIncrease) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;
    
    if (isIncrease) {
        if (item.quantity < product.stock) {
            item.quantity++;
        } else {
            alert('No hay suficiente stock disponible');
        }
    } else {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            removeFromCart(productId);
            return;
        }
    }
    
    updateCart();
}

function updateCart() {
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar items del carrito
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--gray);">Tu carrito está vacío</p>';
        cartTotalPrice.textContent = '$0';
        return;
    }
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toLocaleString()} c/u</p>
                <div class="cart-item-quantity" data-id="${item.id}">
                    <button class="quantity-btn decrease">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase">+</button>
                    <button class="remove-item" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Actualizar precio total
    cartTotalPrice.textContent = `$${totalPrice.toLocaleString()}`;
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCart();
        showNotification('Carrito vaciado');
    }
}

// Checkout y WhatsApp
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Mostrar modal para datos del cliente si no los tiene
    if (!customerData) {
        customerModal.classList.add('active');
        overlay.classList.add('active');
    } else {
        sendWhatsAppMessage();
    }
}

function handleCustomerFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    
    if (!name || !phone) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    customerData = { name, phone };
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    customerModal.classList.remove('active');
    overlay.classList.remove('active');
    
    sendWhatsAppMessage();
}

function skipCustomerData() {
    customerModal.classList.remove('active');
    overlay.classList.remove('active');
    sendWhatsAppMessage();
}

function sendWhatsAppMessage() {
    // Crear mensaje para WhatsApp
    let message = "Hola, me gustaría hacer un pedido:\n\n";
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: $${total.toLocaleString()}\n`;
    
    if (customerData) {
        message += `\nDatos del cliente:\nNombre: ${customerData.name}\nTeléfono: ${customerData.phone}`;
    }
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (cambiar por el número real)
    const whatsappNumber = "573001234567";
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Limpiar carrito después de enviar
    cart = [];
    updateCart();
    closeCart();
}

// Notificación
function showNotification(message) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--accent);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: var(--shadow);
        z-index: 1002;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initEventListeners();
    
    // Añadir estilos de animación para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});createProductCard