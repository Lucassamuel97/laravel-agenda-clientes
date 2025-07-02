<?php

namespace App\Jobs;

use App\Http\Controllers\WhatsAppController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $phoneNumber;
    protected $messageText;
    protected $isGroup;

    /**
     * Create a new job instance.
     *
     * @param string $phoneNumber
     * @param string $messageText
     * @param bool $isGroup
     */
    public function __construct(string $phoneNumber, string $messageText, bool $isGroup = false)
    {
        $this->phoneNumber = $phoneNumber;
        $this->messageText = $messageText;
        $this->isGroup = $isGroup;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(WhatsAppController $whatsAppController)
    {
        $result = $whatsAppController->sendMessage(
            $this->phoneNumber,
            $this->messageText,
            $this->isGroup
        );

        if ($result['success']) {
            Log::info("Job: Mensagem WhatsApp enviada com sucesso para {$this->phoneNumber}.");
        } else {
            Log::error("Job: Falha ao enviar mensagem WhatsApp para {$this->phoneNumber}: " . $result['message']);
        }
    }
}