@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-10">
            <div class="card">
                <div class="card-header">Jobs Falhados</div>

                <div class="card-body">
                    @if (session('success'))
                        <div class="alert alert-success" role="alert">
                            {{ session('success') }}
                        </div>
                    @endif
                    @if (session('error'))
                        <div class="alert alert-danger" role="alert">
                            {{ session('error') }}
                        </div>
                    @endif
                    @if (session('warning'))
                        <div class="alert alert-warning" role="alert">
                            {{ session('warning') }}
                        </div>
                    @endif

                    @if ($failedJobs->isEmpty())
                        <p class="text-center">Nenhum job falhado encontrado.</p>
                    @else
                        <div class="mb-3 text-right">
                            <form action="{{ route('queue.flush_failed_jobs') }}" method="POST" onsubmit="return confirm('Tem certeza que deseja limpar TODOS os jobs falhados? Esta ação é irreversível!');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger">Limpar Todos os Falhados</button>
                            </form>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped table-hover">
                                <thead class="thead-dark">
                                    <tr>
                                        <th>UUID</th>
                                        <th>Conexão</th>
                                        <th>Fila</th>
                                        <th>Job</th>
                                        <th>Falhou em</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($failedJobs as $job)
                                        <tr>
                                            <td>{{ $job->uuid }}</td>
                                            <td>{{ $job->connection }}</td>
                                            <td>{{ $job->queue }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info" type="button" data-toggle="collapse" data-target="#payload-{{ $job->uuid }}" aria-expanded="false" aria-controls="payload-{{ $job->uuid }}">
                                                    Ver Payload
                                                </button>
                                                <div class="collapse mt-2" id="payload-{{ $job->uuid }}">
                                                    <pre class="bg-light p-2 border rounded text-left" style="white-space: pre-wrap; word-break: break-all;">{{ json_encode(json_decode($job->payload), JSON_PRETTY_PRINT) }}</pre>
                                                </div>
                                                <button class="btn btn-sm btn-warning mt-2" type="button" data-toggle="collapse" data-target="#exception-{{ $job->uuid }}" aria-expanded="false" aria-controls="exception-{{ $job->uuid }}">
                                                    Ver Exceção
                                                </button>
                                                <div class="collapse mt-2" id="exception-{{ $job->uuid }}">
                                                    <pre class="bg-light p-2 border rounded text-left" style="white-space: pre-wrap; word-break: break-all; color: red;">{{ $job->exception }}</pre>
                                                </div>
                                            </td>
                                            <td>{{ \Carbon\Carbon::parse($job->failed_at)->format('d/m/Y H:i:s') }}</td>
                                            <td class="text-nowrap">
                                                <form action="{{ route('queue.retry_failed_job', ['uuid' => $job->uuid]) }}" method="POST" style="display:inline-block;" onsubmit="return confirm('Tem certeza que deseja reenviar este job?');">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-success">Retry</button>
                                                </form>
                                                <form action="{{ route('queue.forget_failed_job', ['uuid' => $job->uuid]) }}" method="POST" style="display:inline-block;" onsubmit="return confirm('Tem certeza que deseja remover este job?');">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-danger">Remover</button>
                                                </form>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-center">
                            {{ $failedJobs->links() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('js')
<script>
// Exemplo de como usar o Bootstrap collapse, se não estiver incluído via CDN/mix
// Certifique-se de que o jQuery e o Bootstrap JS estão carregados em layouts/app.blade.php
// Se você usa o Laravel UI, eles geralmente já estão lá.
</script>
@endsection