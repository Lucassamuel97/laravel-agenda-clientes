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
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->string('whatsapp_id')->unique()->comment('ID do chat no WhatsApp (ex: 55429...c.us ou 55429...g.us)');
            $table->string('name')->nullable()->comment('Nome do contato/grupo');
            $table->enum('type', ['individual', 'group'])->default('individual');
            $table->boolean('is_archived')->default(false); // Opcional: para status de arquivamento
            $table->timestamp('last_message_at')->nullable(); // Para ordenar conversas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};