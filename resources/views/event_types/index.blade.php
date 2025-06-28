@extends('layouts.app')

@section('title', 'Tipos de Evento')
@section('subtitle', 'Gerenciamento')

@section('plugins.Datatables', true)
@section('plugins.Sweetalert2', true)

@section('content_header_title', 'Tipos de Evento')
@section('content_header_subtitle', 'Gerenciamento')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Lista de Tipos de Evento</h3>
            <div class="card-tools">
                @can('create', App\Models\EventType::class)
                    <a href="{{ route('event-types.create') }}" class="btn btn-primary btn-sm">
                        Adicionar Novo Tipo
                    </a>
                @endcan
            </div>
        </div>
        <div class="card-body">
            <table id="eventTypesTable" class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cor</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    </div>
@stop

@section('js')
    <script>
        $(function() {
            $('#eventTypesTable').DataTable({
                processing: true,
                serverSide: true,
                ajax: "{{ route('event-types.index') }}",
                columns: [
                    { data: 'id', name: 'id' },
                    { data: 'name', name: 'name' },
                    { data: 'color', name: 'color', render: function(data, type, row) {
                        return '<span style="background-color:' + data + '; padding: 5px; border-radius: 3px;">' + data + '</span>';
                    }},
                    { data: 'action', name: 'action', orderable: false, searchable: false },
                ],
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json"
                }
            });

            // SweetAlert para exclusão
            $(document).on('submit', 'form[id^="deleteForm"]', function(e) {
                e.preventDefault();
                var form = this;
                Swal.fire({
                    title: 'Tem certeza?',
                    text: "Você não poderá reverter isso!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim, excluir!',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit();
                    }
                });
            });
        });
    </script>
@stop
