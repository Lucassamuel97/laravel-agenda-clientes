<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use Cache;
use Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected WhatsAppController $whatsAppController;

    public function __construct(WhatsAppController $whatsAppController)
    {
        $this->whatsAppController = $whatsAppController;
    }

    /**
     * Lista todas as conversas (Chats).
     */
    public function index()
    {
        // Ordena os chats pela data da última mensagem para mostrar os mais recentes primeiro
        $chats = Chat::orderBy('last_message_at', 'desc')->paginate(15);
        return view('chat.index', compact('chats'));
    }

    /**
     * Exibe as mensagens de um chat específico e permite enviar respostas.
     */
    public function show(Chat $chat)
    {
        // Carrega as mensagens do chat, ordenadas por timestamp
        $messages = $chat->messages()->orderBy('timestamp', 'asc')->paginate(30);
        return view('chat.show', compact('chat', 'messages'));
    }

    /**
     * Envia uma mensagem para um chat específico.
     */
    public function sendMessage(Request $request, Chat $chat)
    {
        $request->validate([
            'message_body' => 'required|string|max:1000',
        ]);

        $messageBody = $request->input('message_body');
        $phoneNumber = $chat->whatsapp_id;

        $result = $this->whatsAppController->sendMessage($phoneNumber, $messageBody, $chat->type === 'group');

        if ($result['success']) {
            Log::info("Mensagem enviada com sucesso para chat {$chat->name}: {$messageBody}");

            $message = Message::create([
                'chat_id' => $chat->id,
                'from_whatsapp_id' => config('whatsapp.session_name') . '@c.us',
                'to_whatsapp_id' => $phoneNumber,
                'from_me' => true,
                'body' => $messageBody,
                'type' => 'chat',
                'timestamp' => now(),
                'ack' => 0,
            ]);
            $chat->update(['last_message_at' => now()]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mensagem enviada!',
                    'data' => $message
                ]);
            }

            return back()->with('success', 'Mensagem enviada!');
        } else {
            Log::error("Falha ao enviar mensagem para chat {$chat->name}: " . $result['message']);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Falha ao enviar mensagem: ' . $result['message']
                ], 500);
            }

            return back()->with('error', 'Falha ao enviar mensagem: ' . $result['message']);
        }
    }

    public function downloadMedia(string $messageId)
{
    $token = Cache::get('whatsapp_session_token'); // Usar a mesma chave de token
    $sessionName = config('whatsapp.session_name');
    $apiUrl = config('whatsapp.api_url');

    if (!$token) {
        return response()->json(['error' => 'Sessão do WhatsApp não ativa para baixar mídia.'], 401);
    }

    try {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get("{$apiUrl}/api/{$sessionName}/get-media-by-message/{$messageId}");

        if ($response->successful()) {
            // A API do WPPConnect retorna a mídia como um arquivo binário.
            // Precisamos passar os cabeçalhos corretos para o navegador.
            $contentType = $response->header('Content-Type');
            $contentDisposition = $response->header('Content-Disposition');

            return response($response->body())
                    ->header('Content-Type', $contentType)
                    ->header('Content-Disposition', $contentDisposition);
        } else {
            Log::error('WPPConnect: Falha ao baixar mídia.', [
                'message_id' => $messageId,
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);
            return response()->json(['error' => 'Falha ao baixar mídia do WPPConnect.'], $response->status());
        }
    } catch (\Exception $e) {
        Log::error('WPPConnect: Exceção ao baixar mídia.', [
            'message_id' => $messageId,
            'error' => $e->getMessage()
        ]);
        return response()->json(['error' => 'Erro interno ao baixar mídia.'], 500);
    }
}
}