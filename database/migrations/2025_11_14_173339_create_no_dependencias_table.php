<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('no_dependencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('no_id')->constrained('nos')->onDelete('cascade');
            $table->foreignId('dependencia_id')->constrained('nos')->onDelete('cascade');
            $table->timestamps();
            
            // Garantir que não haja duplicatas
            $table->unique(['no_id', 'dependencia_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('no_dependencias');
    }
};
