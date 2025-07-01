<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventType;
use App\Models\Customer;
use Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class EventController extends Controller
{

    public function index()
    {
        return view('events.calendar');
    }

    public function getEvents(Request $request)
    {
        // filtrar por usuário logado
        $events = Auth::user()->events()->with(['eventType', 'customer'])->get();

        // todos os eventos (se o usuário tiver permissão para ver)
        // $events = Event::all();

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'event_type_id' => 'required|exists:event_types,id',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $eventType = EventType::find($request->event_type_id);
        $atendimentoTypeId = EventType::where('name', 'Atendimento')->first()->id;

        $event = Auth::user()->events()->create([
            'title' => $request->title,
            'description' => $request->description,
            'start' => $request->start,
            'end' => $request->end,
            'color' => $eventType->color, 
            'event_type_id' => $request->event_type_id,
            'customer_id' => $request->event_type_id == $atendimentoTypeId ? $request->customer_id : null,
        ]);

        // Enviar mensagem WhatsApp se for um atendimento e tiver cliente
        if ($event->event_type_id == $atendimentoTypeId && $event->customer_id) {
            $customer = Customer::find($event->customer_id);
            if ($customer && $customer->telefone) {
                $phoneNumber = preg_replace('/[^0-9]/', '', $customer->telefone); // Apenas dígitos
                $start = $event->start->format('d/m/Y H:i');
                $end = $event->end->format('d/m/Y H:i');
                $message = "Olá, {$customer->nome}! Seu agendamento foi confirmado.\n";
                $message .= "*Evento:* {$event->title}\n";
                $message .= "*Descrição:* {$event->description}\n";
                $message .= "*Início:* {$start}\n";
                $message .= "*Fim:* {$end}\n";
                $message .= "Aguardamos você!";

                $apiUrl = config('whatsapp.api_url');
                $sessionName = config('whatsapp.session_name');
                $secretKey = config('whatsapp.secret_key');

                $token = Cache::get("whatsapp_token_{$sessionName}");

                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                    ])->post("{$apiUrl}/api/{$sessionName}/send-message", [
                        'session' => $sessionName,
                        'phone' => '5542991585738',
                        'isGroup' => false,
                        'isNewsletter' => false,
                        'isLid' => false,
                        'message' => $message
                    ]);
                } catch (\Exception $e) {
                    // Logar o erro, mas não impedir o salvamento do evento
                    \Log::error('Erro ao enviar mensagem WhatsApp: ' . $e->getMessage());
                }
            }
        }

        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('update', $event); // Certifique-se que o usuário pode atualizar o evento

        $request->validate([
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'event_type_id' => 'required|exists:event_types,id',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $eventType = EventType::find($request->event_type_id);
        $atendimentoTypeId = EventType::where('name', 'Atendimento')->first()->id;

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'start' => $request->start,
            'end' => $request->end,
            'color' => $eventType->color,
            'event_type_id' => $request->event_type_id,
            'customer_id' => $request->event_type_id == $atendimentoTypeId ? $request->customer_id : null,
        ]);

        // Enviar mensagem WhatsApp se for um atendimento e tiver cliente
        if ($event->event_type_id == $atendimentoTypeId && $event->customer_id) {
            $customer = Customer::find($event->customer_id);
            if ($customer && $customer->telefone) {
                $phoneNumber = preg_replace('/[^0-9]/', '', $customer->telefone); // Apenas dígitos
                $start = $event->start->format('d/m/Y H:i');
                $end = $event->end->format('d/m/Y H:i');
                $message = "Olá, {$customer->nome}! Seu agendamento foi atualizado.\n";
                $message .= "*Evento:* {$event->title}\n";
                $message .= "*Descrição:* {$event->description}\n";
                $message .= "*Início:* {$start}\n";
                $message .= "*Fim:* {$end}\n";
                $message .= "Aguardamos você!";

                try {
                    Http::post(env('WPPCONNECT_SERVER_URL') . '/sendText', [
                        'session' => 'whatsapp-session', // Nome da sessão configurada no WPPConnect Server
                        'phone' => $phoneNumber,
                        'text' => $message,
                    ]);
                } catch (\Exception $e) {
                    // Logar o erro, mas não impedir o salvamento do evento
                    \Log::error('Erro ao enviar mensagem WhatsApp: ' . $e->getMessage());
                }
            }
        }

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);
        $event->delete();
        return response()->json(['message' => 'Evento excluído com sucesso!']);
    }
}