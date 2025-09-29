// JavaScript específico da Galeria ESP32-CAM

(function() {
    'use strict';
    
    // Configurações
    const API = '/api/photos/';         // endpoint paginado (offset & limit)
    const PAGE_LIMIT = 20;              // quantas fotos por "page"
    const POLL_INTERVAL = 3000;        // ms para checar novas fotos
    const THUMB_SIZE = 180;            // para cache-busting

    // Estado
    let offset = 0;                    // quantas fotos já carregadas (para infinite scroll)
    let loading = false;               // evita chamadas concorrentes
    let allLoaded = false;             // true quando API retornou menos que PAGE_LIMIT
    const shownIds = new Set();        // evita duplicatas

    // Elementos DOM
    const gallery = document.getElementById('gallery');
    const loader = document.getElementById('loader');
    const status = document.getElementById('status');

    // Modal
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalClose');

    // Event listeners do modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // Funções do modal
    function openModal(src) {
        if (modal && modalImg) {
            modalImg.src = src;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Previne scroll do body
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            if (modalImg) modalImg.src = '';
            document.body.style.overflow = ''; // Restaura scroll do body
        }
    }

    // Fetch page (offset)
    async function fetchPage() {
        if (loading || allLoaded) return;
        loading = true;
        
        if (loader) loader.style.display = 'block';
        if (status) status.textContent = 'Carregando...';
        
        try {
            const res = await fetch(`${API}?offset=${offset}&limit=${PAGE_LIMIT}`);
            if (!res.ok) throw new Error('Erro HTTP ' + res.status);
            
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('Resposta inesperada');

            if (data.length < PAGE_LIMIT) allLoaded = true;
            renderPhotos(data, { append: true });
            offset += data.length;
            
            if (status) {
                if (offset === 0) {
                    status.textContent = 'Nenhuma foto ainda';
                } else {
                    status.textContent = `Mostrando ${offset} fotos`;
                }
            }
        } catch (err) {
            console.error('fetchPage', err);
            if (status) status.textContent = 'Erro ao carregar fotos';
        } finally {
            loading = false;
            if (loader) loader.style.display = allLoaded ? 'none' : 'block';
        }
    }

    // Fetch latest (poll) - pega as N mais recentes (limit)
    async function fetchLatest() {
        try {
            const res = await fetch(`${API}?offset=0&limit=${PAGE_LIMIT}`);
            if (!res.ok) return;
            
            const data = await res.json();
            // insere novos (que ainda não existem no shownIds) no topo
            const newItems = data.filter(p => !shownIds.has(p.id)).reverse();
            
            if (newItems.length) {
                renderPhotos(newItems, { prepend: true });
                offset += newItems.length;
                if (status) status.textContent = `Mostrando ${offset} fotos`;
            }
        } catch (e) {
            console.debug('poll error', e);
        }
    }

    // Render photos
    function renderPhotos(items, opts = { append: true }) {
        if (!gallery) return;
        
        const fragment = document.createDocumentFragment();
        
        items.forEach(p => {
            if (shownIds.has(p.id)) return; // evita duplicata
            shownIds.add(p.id);

            const card = document.createElement('div');
            card.className = 'thumb-card';

            const img = document.createElement('img');
            img.className = 'thumb';
            img.alt = `Foto ${p.id}`;
            // cache-busting com timestamp curto
            img.src = p.url + '?t=' + (new Date().getTime() % 100000) + '&w=' + THUMB_SIZE;
            img.loading = 'lazy';
            img.onclick = () => openModal(p.url + '?t=' + new Date().getTime());

            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = new Date(p.created_at).toLocaleString('pt-BR');

            card.appendChild(img);
            card.appendChild(meta);
            
            if (opts.prepend) {
                // inserir no fragment de modo que quando inserir no DOM as novas venham antes
                fragment.insertBefore(card, fragment.firstChild);
            } else {
                fragment.appendChild(card);
            }
        });

        if (opts.prepend) {
            // inserir no topo da galeria
            gallery.insertBefore(fragment, gallery.firstChild);
        } else {
            gallery.appendChild(fragment);
        }
    }

    // Infinite scroll: quando chegar perto do fim, carrega próxima página
    function onScroll() {
        if (loading || allLoaded) return;
        const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600);
        if (nearBottom) fetchPage();
    }

    // Inicialização
    function init() {
        // carregue primeira página
        fetchPage();
        
        // polling para novas fotos
        setInterval(fetchLatest, POLL_INTERVAL);
        
        // scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
