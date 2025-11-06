<?php

namespace App\Http\Controllers;

use App\Models\Obra;
use Illuminate\Http\Request;

class ObraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $obras = Obra::latest()->paginate(10);
        return view('obras.index', compact('obras'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('obras.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cliente' => 'required|string|max:255',
            'tipo_obra' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'data_previsao_fim' => 'nullable|date|after_or_equal:data_inicio',
            'descricao' => 'nullable|string',
        ]);

        $obra = Obra::create($validated);

        return redirect()->route('obras.show', $obra)
            ->with('success', 'Obra cadastrada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Obra $obra)
    {
        $obra->load('cronogramas');
        return view('obras.show', compact('obra'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Obra $obra)
    {
        return view('obras.edit', compact('obra'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Obra $obra)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cliente' => 'required|string|max:255',
            'tipo_obra' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'data_previsao_fim' => 'nullable|date|after_or_equal:data_inicio',
            'descricao' => 'nullable|string',
        ]);

        $obra->update($validated);

        return redirect()->route('obras.show', $obra)
            ->with('success', 'Obra atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Obra $obra)
    {
        $obra->delete();

        return redirect()->route('obras.index')
            ->with('success', 'Obra excluída com sucesso!');
    }
}
