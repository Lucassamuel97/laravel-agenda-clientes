@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-10">
            <div class="card">
                <div class="card-header">Jobs Pendentes (Driver: database)</div>

                <div class="card-body">
                    @if (session('warning'))
                        <div class="alert alert-warning" role="alert">
                            {{ session('warning') }}
                        </div>
                    @endif

                    @if ($pendingJobs->isEmpty())
                        <p class="text-center">Nenhum job pendente encontrado.</p>
                        @if(config('queue.default') !== 'database')
                        <p class="text-center text-muted">Esta visualização só mostra jobs pendentes se o driver de fila for 'database'.</p>
                        @endif
                    @else
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped table-hover">
                                <thead class="thead-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fila</th>
                                        <th>Job</th>
                                        <th>Disponível em</th>
                                        <th>Tentativas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($pendingJobs as $job)
                                        <tr>
                                            <td>{{ $job->id }}</td>
                                            <td>{{ $job->queue }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info" type="button" data-toggle="collapse" data-target="#payload-{{ $job->id }}" aria-expanded="false" aria-controls="payload-{{ $job->id }}">
                                                    Ver Payload
                                                </button>
                                                <div class="collapse mt-2" id="payload-{{ $job->id }}">
                                                    <pre class="bg-light p-2 border rounded text-left" style="white-space: pre-wrap; word-break: break-all;">{{ json_encode(json_decode($job->payload), JSON_PRETTY_PRINT) }}</pre>
                                                </div>
                                            </td>
                                            <td>{{ \Carbon\Carbon::parse($job->available_at)->format('d/m/Y H:i:s') }}</td>
                                            <td>{{ $job->attempts }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-center">
                            {{ $pendingJobs->links() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection