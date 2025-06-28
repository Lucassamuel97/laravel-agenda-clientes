<?php

namespace App\Http\Controllers;

use App\Models\EventType;
use Illuminate\Http\Request;
use Yajra\DataTables\DataTables;
use App\Http\Requests\StoreEventTypeRequest;
use App\Http\Requests\UpdateEventTypeRequest;

class EventTypeController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(EventType::class, 'event_type');
    }

    public function index(Request $request)
    {
        if ($request->ajax()) {
            $data = EventType::select(['id', 'name', 'color']);
            return Datatables::of($data)
                ->addIndexColumn()
                ->addColumn('action', function($row){
                    $btn = '';
                    if (auth()->user()->can('view', $row)) {
                        $btn .= '<a href="' . route('event-types.show', $row->id) . '" class="btn btn-info btn-xs" title="Ver Detalhes"><i class="fas fa-eye"></i></a> ';
                    }
                    if (auth()->user()->can('update', $row)) {
                        $btn .= '<a href="' . route('event-types.edit', $row->id) . '" class="btn btn-warning btn-xs" title="Editar Tipo de Evento"><i class="fas fa-edit"></i></a> ';
                    }
                    if (auth()->user()->can('delete', $row)) {
                        $btn .= '<form action="' . route('event-types.destroy', $row->id) . '" method="POST" style="display:inline;" onsubmit="return confirm(\'Tem certeza que deseja excluir este tipo de evento? Esta ação não pode ser desfeita.\');">';
                        $btn .= csrf_field();
                        $btn .= method_field('DELETE');
                        $btn .= '<button type="submit" class="btn btn-danger btn-xs" title="Excluir Tipo de Evento"><i class="fas fa-trash"></i></button>';
                        $btn .= '</form>';
                    }
                    return $btn;
                })
                ->rawColumns(['action'])
                ->make(true);
        }

        return view('event_types.index');
    }

    public function create()
    {
        return view('event_types.create');
    }

    public function store(StoreEventTypeRequest $request)
    {
        EventType::create($request->validated());

        return redirect()->route('event-types.index')
            ->with('success', 'Tipo de Evento criado com sucesso.');
    }

    public function show(EventType $eventType)
    {
        return view('event_types.show', compact('eventType'));
    }

    public function edit(EventType $eventType)
    {
        return view('event_types.edit', compact('eventType'));
    }

    public function update(UpdateEventTypeRequest $request, EventType $eventType)
    {
        $eventType->update($request->validated());

        return redirect()->route('event-types.index')
            ->with('success', 'Tipo de Evento atualizado com sucesso.');
    }

    public function destroy(EventType $eventType)
    {
        $eventType->delete();

        return redirect()->route('event-types.index')
            ->with('success', 'Tipo de Evento excluído com sucesso.');
    }

    public function apiIndex()
    {
        return response()->json(EventType::all());
    }
}
