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
                    <i class="ph ph-camera-slash text-4xl mb-2"></i><br>
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
// 2. MENU DE INTELIGÊNCIA ARTIFICIAL
// ==========================================
const btnAi = document.getElementById('btn-ai');
const aiMenu = document.getElementById('ai-menu');

// Abrir e fechar o menu ao clicar no botão de IA superior
btnAi.addEventListener('click', () => {
    aiMenu.classList.toggle('hidden');
});

// Lógica das bolinhas amarelas do Menu IA
const aiItems = document.querySelectorAll('.ai-menu-item');
aiItems.forEach(item => {
    item.addEventListener('click', () => {
        const indicador = item.querySelector('.check-indicator');
        if (indicador.classList.contains('bg-yellow-400')) {
            indicador.classList.remove('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white');
            indicador.classList.add('border-[1.5px]', 'border-yellow-400');
            indicador.innerHTML = ''; 
        } else {
            indicador.classList.remove('border-[1.5px]', 'border-yellow-400');
            indicador.classList.add('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white');
            indicador.innerHTML = '<i class="ph-bold ph-check text-[10px]"></i>'; 
        }
    });
});

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
function abrirFotoEmTelaCheia(src) {
    modalImage.src = src;
    photoModal.classList.remove('hidden');
    photoModal.classList.add('flex');
}

// Fechar tela cheia
btnCloseModal.addEventListener('click', () => {
    photoModal.classList.add('hidden');
    photoModal.classList.remove('flex');
});

// Fazer as 9 fotos HTML (hardcoded) iniciais ficarem clicáveis
document.querySelectorAll('#gallery-grid > div').forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        abrirFotoEmTelaCheia(imgSrc);
    });
});

// Clicou no botão de TIRAR FOTO (Obturador)
shutterBtn.addEventListener('click', () => {
    
    // 1. Efeito visual do Flash
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-0 transition-opacity duration-75 z-50';
    document.body.appendChild(flash);
    
    setTimeout(() => flash.classList.remove('opacity-0'), 10);
    setTimeout(() => {
        flash.classList.add('opacity-0');
        setTimeout(() => flash.remove(), 100);
    }, 100);

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
        <i class="ph-bold ph-dots-three-vertical absolute top-1 right-1 text-white shadow-black drop-shadow-md"></i>
    `;
    
    // Deixa a foto recém-criada clicável
    novaDiv.addEventListener('click', () => abrirFotoEmTelaCheia(fotoDataUrl));
    
    // "prepend" joga ela para o topo do grid da galeria
    galleryGrid.prepend(novaDiv);
});

