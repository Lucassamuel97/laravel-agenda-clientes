<?php

namespace App\Http\Controllers;

use App\Models\Cronograma;
use App\Models\Obra;
use App\Models\No;
use Illuminate\Http\Request;

class CronogramaController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(Obra $obra)
    {
        return view('cronogramas.create', compact('obra'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Obra $obra)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        $cronograma = $obra->cronogramas()->create($validated);

        return redirect()->route('cronogramas.editor', $cronograma)
            ->with('success', 'Cronograma criado! Agora você pode adicionar as etapas.');
    }

    /**
     * Display the DAG editor.
     */
    public function editor(Cronograma $cronograma)
    {
        $cronograma->load('obra');
        
        // Carregar todos os nós com seus dados atualizados do banco
        $nos = $cronograma->nos()->get()->keyBy('drawflow_id');
        
        return view('cronogramas.editor', compact('cronograma', 'nos'));
    }

    /**
     * Save the DAG structure.
     */
    public function saveDag(Request $request, Cronograma $cronograma)
    {
        $validated = $request->validate([
            'json_dag' => 'required|string',
            'nodes' => 'required|array',
        ]);

        // Validar se o JSON é válido
        $jsonData = json_decode($validated['json_dag'], true);
        if ($jsonData === null) {
            return response()->json([
                'success' => false,
                'message' => 'JSON inválido'
            ], 400);
        }

        // Salvar o JSON do DAG (já vem como string do frontend)
        $cronograma->update([
            'json_dag' => $validated['json_dag']
        ]);

        // Limpar nós antigos
        $cronograma->nos()->delete();

        // Mapa para relacionar drawflow_id com o id do banco
        $nodeMap = [];

        // Primeira passagem: Criar todos os nós sem dependências
        foreach ($validated['nodes'] as $nodeData) {
            $no = No::create([
                'cronograma_id' => $cronograma->id,
                'drawflow_id' => $nodeData['drawflow_id'] ?? null,
                'nome' => $nodeData['nome'] ?? 'Etapa',
                'duracao_dias' => $nodeData['duracao_dias'] ?? 1,
                'pos_x' => $nodeData['pos_x'] ?? 0,
                'pos_y' => $nodeData['pos_y'] ?? 0,
                'responsavel' => !empty($nodeData['responsavel']) ? $nodeData['responsavel'] : null,
                'custo_estimado' => !empty($nodeData['custo_estimado']) ? $nodeData['custo_estimado'] : null,
                'dependencia_id' => null, // Será atualizado na segunda passagem
            ]);

            // Guardar o mapeamento drawflow_id -> database_id
            if (isset($nodeData['drawflow_id'])) {
                $nodeMap[$nodeData['drawflow_id']] = $no->id;
            }
        }

        // Segunda passagem: Atualizar dependências
        foreach ($validated['nodes'] as $index => $nodeData) {
            if (isset($nodeData['dependencies']) && !empty($nodeData['dependencies']) && isset($nodeData['drawflow_id'])) {
                // Pega o primeiro nó de dependência
                $dependenciaDrawflowId = $nodeData['dependencies'][0];
                
                // Encontra o ID do banco de dados correspondente
                if (isset($nodeMap[$dependenciaDrawflowId]) && isset($nodeMap[$nodeData['drawflow_id']])) {
                    $noId = $nodeMap[$nodeData['drawflow_id']];
                    $dependenciaId = $nodeMap[$dependenciaDrawflowId];
                    
                    // Atualiza a dependência
                    No::where('id', $noId)->update([
                        'dependencia_id' => $dependenciaId
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Cronograma salvo com sucesso!',
            'nodes_saved' => count($validated['nodes'])
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cronograma $cronograma)
    {
        $cronograma->load('obra', 'nos.dependencia');
        return view('cronogramas.show', compact('cronograma'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cronograma $cronograma)
    {
        $obraId = $cronograma->obra_id;
        $cronograma->delete();

        return redirect()->route('obras.show', $obraId)
            ->with('success', 'Cronograma excluído com sucesso!');
    }
}
