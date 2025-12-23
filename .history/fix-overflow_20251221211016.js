// fix-overflow.js - Previene que elementos aparezcan accidentalmente

(function() {
    'use strict';
    
    // Lista de elementos que deben estar siempre ocultos inicialmente
    const elementsToHide = [
        '.cart-sidebar',
        '.customer-modal',
        '.overlay'
    ];
    
    // Función para forzar que elementos estén ocultos
    function hideAllModalElements() {
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.remove('active');
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        });
        
        // Remover clase del body
        document.body.classList.remove('cart-open');
    }
    
    // Ejecutar al cargar
    document.addEventListener('DOMContentLoaded', function() {
        hideAllModalElements();
        
        // Forzar ocultamiento cada vez que cambie el tamaño
        window.addEventListener('resize', function() {
            // Solo ocultar si NO están activos intencionalmente
            if (!document.querySelector('.cart-sidebar').classList.contains('active')) {
                hideAllModalElements();
            }
        });
        
        // También cuando se hace scroll (por si acaso)
        window.addEventListener('scroll', function() {
            if (window.innerWidth < 768) {
                hideAllModalElements();
            }
        });
    });
    
    // Sobrescribir funciones de apertura para asegurar visibilidad
    const originalOpenCart = window.openCart;
    if (originalOpenCart) {
        window.openCart = function() {
            // Asegurar que otros elementos estén cerrados
            hideAllModalElements();
            
            // Mostrar elementos necesarios
            const cartSidebar = document.querySelector('.cart-sidebar');
            const overlay = document.querySelector('.overlay');
            
            if (cartSidebar) {
                cartSidebar.classList.add('active');
                cartSidebar.style.visibility = 'visible';
                cartSidebar.style.opacity = '1';
                cartSidebar.style.display = 'block';
            }
            
            if (overlay) {
                overlay.classList.add('active');
                overlay.style.display = 'block';
            }
            
            document.body.classList.add('cart-open');
        };
    }
})();