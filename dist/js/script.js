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

shutterBtn.addEventListener('click', () => {
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-0 transition-opacity duration-75 z-50';
    document.body.appendChild(flash);
    
    setTimeout(() => flash.classList.remove('opacity-0'), 10);
    setTimeout(() => {
        flash.classList.add('opacity-0');
        setTimeout(() => flash.remove(), 100);
    }, 100);
});

startCamera();

     // ====== LÓGICA DO MENU DE IA ======
const btnAi = document.getElementById('btn-ai');
const aiMenu = document.getElementById('ai-menu');

// Abrir e fechar o menu ao clicar no botão de IA superior
btnAi.addEventListener('click', () => {
    aiMenu.classList.toggle('hidden');
});

// Fazer os itens do menu funcionarem (Ativar/Desativar as bolinhas amarelas)
const aiItems = document.querySelectorAll('.ai-menu-item');

aiItems.forEach(item => {
    item.addEventListener('click', () => {
        const indicador = item.querySelector('.check-indicator');
        
        // Verifica se a opção já está ativada (se tem o fundo amarelo)
        if (indicador.classList.contains('bg-yellow-400')) {
            // Se estiver ativada, nós desativamos
            indicador.classList.remove('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white');
            indicador.classList.add('border-[1.5px]', 'border-yellow-400');
            indicador.innerHTML = ''; // Remove o ícone de 'check'
        } else {
            // Se estiver desativada, nós ativamos
            indicador.classList.remove('border-[1.5px]', 'border-yellow-400');
            indicador.classList.add('bg-yellow-400', 'flex', 'items-center', 'justify-center', 'text-white');
            indicador.innerHTML = '<i class="ph-bold ph-check text-[10px]"></i>'; // Adiciona o 'check'
        }
    });
});
