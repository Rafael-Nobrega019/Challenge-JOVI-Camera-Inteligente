// ==========================================
// 1. CÂMERA E CONTROLES BÁSICOS
// ==========================================
const video = document.getElementById('camera-feed');
const switchBtn = document.getElementById('switch-camera');
const shutterBtn = document.getElementById('shutter');

let currentFacingMode = 'environment';
let stream = null;

async function startCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode
            }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        video.parentElement.innerHTML += `
            <div class="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400 text-center px-4">
                <div>
                    <div class="text-4xl mb-2 text-center">📷</div>
                    Permita o acesso à câmera para testar.
                </div>
            </div>`;
    }
}

switchBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startCamera();
});

startCamera();

// ==========================================
// 1.1 CONTROLE DE FLASH (Automático / Ligado / Desligado)
// ==========================================
const btnFlash = document.getElementById('btn-flash');
const flashIcon = document.getElementById('flash-icon');
const flashAutoBadge = document.getElementById('flash-auto-badge');

const MODOS_FLASH = ['auto', 'on', 'off'];
let modoFlash = 'auto';

// Atualiza o ícone conforme o modo atual (raio aceso, cortado, ou com selo "A")
function atualizarIconeFlash() {
    flashIcon.className = 'ph-fill text-[22px] transition-colors';
    flashAutoBadge.classList.add('hidden');

    if (modoFlash === 'off') {
        flashIcon.classList.add('ph-lightning-slash', 'text-white/60');
        btnFlash.title = 'Flash: Desligado';
    } else if (modoFlash === 'on') {
        flashIcon.classList.add('ph-lightning', 'text-yellow-400');
        btnFlash.title = 'Flash: Ligado';
    } else {
        flashIcon.classList.add('ph-lightning', 'text-white');
        flashAutoBadge.classList.remove('hidden');
        btnFlash.title = 'Flash: Automático';
    }
}

// Clique no botão: percorre o ciclo Automático -> Ligado -> Desligado -> Automático...
btnFlash.addEventListener('click', () => {
    modoFlash = MODOS_FLASH[(MODOS_FLASH.indexOf(modoFlash) + 1) % MODOS_FLASH.length];
    atualizarIconeFlash();
});

atualizarIconeFlash();

// ==========================================
// 2. MENU DE INTELIGÊNCIA ARTIFICIAL
// ==========================================
const btnAi = document.getElementById('btn-ai');
const aiMenu = document.getElementById('ai-menu');

// Abrir e fechar o menu ao clicar no botão de IA superior
btnAi.addEventListener('click', () => {
    aiMenu.classList.toggle('hidden');
});

// Cada ajuste aplica um efeito de verdade na imagem da câmera (brilho/contraste/saturação)
const AJUSTES_FILTRO = {
    auto: 'brightness(1.05) contrast(1.05) saturate(1.05)',
    noturna: 'brightness(1.35) contrast(1.15)',
    resolucao: 'contrast(1.08)',
    nitidez: 'contrast(1.15) saturate(1.1)',
    desfoque: 'blur(1.5px)',
    filtro: 'sepia(0.25) saturate(1.3) contrast(1.05)',
};

// Soma o efeito de todos os ajustes ligados e aplica no vídeo da câmera
function atualizarFiltroCamera() {
    const filtros = [...document.querySelectorAll('.ai-menu-item')]
        .filter(item => item.querySelector('.check-indicator').classList.contains('bg-yellow-400'))
        .map(item => AJUSTES_FILTRO[item.dataset.ajuste])
        .filter(Boolean);
    video.style.filter = filtros.join(' ') || 'none';
}

// Lógica das bolinhas amarelas do Menu IA
const aiItems = document.querySelectorAll('.ai-menu-item');
aiItems.forEach(item => {
    item.addEventListener('click', () => {
        const indicador = item.querySelector('.check-indicator');
        const ligado = indicador.classList.contains('bg-yellow-400');
        if (ligado) {
            indicador.classList.remove('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white');
            indicador.classList.add('border-[1.5px]', 'border-yellow-400');
            indicador.innerHTML = '';
        } else {
            indicador.classList.remove('border-[1.5px]', 'border-yellow-400');
            indicador.classList.add('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white', 'text-[10px]', 'leading-none');
            indicador.textContent = '✓';
        }


        atualizarFiltroCamera();
    });
});
atualizarFiltroCamera();

// ==========================================
// 3. GALERIA INTELIGENTE
// ==========================================
const btnOpenGallery = document.getElementById('btn-open-gallery');
const btnCloseGallery = document.getElementById('btn-close-gallery');
const galleryView = document.getElementById('gallery-view');

// Abre a tela da Galeria
btnOpenGallery.addEventListener('click', () => {
    galleryView.classList.remove('hidden');
    galleryView.classList.add('flex');
});

