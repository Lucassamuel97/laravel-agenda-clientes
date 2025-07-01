<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WhatsAppController extends Controller
{
    public function showQrCode()
    {
        return view('whatsapp.qrcode');
    }

    public function getQrCode()
    {
        try {
            $apiUrl = config('whatsapp.api_url');

            $sessionName = config('whatsapp.session_name');
            $secretKey = config('whatsapp.secret_key');

            // 1. Get Token
            $tokenResponse = Http::post("{$apiUrl}/api/{$sessionName}/{$secretKey}/generate-token");


            if ($tokenResponse->failed()) {
                return response()->json(['error' => 'Failed to generate token'], 500);
            }

            $token = $tokenResponse->json('token');

            //salvar token em session or cache
            Cache::put("whatsapp_token_{$sessionName}", $token, 3600); // Cache for 1 hour

            // 2. Start Session & Get QR Code
            $qrCodeResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$apiUrl}/api/{$sessionName}/start-session");

            if ($qrCodeResponse->failed()) {
                return response()->json(['error' => 'Failed to start session or get QR code'], 500);
            }

            return $qrCodeResponse->json();

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
