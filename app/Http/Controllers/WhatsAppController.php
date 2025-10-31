<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Chat;
use App\Models\Message;
use App\Events\NewMessage;
use App\Events\MessageStatusUpdated;
use Carbon\Carbon;

class WhatsAppController extends Controller
{
    private string $apiUrl;
    private string $sessionName;
    private string $secretKey;

    // Constantes para as chaves do cache
    private const STATUS_CACHE_KEY = 'whatsapp_session_status';
    private const TOKEN_CACHE_KEY = 'whatsapp_session_token';

    public function __construct()
    {
        $this->apiUrl = config('whatsapp.api_url') ?? 'http://wppconnect:21465';
        $this->sessionName = config('whatsapp.session_name') ?? 'sistema-laravel-1';
        $this->secretKey = config('whatsapp.secret_key') ?? 'SAMUCASISTEMALARAVELTESTE';
    }

    /**
     * Exibe a página de QR Code com o status atual da sessão.
     */
    public function showQrCode()
    {
        $status = Cache::get(self::STATUS_CACHE_KEY, 'disconnected');
        return view('whatsapp.qrcode', ['status' => $status]);
    }

    /**
     * Inicia uma nova sessão no WPPConnect e retorna o QR Code.
     * Chamado via AJAX.
     */
    public function getQrCode()
    {
        $webhookUrl = route('whatsapp.webhook');

        //Ajusta para funcionar no docker http://app:8000
        $webhookUrl = str_replace('http://localhost:8080', 'http://app:8000', $webhookUrl);
        
        try {
            $token = Cache::get(self::TOKEN_CACHE_KEY);
            if (!$token) {
                $tokenResponse = Http::post("{$this->apiUrl}/api/{$this->sessionName}/{$this->secretKey}/generate-token");
                if ($tokenResponse->failed() || !isset($tokenResponse->json()['token'])) {
                    Log::error('WPPConnect: Falha ao gerar token.', $tokenResponse->json() ?? ['body' => $tokenResponse->body()]);
                    return response()->json(['success' => false, 'message' => 'Falha ao gerar token de autenticação.'], 500);
                }
                $token = $tokenResponse->json('token');
                Cache::put(self::TOKEN_CACHE_KEY, $token, now()->addHours(24));
                Log::info('WPPConnect: Novo token gerado e armazenado.');
            } else {
                Log::info('WPPConnect: Token obtido do cache.');
            }

            $statusResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->get("{$this->apiUrl}/api/{$this->sessionName}/status-session");

            if ($statusResponse->successful()) {
                $currentWppStatus = $statusResponse->json('status');
                $currentQrCode = $statusResponse->json('qrcode');

                if ($currentWppStatus === 'CONNECTED') {
                    Cache::put(self::STATUS_CACHE_KEY, 'connected', now()->addHours(24));
                    return response()->json(['success' => true, 'status' => 'connected', 'message' => 'Sessão já está conectada.']);
                } elseif ($currentWppStatus === 'qrcode' && $currentQrCode) {
                    Cache::put(self::STATUS_CACHE_KEY, 'waiting_qr', now()->addMinutes(5));
                    return response()->json([
                        'success' => true,
                        'qrcode' => $currentQrCode,
                        'message' => 'Sessão existente, aguardando leitura do QR Code.'
                    ]);
                }
            } else {
                Log::warning('WPPConnect: Falha ao verificar status da sessão com token existente. Tentando iniciar/reiniciar.', $statusResponse->json() ?? ['body' => $statusResponse->body()]);
                Cache::forget(self::TOKEN_CACHE_KEY);
            }

            $token = Cache::get(self::TOKEN_CACHE_KEY);
            if (!$token) {
                $tokenResponse = Http::post("{$this->apiUrl}/api/{$this->sessionName}/{$this->secretKey}/generate-token");
                if ($tokenResponse->failed() || !isset($tokenResponse->json()['token'])) {
                    Log::error('WPPConnect: Falha ao re-gerar token para start-session.', $tokenResponse->json() ?? ['body' => $tokenResponse->body()]);
                    return response()->json(['success' => false, 'message' => 'Falha crítica ao obter token para iniciar sessão.'], 500);
                }
                $token = $tokenResponse->json('token');
                Cache::put(self::TOKEN_CACHE_KEY, $token, now()->addHours(24));
            }

            $startSessionResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$this->apiUrl}/api/{$this->sessionName}/start-session", [
                        'webhook' => $webhookUrl,
                        'waitQrCode' => true
                    ]);

            Log::info('WPPConnect start-session final response:', $startSessionResponse->json() ?? ['body' => $startSessionResponse->body()]);

            if ($startSessionResponse->successful()) {
                $responseBody = $startSessionResponse->json();
                $statusFromStart = $responseBody['status'] ?? null;
                $qrcode = $responseBody['qrcode'] ?? null;

                if ($qrcode) {
                    Cache::put(self::STATUS_CACHE_KEY, 'waiting_qr', now()->addMinutes(5));
                    return response()->json([
                        'success' => true,
                        'qrcode' => $qrcode,
                        'message' => 'QR Code gerado com sucesso. Escaneie para conectar.'
                    ]);
                } elseif ($statusFromStart === 'CONNECTED') {
                    Cache::put(self::STATUS_CACHE_KEY, 'connected', now()->addHours(24));
                    return response()->json([
                        'success' => true,
                        'status' => 'connected',
                        'message' => 'Sessão conectada com sucesso.'
                    ]);
                } else {
                    Log::error('WPPConnect: Resposta inesperada ou sessão fechada imediatamente após start-session.', [
                        'response_status' => $startSessionResponse->status(),
                        'response_body' => $responseBody
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Falha ao iniciar sessão ou status final inesperado do WPPConnect.'
                    ], 500);
                }
            } else {
                Log::error('WPPConnect: Requisição HTTP falhou ao iniciar sessão.', [
                    'http_status' => $startSessionResponse->status(),
                    'response_body' => $startSessionResponse->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Erro de comunicação ou resposta de erro do WPPConnect-Server ao iniciar sessão.'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('WPPConnect: Exceção geral ao gerar QR Code.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Erro interno do servidor ao tentar iniciar a sessão WhatsApp.'], 500);
        }
    }

    /**
     * Faz logout da sessão atual do WhatsApp.
     * Chamado via AJAX.
     */
    public function logoutSession()
    {
        try {
            $token = Cache::get(self::TOKEN_CACHE_KEY);

            if (!$token) {
                Cache::forget(self::STATUS_CACHE_KEY);
                return response()->json(['success' => true, 'message' => 'Nenhuma sessão ativa para deslogar (localmente).']);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$this->apiUrl}/api/{$this->sessionName}/logout-session");

            if ($response->successful()) {
                Cache::forget(self::STATUS_CACHE_KEY);
                Cache::forget(self::TOKEN_CACHE_KEY);
                return response()->json(['success' => true, 'message' => 'Sessão deslogada com sucesso.']);
            }

            Log::warning('WPPConnect: Falha ao deslogar sessão no servidor WPPConnect, mas limpando localmente.', $response->json() ?? ['body' => $response->body()]);
            Cache::forget(self::STATUS_CACHE_KEY);
            Cache::forget(self::TOKEN_CACHE_KEY);
            return response()->json(['success' => true, 'message' => 'Falha ao deslogar no WPPConnect, mas sessão limpa localmente.']);

        } catch (\Exception $e) {
            Log::error('WPPConnect: Exceção ao deslogar.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Erro de comunicação com o servidor WhatsApp ao deslogar.'], 500);
        }
    }

    /**
     * Envia uma mensagem de texto via WhatsApp.
     */
    public function sendMessage(string $phoneNumber, string $message, bool $isGroup = false): array
    {
        $token = Cache::get(self::TOKEN_CACHE_KEY);
        $status = Cache::get(self::STATUS_CACHE_KEY);

        if (!$token || $status !== 'connected') {
            Log::warning("WhatsApp: Tentativa de enviar mensagem sem token ou sessão desconectada. Status atual: {$status}");
            return [
                'success' => false,
                'message' => 'Sessão do WhatsApp não está ativa ou conectada para enviar mensagens.'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$this->apiUrl}/api/{$this->sessionName}/send-message", [
                        'phone' => $phoneNumber,
                        'isGroup' => $isGroup,
                        'message' => $message,
                    ]);

            Log::info('WPPConnect: Resposta do envio de mensagem:', $response->json() ?? ['body' => $response->body()]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Mensagem enviada com sucesso!',
                    'data' => $response->json()
                ];
            } else {
                Log::error('WPPConnect: Falha ao enviar mensagem.', [
                    'status' => $response->status(),
                    'response' => $response->json() ?? $response->body()
                ]);
                return [
                    'success' => false,
                    'message' => 'Falha ao enviar mensagem via WPPConnect.',
                    'errors' => $response->json()
                ];
            }
        } catch (\Exception $e) {
            Log::error('WPPConnect: Exceção ao enviar mensagem.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Erro de comunicação ao enviar mensagem: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Manipula os webhooks recebidos do WPPConnect-Server.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        $session = $payload['session'] ?? null;
        $eventType = $payload['event'] ?? null;

        Log::info("Webhook recebido para a sessão '{$session}'. Evento: '{$eventType}'.", $payload);

        if ($session !== $this->sessionName) {
            Log::warning("Webhook recebido para sessão inválida: '{$session}'");
            return response()->json(['status' => 'ignored', 'message' => 'Sessão inválida.'], 200);
        }

        switch ($eventType) {
            case 'onmessage':
                $this->handleOnMessage($payload);
                break;

            case 'onack':
                $this->handleOnAck($payload);
                break;

            case 'onStateChange':
                $this->handleStateChange($payload);
                break;

            // Outros eventos podem ser tratados aqui
            default:
                Log::info("WPPConnect: Webhook com evento '{$eventType}' não tratado.");
                break;
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Trata o evento 'onmessage'.
     */
    private function handleOnMessage(array $data)
    {
        $chatId = $data['chatId'] ?? null;
        if (!$chatId) return;

        $isGroup = $data['isGroupMsg'] ?? false;
        $senderName = $data['sender']['name'] ?? $data['sender']['pushname'] ?? $data['from'];

        // 1. Encontrar ou criar o chat
        $chat = Chat::firstOrCreate(
            ['whatsapp_id' => $chatId],
            [
                'name' => $senderName,
                'type' => $isGroup ? 'group' : 'individual',
            ]
        );

        // 2. Melhorar o nome do chat se necessário
        if ($isGroup && ($chat->name === null || str_contains($chat->name, '@g.us'))) {
            $groupInfo = $this->getGroupInfo($chatId);
            $chat->name = $groupInfo['name'] ?? $data['notifyName'] ?? $chat->name;
        } elseif (!$isGroup && ($chat->name === null || str_contains($chat->name, '@c.us'))) {
            $contactInfo = $this->getContactInfo($data['from']);
            $chat->name = $contactInfo['name'] ?? $senderName;
        }
        $chat->last_message_at = Carbon::createFromTimestamp($data['t']);
        $chat->save();

        // 3. Salvar a mensagem
        $message = Message::firstOrCreate(
            ['whatsapp_message_id' => $data['id']],
            [
                'chat_id' => $chat->id,
                'from_whatsapp_id' => $data['from'],
                'to_whatsapp_id' => $data['to'],
                'from_me' => $data['fromMe'],
                'body' => $data['body'] ?? $data['caption'] ?? null,
                'type' => $data['type'] ?? 'chat',
                'timestamp' => Carbon::createFromTimestamp($data['t']),
                'ack' => $data['ack'] ?? 0,
            ]
        );

        // 4. Disparar evento para notificar o frontend
        if ($message->wasRecentlyCreated) {
            broadcast(new NewMessage($message)); // Removido toOthers() para que o próprio remetente também receba
            Log::info("Mensagem salva e evento NewMessage disparado.", ['message_id' => $message->id]);
        }
    }

    /**
     * Trata o evento 'onack'.
     */
    private function handleOnAck(array $data)
    {
        $messageId = $data['id']['_serialized'] ?? null;
        $ack = $data['ack'] ?? null;

        if ($messageId && $ack !== null) {
            $message = Message::where('whatsapp_message_id', $messageId)->first();
            if ($message) {
                $message->update(['ack' => $ack]);
                broadcast(new MessageStatusUpdated($message))->toOthers();
                Log::info("Status da mensagem atualizado e evento MessageStatusUpdated disparado.", ['message_id' => $messageId, 'ack' => $ack]);
            }
        }
    }

    /**
     * Trata o evento 'onStateChange'.
     */
    private function handleStateChange(array $payload)
    {
        $state = $payload['state'] ?? null;
        $newStatus = null;

        switch ($state) {
            case 'CONNECTED':
            case 'qrReadSuccess':
            case 'isLogged':
                $newStatus = 'connected';
                break;
            case 'qrReadFail':
            case 'notLogged':
            case 'CLOSED':
            case 'DISCONNECTED':
                $newStatus = 'disconnected';
                Cache::forget(self::TOKEN_CACHE_KEY);
                break;
            case 'qrcode':
                $newStatus = 'waiting_qr';
                break;
            default:
                Log::warning("WPPConnect: onStateChange com status desconhecido: '{$state}'");
                break;
        }

        if ($newStatus) {
            Cache::put(self::STATUS_CACHE_KEY, $newStatus, now()->addHours(24));
            Log::info("Cache de status atualizado via webhook para '{$newStatus}'.");
        }
    }

    /**
     * Obtém informações de um contato via API do WPPConnect.
     */
    private function getContactInfo(string $contactId): array
    {
        $token = Cache::get(self::TOKEN_CACHE_KEY);
        if (!$token) return [];

        try {
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $token])
                ->get("{$this->apiUrl}/api/{$this->sessionName}/contact/{$contactId}");

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::error("Falha ao buscar informações do contato {$contactId}", ['error' => $e->getMessage()]);
        }
        return [];
    }

    /**
     * Obtém informações de um grupo via API do WPPConnect.
     */
    private function getGroupInfo(string $groupId): array
    {
        $token = Cache::get(self::TOKEN_CACHE_KEY);
        if (!$token) return [];

        try {
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $token])
                ->get("{$this->apiUrl}/api/{$this->sessionName}/list-chats");

            if ($response->successful()) {
                $chats = $response->json();
                foreach ($chats as $chat) {
                    if (($chat['id']['_serialized'] ?? null) === $groupId) {
                        return [
                            'name' => $chat['name'] ?? $chat['contact']['name'] ?? null,
                            'participants' => $chat['groupMetadata']['participants'] ?? []
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Falha ao buscar informações do grupo {$groupId}", ['error' => $e->getMessage()]);
        }
        return [];
    }
}
