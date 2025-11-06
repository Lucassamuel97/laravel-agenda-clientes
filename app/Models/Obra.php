<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obra extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'cliente',
        'tipo_obra',
        'data_inicio',
        'data_previsao_fim',
        'descricao',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_previsao_fim' => 'date',
    ];

    /**
     * Relacionamento com cronogramas
     */
    public function cronogramas(): HasMany
    {
        return $this->hasMany(Cronograma::class);
    }
}
