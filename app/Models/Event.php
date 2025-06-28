<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start',
        'end',
        'color',
        'user_id',
        'event_type_id',
        'customer_id',
    ];

    protected $casts = [
        'start' => 'datetime',
        'end' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function eventType()
    {
        return $this->belongsTo(EventType::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}