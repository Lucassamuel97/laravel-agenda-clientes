@extends('layouts.app')

@section('title', 'Visualizar Cronograma')

@section('content_header_title', 'Cronograma')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">
                <i class="fas fa-project-diagram"></i> {{ $cronograma->nome }}
            </h3>
            <div class="card-tools">
                <a href="{{ route('cronogramas.editor', $cronograma->id) }}" class="btn btn-primary btn-sm">
                    <i class="fas fa-edit"></i> Editar Cronograma
                </a>
                <a href="{{ route('obras.show', $cronograma->obra_id) }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Voltar
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Obra:</dt>
                        <dd class="col-sm-8">{{ $cronograma->obra->nome }}</dd>

                        <dt class="col-sm-4">Cliente:</dt>
                        <dd class="col-sm-8">{{ $cronograma->obra->cliente }}</dd>

                        <dt class="col-sm-4">Total de Etapas:</dt>
                        <dd class="col-sm-8">{{ $cronograma->nos->count() }}</dd>
                    </dl>
                </div>
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Duração Total:</dt>
                        <dd class="col-sm-8">{{ $cronograma->nos->sum('duracao_dias') }} dias</dd>

                        <dt class="col-sm-4">Custo Estimado:</dt>
                        <dd class="col-sm-8">R$ {{ number_format($cronograma->nos->sum('custo_estimado'), 2, ',', '.') }}</dd>

                        <dt class="col-sm-4">Criado em:</dt>
                        <dd class="col-sm-8">{{ $cronograma->created_at->format('d/m/Y H:i') }}</dd>
                    </dl>
                </div>
            </div>

            @if($cronograma->descricao)
                <div class="row">
                    <div class="col-12">
                        <h5>Descrição:</h5>
                        <p class="text-muted">{{ $cronograma->descricao }}</p>
                    </div>
                </div>
            @endif
        </div>
    </div>

    @if($cronograma->nos->count() > 0)
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Etapas do Cronograma</h3>
            </div>
            <div class="card-body p-0">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Nome da Etapa</th>
                            <th>Duração</th>
                            <th>Responsável</th>
                            <th>Custo Estimado</th>
                            <th>Dependência</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($cronograma->nos as $index => $no)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>
                                    <strong>{{ $no->nome }}</strong>
                                </td>
                                <td>
                                    <i class="fas fa-clock text-primary"></i>
                                    {{ $no->duracao_dias }} {{ $no->duracao_dias == 1 ? 'dia' : 'dias' }}
                                </td>
                                <td>
                                    @if($no->responsavel)
                                        <i class="fas fa-user text-info"></i> {{ $no->responsavel }}
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    @if($no->custo_estimado)
                                        <i class="fas fa-dollar-sign text-success"></i>
                                        R$ {{ number_format($no->custo_estimado, 2, ',', '.') }}
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    @if($no->dependencia)
                                        <span class="badge badge-info">
                                            <i class="fas fa-link"></i> {{ $no->dependencia->nome }}
                                        </span>
                                    @else
                                        <span class="text-muted">Sem dependência</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                    <tfoot>
                        <tr class="bg-light">
                            <td colspan="2"><strong>TOTAL</strong></td>
                            <td><strong>{{ $cronograma->nos->sum('duracao_dias') }} dias</strong></td>
                            <td colspan="2">
                                <strong>R$ {{ number_format($cronograma->nos->sum('custo_estimado'), 2, ',', '.') }}</strong>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- Visualização em Timeline (opcional) -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Timeline das Etapas</h3>
            </div>
            <div class="card-body">
                <div class="timeline">
                    @foreach($cronograma->nos as $no)
                        <div class="time-label">
                            <span class="bg-primary">{{ $no->nome }}</span>
                        </div>
                        <div>
                            <i class="fas fa-clock bg-info"></i>
                            <div class="timeline-item">
                                <h3 class="timeline-header">
                                    Duração: {{ $no->duracao_dias }} {{ $no->duracao_dias == 1 ? 'dia' : 'dias' }}
                                </h3>
                                <div class="timeline-body">
                                    @if($no->responsavel)
                                        <p><strong>Responsável:</strong> {{ $no->responsavel }}</p>
                                    @endif
                                    @if($no->custo_estimado)
                                        <p><strong>Custo:</strong> R$ {{ number_format($no->custo_estimado, 2, ',', '.') }}</p>
                                    @endif
                                    @if($no->dependencia)
                                        <p><strong>Depende de:</strong> {{ $no->dependencia->nome }}</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endforeach
                    <div>
                        <i class="fas fa-check bg-success"></i>
                    </div>
                </div>
            </div>
        </div>
    @else
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-info-circle fa-3x text-muted mb-3"></i>
                <h5>Nenhuma etapa cadastrada</h5>
                <p class="text-muted">Use o editor visual para adicionar etapas ao cronograma.</p>
                <a href="{{ route('cronogramas.editor', $cronograma->id) }}" class="btn btn-primary">
                    <i class="fas fa-sitemap"></i> Ir para o Editor
                </a>
            </div>
        </div>
    @endif
@endsection
