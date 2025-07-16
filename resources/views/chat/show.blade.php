@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    Conversa com: {{ $chat->name }}
                    <a href="{{ route('chats.index') }}" class="btn btn-sm btn-outline-secondary float-right">Voltar às Conversas</a>
                </div>

                <div class="card-body">
                    @if (session('success'))
                        <div class="alert alert-success" role="alert">{{ session('success') }}</div>
                    @endif
                    @if (session('error'))
                        <div class="alert alert-danger" role="alert">{{ session('error') }}</div>
                    @endif

                    {{-- O ID do chat é passado aqui para o nosso JavaScript --}}
                    <div id="messages-container" data-chat-id="{{ $chat->id }}" style="max-height: 500px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 10px; margin-bottom: 15px;">
                        @forelse ($messages as $message)
                            <div class="d-flex {{ $message->from_me ? 'justify-content-end' : 'justify-content-start' }} mb-2">
                                <div class="p-2 rounded {{ $message->from_me ? 'bg-primary text-white' : 'bg-light text-dark border' }}" style="max-width: 70%;">
                                    <small class="text-muted d-block text-right">{{ $message->timestamp->format('H:i') }}</small>
                                    <strong>
                                        @if(!$message->from_me)
                                            @if($chat->type === 'group')
                                                {{ $message->sender_name_cached ?? $message->from_whatsapp_id }}
                                            @else
                                                {{ $chat->name }}
                                            @endif
                                        @else
                                            Você
                                        @endif
                                    :</strong>
                                    
                                    @if($message->type === 'chat')
                                        <p class="mb-0">{{ $message->body }}</p>
                                    @elseif(in_array($message->type, ['image', 'video', 'document', 'audio']))
                                        <p class="mb-0 text-info">[Mídia: {{ $message->type }}]</p>
                                        @if($message->body)
                                            <small class="d-block text-muted">{{ $message->body }}</small>
                                        @endif
                                        <a href="#" class="btn btn-sm btn-outline-info mt-1 download-media-btn" data-message-id="{{ $message->whatsapp_message_id }}">Baixar Mídia</a>
                                    @else
                                        <p class="mb-0 text-muted">[Mensagem tipo: {{ $message->type }}]</p>
                                    @endif

                                    @if($message->from_me)
                                        <small class="text-right d-block" id="ack-{{ $message->whatsapp_message_id }}">
                                            @if($message->ack === 0) Pendente @elseif($message->ack === 1) Enviada @elseif($message->ack === 2) Entregue @elseif($message->ack === 3) Lida @endif
                                        </small>
                                    @endif
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-muted">Nenhuma mensagem nesta conversa ainda.</p>
                        @endforelse
                    </div>

                    <form id="send-message-form" action="{{ route('chats.send_message', $chat) }}" method="POST">
                        @csrf
                        <div class="form-group">
                            <textarea name="message_body" class="form-control" rows="3" placeholder="Digite sua mensagem..." required></textarea>
                            @error('message_body')
                                <div class="text-danger">{{ $message }}</div>
                            @enderror
                        </div>
                        <button type="submit" class="btn btn-success float-right">Enviar Mensagem</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

{{-- O @section('js') foi removido pois o JavaScript agora é global --}}
