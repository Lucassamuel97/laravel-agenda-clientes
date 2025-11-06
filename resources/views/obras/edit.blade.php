@extends('layouts.app')

@section('title', 'Editar Obra')

@section('content_header_title', 'Editar Obra')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Dados da Obra</h3>
        </div>
        <form action="{{ route('obras.update', $obra->id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nome">Nome da Obra <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('nome') is-invalid @enderror" 
                                   id="nome" name="nome" value="{{ old('nome', $obra->nome) }}" required>
                            @error('nome')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="cliente">Cliente <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('cliente') is-invalid @enderror" 
                                   id="cliente" name="cliente" value="{{ old('cliente', $obra->cliente) }}" required>
                            @error('cliente')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="tipo_obra">Tipo de Obra <span class="text-danger">*</span></label>
                            <select class="form-control @error('tipo_obra') is-invalid @enderror" 
                                    id="tipo_obra" name="tipo_obra" required>
                                <option value="">Selecione...</option>
                                <option value="pavimentacao" {{ old('tipo_obra', $obra->tipo_obra) == 'pavimentacao' ? 'selected' : '' }}>Pavimentação</option>
                                <option value="escola" {{ old('tipo_obra', $obra->tipo_obra) == 'escola' ? 'selected' : '' }}>Escola</option>
                                <option value="unidade_saude" {{ old('tipo_obra', $obra->tipo_obra) == 'unidade_saude' ? 'selected' : '' }}>Unidade de Saúde</option>
                                <option value="edificacao" {{ old('tipo_obra', $obra->tipo_obra) == 'edificacao' ? 'selected' : '' }}>Edificação</option>
                                <option value="saneamento" {{ old('tipo_obra', $obra->tipo_obra) == 'saneamento' ? 'selected' : '' }}>Saneamento</option>
                                <option value="outro" {{ old('tipo_obra', $obra->tipo_obra) == 'outro' ? 'selected' : '' }}>Outro</option>
                            </select>
                            @error('tipo_obra')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="data_inicio">Data de Início <span class="text-danger">*</span></label>
                            <input type="date" class="form-control @error('data_inicio') is-invalid @enderror" 
                                   id="data_inicio" name="data_inicio" value="{{ old('data_inicio', $obra->data_inicio->format('Y-m-d')) }}" required>
                            @error('data_inicio')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="data_previsao_fim">Previsão de Término</label>
                            <input type="date" class="form-control @error('data_previsao_fim') is-invalid @enderror" 
                                   id="data_previsao_fim" name="data_previsao_fim" value="{{ old('data_previsao_fim', $obra->data_previsao_fim ? $obra->data_previsao_fim->format('Y-m-d') : '') }}">
                            @error('data_previsao_fim')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="descricao">Descrição</label>
                    <textarea class="form-control @error('descricao') is-invalid @enderror" 
                              id="descricao" name="descricao" rows="4">{{ old('descricao', $obra->descricao) }}</textarea>
                    @error('descricao')
                        <span class="invalid-feedback">{{ $message }}</span>
                    @enderror
                </div>
            </div>

            <div class="card-footer">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Atualizar Obra
                </button>
                <a href="{{ route('obras.show', $obra->id) }}" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                </a>
            </div>
        </form>
    </div>
@endsection
