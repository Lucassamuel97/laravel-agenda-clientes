@extends('layouts.app')

@section('title', 'Criar Tipo de Evento')
@section('subtitle', 'Novo')

@section('content_header_title', 'Tipos de Evento')
@section('content_header_subtitle', 'Criar')

@section('content')
    <div class="card card-primary">
        <div class="card-header">
            <h3 class="card-title">Novo Tipo de Evento</h3>
        </div>
        <form action="{{ route('event-types.store') }}" method="POST">
            @csrf
            <div class="card-body">
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" id="name" placeholder="Nome do Tipo de Evento" value="{{ old('name') }}" required>
                    @error('name')
                        <span class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="color">Cor (Hexadecimal)</label>
                    <input type="color" name="color" class="form-control @error('color') is-invalid @enderror" id="color" value="{{ old('color', '#000000') }}" required>
                    @error('color')
                        <span class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                    @enderror
                </div>
            </div>
            <div class="card-footer">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <a href="{{ route('event-types.index') }}" class="btn btn-secondary">Cancelar</a>
            </div>
        </form>
    </div>
@stop
