// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let customerData = JSON.parse(localStorage.getItem('customerData')) || null;
// Variables para el modal de producto
let productModal;
let closeProductModalBtn;
let modalOverlay;
let currentProductId = null;

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

// Array de productos - ¡SIN DUPLICAR ESTA LÍNEA!
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
        // Datos de ejemplo como fallback
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
    if (!individualProductsContainer || !comboProductsContainer) {
        console.error('Contenedores de productos no encontrados');
        return;
    }
    
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
    
    console.log(`Productos mostrados: ${products.length} total, ${individualProducts.length} individuales, ${comboProducts.length} combos`);
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}</p>
            <p class="product-stock">Unidades: ${product.stock}</p>
            <p class="product-price">$${product.price.toLocaleString()}</p>
            <div class="product-actions">
                <button class="view-details" data-id="${product.id}">Ver detalles</button>
                <button class="add-to-cart" data-id="${product.id}">Agregar</button>
                <button class="buy-now" data-id="${product.id}">Comprar</button>
            </div>
        </div>
    `;
    
    return card;
}

// Funciones del carrito
function openCart() {
    console.log('Abriendo carrito...');
    if (cartSidebar && overlay) {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('cart-open');
    }
}

function closeCart() {
    console.log('Cerrando carrito...');
    if (cartSidebar && overlay) {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('cart-open');
        navMenu.classList.remove('active');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('Producto no encontrado:', productId);
        return;
    }
    
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
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Actualizar items del carrito
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--gray);">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>Tu carrito está vacío</p>
                    <p style="font-size: 0.9rem;">Agrega productos para comenzar</p>
                </div>
            `;
            if (cartTotalPrice) cartTotalPrice.textContent = '$0';
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
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `$${totalPrice.toLocaleString()}`;
        }
    }
}

// Inicializar modal de producto (AGREGAR DESPUÉS DE closeCart())
function initializeProductModal() {
    productModal = document.querySelector('.product-modal');
    closeProductModalBtn = document.querySelector('.close-product-modal');
    modalOverlay = document.querySelector('.modal-overlay');
    
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProductModal);
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal && productModal.classList.contains('active')) {
            closeProductModal();
        }
    });
}

