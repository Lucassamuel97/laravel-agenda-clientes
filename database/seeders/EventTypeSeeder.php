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
        EventType::firstOrCreate(['name' => 'Reunião', 'color' => '#007bff']); // Azul
        EventType::firstOrCreate(['name' => 'Atendimento', 'color' => '#28a745']); // Verde
        EventType::firstOrCreate(['name' => 'Lembrete', 'color' => '#ffc107']); // Amarelo
        EventType::firstOrCreate(['name' => 'Outro', 'color' => '#6c757d']); // Cinza
    }
}
