<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cronograma extends Model
{
    use HasFactory;

    protected $fillable = [
        'obra_id',
        'nome',
        'descricao',
        'json_dag',
    ];

    // Não fazer cast automático do json_dag para evitar problemas de serialização
    // O JSON será tratado manualmente no controller e nas views
    protected $casts = [
        // 'json_dag' => 'array', // Removido para controle manual
    ];

    /**
     * Relacionamento com obra
     */
    public function obra(): BelongsTo
    {
        return $this->belongsTo(Obra::class);
    }

    /**
     * Relacionamento com nós
     */
    public function nos(): HasMany
    {
        return $this->hasMany(No::class);
    }

    /**
     * Retorna o JSON DAG decodificado
     */
    public function getJsonDagDecoded()
    {
        if (empty($this->json_dag)) {
            return null;
        }
        
        return json_decode($this->json_dag, true);
    }

    /**
     * Verifica se tem um DAG salvo válido
     */
    public function hasValidDag(): bool
    {
        $dag = $this->getJsonDagDecoded();
        return !empty($dag) && isset($dag['drawflow']['Home']['data']);
    }

    /**
     * Retorna os nós ordenados topologicamente (por dependência)
     * Nós sem dependência vêm primeiro, depois seus dependentes, e assim por diante
     */
    public function getNosOrdenadosPorDependencia()
    {
        $nos = $this->nos()->with('dependencias')->get();
        
        if ($nos->isEmpty()) {
            return collect();
        }

        $ordenados = collect();
        $processados = [];
        $todosNos = $nos->keyBy('id');

        // Função recursiva para adicionar nó e seus dependentes
        $adicionarNoEDependentes = function($no) use (&$adicionarNoEDependentes, &$ordenados, &$processados, $todosNos) {
            // Se já foi processado, retorna
            if (in_array($no->id, $processados)) {
                return;
            }

            // Se tem dependências, processa todas as dependências primeiro
            if ($no->dependencias && $no->dependencias->count() > 0) {
                foreach ($no->dependencias as $dependencia) {
                    if (isset($todosNos[$dependencia->id])) {
                        $adicionarNoEDependentes($todosNos[$dependencia->id]);
                    }
                }
            }

            // Adiciona o nó atual se ainda não foi adicionado
            if (!in_array($no->id, $processados)) {
                $ordenados->push($no);
                $processados[] = $no->id;
            }
        };

        // Primeiro, processar todos os nós
        foreach ($todosNos as $no) {
            $adicionarNoEDependentes($no);
        }

        return $ordenados;
    }
}
