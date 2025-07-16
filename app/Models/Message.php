<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'whatsapp_message_id',
        'from_whatsapp_id',
        'to_whatsapp_id',
        'from_me',
        'body',
        'type',
        'timestamp',
        'ack',
    ];

    protected $casts = [
        'from_me' => 'boolean',
        'timestamp' => 'datetime',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}