@extends('layouts.app')

@section('title', 'Obras')

@section('content_header_title', 'Gestão de Obras')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Obras Cadastradas</h3>
            <div class="card-tools">
                <a href="{{ route('obras.create') }}" class="btn btn-primary btn-sm">
                    <i class="fas fa-plus"></i> Nova Obra
                </a>
            </div>
        </div>
        <div class="card-body p-0">
            @if (session('success'))
                <div class="alert alert-success m-3">
                    {{ session('success') }}
                </div>
            @endif
            @if (session('error'))
                <div class="alert alert-danger m-3">
                    {{ session('error') }}
                </div>
            @endif

            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th style="width: 50px;">ID</th>
                        <th>Nome da Obra</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Data Início</th>
                        <th>Previsão Fim</th>
                        <th style="width: 180px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($obras as $obra)
                        <tr>
                            <td>{{ $obra->id }}</td>
                            <td>{{ $obra->nome }}</td>
                            <td>{{ $obra->cliente }}</td>
                            <td>{{ $obra->tipo_obra }}</td>
                            <td>{{ $obra->data_inicio->format('d/m/Y') }}</td>
                            <td>{{ $obra->data_previsao_fim ? $obra->data_previsao_fim->format('d/m/Y') : '-' }}</td>
                            <td>
                                <a href="{{ route('obras.show', $obra->id) }}" class="btn btn-info btn-xs" title="Ver Detalhes">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ route('obras.edit', $obra->id) }}" class="btn btn-warning btn-xs" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ route('obras.destroy', $obra->id) }}" method="POST" style="display: inline-block;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-xs" title="Excluir" 
                                            onclick="return confirm('Tem certeza que deseja excluir esta obra?')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">Nenhuma obra cadastrada.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($obras->hasPages())
            <div class="card-footer clearfix">
                {{ $obras->links() }}
            </div>
        @endif
    </div>
@endsection
