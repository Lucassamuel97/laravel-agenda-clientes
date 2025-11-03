@extends('layouts.app')

@section('title', 'Detalhes do Tipo de Evento')
@section('subtitle', 'Visualização')

@section('content_header_title', 'Tipos de Evento')
@section('content_header_subtitle', 'Detalhes')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title">Detalhes do Tipo de Evento: {{ $eventType->name }}</h3>
        </div>
        <div class="card-body">
            <div class="form-group">
                <label for="name">Nome:</label>
                <p>{{ $eventType->name }}</p>
            </div>
            <div class="form-group">
                <label for="color">Cor:</label>
                <p><span style="background-color: {{ $eventType->color }}; padding: 5px; border-radius: 3px;">{{ $eventType->color }}</span></p>
            </div>
        </div>
        <div class="card-footer">
            <a href="{{ route('event-types.index') }}" class="btn btn-secondary">Voltar</a>
            @can('update', $eventType)
                <a href="{{ route('event-types.edit', $eventType->id) }}" class="btn btn-warning">Editar</a>
            @endcan
        </div>
    </div>
@stop
