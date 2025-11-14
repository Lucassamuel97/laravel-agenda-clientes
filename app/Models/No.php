<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class No extends Model
{
    use HasFactory;

    protected $fillable = [
        'cronograma_id',
        'drawflow_id',
        'nome',
        'duracao_dias',
        'dependencia_id',
        'pos_x',
        'pos_y',
        'responsavel',
        'custo_estimado',
    ];

    protected $casts = [
        'duracao_dias' => 'integer',
        'pos_x' => 'integer',
        'pos_y' => 'integer',
        'custo_estimado' => 'decimal:2',
    ];

    /**
     * Relacionamento com cronograma
     */
    public function cronograma(): BelongsTo
    {
        return $this->belongsTo(Cronograma::class);
    }

    /**
     * Nó pai (dependência) - DEPRECATED: usar dependencias()
     */
    public function dependencia(): BelongsTo
    {
        return $this->belongsTo(No::class, 'dependencia_id');
    }

    /**
     * Todas as dependências deste nó (nós dos quais este depende)
     */
    public function dependencias(): BelongsToMany
    {
        return $this->belongsToMany(No::class, 'no_dependencias', 'no_id', 'dependencia_id')
            ->withTimestamps();
    }

    /**
     * Nós que dependem deste nó
     */
    public function dependentesDiretos(): BelongsToMany
    {
        return $this->belongsToMany(No::class, 'no_dependencias', 'dependencia_id', 'no_id')
            ->withTimestamps();
    }

    /**
     * Nós dependentes deste nó - DEPRECATED: manter para compatibilidade
     */
    public function dependentes(): HasMany
    {
        return $this->hasMany(No::class, 'dependencia_id');
    }
}
