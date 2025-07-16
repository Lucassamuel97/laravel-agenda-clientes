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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->onDelete('cascade');
            $table->string('whatsapp_message_id')->unique()->nullable()->comment('ID da mensagem no WhatsApp');
            $table->string('from_whatsapp_id')->comment('Quem enviou (WPPConnect ID ou ID do contato)');
            $table->string('to_whatsapp_id')->comment('Para quem foi enviada (WPPConnect ID ou ID do contato)');
            $table->boolean('from_me')->comment('True se a mensagem foi enviada por este WhatsApp (sua sessão)');
            $table->text('body')->nullable()->comment('Conteúdo da mensagem');
            $table->string('type')->default('chat')->comment('Tipo da mensagem (chat, image, video, document, etc.)');
            $table->timestamp('timestamp')->comment('Timestamp original da mensagem do WhatsApp');
            $table->integer('ack')->default(0)->comment('Status de entrega (0=pending, 1=sent, 2=delivered, 3=read)'); // Opcional
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};