// Fecha a tela da Galeria (Botão Câmera na barra inferior)
btnCloseGallery.addEventListener('click', () => {
    galleryView.classList.add('hidden');
    galleryView.classList.remove('flex');
});

// ==========================================
// 4. TIRAR FOTOS & VISUALIZADOR TELA CHEIA
// ==========================================
const canvas = document.getElementById('photo-canvas');
const thumbnailImg = document.getElementById('thumbnail-img');
const galleryGrid = document.getElementById('gallery-grid');

const photoModal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const btnCloseModal = document.getElementById('btn-close-modal');

// Função de abrir a foto em tela cheia (Modal)
let fotoAtualElemento = null;
function abrirFotoEmTelaCheia(src, elemento) {
    modalImage.src = src;
    fotoAtualElemento = elemento || null;
    
    const favoritada = !!fotoAtualElemento?.classList.contains('favorito');
    
    // Removemos o textContent e usamos as classes ph e ph-fill do Phosphor
    btnFavoritarFoto.classList.toggle('ph-fill', favoritada);
    btnFavoritarFoto.classList.toggle('ph', !favoritada);
    btnFavoritarFoto.classList.toggle('text-pink-500', favoritada);
    
    photoModal.classList.remove('hidden');
    photoModal.classList.add('flex');
}

// Coração do visualizador: favorita/desfavorita a foto aberta
const btnFavoritarFoto = document.getElementById('btn-favoritar-foto');
btnFavoritarFoto.addEventListener('click', () => {
    if (!fotoAtualElemento) return;
    
    const favoritada = fotoAtualElemento.classList.toggle('favorito');
    
    // Alterna dinamicamente entre o ícone vazado e o preenchido
    btnFavoritarFoto.classList.toggle('ph-fill', favoritada);
    btnFavoritarFoto.classList.toggle('ph', !favoritada);
    btnFavoritarFoto.classList.toggle('text-pink-500', favoritada);
});

// Lixeira: exclui a foto aberta da galeria e fecha o visualizador
const btnExcluirFoto = document.getElementById('btn-excluir-foto');
btnExcluirFoto.addEventListener('click', () => {
    fotoAtualElemento?.remove();
    fotoAtualElemento = null;
    btnCloseModal.click();
});

// Fechar tela cheia
btnCloseModal.addEventListener('click', () => {
    photoModal.classList.add('hidden');
    photoModal.classList.remove('flex');
    modalImage.classList.remove('ia-realce');
    document.getElementById('badge-resolucao')?.remove();
});

// Painel de IA dentro do visualizador de foto (resolução e iluminação)
const btnIaFoto = document.getElementById('btn-ia-foto');
const menuIaFoto = document.getElementById('menu-ia-foto');
btnIaFoto.addEventListener('click', () => menuIaFoto.classList.toggle('hidden'));

const ACOES_IA_FOTO = {
    resolucao: () => {
        const badgeExistente = document.getElementById('badge-resolucao');
        if (badgeExistente) return badgeExistente.remove();
        const badge = document.createElement('div');
        badge.id = 'badge-resolucao';
        badge.className = 'absolute top-24 left-1/2 -translate-x-1/2 bg-purple-600/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20';
        badge.textContent = 'IA sugere: 4K Ultra HD';
        photoModal.appendChild(badge);
    },
    realce: () => modalImage.classList.toggle('ia-realce'),
};
document.querySelectorAll('#menu-ia-foto .ia-acao-foto').forEach(item => {
    item.addEventListener('click', () => {
        ACOES_IA_FOTO[item.dataset.acao]?.();
        menuIaFoto.classList.add('hidden');
    });
});

// Fazer as 9 fotos HTML (hardcoded) iniciais ficarem clicáveis
document.querySelectorAll('#gallery-grid > div').forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        abrirFotoEmTelaCheia(imgSrc, item);
    });
});

