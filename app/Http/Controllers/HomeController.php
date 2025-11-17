<?php

namespace App\Http\Controllers;

use App\Models\Obra;
use App\Models\User;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        // Contar produtos e usuários
        $totalObras = Obra::count();
        $totalUsers = User::count();

        // Passar os dados para a view
        return view('home', compact('totalObras', 'totalUsers'));
    }
}
