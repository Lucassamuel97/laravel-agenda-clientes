<?php

namespace App\Http\Controllers;

use App\Models\Cronograma;
use App\Models\Obra;
use App\Models\No;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
                'dependencia_id' => null, // Mantido para compatibilidade (será a primeira dependência)
            ]);

            // Guardar o mapeamento drawflow_id -> database_id
            if (isset($nodeData['drawflow_id'])) {
                $nodeMap[$nodeData['drawflow_id']] = $no->id;
            }
        }

        // Segunda passagem: Atualizar TODAS as dependências usando a tabela pivot
        foreach ($validated['nodes'] as $nodeData) {
            if (isset($nodeData['dependencies']) && !empty($nodeData['dependencies']) && isset($nodeData['drawflow_id'])) {
                $noId = $nodeMap[$nodeData['drawflow_id']] ?? null;
                
                if ($noId) {
                    try {
                        $no = No::find($noId);
                        
                        if (!$no) {
                            Log::error("Nó não encontrado: ID {$noId}");
                            continue;
                        }
                        
                        $dependenciasIds = [];
                        
                        // Processar todas as dependências
                        foreach ($nodeData['dependencies'] as $dependenciaDrawflowId) {
                            if (isset($nodeMap[$dependenciaDrawflowId])) {
                                $dependenciasIds[] = $nodeMap[$dependenciaDrawflowId];
                            }
                        }
                        
                        Log::info("Sincronizando dependências do nó {$noId}: " . json_encode($dependenciasIds));
                        
                        // Sincronizar as dependências na tabela pivot
                        if (!empty($dependenciasIds)) {
                            // Primeiro, limpar dependências antigas
                            DB::table('no_dependencias')->where('no_id', $noId)->delete();
                            
                            // Depois, inserir as novas
                            foreach ($dependenciasIds as $depId) {
                                DB::table('no_dependencias')->insert([
                                    'no_id' => $noId,
                                    'dependencia_id' => $depId,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ]);
                            }
                            
                            // Atualizar dependencia_id com a primeira dependência (compatibilidade)
                            $no->update(['dependencia_id' => $dependenciasIds[0]]);
                        }
                    } catch (\Exception $e) {
                        Log::error("Erro ao sincronizar dependências do nó {$noId}: " . $e->getMessage());
                        return response()->json([
                            'success' => false,
                            'message' => 'Erro ao salvar dependências: ' . $e->getMessage()
                        ], 500);
                    }
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
        $cronograma->load('obra', 'nos.dependencias', 'nos.dependencia');
        
        // Obter nós ordenados por dependência para a timeline
        $nosOrdenados = $cronograma->getNosOrdenadosPorDependencia();
        
        return view('cronogramas.show', compact('cronograma', 'nosOrdenados'));
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