// Captura de fato a foto (chamada direto, ou no fim da contagem do autotimer)
function tirarFoto() {

    // Modo "off" nunca dispara o flash; "on" e "auto" disparam
    const dispararFlash = modoFlash !== 'off';

    // 1. Efeito visual do Flash
    if (dispararFlash) {
        const flash = document.createElement('div');
        flash.className = 'absolute inset-0 bg-white opacity-0 transition-opacity duration-75 z-50';
        document.body.appendChild(flash);

        setTimeout(() => flash.classList.remove('opacity-0'), 10);
        setTimeout(() => {
            flash.classList.add('opacity-0');
            setTimeout(() => flash.remove(), 100);
        }, 100);
    }

    // 2. Extrai a foto do vídeo para o canvas invisível
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 3. Converte a foto num link (Base64)
    const fotoDataUrl = canvas.toDataURL('image/jpeg');

    // 4. Atualiza a foto do cantinho (miniatura)
    thumbnailImg.src = fotoDataUrl;

    // 5. Injeta a foto recém-tirada como o 1º item da Galeria Inteligente
    const novaDiv = document.createElement('div');
    novaDiv.className = 'aspect-[4/3] relative rounded-md overflow-hidden bg-gray-800 cursor-pointer active:scale-95 transition-transform';
    
    novaDiv.innerHTML = `
        <img src="${fotoDataUrl}" class="w-full h-full object-cover" alt="Sua Foto">
        <div class="absolute top-1 left-1 border border-white/40 text-white text-[9px] font-bold px-1 rounded-sm bg-purple-600/80 backdrop-blur-md shadow-[0_0_8px_rgba(168,85,247,0.5)]">NOVA</div>
        <span class="absolute top-1 right-1 text-white shadow-black drop-shadow-md leading-none">⋮</span>
    `;
    
    // Deixa a foto recém-criada clicável
     novaDiv.addEventListener('click', () => abrirFotoEmTelaCheia(fotoDataUrl, novaDiv));
    
    // "prepend" joga ela para o topo do grid da galeria
    galleryGrid.prepend(novaDiv);
}

// Autotimer: Desligado -> 3s -> 10s -> Desligado...
const TEMPOS_TIMER = [0, 3, 10];
let indiceTimer = 0;
const btnTimer = document.getElementById('btn-timer');
const timerBadge = document.getElementById('timer-badge');
btnTimer.addEventListener('click', () => {
    indiceTimer = (indiceTimer + 1) % TEMPOS_TIMER.length;
    const segundos = TEMPOS_TIMER[indiceTimer];
    timerBadge.textContent = segundos || '';
    timerBadge.classList.toggle('hidden', !segundos);
    btnTimer.title = segundos ? `Timer: ${segundos}s` : 'Timer: Desligado';
});

// Clicou no botão de TIRAR FOTO (Obturador): respeita o autotimer, se estiver ligado
const timerContagem = document.getElementById('timer-contagem');
shutterBtn.addEventListener('click', () => {
    const segundos = TEMPOS_TIMER[indiceTimer];
    if (!segundos) return tirarFoto();

    let restante = segundos;
    timerContagem.textContent = restante;
    timerContagem.classList.remove('hidden');
    timerContagem.classList.add('flex');
    const intervalo = setInterval(() => {
        restante--;
        if (restante <= 0) {
            clearInterval(intervalo);
            timerContagem.classList.add('hidden');
            timerContagem.classList.remove('flex');
            tirarFoto();
        } else {
            timerContagem.textContent = restante;
        }
    }, 1000);
});

// Proporção da foto (4:5 / 1:1 / 16:9): ajusta o enquadramento do vídeo
const ASPECTOS = ['4:5', '1:1', '16:9'];
let indiceAspecto = 0;
const btnAspecto = document.getElementById('btn-aspecto');
btnAspecto.addEventListener('click', () => {
    indiceAspecto = (indiceAspecto + 1) % ASPECTOS.length;
    const proporcao = ASPECTOS[indiceAspecto];
    btnAspecto.textContent = proporcao;
    video.style.aspectRatio = proporcao.replace(':', ' / ');
    video.style.width = proporcao === '16:9' ? '100%' : 'auto';
    video.style.height = proporcao === '16:9' ? 'auto' : '100%';
});

// Configurações: abre/fecha o painel e liga/desliga a grade de enquadramento
const btnConfig = document.getElementById('btn-config');
const menuConfig = document.getElementById('menu-config');
btnConfig.addEventListener('click', () => menuConfig.classList.toggle('hidden'));

const btnGrade = document.getElementById('btn-grade');
const gradeOverlay = document.getElementById('grade-overlay');
btnGrade.addEventListener('click', () => {
    const ligada = btnGrade.querySelector('.check-indicator').classList.toggle('bg-yellow-400');
    gradeOverlay.classList.toggle('hidden', !ligada);
});

// Modos da câmera (Noite/Retrato/Foto/Video/Microfilme): só um fica ativo por vez
const CLASSES_MODO_ATIVO = ['bg-gray-800/80', 'text-pink-600', 'rounded-full', 'px-5', 'py-1.5', 'font-semibold'];
document.querySelectorAll('.modo-camera').forEach(modo => {
    modo.addEventListener('click', () => {
        document.querySelectorAll('.modo-camera').forEach(m => {
            m.classList.remove(...CLASSES_MODO_ATIVO);
            m.classList.add('text-gray-400');
        });
        modo.classList.remove('text-gray-400');
        modo.classList.add(...CLASSES_MODO_ATIVO);
    });
});

