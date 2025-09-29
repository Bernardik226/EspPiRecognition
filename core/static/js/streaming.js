// JavaScript específico do Streaming

(function() {
    'use strict';
    
    // Elementos DOM
    const startBtn = document.getElementById('startStream');
    const stopBtn = document.getElementById('stopStream');
    const autoStartCheckbox = document.getElementById('autoStart');
    const streamingVideo = document.getElementById('streamingVideo');
    
    // Estado do streaming
    let isStreaming = false;
    let streamInterval = null;
    
    // Configurações
    const STREAM_URL = '/stream/'; // URL do stream (ajustar conforme necessário)
    const CHECK_INTERVAL = 5000; // Verificar status a cada 5 segundos
    
    // Inicialização
    function init() {
        if (!streamingVideo) {
            console.warn('Elemento de vídeo não encontrado');
            return;
        }
        
        // Event listeners
        if (startBtn) {
            startBtn.addEventListener('click', startStream);
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', stopStream);
        }
        
        if (autoStartCheckbox) {
            autoStartCheckbox.addEventListener('change', handleAutoStart);
        }
        
        // Event listeners do vídeo
        streamingVideo.addEventListener('loadstart', handleVideoLoadStart);
        streamingVideo.addEventListener('canplay', handleVideoCanPlay);
        streamingVideo.addEventListener('error', handleVideoError);
        streamingVideo.addEventListener('ended', handleVideoEnded);
        
        // Verificar se deve iniciar automaticamente
        if (autoStartCheckbox && autoStartCheckbox.checked) {
            startStream();
        }
        
        // Verificar status periodicamente
        setInterval(checkStreamStatus, CHECK_INTERVAL);
        
        console.log('Streaming module initialized');
    }
    
    // Iniciar stream
    function startStream() {
        if (isStreaming) return;
        
        console.log('Iniciando stream...');
        isStreaming = true;
        
        // Atualizar UI
        updateUI('starting');
        
        // Configurar fonte do vídeo
        if (streamingVideo) {
            streamingVideo.src = STREAM_URL;
            streamingVideo.load();
        }
    }
    
    // Parar stream
    function stopStream() {
        if (!isStreaming) return;
        
        console.log('Parando stream...');
        isStreaming = false;
        
        // Parar vídeo
        if (streamingVideo) {
            streamingVideo.pause();
            streamingVideo.src = '';
        }
        
        // Atualizar UI
        updateUI('stopped');
    }
    
    // Verificar status do stream
    function checkStreamStatus() {
        if (!isStreaming || !streamingVideo) return;
        
        // Verificar se o vídeo está funcionando
        if (streamingVideo.readyState >= 2) { // HAVE_CURRENT_DATA
            updateUI('streaming');
        } else if (streamingVideo.error) {
            updateUI('error');
        }
    }
    
    // Atualizar interface do usuário
    function updateUI(status) {
        // Atualizar botões
        if (startBtn) {
            startBtn.disabled = (status === 'starting' || status === 'streaming');
            startBtn.innerHTML = status === 'starting' ? 
                '<i class="fas fa-spinner fa-spin"></i> Iniciando...' : 
                '<i class="fas fa-play"></i> Iniciar Stream';
        }
        
        if (stopBtn) {
            stopBtn.disabled = (status === 'stopped' || status === 'starting');
            stopBtn.innerHTML = '<i class="fas fa-stop"></i> Parar Stream';
        }
        
        // Atualizar status visual
        updateStatusIndicator(status);
    }
    
    // Atualizar indicador de status
    function updateStatusIndicator(status) {
        let statusElement = document.getElementById('streamStatus');
        if (!statusElement) {
            // Criar elemento de status se não existir
            statusElement = document.createElement('div');
            statusElement.id = 'streamStatus';
            statusElement.className = 'status-indicator';
            
            // Inserir após os controles
            const controls = document.querySelector('.control-buttons');
            if (controls) {
                controls.appendChild(statusElement);
            }
        }
        
        const statusConfig = {
            'stopped': { text: 'Stream Parado', class: 'status-offline' },
            'starting': { text: 'Iniciando...', class: 'status-offline' },
            'streaming': { text: 'Stream Ativo', class: 'status-online' },
            'error': { text: 'Erro no Stream', class: 'status-offline' }
        };
        
        const config = statusConfig[status] || statusConfig['stopped'];
        statusElement.className = `status-indicator ${config.class}`;
        statusElement.innerHTML = `
            <span class="status-dot"></span>
            ${config.text}
        `;
    }
    
    // Event handlers do vídeo
    function handleVideoLoadStart() {
        console.log('Vídeo iniciando carregamento...');
        updateUI('starting');
    }
    
    function handleVideoCanPlay() {
        console.log('Vídeo pronto para reprodução');
        updateUI('streaming');
        
        // Tentar reproduzir
        if (streamingVideo) {
            streamingVideo.play().catch(err => {
                console.warn('Erro ao reproduzir vídeo:', err);
            });
        }
    }
    
    function handleVideoError(e) {
        console.error('Erro no vídeo:', e);
        updateUI('error');
        isStreaming = false;
    }
    
    function handleVideoEnded() {
        console.log('Stream finalizado');
        updateUI('stopped');
        isStreaming = false;
    }
    
    // Gerenciar auto-start
    function handleAutoStart() {
        if (autoStartCheckbox && autoStartCheckbox.checked && !isStreaming) {
            startStream();
        } else if (!autoStartCheckbox.checked && isStreaming) {
            stopStream();
        }
    }
    
    // Funções públicas (para uso externo se necessário)
    window.StreamingModule = {
        start: startStream,
        stop: stopStream,
        isActive: () => isStreaming,
        getStatus: () => isStreaming ? 'streaming' : 'stopped'
    };
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
