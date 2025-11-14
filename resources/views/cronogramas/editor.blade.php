@extends('layouts.app')

@section('title', 'Editor de Cronograma')

@section('content_header_title', 'Editor Visual de Etapas (DAG)')

@push('css')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.css">
<style>
    #drawflow {
        position: relative;
        width: 100%;
        height: 600px;
        border: 1px solid #dee2e6;
        background: #f8f9fa;
        background-size: 20px 20px;
        background-image: 
            linear-gradient(to right, #e9ecef 1px, transparent 1px),
            linear-gradient(to bottom, #e9ecef 1px, transparent 1px);
    }
    
    .drawflow .drawflow-node {
        background: #fff;
        border: 2px solid #007bff;
        border-radius: 8px;
        padding: 15px;
        min-width: 200px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .drawflow .drawflow-node.selected {
        border-color: #28a745;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
    
    .node-header {
        font-weight: bold;
        margin-bottom: 10px;
        color: #007bff;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 5px;
    }
    
    .node-content {
        font-size: 12px;
        color: #6c757d;
    }
    
    .node-content div {
        margin: 3px 0;
    }
    
    .toolbar {
        margin-bottom: 15px;
        padding: 15px;
        background: #fff;
        border: 1px solid #dee2e6;
        border-radius: 4px;
    }
    
    .drawflow-delete {
        background: #dc3545;
        color: white;
        border: none;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
    }
</style>
@endpush

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-project-diagram"></i> 
                        {{ $cronograma->nome }} - Obra: {{ $cronograma->obra->nome }}
                    </h3>
                    <div class="card-tools">
                        <a href="{{ route('obras.show', $cronograma->obra_id) }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Voltar para Obra
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="toolbar">
                        <button type="button" class="btn btn-success" id="addNodeBtn">
                            <i class="fas fa-plus"></i> Adicionar Etapa
                        </button>
                        <button type="button" class="btn btn-primary" id="saveBtn">
                            <i class="fas fa-save"></i> Salvar Cronograma
                        </button>
                        <button type="button" class="btn btn-info" id="zoomInBtn">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button type="button" class="btn btn-info" id="zoomOutBtn">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button type="button" class="btn btn-warning" id="zoomResetBtn">
                            <i class="fas fa-compress"></i> Reset Zoom
                        </button>
                        <button type="button" class="btn btn-danger" id="clearBtn">
                            <i class="fas fa-trash"></i> Limpar Tudo
                        </button>
                    </div>

                    <div id="drawflow"></div>

                    <div class="mt-3">
                        <div class="alert alert-info">
                            <strong>Como usar:</strong>
                            <ul class="mb-0">
                                <li>Clique em "Adicionar Etapa" para criar um novo nó</li>
                                <li>Arraste dos pontos de saída (direita) para pontos de entrada (esquerda) para criar dependências</li>
                                <li>Clique duas vezes em um nó para editá-lo</li>
                                <li>Use o mouse para arrastar e organizar os nós</li>
                                <li>Não esqueça de clicar em "Salvar Cronograma" ao finalizar</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para editar nó -->
    <div class="modal fade" id="nodeModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Etapa</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="nodeForm">
                        <input type="hidden" id="nodeId">
                        <div class="form-group">
                            <label for="nodeName">Nome da Etapa</label>
                            <input type="text" class="form-control" id="nodeName" required>
                        </div>
                        <div class="form-group">
                            <label for="nodeDuration">Duração (dias)</label>
                            <input type="number" class="form-control" id="nodeDuration" min="1" value="1" required>
                        </div>
                        <div class="form-group">
                            <label for="nodeResponsavel">Responsável</label>
                            <input type="text" class="form-control" id="nodeResponsavel">
                        </div>
                        <div class="form-group">
                            <label for="nodeCusto">Custo Estimado (R$)</label>
                            <input type="number" class="form-control" id="nodeCusto" step="0.01" min="0">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveNodeBtn">Salvar</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
<script src="https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.js"></script>
<script>
    let editor;
    let nodeIdCounter = 1;

    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('drawflow');
        editor = new Drawflow(container);
        editor.reroute = true;
        editor.start();

        // Carregar cronograma existente se houver
        @if($cronograma->hasValidDag())
            try {
                const savedDataString = @json($cronograma->json_dag);
                let savedData;
                
                // Se for string, fazer parse
                if (typeof savedDataString === 'string') {
                    savedData = JSON.parse(savedDataString);
                } else {
                    savedData = savedDataString;
                }
                
                console.log('Carregando cronograma salvo:', savedData);
                
                // Carregar dados atualizados dos nós do banco de dados
                const nosFromDB = @json($nos);
                console.log('Nós do banco de dados:', nosFromDB);
                
                // Verificar se tem a estrutura correta
                if (savedData && savedData.drawflow && savedData.drawflow.Home && savedData.drawflow.Home.data) {
                    // Mesclar dados do banco com o Drawflow
                    for (let nodeId in savedData.drawflow.Home.data) {
                        if (nosFromDB[nodeId]) {
                            const dbNode = nosFromDB[nodeId];
                            const drawflowNode = savedData.drawflow.Home.data[nodeId];
                            
                            // Atualizar os dados do nó com os dados mais recentes do banco
                            drawflowNode.data.nome = dbNode.nome;
                            drawflowNode.data.duracao_dias = dbNode.duracao_dias;
                            drawflowNode.data.responsavel = dbNode.responsavel;
                            drawflowNode.data.custo_estimado = dbNode.custo_estimado;
                            
                            // Atualizar o HTML do nó
                            drawflowNode.html = createNodeHTML(
                                dbNode.nome,
                                dbNode.duracao_dias,
                                dbNode.responsavel,
                                dbNode.custo_estimado
                            );
                            
                            console.log(`Nó ${nodeId} sincronizado com banco de dados`);
                        }
                    }
                    
                    editor.import(savedData);
                    
                    // Atualizar contador de IDs
                    const nodes = Object.keys(savedData.drawflow.Home.data);
                    if (nodes.length > 0) {
                        nodeIdCounter = Math.max(...nodes.map(n => parseInt(n))) + 1;
                    }
                    
                    console.log('Cronograma carregado com sucesso. Total de nós:', nodes.length);
                } else {
                    console.warn('Estrutura do cronograma salvo está vazia ou inválida');
                }
            } catch (e) {
                console.error('Erro ao carregar cronograma:', e);
                alert('Erro ao carregar o cronograma salvo. Iniciando um novo cronograma vazio.');
            }
        @else
            console.log('Nenhum cronograma salvo anteriormente. Iniciando vazio.');
        @endif

        // Adicionar novo nó
        document.getElementById('addNodeBtn').addEventListener('click', function() {
            addNewNode();
        });

        // Salvar cronograma
        document.getElementById('saveBtn').addEventListener('click', function() {
            saveCronograma();
        });

        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => editor.zoom_in());
        document.getElementById('zoomOutBtn').addEventListener('click', () => editor.zoom_out());
        document.getElementById('zoomResetBtn').addEventListener('click', () => editor.zoom_reset());

        // Limpar tudo
        document.getElementById('clearBtn').addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todo o cronograma?')) {
                editor.clear();
                nodeIdCounter = 1;
            }
        });

        // Double click para editar nó
        editor.on('nodeSelected', function(id) {
            // Pode adicionar lógica aqui se necessário
        });

        // Salvar edição de nó
        document.getElementById('saveNodeBtn').addEventListener('click', function() {
            const nodeId = document.getElementById('nodeId').value;
            const name = document.getElementById('nodeName').value;
            const duration = document.getElementById('nodeDuration').value;
            const responsavel = document.getElementById('nodeResponsavel').value;
            const custo = document.getElementById('nodeCusto').value;

            if (!name || !duration) {
                alert('Nome e duração são obrigatórios!');
                return;
            }

            if (nodeId) {
                // Editar nó existente
                updateNode(nodeId, name, duration, responsavel, custo);
            } else {
                // Criar novo nó
                const html = createNodeHTML(name, duration, responsavel, custo);
                
                const posX = 100 + (nodeIdCounter * 50);
                const posY = 100 + (Math.random() * 100);

                editor.addNode('node-' + nodeIdCounter, 1, 1, posX, posY, 'node-class', {
                    nome: name,
                    duracao_dias: duration,
                    responsavel: responsavel,
                    custo_estimado: custo
                }, html);

                nodeIdCounter++;
            }

            $('#nodeModal').modal('hide');
        });
    });

    function addNewNode() {
        // Abrir modal para criar novo nó
        document.getElementById('nodeId').value = '';
        document.getElementById('nodeName').value = 'Nova Etapa';
        document.getElementById('nodeDuration').value = '5';
        document.getElementById('nodeResponsavel').value = '';
        document.getElementById('nodeCusto').value = '';
        
        $('#nodeModal').modal('show');
    }

    function createNodeHTML(name, duration, responsavel, custo) {
        let html = `
            <div class="node-header">${name}</div>
            <div class="node-content">
                <div><i class="fas fa-clock"></i> ${duration} dias</div>
        `;
        
        if (responsavel) {
            html += `<div><i class="fas fa-user"></i> ${responsavel}</div>`;
        }
        
        if (custo) {
            html += `<div><i class="fas fa-dollar-sign"></i> R$ ${parseFloat(custo).toFixed(2)}</div>`;
        }
        
        html += `</div>`;
        return html;
    }

    function updateNode(nodeId, name, duration, responsavel, custo) {
        const node = editor.getNodeFromId(nodeId);
        if (node) {
            // Atualizar os dados do nó no Drawflow
            editor.updateNodeDataFromId(nodeId, {
                nome: name,
                duracao_dias: duration,
                responsavel: responsavel,
                custo_estimado: custo
            });

            // Criar novo HTML
            const html = createNodeHTML(name, duration, responsavel, custo);
            
            // Atualizar visualmente
            const nodeElement = document.querySelector(`#node-${nodeId} .drawflow_content_node`);
            if (nodeElement) {
                nodeElement.innerHTML = html;
            }
            
            console.log(`Nó ${nodeId} atualizado:`, {
                nome: name,
                duracao_dias: duration,
                responsavel: responsavel,
                custo_estimado: custo
            });
        }
    }

    function saveCronograma() {
        const exportData = editor.export();
        
        // Preparar dados dos nós com informações completas
        const nodes = [];
        const drawflowData = exportData.drawflow.Home.data;
        
        for (let nodeId in drawflowData) {
            const node = drawflowData[nodeId];
            
            console.log(`Nó ${nodeId} - Data:`, node.data);
            
            // Encontrar TODAS as dependências (inputs) deste nó
            const dependencies = [];
            if (node.inputs && node.inputs.input_1) {
                const connections = node.inputs.input_1.connections;
                if (connections && connections.length > 0) {
                    // Pegar TODAS as conexões de entrada (múltiplas dependências)
                    connections.forEach(connection => {
                        dependencies.push(connection.node);
                    });
                }
            }
            
            console.log(`Nó ${nodeId} - Dependências:`, dependencies);
            
            nodes.push({
                drawflow_id: nodeId, // ID original do nó no Drawflow
                nome: node.data.nome || 'Etapa',
                duracao_dias: parseInt(node.data.duracao_dias) || 1,
                pos_x: Math.round(node.pos_x),
                pos_y: Math.round(node.pos_y),
                responsavel: node.data.responsavel || null,
                custo_estimado: node.data.custo_estimado ? parseFloat(node.data.custo_estimado) : null,
                dependencies: dependencies // Array de IDs dos nós que este depende
            });
        }

        console.log('Salvando nós:', nodes);

        // Enviar para o servidor
        fetch('{{ route("cronogramas.saveDag", $cronograma->id) }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                json_dag: JSON.stringify(exportData),
                nodes: nodes
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cronograma salvo com sucesso!');
            } else {
                alert('Erro ao salvar cronograma');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar cronograma');
        });
    }

    // Permitir editar nó ao dar double-click
    document.addEventListener('dblclick', function(e) {
        if (e.target.closest('.drawflow-node')) {
            const nodeElement = e.target.closest('.drawflow-node');
            const nodeId = nodeElement.id.replace('node-', '');
            const node = editor.getNodeFromId(nodeId);
            
            if (node) {
                document.getElementById('nodeId').value = nodeId;
                document.getElementById('nodeName').value = node.data.nome || '';
                document.getElementById('nodeDuration').value = node.data.duracao_dias || 1;
                document.getElementById('nodeResponsavel').value = node.data.responsavel || '';
                document.getElementById('nodeCusto').value = node.data.custo_estimado || '';
                
                $('#nodeModal').modal('show');
            }
        }
    });
</script>
@endpush
