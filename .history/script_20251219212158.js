/**
 * BODEGA VIRTUAL - SCRIPT PREMIUM
 * Funcionalidades avanzadas para tienda de licores
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Bodega Virtual - Premium Licores 🥃');
    
    // ============================================
    // 1. HEADER SCROLL EFFECT
    // ============================================
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
            
            if (currentScroll > lastScroll && currentScroll > 400) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // 2. MENÚ MÓVIL RESPONSIVE
    // ============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            
            // Animación del ícono
            const icon = this.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                this.style.transform = 'rotate(90deg)';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                this.style.transform = 'rotate(0)';
            }
        });
    }
    
    // Cerrar menú al hacer clic en enlace
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Cerrar menú móvil
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        document.body.style.overflow = '';
                        if (menuToggle) {
                            const icon = menuToggle.querySelector('i');
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                            menuToggle.style.transform = 'rotate(0)';
                        }
                    }
                    
                    // Scroll suave
                    window.scrollTo({
                        top: targetSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ============================================
    // 3. ANIMACIÓN DE ELEMENTOS AL SCROLL
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animaciones específicas
                if (entry.target.classList.contains('producto-card')) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay || '0'}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos
    document.querySelectorAll('.producto-card, .combo-card, .beneficio, .testimonio').forEach((el, index) => {
        el.dataset.delay = (index * 0.1) + 0.2;
        observer.observe(el);
    });
    
    // ============================================
    // 4. FORMULARIO CLUB VIP
    // ============================================
    const formularioVIP = document.getElementById('formularioClubVIP');
    
    if (formularioVIP) {
        formularioVIP.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Mostrar estado de carga
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
            submitBtn.disabled = true;
            
            // Obtener datos
            const formData = {
                nombre: document.getElementById('nombreCompleto').value.trim(),
                telefono: document.getElementById('numeroTelefono').value.trim(),
                intereses: document.getElementById('intereses').value,
                aceptaWhatsApp: document.getElementById('aceptoWhatsApp').checked,
                fecha: new Date().toISOString(),
                tipo: 'club_vip'
            };
            
            // Validación
            if (!formData.nombre || !formData.telefono) {
                mostrarAlerta('Por favor, completa todos los campos obligatorios.', 'error');
                resetearBoton(submitBtn, originalText);
                return;
            }
            
            if (formData.telefono.length < 10) {
                mostrarAlerta('Por favor, ingresa un número de WhatsApp válido.', 'error');
                resetearBoton(submitBtn, originalText);
                return;
            }
            
            try {
                // Guardar en JSON local (simulación)
                guardarClienteLocal(formData);
                
                // Simular envío al servidor
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Mostrar éxito
                mostrarAlerta('¡Felicidades! 🎉 Te has unido al Club VIP. Pronto recibirás beneficios exclusivos.', 'success');
                
                // Enviar mensaje por WhatsApp
                const mensaje = `¡Hola Bodega Virtual! Me acabo de unir al Club VIP.\nNombre: ${formData.nombre}\nTeléfono: ${formData.telefono}\nInterés: ${formData.intereses || 'Todos los licores'}`;
                window.open(`https://wa.me/573168493791?text=${encodeURIComponent(mensaje)}`, '_blank');
                
                // Resetear formulario
                formularioVIP.reset();
                
            } catch (error) {
                console.error('Error:', error);
                mostrarAlerta('Error al procesar tu registro. Por favor, intenta nuevamente.', 'error');
            } finally {
                resetearBoton(submitBtn, originalText);
            }
        });
    }
    
    // ============================================
    // 5. FUNCIONES DE WHATSAPP PARA PRODUCTOS
    // ============================================
    window.comprarProducto = function(nombreProducto) {
        const mensaje = `¡Hola Bodega Virtual! 🥃\n\nMe interesa comprar el producto:\n"${nombreProducto}"\n\nPor favor, necesito:\n• Precio actual\n• Disponibilidad\n• Tiempo de entrega\n• Formas de pago\n\nGracias, quedo atento.`;
        window.open(`https://wa.me/573168493791?text=${encodeURIComponent(mensaje)}`, '_blank');
    };
    
    window.comprarCombo = function(nombreCombo) {
        const mensaje = `¡Hola Bodega Virtual! 🎁\n\nMe interesa el combo:\n"${nombreCombo}"\n\nPor favor, necesito:\n• Precio del combo\n• Qué incluye exactamente\n• Tiempo de entrega\n• Posibilidad de personalización\n\nGracias, quedo atento.`;
        window.open(`https://wa.me/573168493791?text=${encodeURIComponent(mensaje)}`, '_blank');
    };
    
    // ============================================
    // 6. FUNCIONES AUXILIARES
    // ============================================
    function guardarClienteLocal(cliente) {
        // Obtener clientes existentes
        let clientes = JSON.parse(localStorage.getItem('bodega_virtual_clientes') || '[]');
        
        // Agregar nuevo cliente
        cliente.id = Date.now();
        clientes.push(cliente);
        
        // Guardar en localStorage
        localStorage.setItem('bodega_virtual_clientes', JSON.stringify(clientes));
        
        // También enviar al servidor (simulación)
        enviarAlServidor(cliente);
        
        console.log('Cliente guardado:', cliente);
    }
    
    async function enviarAlServidor(cliente) {
        try {
            const respuesta = await fetch('guardar-cliente.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cliente)
            });
            
            if (!respuesta.ok) {
                throw new Error('Error en el servidor');
            }
            
            const datos = await respuesta.json();
            console.log('Respuesta servidor:', datos);
            
        } catch (error) {
            console.warn('No se pudo conectar al servidor, pero los datos se guardaron localmente:', error);
        }
    }
    
    function mostrarAlerta(mensaje, tipo = 'info') {
        // Crear alerta
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensaje}</span>
            <button class="alerta-cerrar"><i class="fas fa-times"></i></button>
        `;
        
        // Estilos de la alerta
        alerta.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: ${tipo === 'success' ? '#2E8B57' : '#8B0000'};
            color: white;
            padding: 20px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 400px;
            animation: aparecerAlerta 0.5s ease-out;
            border-left: 5px solid ${tipo === 'success' ? '#D4AF37' : '#FFD700'};
        `;
        
        // Animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes aparecerAlerta {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes desaparecerAlerta {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Botón cerrar
        const btnCerrar = alerta.querySelector('.alerta-cerrar');
        btnCerrar.addEventListener('click', () => {
            alerta.style.animation = 'desaparecerAlerta 0.5s ease-out forwards';
            setTimeout(() => alerta.remove(), 500);
        });
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.style.animation = 'desaparecerAlerta 0.5s ease-out forwards';
                setTimeout(() => alerta.remove(), 500);
            }
        }, 5000);
        
        // Agregar al documento
        document.body.appendChild(alerta);
    }
    
    function resetearBoton(boton, textoOriginal) {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
    
    // ============================================
    // 7. CONTADOR DE PRODUCTOS EN STOCK
    // ============================================
    function actualizarContadoresStock() {
        const contadores = document.querySelectorAll('.combo-stock');
        contadores.forEach(contador => {
            const stock = Math.floor(Math.random() * 5) + 1; // Simulación
            contador.innerHTML = `<i class="fas fa-bolt"></i> Solo ${stock} disponible${stock > 1 ? 's' : ''}`;
        });
    }
    
    // Inicializar contadores
    actualizarContadoresStock();
    
    // ============================================
    // 8. VALIDACIÓN EN TIEMPO REAL
    // ============================================
    const inputTelefono = document.getElementById('numeroTelefono');
    if (inputTelefono) {
        inputTelefono.addEventListener('input', function() {
            // Limpiar caracteres no numéricos
            this.value = this.value.replace(/[^0-9+]/g, '');
            
            // Formato automático
            if (this.value.length > 3 && this.value.length <= 6) {
                this.value = this.value.replace(/(\d{3})(\d{0,3})/, '$1 $2');
            } else if (this.value.length > 6) {
                this.value = this.value.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3');
            }
            
            // Validar longitud
            const numeros = this.value.replace(/\s/g, '');
            if (numeros.length > 12) {
                this.value = this.value.slice(0, 12);
            }
        });
    }
    
   // ============================================
// 9. EFECTO TYPING EN HERO - MEJORADO PARA MÓVIL
// ============================================
function efectoTyping() {
    const esMovil = window.innerWidth < 768;
    
    // Textos más cortos para móvil
    const textos = esMovil ? [
        "EL ARTE DEL BUEN BEBER",
        "LICORES PREMIUM",
        "EXPERIENCIAS ÚNICAS"
    ] : [
        "EL ARTE DEL BUEN BEBER",
        "LICORES PREMIUM",
        "EXPERIENCIAS ÚNICAS",
        "PASIÓN POR LOS DETALLES"
    ];
    
    let textoIndex = 0;
    let charIndex = 0;
    const elemento = document.querySelector('.hero-content h2 span');
    
    if (!elemento) return;
    
    // Limpiar texto inicial
    elemento.textContent = '';
    
    // Detener animación si existe
    if (window.typingInterval) {
        clearInterval(window.typingInterval);
    }
    
    function typeWriter() {
        if (charIndex < textos[textoIndex].length) {
            elemento.textContent += textos[textoIndex].charAt(charIndex);
            charIndex++;
            const velocidad = esMovil ? 80 : 100; // Más lento en móvil
            window.typingInterval = setTimeout(typeWriter, velocidad);
        } else {
            // Esperar antes de borrar
            const espera = esMovil ? 1500 : 2000;
            window.typingInterval = setTimeout(borrarTexto, espera);
        }
    }
    
    function borrarTexto() {
        if (charIndex > 0) {
            elemento.textContent = textos[textoIndex].substring(0, charIndex - 1);
            charIndex--;
            const velocidad = esMovil ? 40 : 50; // Borrar más rápido en móvil
            window.typingInterval = setTimeout(borrarTexto, velocidad);
        } else {
            textoIndex = (textoIndex + 1) % textos.length;
            window.typingInterval = setTimeout(typeWriter, 500);
        }
    }
    
    // Iniciar efecto
    typeWriter();
    
    // Pausar animación cuando no está visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && window.typingInterval) {
            clearTimeout(window.typingInterval);
        } else if (!document.hidden) {
            typeWriter();
        }
    });
}

// Iniciar efecto typing después de 1 segundo
setTimeout(efectoTyping, 1000);

// Re-iniciar typing al cambiar tamaño de ventana (responsive)
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(efectoTyping, 500);
});
    
    // ============================================
    // 10. INICIALIZACIÓN DE COMPONENTES
    // ============================================
    console.log('✅ Bodega Virtual inicializada correctamente');
});