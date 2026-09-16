// ==========================================
// 1. CÂMERA E CONTROLES BÁSICOS
// ==========================================
const video = document.getElementById('camera-feed');
let stream = null;
let currentFacingMode = 'environment';

async function startCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
        video.srcObject = stream;
    } catch (err) {
        console.error("Erro da câmera:", err);
        video.parentElement.insertAdjacentHTML('beforeend', `
            <div class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50 text-gray-400 text-center px-4">
                <div><i class="ph ph-camera-slash text-4xl mb-2 text-center block"></i>Permita o acesso à câmera.</div>
            </div>`);
    }
}

document.getElementById('switch-camera').addEventListener('click', () => {
    if (currentFacingMode === 'environment') {
        currentFacingMode = 'user';
    } else {
        currentFacingMode = 'environment';
    }
    startCamera();
});
startCamera();

// ==========================================
// 1.1 CONTROLE DE FLASH
// ==========================================
const btnFlash = document.getElementById('btn-flash');
const flashIcon = document.getElementById('flash-icon');
const flashAutoBadge = document.getElementById('flash-auto-badge');
const MODOS_FLASH = ['auto', 'on', 'off'];
let modoFlash = 'auto';

btnFlash.addEventListener('click', () => {
    modoFlash = MODOS_FLASH[(MODOS_FLASH.indexOf(modoFlash) + 1) % 3];
    
    flashIcon.className = 'ph-fill text-[22px] transition-colors';
    
    if (modoFlash === 'off') {
        flashIcon.classList.add('ph-lightning-slash', 'text-white/60');
        btnFlash.title = 'Flash: Desligado';
    } else if (modoFlash === 'on') {
        flashIcon.classList.add('ph-lightning', 'text-yellow-400');
        btnFlash.title = 'Flash: Ligado';
    } else {
        flashIcon.classList.add('ph-lightning', 'text-white');
        btnFlash.title = 'Flash: Automático';
    }
    
    if (modoFlash !== 'auto') {
        flashAutoBadge.classList.add('hidden');
    } else {
        flashAutoBadge.classList.remove('hidden');
    }
});

// ==========================================
// 2. MENU DE INTELIGÊNCIA ARTIFICIAL
// ==========================================
const aiMenu = document.getElementById('ai-menu');
document.getElementById('btn-ai').addEventListener('click', () => {
    aiMenu.classList.toggle('hidden');
});

const AJUSTES_FILTRO = {
    auto: 'brightness(1.05) contrast(1.05) saturate(1.05)',
    noturna: 'brightness(1.35) contrast(1.15)',
    resolucao: 'contrast(1.08)',
    nitidez: 'contrast(1.15) saturate(1.1)',
    desfoque: 'blur(1.5px)',
    filtro: 'sepia(0.25) saturate(1.3) contrast(1.05)',
};

function atualizarFiltroCamera() {
    const filtros = [...document.querySelectorAll('.ai-menu-item')]
        .filter(item => item.querySelector('.check-indicator').classList.contains('bg-yellow-400'))
        .map(item => AJUSTES_FILTRO[item.dataset.ajuste])
        .filter(Boolean);
        
    if (filtros.length > 0) {
        video.style.filter = filtros.join(' ');
    } else {
        video.style.filter = 'none';
    }
}

document.querySelectorAll('.ai-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const ind = item.querySelector('.check-indicator');
        const ligado = ind.classList.toggle('bg-yellow-400');
        
        if (ligado) {
            ind.className = 'check-indicator w-[18px] h-[18px] rounded-full bg-yellow-400 flex items-center justify-center text-white';
            ind.innerHTML = '<i class="ph-bold ph-check text-[10px]"></i>';
        } else {
            ind.className = 'check-indicator w-[18px] h-[18px] rounded-full border-[1.5px] border-yellow-400';
            ind.innerHTML = '';
        }
        
        atualizarFiltroCamera();
    });
});