// Abrir modal de producto (AGREGAR DESPUÉS DE initializeProductModal())
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProductId = productId;
    
    // Actualizar contenido del modal
    document.getElementById('modal-product-img').src = product.image;
    document.getElementById('modal-product-img').alt = product.name;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-price').textContent = `$${product.price.toLocaleString()}`;
    document.getElementById('modal-product-stock').textContent = product.stock;
    document.getElementById('modal-product-category').textContent = 
        product.category === 'individual' ? 'Producto Individual' : 'Combo Especial';
    
    // Mostrar modal
    if (productModal && modalOverlay) {
        productModal.classList.add('active');
        modalOverlay.style.display = 'block';
        document.body.classList.add('product-modal-open');
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar modal de producto (AGREGAR DESPUÉS DE openProductModal())
function closeProductModal() {
    if (productModal && modalOverlay) {
        productModal.classList.remove('active');
        modalOverlay.style.display = 'none';
        document.body.classList.remove('product-modal-open');
        document.body.style.overflow = '';
        currentProductId = null;
    }
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
    if (customerModal && overlay) {
        customerModal.classList.add('active');
        overlay.classList.add('active');
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
    
    // Guardar datos
    customerData = { name, phone };
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    // Cerrar modal
    if (customerModal) customerModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    // Enviar mensaje a WhatsApp
    sendWhatsAppMessage();
}

function skipCustomerData() {
    // Usar datos anónimos
    customerData = { 
        name: 'Cliente', 
        phone: 'Sin registro'
    };
    
    if (customerModal) customerModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    sendWhatsAppMessage();
}

function sendWhatsAppMessage() {
    // Número de WhatsApp
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
    const iva = total * 0.19;
    const totalConIva = total + iva;
    
    message += "═══════════════════════════\n";
    message += "💰 **RESUMEN DE PAGO**\n";
    message += "═══════════════════════════\n\n";
    message += `Subtotal: $${total.toLocaleString()}\n`;
    message += `IVA (19%): $${iva.toLocaleString()}\n`;
    message += `*TOTAL A PAGAR: $${totalConIva.toLocaleString()}*\n\n`;
    
    // Agregar datos del cliente
    message += "═══════════════════════════\n";
    message += "👤 **DATOS DEL CLIENTE**\n";
    message += "═══════════════════════════\n\n";
    message += `Nombre: ${customerData.name}\n`;
    message += `Teléfono: ${customerData.phone}\n\n`;
    
    message += "📦 *Información de entrega:*\n";
    message += "Por favor confirmar dirección de entrega y horario disponible.\n\n";
    message += "¡Gracias! 🙏";
    
    // Codificar mensaje
    const encodedMessage = encodeURIComponent(message);
    
    // Crear URL de WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Limpiar carrito
    cart = [];
    updateCart();
    closeCart();
    
    // Mostrar confirmación
    showNotification('✅ Pedido enviado a WhatsApp');
}

// Notificación
function showNotification(message) {
    // Eliminar notificaciones anteriores
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inicializar eventos CORREGIDO
function initEventListeners() {
    console.log('Inicializando eventos del carrito...');
    
    // 1. ICONO DEL CARRITO - ¡VERSIÓN CORREGIDA!
    if (cartIcon) {
        console.log('Icono del carrito encontrado');
        
        // MÚLTIPLES maneras de asegurar que funcione
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en carrito detectado');
            openCart();
        });
        
        // También asignar onclick directo
        cartIcon.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCart();
            return false;
        };
        
        // Asegurar que sea clickeable
        cartIcon.style.cursor = 'pointer';
        cartIcon.style.pointerEvents = 'auto';
        cartIcon.style.position = 'relative';
        cartIcon.style.zIndex = '1000';
    } else {
        console.error('ERROR: Icono del carrito no encontrado');
    }
    
    // 2. BOTÓN CERRAR CARRITO
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // 3. OVERLAY
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
    
    // 6. FORMULARIO
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerFormSubmit);
    }
    
    if (skipDataBtn) {
        skipDataBtn.addEventListener('click', skipCustomerData);
    }
    
    // 7. NAVEGACIÓN
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                closeCart();
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
                
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // 8. EVENT DELEGATION PARA PRODUCTOS
    document.addEventListener('click', function(e) {
        // Agregar al carrito
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
        
        // Comprar ahora
        if (e.target.classList.contains('buy-now')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
            setTimeout(openCart, 300);
        }
        
        // Eliminar item
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) {
            const productId = parseInt(removeBtn.getAttribute('data-id'));
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
    
    // 9. TECLA ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
    
    // 10. PREVENIR CERRADO ACCIDENTAL
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
    console.log('DOM cargado, iniciando...');
    
    // Cargar productos
    loadProducts().then(() => {
        console.log('Productos cargados');
        // Inicializar eventos
        initEventListeners();
        // Cerrar carrito al inicio
        closeCart();
        console.log('Aplicación lista');
    }).catch(error => {
        console.error('Error:', error);
        initEventListeners();
    });
    
    // Añadir estilos de animación
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
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
    }
});

// ==============================================
// CÓDIGO DE EMERGENCIA - GARANTIZA QUE EL CARRITO FUNCIONE
// ==============================================

// Esto se ejecutará después de que todo cargue
window.addEventListener('load', function() {
    console.log('Cargando código de emergencia...');
    
    setTimeout(function() {
        const cartIcon = document.querySelector('.cart-icon');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (cartIcon && cartSidebar) {
            console.log('Configurando carrito de emergencia');
            
            // Función ULTRA simple que siempre funcionará
            function emergencyOpenCart() {
                console.log('EMERGENCIA: Abriendo carrito');
                cartSidebar.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.classList.add('cart-open');
                return false;
            }
            
            // Sobrescribir cualquier cosa anterior
            cartIcon.onclick = emergencyOpenCart;
            
            // Añadir más listeners
            cartIcon.addEventListener('click', emergencyOpenCart, true);
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                emergencyOpenCart();
            }, true);
            
            // Estilos para asegurar click
            cartIcon.style.cursor = 'pointer';
            cartIcon.style.pointerEvents = 'auto';
            cartIcon.style.zIndex = '9999';
            
            console.log('Carrito de emergencia listo');
        }
    }, 1500);
});