@extends('layouts.app')

@section('title', 'Detalhes da Obra')

@section('content_header_title', 'Detalhes da Obra')

@section('content')
    @if (session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">{{ $obra->nome }}</h3>
            <div class="card-tools">
                <a href="{{ route('obras.edit', $obra->id) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit"></i> Editar
                </a>
                <a href="{{ route('obras.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Voltar
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Cliente:</dt>
                        <dd class="col-sm-8">{{ $obra->cliente }}</dd>

                        <dt class="col-sm-4">Tipo de Obra:</dt>
                        <dd class="col-sm-8">{{ ucfirst(str_replace('_', ' ', $obra->tipo_obra)) }}</dd>

                        <dt class="col-sm-4">Data de Início:</dt>
                        <dd class="col-sm-8">{{ $obra->data_inicio->format('d/m/Y') }}</dd>
                    </dl>
                </div>
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Previsão de Término:</dt>
                        <dd class="col-sm-8">{{ $obra->data_previsao_fim ? $obra->data_previsao_fim->format('d/m/Y') : 'Não definida' }}</dd>

                        <dt class="col-sm-4">Cadastrado em:</dt>
                        <dd class="col-sm-8">{{ $obra->created_at->format('d/m/Y H:i') }}</dd>

                        <dt class="col-sm-4">Última atualização:</dt>
                        <dd class="col-sm-8">{{ $obra->updated_at->format('d/m/Y H:i') }}</dd>
                    </dl>
                </div>
            </div>

            @if($obra->descricao)
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>Descrição:</h5>
                        <p class="text-muted">{{ $obra->descricao }}</p>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Cronogramas</h3>
            <div class="card-tools">
                <a href="{{ route('cronogramas.create', $obra->id) }}" class="btn btn-success btn-sm">
                    <i class="fas fa-project-diagram"></i> Novo Cronograma
                </a>
            </div>
        </div>
        <div class="card-body p-0">
            @if($obra->cronogramas->count() > 0)
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th style="width: 50px;">ID</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Etapas</th>
                            <th>Criado em</th>
                            <th style="width: 180px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($obra->cronogramas as $cronograma)
                            <tr>
                                <td>{{ $cronograma->id }}</td>
                                <td>{{ $cronograma->nome }}</td>
                                <td>{{ Str::limit($cronograma->descricao, 50) }}</td>
                                <td>{{ $cronograma->nos->count() }}</td>
                                <td>{{ $cronograma->created_at->format('d/m/Y') }}</td>
                                <td>
                                    <a href="{{ route('cronogramas.show', $cronograma->id) }}" class="btn btn-info btn-xs" title="Ver">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('cronogramas.editor', $cronograma->id) }}" class="btn btn-primary btn-xs" title="Editor DAG">
                                        <i class="fas fa-sitemap"></i>
                                    </a>
                                    <form action="{{ route('cronogramas.destroy', $cronograma->id) }}" method="POST" style="display: inline-block;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-danger btn-xs" title="Excluir" 
                                                onclick="return confirm('Tem certeza que deseja excluir este cronograma?')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="p-4 text-center text-muted">
                    <i class="fas fa-project-diagram fa-3x mb-3"></i>
                    <p>Nenhum cronograma cadastrado para esta obra.</p>
                    <a href="{{ route('cronogramas.create', $obra->id) }}" class="btn btn-success">
                        <i class="fas fa-plus"></i> Criar Primeiro Cronograma
                    </a>
                </div>
            @endif
        </div>
    </div>
@endsection
