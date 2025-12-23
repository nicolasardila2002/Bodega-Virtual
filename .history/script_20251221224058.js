// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let customerData = JSON.parse(localStorage.getItem('customerData')) || null;
let products = [];

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
const individualProductsContainer = document.getElementById('individual-products');
const comboProductsContainer = document.getElementById('combo-products');

// Datos de ejemplo (cargar desde productos.json)
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
        // Datos de ejemplo
        products = [
            {
                id: 1,
                name: "Aguardiente Amarillo Manzanares 750ml",
                description: "Aguardiente premium con sabor a manzana.",
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
            }
        ];
        displayProducts();
    }
}

// Mostrar productos en la página
function displayProducts() {
    individualProductsContainer.innerHTML = '';
    comboProductsContainer.innerHTML = '';
    
    const individualProducts = products.filter(p => p.category === 'individual');
    const comboProducts = products.filter(p => p.category === 'combo');
    
    individualProducts.forEach(product => {
        const productCard = createProductCard(product);
        individualProductsContainer.appendChild(productCard);
    });
    
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
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
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

// Funciones del carrito
function openCart() {
    console.log('openCart llamado');
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('cart-open'); // Prevenir scroll
}

function closeCart() {
    console.log('closeCart llamado');
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('cart-open');
    
    // También cerrar menú móvil si está abierto
    navMenu.classList.remove('active');
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
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('✅ Producto agregado al carrito');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, increase) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;
    
    if (increase) {
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
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Actualizar items del carrito
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--gray);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 0.9rem;">Agrega productos para comenzar</p>
            </div>
        `;
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
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Actualizar precio total
    cartTotalPrice.textContent = `$${totalPrice.toLocaleString()}`;
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCart();
        showNotification('🗑️ Carrito vaciado');
    }
}

// Checkout y WhatsApp
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Mostrar modal para datos del cliente
    customerModal.classList.add('active');
    overlay.classList.add('active');
}

function handleCustomerFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    
    if (!name || !phone) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Guardar datos
    customerData = { name, phone };
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    // Cerrar modal
    customerModal.classList.remove('active');
    overlay.classList.remove('active');
    
    // Enviar mensaje a WhatsApp
    sendWhatsAppMessage();
}

function skipCustomerData() {
    // Usar datos anónimos
    customerData = { 
        name: 'Cliente', 
        phone: 'Sin registro'
    };
    
    customerModal.classList.remove('active');
    overlay.classList.remove('active');
    sendWhatsAppMessage();
}

function sendWhatsAppMessage() {
    // Número de WhatsApp (CAMBIAR POR TU NÚMERO REAL)
    const whatsappNumber = "573168493791";
    
    // Crear mensaje DETALLADO con los productos
    let message = "¡Hola! 👋\n\n";
    message += "Me gustaría hacer el siguiente pedido:\n\n";
    message += "═══════════════════════════\n";
    message += "📋 **DETALLE DEL PEDIDO**\n";
    message += "═══════════════════════════\n\n";
    
    // Agregar cada producto con detalles
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio unitario: $${item.price.toLocaleString()}\n`;
        message += `   Subtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const iva = total * 0.19; // Suponiendo 19% de IVA
    const totalConIva = total + iva;
    
    message += "═══════════════════════════\n";
    message += "💰 **RESUMEN DE PAGO**\n";
    message += "═══════════════════════════\n\n";
    message += `Subtotal: $${total.toLocaleString()}\n`;
    message += `IVA (19%): $${iva.toLocaleString()}\n`;
    message += `*TOTAL A PAGAR: $${totalConIva.toLocaleString()}*\n\n`;
    
    // Agregar datos del cliente si los tiene
    message += "═══════════════════════════\n";
    message += "👤 **DATOS DEL CLIENTE**\n";
    message += "═══════════════════════════\n\n";
    message += `Nombre: ${customerData.name}\n`;
    message += `Teléfono: ${customerData.phone}\n\n`;
    
    message += "📦 *Información de entrega:*\n";
    message += "Por favor confirmar dirección de entrega y horario disponible.\n\n";
    message += "¡Gracias! 🙏";
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear URL de WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappURL, '_blank');
    
    // Limpiar carrito después de enviar
    cart = [];
    updateCart();
    closeCart();
    
    // Mostrar confirmación
    showNotification('✅ Pedido enviado a WhatsApp');
}

// Notificación
function showNotification(message) {
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
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicializar eventos
function initEventListeners() {
    console.log('Inicializando eventos...');
    
    // 1. ICONO DEL CARRITO - ¡CORREGIDO!
    if (cartIcon) {
        console.log('Icono del carrito encontrado');
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en icono del carrito detectado');
            openCart();
        });
        
        // Asegurar que sea clickeable
        cartIcon.style.cursor = 'pointer';
        cartIcon.style.pointerEvents = 'auto';
    } else {
        console.error('Icono del carrito NO encontrado');
    }
    
    // 2. BOTÓN CERRAR CARRITO
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // 3. OVERLAY (clic fuera para cerrar)
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeCart();
            }
        });
    }
    
    // 4. MENÚ MÓVIL
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }
    
    // 5. BOTONES DEL CARRITO
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // 6. FORMULARIO DE CLIENTE
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerFormSubmit);
    }
    
    if (skipDataBtn) {
        skipDataBtn.addEventListener('click', skipCustomerData);
    }
    
    // 7. NAVEGACIÓN SUAVE
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Cerrar menú móvil y carrito
                    navMenu.classList.remove('active');
                    closeCart();
                    
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
            }
        });
    });
    
    // 8. EVENT DELEGATION PARA PRODUCTOS (CORREGIDO)
    document.addEventListener('click', function(e) {
        // Agregar al carrito
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            console.log('Agregando producto ID:', productId);
            addToCart(productId);
        }
        
        // Comprar ahora
        if (e.target.classList.contains('buy-now')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            console.log('Comprar ahora producto ID:', productId);
            addToCart(productId);
            setTimeout(openCart, 300);
        }
        
        // Eliminar item del carrito
        if (e.target.classList.contains('remove-item') || 
            e.target.closest('.remove-item')) {
            const button = e.target.classList.contains('remove-item') ? 
                          e.target : e.target.closest('.remove-item');
            const productId = parseInt(button.getAttribute('data-id'));
            removeFromCart(productId);
        }
        
        // Cambiar cantidad
        if (e.target.classList.contains('decrease')) {
            const productId = parseInt(e.target.parentElement.getAttribute('data-id'));
            updateQuantity(productId, false);
        }
        
        if (e.target.classList.contains('increase')) {
            const productId = parseInt(e.target.parentElement.getAttribute('data-id'));
            updateQuantity(productId, true);
        }
    });
    
    // 9. CERRAR CON TECLA ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
    
    // 10. PREVENIR CERRADO ACCIDENTAL AL HACER CLIC DENTRO DEL CARRITO
    if (cartSidebar) {
        cartSidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Inicializar carrito
    updateCart();
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    
    // Cargar productos primero
    loadProducts().then(() => {
        console.log('Productos cargados');
        // Inicializar eventos después de cargar productos
        initEventListeners();
        
        // Forzar cierre del carrito al inicio
        closeCart();
        
        console.log('Aplicación lista');
    }).catch(error => {
        console.error('Error al cargar productos:', error);
        initEventListeners(); // Inicializar de todos modos
    });
    
    // Añadir estilos de animación
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
});

// ==============================================
// CÓDIGO DE EMERGENCIA - ¡IMPORTANTE!
// ==============================================

// Añadir este código AL FINAL del archivo o mejor en el HTML
// Esto garantiza que el carrito funcione incluso si hay errores

// Función de emergencia para el carrito
function setupEmergencyCart() {
    console.log('Configurando carrito de emergencia...');
    
    // Esperar un momento para asegurar que el DOM esté listo
    setTimeout(() => {
        const cartIcon = document.querySelector('.cart-icon');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (cartIcon && cartSidebar) {
            console.log('Elementos encontrados para emergencia');
            
            // Función simple para abrir
            const openEmergency = () => {
                console.log('EMERGENCIA: Abriendo carrito');
                cartSidebar.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.classList.add('cart-open');
            };
            
            // Añadir evento directo
            cartIcon.onclick = openEmergency;
            
            // También añadir event listener
            cartIcon.addEventListener('click', openEmergency);
            
            // Asegurar que sea clickeable
            cartIcon.style.cursor = 'pointer';
            cartIcon.style.pointerEvents = 'auto';
            
            console.log('Carrito de emergencia configurado');
        } else {
            console.error('EMERGENCIA: Elementos no encontrados', {
                icon: !!cartIcon,
                sidebar: !!cartSidebar
            });
        }
    }, 1000);
}

// Ejecutar emergencia después de que todo cargue
window.addEventListener('load', setupEmergencyCart);