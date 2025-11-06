<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
     * Nó pai (dependência)
     */
    public function dependencia(): BelongsTo
    {
        return $this->belongsTo(No::class, 'dependencia_id');
    }

    /**
     * Nós dependentes deste nó
     */
    public function dependentes(): HasMany
    {
        return $this->hasMany(No::class, 'dependencia_id');
    }
}