// ==========================================
// 5. MENU, ORGANIZAR IA, FILTROS E NAV. DA GALERIA
// ==========================================
const menuToggle = document.getElementById('menu-toggle');
const menuLateral = document.getElementById('menu-lateral');
const btnOrganizarIA = document.getElementById('btn-organizar-ia');
const inputBusca = document.getElementById('input-busca');
const bannerAltaQualidade = document.getElementById('banner-alta-qualidade');
const navBuscar = document.getElementById('nav-buscar');
const navSugestoes = document.getElementById('nav-sugestoes');
const navFavoritos = document.getElementById('nav-favoritos');
const navAlbuns = document.getElementById('nav-albuns');

// Menu (☰): abre/fecha a lista de para onde ir dentro da galeria
menuToggle.addEventListener('click', () => menuLateral.classList.toggle('hidden'));

// Cada item do menu fecha o menu e "clica" no botão real correspondente da barra inferior
document.querySelectorAll('#menu-lateral .menu-item').forEach(item => {
    item.addEventListener('click', () => {
        menuLateral.classList.add('hidden');
        document.getElementById(item.dataset.alvo)?.click();
    });
});

// Álbuns: volta a mostrar todas as fotos (remove qualquer filtro de qualidade ativo)
navAlbuns.addEventListener('click', () => filtrarPorQualidade(null));

// Ordena as fotos da melhor pra pior qualidade (usado pelo banner e pelo painel de IA)
const ORDEM_QUALIDADE = { '8K': 4, '4K': 3, '2K': 2, FHD: 1 };
function organizarPorQualidade() {
    [...galleryGrid.children]
        .sort((a, b) => (ORDEM_QUALIDADE[b.querySelector('div')?.textContent.trim()] || 0)
            - (ORDEM_QUALIDADE[a.querySelector('div')?.textContent.trim()] || 0))
        .forEach(el => galleryGrid.appendChild(el));
}

// Banner "IA organizou por qualidade"
const bannerOrganizarIA = document.getElementById('banner-organizar-ia');
bannerOrganizarIA.addEventListener('click', organizarPorQualidade);

// Painel de IA (CPU e Sugestões IA abrem o mesmo painel de ações)
const menuIaGaleria = document.getElementById('menu-ia-galeria');
function abrirFecharMenuIA() {
    menuIaGaleria.classList.toggle('hidden');
}
btnOrganizarIA.addEventListener('click', abrirFecharMenuIA);
navSugestoes.addEventListener('click', abrirFecharMenuIA);

// Ações reais de cada item do painel de IA
const ACOES_IA = {
    organizar: organizarPorQualidade,
    resolucao: () => document.querySelector('[data-filtro="4K"]')?.click(),
    realce: () => galleryGrid.querySelectorAll('img').forEach(img => img.classList.toggle('ia-realce')),
};
document.querySelectorAll('#menu-ia-galeria .ia-acao').forEach(item => {
    item.addEventListener('click', () => {
        ACOES_IA[item.dataset.acao]?.();
        menuIaGaleria.classList.add('hidden');
    });
});

// Filtros de qualidade e banner: mostra só as fotos com o(s) selo(s) informado(s)
function filtrarPorQualidade(qualidades) {
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        const selo = item.querySelector('div')?.textContent.trim();
        item.style.display = (!qualidades || qualidades.includes(selo)) ? '' : 'none';
    });
}
// Destaca em roxo só o card de qualidade clicado, e desmarca os outros
const CLASSES_FILTRO_ATIVO = ['bg-[#25103f]', 'border-purple-500/50'];
const CLASSES_FILTRO_INATIVO = ['bg-[#130722]', 'border-white/10'];
document.querySelectorAll('.filtro-qualidade').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.filtro-qualidade').forEach(p => {
            p.classList.remove(...CLASSES_FILTRO_ATIVO);
            p.classList.add(...CLASSES_FILTRO_INATIVO);
        });
        pill.classList.remove(...CLASSES_FILTRO_INATIVO);
        pill.classList.add(...CLASSES_FILTRO_ATIVO);
        filtrarPorQualidade(pill.dataset.filtro ? [pill.dataset.filtro] : null);
    });
});
bannerAltaQualidade.addEventListener('click', () => filtrarPorQualidade(['4K', '8K']));

// Buscar: leva o foco direto pro campo de busca
navBuscar.addEventListener('click', () => inputBusca.focus());

// Favoritos: mostra só as fotos favoritadas (coração no visualizador); clicar de novo mostra todas
let mostrandoFavoritos = false;
navFavoritos.addEventListener('click', () => {
    mostrandoFavoritos = !mostrandoFavoritos;
    navFavoritos.classList.toggle('text-pink-500', mostrandoFavoritos);
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        item.style.display = (!mostrandoFavoritos || item.classList.contains('favorito')) ? '' : 'none';
    });
});