// ==========================================
// 3. GALERIA INTELIGENTE & VISUALIZADOR
// ==========================================
const galleryView = document.getElementById('gallery-view');
document.getElementById('btn-open-gallery').addEventListener('click', () => { 
    galleryView.classList.remove('hidden'); 
    galleryView.classList.add('flex'); 
});
document.getElementById('btn-close-gallery').addEventListener('click', () => { 
    galleryView.classList.add('hidden'); 
    galleryView.classList.remove('flex'); 
});

const canvas = document.getElementById('photo-canvas');
const thumbnailImg = document.getElementById('thumbnail-img');
const galleryGrid = document.getElementById('gallery-grid');
const photoModal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const btnFavoritarFoto = document.getElementById('btn-favoritar-foto');

let fotoAtualElemento = null;

function abrirFotoEmTelaCheia(src, elemento) {
    modalImage.src = src;
    
    if (elemento) {
        fotoAtualElemento = elemento;
    } else {
        fotoAtualElemento = null;
    }
    
    let favoritada = false;
    if (fotoAtualElemento && fotoAtualElemento.classList.contains('favorito')) {
        favoritada = true;
    }
    
    if (favoritada) {
        btnFavoritarFoto.classList.add('ph-fill', 'text-pink-500');
        btnFavoritarFoto.classList.remove('ph');
    } else {
        btnFavoritarFoto.classList.remove('ph-fill', 'text-pink-500');
        btnFavoritarFoto.classList.add('ph');
    }
    
    photoModal.classList.replace('hidden', 'flex');
}

btnFavoritarFoto.addEventListener('click', () => {
    if (!fotoAtualElemento) return;
    
    const favoritada = fotoAtualElemento.classList.toggle('favorito');
    
    if (favoritada) {
        btnFavoritarFoto.classList.add('ph-fill', 'text-pink-500');
        btnFavoritarFoto.classList.remove('ph');
    } else {
        btnFavoritarFoto.classList.remove('ph-fill', 'text-pink-500');
        btnFavoritarFoto.classList.add('ph');
    }
});

document.getElementById('btn-excluir-foto').addEventListener('click', () => {
    if (fotoAtualElemento) {
        fotoAtualElemento.remove();
        fotoAtualElemento = null;
    }
    document.getElementById('btn-close-modal').click();
});

document.getElementById('btn-close-modal').addEventListener('click', () => {
    photoModal.classList.replace('flex', 'hidden');
    modalImage.classList.remove('ia-realce');
    
    const badgeReq = document.getElementById('badge-resolucao');
    if (badgeReq) {
        badgeReq.remove();
    }
});

// IA da Foto Aberta
const menuIaFoto = document.getElementById('menu-ia-foto');
document.getElementById('btn-ia-foto').addEventListener('click', () => {
    menuIaFoto.classList.toggle('hidden');
});

document.querySelectorAll('#menu-ia-foto .ia-acao-foto').forEach(item => {
    item.addEventListener('click', () => {
        if (item.dataset.acao === 'resolucao') {
            if (!document.getElementById('badge-resolucao')) {
                photoModal.insertAdjacentHTML('beforeend', `<div id="badge-resolucao" class="absolute top-24 left-1/2 -translate-x-1/2 bg-purple-600/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20 shadow-md">IA sugere: 4K Ultra HD</div>`);
            }
        } else if (item.dataset.acao === 'realce') {
            modalImage.classList.toggle('ia-realce');
        }
        menuIaFoto.classList.add('hidden');
    });
});

// Clique inicial nas 9 fotos chumbadas no HTML
document.querySelectorAll('#gallery-grid > div').forEach(item => {
    item.addEventListener('click', () => {
        abrirFotoEmTelaCheia(item.querySelector('img').src, item);
    });
});

