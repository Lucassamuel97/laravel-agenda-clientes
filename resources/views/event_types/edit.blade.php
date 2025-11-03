@extends('layouts.app')

@section('title', 'Editar Tipo de Evento')
@section('subtitle', 'Edição')

@section('content_header_title', 'Tipos de Evento')
@section('content_header_subtitle', 'Editar')

@section('content')
    <div class="card card-warning">
        <div class="card-header">
            <h3 class="card-title">Editar Tipo de Evento: {{ $eventType->name }}</h3>
        </div>
        <form action="{{ route('event-types.update', $eventType->id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="card-body">
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" id="name" placeholder="Nome do Tipo de Evento" value="{{ old('name', $eventType->name) }}" required>
                    @error('name')
                        <span class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="color">Cor (Hexadecimal)</label>
                    <input type="color" name="color" class="form-control @error('color') is-invalid @enderror" id="color" value="{{ old('color', $eventType->color) }}" required>
                    @error('color')
                        <span class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                    @enderror
                </div>
            </div>
            <div class="card-footer">
                <button type="submit" class="btn btn-warning">Atualizar</button>
                <a href="{{ route('event-types.index') }}" class="btn btn-secondary">Cancelar</a>
            </div>
        </form>
    </div>
@stop
