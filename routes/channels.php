<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Adiciona a autorização para o canal de chat
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    // Em um cenário real, você validaria se o usuário pertence a este chat.
    // Por exemplo: return $user->chats->contains($chatId);
    // Por enquanto, se o usuário estiver logado, ele pode ouvir o canal.
    return $user !== null;
});
