/**
 * BODEGA VIRTUAL - SCRIPT PRINCIPAL
 * Funcionalidades: Menú móvil, formulario, WhatsApp
 */

// ============================================
// 1. MENÚ MÓVIL RESPONSIVE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            
            // Cambiar ícono
            const icon = this.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Cerrar menú al hacer clic en enlace
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            if (menuToggle) {
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // ============================================
    // 2. FORMULARIO DE REGISTRO
    // ============================================
    const formulario = document.getElementById('formularioRegistro');
    
    if (formulario) {
        formulario.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const nombre = document.getElementById('nombreCompleto').value.trim();
            const telefono = document.getElementById('numeroTelefono').value.trim();
            const aceptaWhatsApp = document.getElementById('aceptoWhatsApp').checked;
            
            // Validación básica
            if (!nombre || !telefono) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            if (telefono.length < 10) {
                alert('Por favor, ingresa un número de teléfono válido.');
                return;
            }
            
            // Crear objeto con datos del cliente
            const cliente = {
                nombre: nombre,
                telefono: telefono,
                aceptaWhatsApp: aceptaWhatsApp,
                fechaRegistro: new Date().toISOString()
            };
            
            try {
                // Enviar datos al servidor
                const respuesta = await enviarDatosCliente(cliente);
                
                if (respuesta.success) {
                    // Mostrar mensaje de éxito
                    alert('¡Registro exitoso! Gracias por unirte a nuestros clientes fieles.');
                    
                    // Resetear formulario
                    formulario.reset();
                    
                    // Opcional: Redirigir o mostrar mensaje especial
                    console.log('Cliente registrado:', respuesta.cliente);
                } else {
                    alert('Hubo un error al registrar. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.');
            }
        });
    }
    
    // ============================================
    // 3. FUNCIÓN PARA ENVIAR DATOS AL SERVIDOR
    // ============================================
    async function enviarDatosCliente(cliente) {
        // NOTA: Esta función requiere el archivo PHP "guardar-cliente.php"
        // Si no usas PHP, puedes modificar para usar otra tecnología
        
        const respuesta = await fetch('guardar-cliente.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente)
        });
        
        return await respuesta.json();
    }
    
    // ============================================
    // 4. FUNCIONES PARA WHATSAPP
    // ============================================
    window.comprarProducto = function(nombreProducto) {
        const mensaje = `Hola, me interesa comprar el producto: ${nombreProducto}. ¿Podrían darme más información?`;
        const urlWhatsApp = `https://wa.me/573168493791?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
    };
    
    window.comprarCombo = function(nombreCombo) {
        const mensaje = `Hola, me interesa comprar el combo: ${nombreCombo}. ¿Podrían darme más información?`;
        const urlWhatsApp = `https://wa.me/573168493791?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
    };
    
    // ============================================
    // 5. SCROLL SUAVE PARA ENLACES INTERNOS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ============================================
    // 6. VALIDACIÓN EN TIEMPO REAL DEL TELÉFONO
    // ============================================
    const inputTelefono = document.getElementById('numeroTelefono');
    if (inputTelefono) {
        inputTelefono.addEventListener('input', function() {
            // Solo permitir números
            this.value = this.value.replace(/[^0-9+]/g, '');
            
            // Limitar longitud
            if (this.value.length > 15) {
                this.value = this.value.slice(0, 15);
            }
        });
    }
    
    // ============================================
    // 7. ANIMACIÓN AL SCROLL
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.producto-card, .combo-card').forEach(el => {
        observer.observe(el);
    });
});