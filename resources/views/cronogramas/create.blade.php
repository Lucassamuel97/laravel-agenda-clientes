@extends('layouts.app')

@section('title', 'Novo Cronograma')

@section('content_header_title', 'Criar Cronograma')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Novo Cronograma para: {{ $obra->nome }}</h3>
        </div>
        <form action="{{ route('cronogramas.store', $obra->id) }}" method="POST">
            @csrf
            <div class="card-body">
                <div class="form-group">
                    <label for="nome">Nome do Cronograma <span class="text-danger">*</span></label>
                    <input type="text" class="form-control @error('nome') is-invalid @enderror" 
                           id="nome" name="nome" value="{{ old('nome') }}" required 
                           placeholder="Ex: Cronograma Completo, Fase 1, etc.">
                    @error('nome')
                        <span class="invalid-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <div class="form-group">
                    <label for="descricao">Descrição</label>
                    <textarea class="form-control @error('descricao') is-invalid @enderror" 
                              id="descricao" name="descricao" rows="4" 
                              placeholder="Descreva as principais etapas ou características deste cronograma...">{{ old('descricao') }}</textarea>
                    @error('descricao')
                        <span class="invalid-feedback">{{ $message }}</span>
                    @enderror
                </div>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> 
                    Após criar o cronograma, você será redirecionado para o editor visual onde poderá adicionar as etapas e suas dependências.
                </div>
            </div>

            <div class="card-footer">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-arrow-right"></i> Criar e Ir para o Editor
                </button>
                <a href="{{ route('obras.show', $obra->id) }}" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                </a>
            </div>
        </form>
    </div>
@endsection
