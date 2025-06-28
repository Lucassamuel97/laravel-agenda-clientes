<?php

namespace App\Http\Controllers;

use App\Models\EventType;
use Illuminate\Http\Request;

class EventTypeController extends Controller
{
    public function index()
    {
        return response()->json(EventType::all());
    }
}
