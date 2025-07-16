import Echo from 'laravel-echo';

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    console.log('messagesContainer:', messagesContainer);
    if (!messagesContainer) {
        return; // Sai se não estiver na página de chat
    }

    const chatId = messagesContainer.dataset.chatId;
    if (!chatId) {
        console.error('Chat ID não encontrado no data-attribute.');
        return;
    }

    if (typeof window.Echo === 'undefined') {
        console.error('Laravel Echo não está configurado. Verifique resources/js/bootstrap.js e npm run dev.');
        return;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    scrollToBottom();

    // Escutar por novas mensagens em um canal PRIVADO
    window.Echo.private(`chat.${chatId}`)
        .listen('NewMessage', (e) => {
            console.log('Nova mensagem recebida via WebSocket:', e);

            const newMessageDiv = document.createElement('div');
            newMessageDiv.classList.add('d-flex', 'mb-2');
            newMessageDiv.classList.add(e.message.from_me ? 'justify-content-end' : 'justify-content-start');

            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add('p-2', 'rounded');
            if (e.message.from_me) {
                messageContentDiv.classList.add('bg-primary', 'text-white');
            } else {
                messageContentDiv.classList.add('bg-light', 'text-dark', 'border');
            }
            messageContentDiv.style.maxWidth = '70%';

            const timeSmall = document.createElement('small');
            timeSmall.classList.add('text-muted', 'd-block', 'text-right');
            timeSmall.textContent = new Date(e.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const senderStrong = document.createElement('strong');
            if (!e.message.from_me) {
                senderStrong.textContent = (e.sender_name ? e.sender_name : e.message.from_whatsapp_id) + ':';
            } else {
                senderStrong.textContent = 'Você:';
            }

            const bodyP = document.createElement('p');
            bodyP.classList.add('mb-0');
            bodyP.textContent = e.message.body;

            messageContentDiv.appendChild(timeSmall);
            messageContentDiv.appendChild(senderStrong);
            messageContentDiv.appendChild(bodyP);

            if (e.message.from_me) {
                const ackSmall = document.createElement('small');
                ackSmall.classList.add('text-right', 'd-block');
                ackSmall.id = `ack-${e.message.whatsapp_message_id}`; // ID para atualização
                ackSmall.textContent = 'Enviada'; // Status inicial
                messageContentDiv.appendChild(ackSmall);
            }

            newMessageDiv.appendChild(messageContentDiv);
            messagesContainer.appendChild(newMessageDiv);

            scrollToBottom();
        });

    // Escutar por atualizações de status
    window.Echo.channel(`chat.${chatId}`)
        .listen('MessageStatusUpdated', (e) => {
            console.log('Status da mensagem atualizado:', e);
            const ackElement = document.getElementById(`ack-${e.message.whatsapp_message_id}`);
            if (ackElement) {
                let statusText = 'Enviada';
                if (e.message.ack === 2) statusText = 'Entregue';
                if (e.message.ack === 3) statusText = 'Lida';
                ackElement.textContent = statusText;
            }
        });


    // Lidar com o envio de formulário
    const sendMessageForm = document.getElementById('send-message-form');
    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const messageBodyField = this.querySelector('textarea[name="message_body"]');
            const messageBody = messageBodyField.value;
            const submitButton = this.querySelector('button[type="submit"]');

            if (!messageBody.trim()) return;

            // Adiciona mensagem no chat imediatamente (otimismo)
            const now = new Date();
            const tempId = 'temp-' + now.getTime();
            const newMessageDiv = document.createElement('div');
            newMessageDiv.classList.add('d-flex', 'mb-2', 'justify-content-end');
            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add('p-2', 'rounded', 'bg-primary', 'text-white');
            messageContentDiv.style.maxWidth = '70%';
            const timeSmall = document.createElement('small');
            timeSmall.classList.add('text-muted', 'd-block', 'text-right');
            timeSmall.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const senderStrong = document.createElement('strong');
            senderStrong.textContent = 'Você:';
            const bodyP = document.createElement('p');
            bodyP.classList.add('mb-0');
            bodyP.textContent = messageBody;
            const ackSmall = document.createElement('small');
            ackSmall.classList.add('text-right', 'd-block');
            ackSmall.id = `ack-${tempId}`;
            ackSmall.textContent = 'Pendente';
            messageContentDiv.appendChild(timeSmall);
            messageContentDiv.appendChild(senderStrong);
            messageContentDiv.appendChild(bodyP);
            messageContentDiv.appendChild(ackSmall);
            newMessageDiv.appendChild(messageContentDiv);
            messagesContainer.appendChild(newMessageDiv);
            scrollToBottom();

            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

            try {
                const response = await axios.post(this.action, {
                    message_body: messageBody,
                    _token: this.querySelector('input[name="_token"]').value
                });

                if (response.data.success) {
                    messageBodyField.value = '';
                } else {
                    alert('Falha ao enviar mensagem: ' + (response.data.message || 'Erro desconhecido.'));
                }
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                alert('Erro de comunicação: ' + (error.response?.data?.message || error.message));
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Enviar Mensagem';
            }
        });
    }

    // Lógica de download de mídia
    document.querySelectorAll('.download-media-btn').forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            const messageId = this.dataset.messageId;
            if (!messageId) return;

            this.disabled = true;
            this.textContent = 'Baixando...';

            try {
                const downloadResponse = await axios.get(`/chats/media/${messageId}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
                const link = document.createElement('a');
                link.href = url;
                const contentDisposition = downloadResponse.headers['content-disposition'];
                let fileName = 'download';
                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (fileNameMatch && fileNameMatch.length > 1) {
                        fileName = fileNameMatch[1];
                    }
                }
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Erro ao baixar mídia:', error);
                alert('Falha ao baixar mídia.');
            } finally {
                this.disabled = false;
                this.textContent = 'Baixar Mídia';
            }
        });
    });

    alert('chat.js executando!');
});
