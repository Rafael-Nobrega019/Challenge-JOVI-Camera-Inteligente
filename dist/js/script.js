// O script da câmera inicia aqui ó
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

//  O BOTÃO DE FLASH FUNCIONAL :D
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

// Menu de IA
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

// A Galeria inteligente
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
let lixeiraAtiva = false;

const modalVideo = document.getElementById('modal-video');

function abrirFotoEmTelaCheia(src, elemento, tipoArquivo = 'foto') {
    fotoAtualElemento = elemento || null;
    
    // Esconde a foto se for vídeo, esconde o vídeo se for foto
    if (tipoArquivo === 'video' || (elemento && elemento.innerHTML.includes('<video'))) {
        modalImage.classList.add('hidden');
        modalVideo.classList.remove('hidden');
        modalVideo.src = src;
        modalVideo.play();
    } else {
        modalVideo.classList.add('hidden');
        modalImage.classList.remove('hidden');
        modalImage.src = src;
        modalVideo.pause(); 
    }
    
    // Agora a lixeira funciona
    const naLixeira = fotoAtualElemento && fotoAtualElemento.dataset.status === 'lixeira';
    document.querySelectorAll('.acao-normal').forEach(el => el.classList.toggle('hidden', naLixeira));
    document.querySelectorAll('.acao-lixeira').forEach(el => el.classList.toggle('hidden', !naLixeira));
    
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

// Mandando pra lixeira (Botão de lixo normal)
document.getElementById('btn-excluir-foto').addEventListener('click', () => {
    if (fotoAtualElemento) {
        fotoAtualElemento.dataset.status = 'lixeira'; // Marca a foto como "na lixeira"
        fotoAtualElemento.style.display = 'none';      // Esconde da galeria atual
        fotoAtualElemento.classList.remove('favorito'); // Tira dos favoritos
    }
    document.getElementById('btn-close-modal').click();
});

// restaurando da lixeira agora (no caso o botão de restaurar)
document.getElementById('btn-restaurar-foto').addEventListener('click', () => {
    if (fotoAtualElemento) {
        delete fotoAtualElemento.dataset.status; // Tira a marcação de lixeira
        // Como estamos na visualização da lixeira, esconder ela da tela atual
        if (lixeiraAtiva) fotoAtualElemento.style.display = 'none'; 
    }
    document.getElementById('btn-close-modal').click();
});

// DELETAR PERMANENTEMENTE
document.getElementById('btn-excluir-permanente').addEventListener('click', () => {
    // Alerta nativo para confirmar exclusão
    const certeza = confirm("Tem certeza que deseja excluir esta foto permanentemente? Isso não pode ser desfeito.");
    if (certeza && fotoAtualElemento) {
        fotoAtualElemento.remove(); // Apaga do HTML de vez
        fotoAtualElemento = null;
        document.getElementById('btn-close-modal').click();
    }
});

document.getElementById('btn-close-modal').addEventListener('click', () => {
    photoModal.classList.replace('flex', 'hidden');
    modalImage.classList.remove('ia-realce');
    
    const badgeReq = document.getElementById('badge-resolucao');
    if (badgeReq) badgeReq.remove();
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

// Função de tirar foto e do timer junto
function tirarFoto() {
    // Efeito de Flash (piscar branco)
    if (modoFlash !== 'off') {
        const flash = document.createElement('div');
        flash.className = 'absolute inset-0 bg-white opacity-0 transition-opacity duration-75 z-50';
        document.body.appendChild(flash);
        setTimeout(() => flash.classList.remove('opacity-0'), 10);
        setTimeout(() => { 
            flash.classList.add('opacity-0'); 
            setTimeout(() => flash.remove(), 100); 
        }, 100);
    }

    // pegando a resolução real
    const natWidth = video.videoWidth || 1080;
    const natHeight = video.videoHeight || 1920;
    const nativeAspect = natWidth / natHeight;

    // Agora ajustando a proporção pela escolhida
    const [wRatio, hRatio] = ASPECTOS[indiceAspecto].split(':').map(Number);
    const targetAspect = wRatio / hRatio;

    let drawWidth = natWidth;
    let drawHeight = natHeight;
    let startX = 0;
    let startY = 0;

    // Fazendo o corte na foto
    if (nativeAspect > targetAspect) {
        drawWidth = natHeight * targetAspect;
        startX = (natWidth - drawWidth) / 2;
    } else if (nativeAspect < targetAspect) {
        drawHeight = natWidth / targetAspect;
        startY = (natHeight - drawHeight) / 2;
    }

    // Ajustar o canvas para o tamanho final cortado
    canvas.width = drawWidth;
    canvas.height = drawHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
    
    const fotoDataUrl = canvas.toDataURL('image/jpeg');
    thumbnailImg.src = fotoDataUrl;
    
    const novaDiv = document.createElement('div');
    novaDiv.className = 'aspect-[4/3] relative rounded-md overflow-hidden bg-gray-800 cursor-pointer active:scale-95 transition-transform';
    novaDiv.innerHTML = `
        <img src="${fotoDataUrl}" class="w-full h-full object-cover" alt="Sua Foto">
        <div class="absolute top-1 left-1 border border-white/40 text-white text-[9px] font-bold px-1 rounded-sm bg-purple-600/80 backdrop-blur-md shadow-[0_0_8px_rgba(168,85,247,0.5)]">NOVA</div>
    `;
    
    novaDiv.addEventListener('click', () => abrirFotoEmTelaCheia(fotoDataUrl, novaDiv, 'foto'));
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

let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

document.getElementById('shutter').addEventListener('click', () => {

    if (modoAtualCamera === 'Video') {
        const shutterBtn = document.getElementById('shutter');
        
        if (!isRecording) {
            recordedChunks = [];
            try { mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' }); } 
            catch(e) { mediaRecorder = new MediaRecorder(stream); }

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                
                const novaDiv = document.createElement('div');
                novaDiv.className = 'aspect-[4/3] relative rounded-md overflow-hidden bg-gray-800 cursor-pointer active:scale-95 transition-transform';
                novaDiv.innerHTML = `
                    <video src="${videoUrl}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30"><i class="ph-fill ph-play-circle text-3xl text-white drop-shadow-lg"></i></div>
                    <div class="absolute top-1 left-1 border border-white/40 text-white text-[9px] font-bold px-1 rounded-sm bg-red-600/80 backdrop-blur-md shadow-[0_0_8px_rgba(220,38,38,0.5)]">VÍDEO</div>
                `;
                novaDiv.addEventListener('click', () => abrirFotoEmTelaCheia(videoUrl, novaDiv, 'video'));
                galleryGrid.prepend(novaDiv);
            };

            mediaRecorder.start();
            isRecording = true;
            
            // botão de gravação ficando vermelho quando clica nele, invés de ficar padrão branco como o de tirar foto
            shutterBtn.classList.remove('bg-white');
            shutterBtn.classList.add('bg-red-600', 'animate-pulse');
        } else {

            mediaRecorder.stop();
            isRecording = false;
            
            // agora volta ao normal quando para de gravar
            shutterBtn.classList.remove('bg-red-600', 'animate-pulse');
            shutterBtn.classList.add('bg-white');
        }
        return; 
    }

    // SE ESTIVER NO MODO FOTO
    let restante = TEMPOS_TIMER[indiceTimer];
    if (!restante) { tirarFoto(); return; }

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

// Aspectos da câmera funcionando :) 
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

let modoAtualCamera = 'Foto';

const CLASSES_MODO = ['bg-gray-800/80', 'text-pink-600', 'rounded-full', 'px-5', 'py-1.5', 'font-semibold'];
document.querySelectorAll('.modo-camera').forEach(modo => {
    modo.addEventListener('click', () => {
        document.querySelectorAll('.modo-camera').forEach(m => { 
            m.classList.remove(...CLASSES_MODO); 
            m.classList.add('text-gray-400'); 
        });
        modo.classList.remove('text-gray-400');
        modo.classList.add(...CLASSES_MODO);
        
        modoAtualCamera = modo.textContent.trim();
    });
});

// Navegação na galeria
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

// Ordenação por IA
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

const menuIaGaleria = document.getElementById('menu-ia-galeria');

function toggleMenuIa() {
    menuIaGaleria.classList.toggle('hidden');
}

document.getElementById('btn-organizar-ia').addEventListener('click', toggleMenuIa);
document.getElementById('nav-sugestoes').addEventListener('click', toggleMenuIa);

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

// Filtrando por favoritos, qualidade e lixeira :D
function filtrarPorQualidade(qualidades) {
    lixeiraAtiva = false;
    document.getElementById('titulo-galeria').innerHTML = `Galeria <span class="text-purple-500">Inteligente</span>`;
    
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        if (item.dataset.status === 'lixeira') {
            item.style.display = 'none';
            return;
        }

        const divSelo = item.querySelector('div');
        let selo = divSelo ? divSelo.textContent.trim() : '';
        
        if (!qualidades || qualidades.includes(selo)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Botões redondinhos de Filtro lá no topo da galeria (Todos, FHD, 2k, 4k, 8k)
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

document.getElementById('menu-item-lixeira').addEventListener('click', () => {
    menuLateral.classList.add('hidden');
    lixeiraAtiva = true;
    favAtivo = false;
    document.getElementById('nav-favoritos').classList.remove('text-pink-500');
    
    // Muda o título para lixeira excluídos, quando acessa a lixeira C:
    document.getElementById('titulo-galeria').innerHTML = `Lixeira <span class="text-red-500">Excluídos</span>`;
    
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        if (item.dataset.status === 'lixeira') {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// Favoritos
let favAtivo = false;
const navFav = document.getElementById('nav-favoritos');

navFav.addEventListener('click', () => {
    lixeiraAtiva = false;
    document.getElementById('titulo-galeria').innerHTML = `Galeria <span class="text-purple-500">Inteligente</span>`;
    
    favAtivo = !favAtivo;
    
    if (favAtivo) {
        navFav.classList.add('text-pink-500');
    } else {
        navFav.classList.remove('text-pink-500');
    }
    
    document.querySelectorAll('#gallery-grid > div').forEach(item => {
        if (item.dataset.status === 'lixeira') {
            item.style.display = 'none';
            return;
        }
        
        if (!favAtivo || item.classList.contains('favorito')) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

const shareModal = document.getElementById('share-modal');
const btnCloseShare = document.getElementById('btn-close-share');

const btnShare = document.getElementById('btn-share'); 

if (btnShare) {
    btnShare.addEventListener('click', () => {
        shareModal.classList.replace('hidden', 'flex');
    });
}

btnCloseShare.addEventListener('click', () => {
    shareModal.classList.replace('flex', 'hidden');
});

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.classList.replace('flex', 'hidden');
    }
});

function compartilharRede(tipo) {
    const imagemAtualSrc = modalImage.src;

    if (tipo === 'copiar') {
        navigator.clipboard.writeText(imagemAtualSrc).then(() => {
            alert('Imagem copiada para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    } else if (tipo === 'whatsapp') {
        const urlWp = `https://api.whatsapp.com/send?text=Olha%20que%20foto%20incrível%20que%20eu%20tirei!%20${encodeURIComponent(imagemAtualSrc)}`;
        window.open(urlWp, '_blank');
    } else if (tipo === 'mais') {
        alert('Abrindo mais opções de compartilhamento!');
    } else {
        alert(`Compartilhando via ${tipo}`);
    }

    shareModal.classList.replace('flex', 'hidden');
}