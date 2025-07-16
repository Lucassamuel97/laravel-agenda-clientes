@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Conversas do WhatsApp</div>

                <div class="card-body">
                    @if ($chats->isEmpty())
                        <p class="text-center">Nenhuma conversa encontrada ainda. Envie ou receba uma mensagem para começar.</p>
                    @else
                        <ul class="list-group list-group-flush">
                            @foreach ($chats as $chat)
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="{{ route('chats.show', $chat) }}" class="text-decoration-none text-dark">
                                        <h5>{{ $chat->name }}</h5>
                                        <small class="text-muted">
                                            @if($chat->last_message_at)
                                                Última mensagem: {{ $chat->last_message_at->diffForHumans() }}
                                            @else
                                                Sem mensagens recentes
                                            @endif
                                        </small>
                                    </a>
                                    {{-- Você pode adicionar um badge para mensagens não lidas aqui, se implementar --}}
                                </li>
                            @endforeach
                        </ul>
                        <div class="mt-3">
                            {{ $chats->links() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection