<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTypeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QueueMonitorController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WhatsAppController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes([
    'register' => false,
]);

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::middleware(['auth'])->group(function () {
    // Rotas para o gerenciamento de produtos
    Route::resource('products', ProductController::class);

    // Rotas para o gerenciamento de eventos
    Route::get('/calendar', [EventController::class, 'index'])->name('events.calendar');
    Route::get('/api/events', [EventController::class, 'getEvents'])->name('api.events');
    Route::post('/api/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/api/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/api/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

    Route::get('/event-types-api', [EventTypeController::class, 'apiIndex'])->name('event-types.apiIndex');
    Route::resource('event-types', EventTypeController::class);
    Route::get('/customers-api', [CustomerController::class, 'apiIndex'])->name('customers.apiIndex');

    // Rotas para gerenciamento de usuários
    Route::resource('users', UserController::class)->middleware('can:viewAny,App\Models\User');
    Route::get('/profile/password', [ProfileController::class, 'changePasswordForm'])->name('profile.change_password_form');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update_password');

    // Rotas para o gerenciamento de clientes
    Route::resource('customers', CustomerController::class);

    // Rotas para o WhatsApp
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('qrcode', [WhatsAppController::class, 'showQrCode'])->name('qrcode.show');
        Route::post('get-qrcode', [WhatsAppController::class, 'getQrCode'])->name('qrcode.get');
        Route::post('logout', [WhatsAppController::class, 'logoutSession'])->name('session.logout');
    });

    Route::prefix('queue-monitor')->group(function () {
        Route::get('/failed', [QueueMonitorController::class, 'failedJobs'])->name('queue.failed_jobs');
        Route::get('/pending', [QueueMonitorController::class, 'pendingJobs'])->name('queue.pending_jobs'); // Opcional, só para driver 'database'
        Route::post('/failed/{uuid}/retry', [QueueMonitorController::class, 'retryFailedJob'])->name('queue.retry_failed_job');
        Route::delete('/failed/{uuid}/forget', [QueueMonitorController::class, 'forgetFailedJob'])->name('queue.forget_failed_job');
        Route::delete('/failed/flush', [QueueMonitorController::class, 'flushFailedJobs'])->name('queue.flush_failed_jobs');
    });

    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('chats.index');
        Route::get('/{chat}', [ChatController::class, 'show'])->name('chats.show');
        Route::post('/{chat}/send', [ChatController::class, 'sendMessage'])->name('chats.send_message');
        Route::get('/media/{messageId}', [ChatController::class, 'downloadMedia'])->name('chats.download_media');
    });
});

// Rota para o Webhook do WPPConnect
Route::post('whatsapp/webhook', [WhatsAppController::class, 'handleWebhook'])->name('whatsapp.webhook');
