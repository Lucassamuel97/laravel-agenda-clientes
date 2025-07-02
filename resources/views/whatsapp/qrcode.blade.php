@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Conexão WhatsApp</div>

                <div class="card-body text-center">
                    {{-- Container para mensagens de status --}}
                    <div id="status-message" class="alert {{
                        $status === 'connected' ? 'alert-success' :
                        ($status === 'waiting_qr' ? 'alert-info' : 'alert-warning')
                    }}">
                        @if($status === 'connected')
                            <h4 class="alert-heading">Conectado!</h4>
                            <p>A sessão do WhatsApp já está ativa e pronta para ser usada por todos os usuários do sistema.</p>
                        @elseif($status === 'waiting_qr')
                            Aguardando leitura do QR Code. Mantenha esta página aberta.
                        @else
                            Nenhuma sessão do WhatsApp conectada. Clique no botão para gerar um QR Code e iniciar a conexão.
                        @endif
                    </div>

                    {{-- Área para exibir o QR Code ou spinner --}}
                    <div id="qr-code-display" class="my-3" style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        {{-- Inicialmente oculto, será exibido e preenchido via JS --}}
                        <img id="qr-code-image" src="" alt="QR Code do WhatsApp" style="display: none; max-width: 300px;">

                        {{-- Spinner e placeholder, visíveis apenas se não houver QR code na carga inicial --}}
                        @if($status === 'waiting_qr')
                            {{-- Se o status é waiting_qr na carga, o QR Code será buscado pelo JS --}}
                            <div class="spinner-border text-primary" role="status" id="initial-spinner">
                                <span class="sr-only">Carregando QR Code...</span>
                            </div>
                            <p id="initial-placeholder" class="ml-2">Carregando QR Code...</p>
                        @elseif($status === 'connected')
                            {{-- Se conectado, não mostra nada aqui, a mensagem já está no status-message --}}
                            <p id="qrcode-placeholder" style="display: none;">O QR Code aparecerá aqui.</p>
                        @else
                            {{-- Se desconectado, mostra placeholder --}}
                            <p id="qrcode-placeholder">O QR Code aparecerá aqui.</p>
                        @endif
                    </div>

                    {{-- Botões de Ação --}}
                    <div id="actions-container">
                        {{-- O botão de gerar só aparece se não estiver conectado --}}
                        <button id="btn-generate-qr" class="btn btn-primary {{ $status === 'connected' ? 'd-none' : '' }}">Gerar QR Code</button>

                        {{-- O botão de deslogar só aparece se houver uma sessão (conectada ou aguardando) --}}
                        <button id="btn-logout" class="btn btn-danger {{ $status === 'disconnected' ? 'd-none' : '' }}">Deslogar Sessão</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('js')
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    // Referências aos elementos DOM
    const btnGenerate = document.getElementById('btn-generate-qr');
    const btnLogout = document.getElementById('btn-logout');
    const qrCodeDisplay = document.getElementById('qr-code-display');
    const qrCodeImage = document.getElementById('qr-code-image');
    const qrcodePlaceholder = document.getElementById('qrcode-placeholder'); // Placeholder de texto
    const statusMessageDiv = document.getElementById('status-message'); // Antigo status-container
    const initialSpinner = document.getElementById('initial-spinner');
    const initialPlaceholder = document.getElementById('initial-placeholder');

    // Funções auxiliares para manipular a UI
    function showSpinner() {
        qrCodeImage.style.display = 'none';
        if (qrcodePlaceholder) qrcodePlaceholder.style.display = 'none';
        qrCodeDisplay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Carregando...</span></div>';
    }

    function showQrCode(dataUri) {
        qrCodeDisplay.innerHTML = ''; // Limpa o spinner/placeholder
        qrCodeImage.src = dataUri;
        qrCodeImage.style.display = 'block';
        qrCodeDisplay.appendChild(qrCodeImage); // Re-adiciona a imagem se ela foi removida
    }

    function hideQrCodeAndShowPlaceholder() {
        qrCodeImage.style.display = 'none';
        qrCodeImage.src = '';
        qrCodeDisplay.innerHTML = ''; // Limpa qualquer QR code ou spinner
        if (qrcodePlaceholder) {
            qrcodePlaceholder.style.display = 'block';
            qrCodeDisplay.appendChild(qrcodePlaceholder); // Re-adiciona o placeholder de texto
        }
    }

    function updateStatusDisplay(message, type = 'warning', heading = null) {
        statusMessageDiv.className = `alert alert-${type}`;
        if (heading) {
            statusMessageDiv.innerHTML = `<h4 class="alert-heading">${heading}</h4><p>${message}</p>`;
        } else {
            statusMessageDiv.innerHTML = message;
        }
    }

    // Função principal para atualizar a interface do usuário com base no status
    function updateUI(status, qrcodeData = null) {
        if (initialSpinner) initialSpinner.style.display = 'none';
        if (initialPlaceholder) initialPlaceholder.style.display = 'none';

        if (status === 'connected') {
            btnGenerate.classList.add('d-none');
            btnLogout.classList.remove('d-none');
            hideQrCodeAndShowPlaceholder(); // Esconde o QR code se conectado
            updateStatusDisplay('A sessão do WhatsApp já está ativa e pronta para ser usada por todos os usuários do sistema.', 'success', 'Conectado!');
        } else if (status === 'waiting_qr') {
            btnGenerate.classList.add('d-none');
            btnLogout.classList.remove('d-none');
            if (qrcodeData) {
                showQrCode(qrcodeData);
                updateStatusDisplay('QR Code gerado. Por favor, escaneie com seu celular.', 'info');
            } else {
                showSpinner(); // Mostrar spinner enquanto aguarda o QR code via AJAX
                updateStatusDisplay('Aguardando QR Code...', 'info');
            }
        } else { // disconnected ou outro status
            btnGenerate.classList.remove('d-none');
            btnLogout.classList.add('d-none');
            hideQrCodeAndShowPlaceholder(); // Esconde QR code e mostra placeholder
            updateStatusDisplay('Nenhuma sessão do WhatsApp conectada. Clique no botão para gerar um QR Code.', 'warning');
        }
        btnGenerate.disabled = false; // Garante que os botões não fiquem desabilitados se o estado final é desconectado
        btnLogout.disabled = false;
    }

    // --- Event Listeners ---

    // Gerar QR Code
    if (btnGenerate) {
        btnGenerate.addEventListener('click', async function () {
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gerando...';
            
            showSpinner(); // Mostrar spinner imediatamente
            updateStatusDisplay('Gerando QR Code, por favor aguarde...', 'info');

            try {
                const response = await axios.post("{{ route('whatsapp.qrcode.get') }}"); // Use axios.post para o getQrCode

                if (response.data.success) {
                    if (response.data.status === 'connected') {
                        updateUI('connected');
                    } else if (response.data.qrcode) {
                        updateUI('waiting_qr', response.data.qrcode);
                    } else {
                        // Caso de sucesso sem QR code ou conectado, mas resposta inesperada
                        updateStatusDisplay(response.data.message || 'Resposta inesperada do servidor.', 'warning');
                        updateUI('disconnected'); // Reverte para desconectado
                    }
                } else {
                    updateStatusDisplay(response.data.message || 'Falha ao gerar QR Code. Tente novamente.', 'danger');
                    updateUI('disconnected');
                }
            } catch (error) {
                console.error('Erro ao gerar QR Code:', error);
                updateStatusDisplay('Erro de comunicação: ' + (error.response?.data?.message || error.message), 'danger');
                updateUI('disconnected');
            } finally {
                this.innerHTML = 'Gerar QR Code'; // Restaura o texto do botão
            }
        });
    }

    // Deslogar Sessão
    const handleLogout = async function() {
        if (!confirm('Tem certeza que deseja deslogar a sessão atual? Isso exigirá uma nova leitura de QR Code.')) {
            return;
        }

        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deslogando...';
        updateStatusDisplay('Deslogando sessão...', 'info');
        showSpinner(); // Mostra spinner enquanto desloga

        try {
            const response = await axios.post("{{ route('whatsapp.session.logout') }}", {}, { // Use axios.post
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.data.success) {
                updateStatusDisplay(response.data.message || 'Sessão desconectada com sucesso.', 'success');
                updateUI('disconnected'); // Força o estado para desconectado
            } else {
                updateStatusDisplay(response.data.message || 'Ocorreu um erro ao deslogar.', 'danger');
                // Mesmo em erro, se o back-end limpou localmente, forçamos o estado
                updateUI('disconnected');
            }
        } catch (error) {
            console.error('Erro ao deslogar sessão:', error);
            updateStatusDisplay('Falha na comunicação com o servidor ao deslogar: ' + (error.response?.data?.message || error.message), 'danger');
            updateUI('disconnected');
        } finally {
            this.innerHTML = 'Deslogar Sessão'; // Restaura o texto do botão
        }
    };

    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // --- Lógica de inicialização da UI ---
    // Chama updateUI com o status inicial do Blade
    updateUI("{{ $status }}");

    // Se o status inicial é 'waiting_qr' (e não há QR Code na carga da página, pois ele só vem via AJAX),
    // simula um clique no botão para buscar o QR Code.
    @if($status === 'waiting_qr')
        // Dispara a busca pelo QR Code para preencher a imagem
        // Isso é para o caso de o usuário recarregar a página enquanto o QR Code já estava sendo esperado.
        btnGenerate?.dispatchEvent(new Event('click'));
    @endif
});
</script>
@endpush