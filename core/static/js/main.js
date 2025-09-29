// JavaScript principal da aplicação PiEsp Recognition

(function() {
    'use strict';
    
    // Configurações globais
    const CONFIG = {
        animationDuration: 300,
        scrollOffset: 100,
        debounceDelay: 250
    };
    
    // Utilitários
    const Utils = {
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Verificar se elemento está visível
        isElementInViewport: function(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    };
    
    // Módulo de navegação
    const Navigation = {
        init: function() {
            this.initSmoothScroll();
            this.initActiveLinks();
            this.initMobileMenu();
        },
        
        initSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        },
        
        initActiveLinks: function() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath || (currentPath === '/' && href === '/')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        },
        
        initMobileMenu: function() {
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            
            if (navbarToggler && navbarCollapse) {
                // Fechar menu ao clicar em um link
                const navLinks = navbarCollapse.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (navbarCollapse.classList.contains('show')) {
                            navbarToggler.click();
                        }
                    });
                });
            }
        }
    };
    
    // Módulo de animações
    const Animations = {
        init: function() {
            this.initFadeInOnScroll();
            this.initCardHoverEffects();
        },
        
        initFadeInOnScroll: function() {
            const elements = document.querySelectorAll('.fade-in');
            
            const handleScroll = Utils.throttle(() => {
                elements.forEach(el => {
                    if (Utils.isElementInViewport(el)) {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }
                });
            }, CONFIG.debounceDelay);
            
            // Configurar elementos iniciais
            elements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `opacity ${CONFIG.animationDuration}ms ease, transform ${CONFIG.animationDuration}ms ease`;
            });
            
            window.addEventListener('scroll', handleScroll);
            handleScroll(); // Verificar elementos já visíveis
        },
        
        initCardHoverEffects: function() {
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }
    };
    
    // Módulo de notificações
    const Notifications = {
        show: function(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            notification.style.cssText = `
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            notification.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remover após duração
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    };
    
    // Módulo de performance
    const Performance = {
        init: function() {
            this.initLazyLoading();
            this.initImageOptimization();
        },
        
        initLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },
        
        initImageOptimization: function() {
            // Adicionar loading="lazy" para imagens sem lazy loading
            document.querySelectorAll('img:not([loading])').forEach(img => {
                img.loading = 'lazy';
            });
        }
    };
    
    // Inicialização principal
    function init() {
        console.log('PiEsp Recognition carregado!');
        
        // Inicializar tooltips do Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Inicializar módulos
        Navigation.init();
        Animations.init();
        Performance.init();
        
        // Expor utilitários globalmente
        window.PiEspUtils = {
            Utils,
            Notifications,
            CONFIG
        };
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();