// ==========================================
// 4. TIRAR FOTO E AUTOTIMER
// ==========================================
function tirarFoto() {
    if (modoFlash !== 'off') {
        const flash = document.createElement('div');
        flash.className = 'absolute inset-0 bg-white opacity-0 transition-opacity duration-75 z-50';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.classList.remove('opacity-0');
        }, 10);
        
        setTimeout(() => { 
            flash.classList.add('opacity-0'); 
            setTimeout(() => {
                flash.remove();
            }, 100); 
        }, 100);
    }

    if (video.videoWidth) {
        canvas.width = video.videoWidth;
    } else {
        canvas.width = 1080;
    }
    
    if (video.videoHeight) {
        canvas.height = video.videoHeight;
    } else {
        canvas.height = 1920;
    }
    
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const fotoDataUrl = canvas.toDataURL('image/jpeg');
    
    thumbnailImg.src = fotoDataUrl;
    
    const novaDiv = document.createElement('div');
    novaDiv.className = 'aspect-[4/3] relative rounded-md overflow-hidden bg-gray-800 cursor-pointer active:scale-95 transition-transform';
    novaDiv.innerHTML = `
        <img src="${fotoDataUrl}" class="w-full h-full object-cover" alt="Sua Foto">
        <div class="absolute top-1 left-1 border border-white/40 text-white text-[9px] font-bold px-1 rounded-sm bg-purple-600/80 backdrop-blur-md shadow-[0_0_8px_rgba(168,85,247,0.5)]">NOVA</div>
        <i class="ph-bold ph-dots-three-vertical absolute top-1 right-1 text-white shadow-black drop-shadow-md"></i>`;
    
    novaDiv.addEventListener('click', () => {
        abrirFotoEmTelaCheia(fotoDataUrl, novaDiv);
    });
    
    galleryGrid.prepend(novaDiv);
}

const TEMPOS_TIMER = [0, 3, 10];
const btnTimer = document.getElementById('btn-timer');
const timerBadge = document.getElementById('timer-badge');
const timerContagem = document.getElementById('timer-contagem');
let indiceTimer = 0;

btnTimer.addEventListener('click', () => {
    indiceTimer = (indiceTimer + 1) % TEMPOS_TIMER.length;
    const seg = TEMPOS_TIMER[indiceTimer];
    
    if (seg) {
        timerBadge.textContent = seg;
        timerBadge.classList.remove('hidden');
        btnTimer.title = `Timer: ${seg}s`;
    } else {
        timerBadge.textContent = '';
        timerBadge.classList.add('hidden');
        btnTimer.title = 'Timer: Desligado';
    }
});

document.getElementById('shutter').addEventListener('click', () => {
    let restante = TEMPOS_TIMER[indiceTimer];
    
    if (!restante) {
        tirarFoto();
        return;
    }

    timerContagem.textContent = restante;
    timerContagem.classList.replace('hidden', 'flex');
    
    const intervalo = setInterval(() => {
        restante--;
        if (restante <= 0) {
            clearInterval(intervalo);
            timerContagem.classList.replace('flex', 'hidden');
            tirarFoto();
        } else {
            timerContagem.textContent = restante;
        }
    }, 1000);
});

// ==========================================
// 5. PROPORÇÃO, MODOS E FILTROS DA GALERIA
// ==========================================
const ASPECTOS = ['4:5', '1:1', '16:9'];
const btnAspecto = document.getElementById('btn-aspecto');
let indiceAspecto = 0;

btnAspecto.addEventListener('click', () => {
    indiceAspecto = (indiceAspecto + 1) % ASPECTOS.length;
    const prop = ASPECTOS[indiceAspecto];
    
    btnAspecto.textContent = prop;
    video.style.aspectRatio = prop.replace(':', ' / ');
    
    if (prop === '16:9') {
        video.style.width = '100%';
        video.style.height = 'auto';
    } else {
        video.style.width = 'auto';
        video.style.height = '100%';
    }
});

const CLASSES_MODO = ['bg-gray-800/80', 'text-pink-600', 'rounded-full', 'px-5', 'py-1.5', 'font-semibold'];
document.querySelectorAll('.modo-camera').forEach(modo => {
    modo.addEventListener('click', () => {
        document.querySelectorAll('.modo-camera').forEach(m => { 
            m.classList.remove(...CLASSES_MODO); 
            m.classList.add('text-gray-400'); 
        });
        modo.classList.remove('text-gray-400');
        modo.classList.add(...CLASSES_MODO);
    });
});

