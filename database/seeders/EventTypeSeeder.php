<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventType;

class EventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EventType::create(['name' => 'Reunião', 'color' => '#007bff']); // Azul
        EventType::create(['name' => 'Atendimento', 'color' => '#28a745']); // Verde
        EventType::create(['name' => 'Lembrete', 'color' => '#ffc107']); // Amarelo
        EventType::create(['name' => 'Outro', 'color' => '#6c757d']); // Cinza
    }
}
