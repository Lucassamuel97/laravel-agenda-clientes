<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventType;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $event = Auth::user()->events()->create([
            'title' => $request->title,
            'description' => $request->description,
            'start' => $request->start,
            'end' => $request->end,
            'color' => $eventType->color, 
            'event_type_id' => $request->event_type_id,
            'customer_id' => $request->customer_id,
        ]);

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

        $eventType = EventType::find(id: $request->event_type_id);

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'start' => $request->start,
            'end' => $request->end,
            'color' => $eventType->color,
            'event_type_id' => $request->event_type_id,
            'customer_id' => $request->customer_id,
        ]);

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);
        $event->delete();
        return response()->json(['message' => 'Evento excluído com sucesso!']);
    }
}