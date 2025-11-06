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
        Schema::create('nos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cronograma_id')->constrained('cronogramas')->onDelete('cascade');
            $table->string('nome');
            $table->integer('duracao_dias')->default(1);
            $table->foreignId('dependencia_id')->nullable()->constrained('nos')->onDelete('set null');
            $table->integer('pos_x')->default(0);
            $table->integer('pos_y')->default(0);
            $table->string('responsavel')->nullable();
            $table->decimal('custo_estimado', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nos');
    }
};