// Navegação Galeria
const menuLateral = document.getElementById('menu-lateral');
document.getElementById('menu-toggle').addEventListener('click', () => {
    menuLateral.classList.toggle('hidden');
});

document.querySelectorAll('#menu-lateral .menu-item').forEach(item => {
    item.addEventListener('click', () => { 
        menuLateral.classList.add('hidden'); 
        const alvo = document.getElementById(item.dataset.alvo);
        if (alvo) {
            alvo.click();
        }
    });
});

// Ordenação IA
const ORDEM = { '8K': 4, '4K': 3, '2K': 2, 'FHD': 1 };

function organizarPorQualidade() {
    const fotos = Array.from(galleryGrid.children);
    fotos.sort((a, b) => {
        const divA = a.querySelector('div');
        const divB = b.querySelector('div');
        
        let valorA = 0;
        if (divA) {
            valorA = ORDEM[divA.textContent.trim()] || 0;
        }
        
        let valorB = 0;
        if (divB) {
            valorB = ORDEM[divB.textContent.trim()] || 0;
        }
        
        return valorB - valorA;
    });
    
    fotos.forEach(el => {
        galleryGrid.appendChild(el);
    });
}

document.getElementById('banner-organizar-ia').addEventListener('click', organizarPorQualidade);
document.getElementById('nav-sugestoes').addEventListener('click', organizarPorQualidade);

const menuIaGaleria = document.getElementById('menu-ia-galeria');
document.getElementById('btn-organizar-ia').addEventListener('click', () => {
    menuIaGaleria.classList.toggle('hidden');
});

document.querySelectorAll('#menu-ia-galeria .ia-acao').forEach(item => {
    item.addEventListener('click', () => {
        if (item.dataset.acao === 'organizar') {
            organizarPorQualidade();
        } else if (item.dataset.acao === 'resolucao') {
            const filtro4k = document.querySelector('[data-filtro="4K"]');
            if (filtro4k) {
                filtro4k.click();
            }
        } else if (item.dataset.acao === 'realce') {
            galleryGrid.querySelectorAll('img').forEach(img => {
                img.classList.toggle('ia-realce');
            });
        }
        menuIaGaleria.classList.add('hidden');
    });
});

// Filtros Qualidade
function filtrarPorQualidade(qualidades) {
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        const divSelo = item.querySelector('div');
        let selo = '';
        if (divSelo) {
            selo = divSelo.textContent.trim();
        }
        
        if (!qualidades || qualidades.includes(selo)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

document.querySelectorAll('.filtro-qualidade').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.filtro-qualidade').forEach(p => { 
            p.classList.remove('bg-[#25103f]', 'border-purple-500/50'); 
            p.classList.add('bg-[#130722]', 'border-white/10'); 
        });
        
        pill.classList.remove('bg-[#130722]', 'border-white/10');
        pill.classList.add('bg-[#25103f]', 'border-purple-500/50');
        
        if (pill.dataset.filtro) {
            filtrarPorQualidade([pill.dataset.filtro]);
        } else {
            filtrarPorQualidade(null);
        }
    });
});

document.getElementById('nav-albuns').addEventListener('click', () => {
    filtrarPorQualidade(null);
});

document.getElementById('banner-alta-qualidade').addEventListener('click', () => {
    filtrarPorQualidade(['4K', '8K']);
});

document.getElementById('nav-buscar').addEventListener('click', () => {
    document.getElementById('input-busca').focus();
});

// Favoritos
let favAtivo = false;
const navFav = document.getElementById('nav-favoritos');

navFav.addEventListener('click', () => {
    favAtivo = !favAtivo;
    
    if (favAtivo) {
        navFav.classList.add('text-pink-500');
    } else {
        navFav.classList.remove('text-pink-500');
    }
    
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        if (!favAtivo || item.classList.contains('favorito')) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});