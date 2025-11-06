# Módulo de Cronograma de Obras - Etapa 1

## 📋 Visão Geral

Este módulo implementa um sistema completo de gestão de obras com editor visual de cronogramas baseado em gráfico de dependências (DAG - Directed Acyclic Graph).

## ✅ Funcionalidades Implementadas

### 1. Gestão de Obras
- ✅ CRUD completo de obras
- ✅ Campos: nome, cliente, tipo, datas, descrição
- ✅ Tipos de obra pré-definidos (pavimentação, escola, unidade de saúde, etc.)
- ✅ Validação de dados
- ✅ Interface AdminLTE responsiva

### 2. Gestão de Cronogramas
- ✅ Criação de cronogramas vinculados a obras
- ✅ Suporte a múltiplos cronogramas por obra
- ✅ Visualização em lista e detalhes

### 3. Editor Visual de Dependências (DAG)
- ✅ Editor baseado em Drawflow (via CDN)
- ✅ Criação visual de etapas (nós)
- ✅ Conexão de dependências entre etapas
- ✅ Edição de propriedades dos nós:
  - Nome da etapa
  - Duração em dias
  - Responsável
  - Custo estimado
- ✅ Controles de zoom e navegação
- ✅ Salvamento do grafo em JSON
- ✅ Persistência de nós no banco de dados

### 4. Visualização de Cronogramas
- ✅ Lista de etapas com detalhes
- ✅ Timeline visual das etapas
- ✅ Exibição de dependências
- ✅ Totalizadores (duração total, custo total)

## 🗄️ Estrutura do Banco de Dados

### Tabela: `obras`
```sql
- id
- nome
- cliente
- tipo_obra
- data_inicio
- data_previsao_fim
- descricao
- timestamps
```

### Tabela: `cronogramas`
```sql
- id
- obra_id (FK)
- nome
- descricao
- json_dag (longtext) -- Estrutura completa do Drawflow
- timestamps
```

### Tabela: `nos`
```sql
- id
- cronograma_id (FK)
- nome
- duracao_dias
- dependencia_id (FK nullable)
- pos_x
- pos_y
- responsavel
- custo_estimado
- timestamps
```

## 🚀 Como Usar

### 1. Acessar o Sistema
1. Faça login no sistema
2. Acesse o menu **"Obras"** na barra lateral

### 2. Cadastrar uma Obra
1. Clique em **"Nova Obra"**
2. Preencha os dados:
   - Nome da obra
   - Cliente
   - Tipo de obra
   - Data de início
   - Previsão de término (opcional)
   - Descrição (opcional)
3. Clique em **"Salvar Obra"**

### 3. Criar um Cronograma
1. Na página de detalhes da obra, clique em **"Novo Cronograma"**
2. Preencha:
   - Nome do cronograma
   - Descrição (opcional)
3. Clique em **"Criar e Ir para o Editor"**

### 4. Montar o Gráfico de Dependências (DAG)
1. No editor visual:
   - Clique em **"Adicionar Etapa"** para criar um novo nó
   - Informe o nome e duração da etapa
   - Arraste os nós para organizá-los visualmente
   - Conecte nós arrastando dos pontos de saída (direita) para pontos de entrada (esquerda)
   - Dê duplo clique em um nó para editar suas propriedades
2. Utilize os controles:
   - **Zoom In/Out**: Para ajustar a visualização
   - **Reset Zoom**: Volta ao zoom padrão
   - **Limpar Tudo**: Remove todos os nós (cuidado!)
3. Clique em **"Salvar Cronograma"** para persistir as alterações

### 5. Visualizar o Cronograma
1. Volte para a página da obra
2. Clique no ícone de visualização (👁️) do cronograma
3. Você verá:
   - Lista detalhada de todas as etapas
   - Timeline visual
   - Totalizadores de duração e custo

## 🎨 Estrutura de Arquivos Criados

```
app/
├── Models/
│   ├── Obra.php
│   ├── Cronograma.php
│   └── No.php
├── Http/Controllers/
│   ├── ObraController.php
│   └── CronogramaController.php

database/migrations/
├── 2025_11_06_132023_create_obras_table.php
├── 2025_11_06_132038_create_cronogramas_table.php
└── 2025_11_06_132104_create_nos_table.php

resources/views/
├── obras/
│   ├── index.blade.php
│   ├── create.blade.php
│   ├── edit.blade.php
│   └── show.blade.php
└── cronogramas/
    ├── create.blade.php
    ├── editor.blade.php
    └── show.blade.php

routes/
└── web.php (rotas adicionadas)

config/
└── adminlte.php (menu adicionado)
```

## 🔗 Rotas Disponíveis

```php
// Obras
GET    /obras              - Lista de obras
GET    /obras/create       - Formulário de nova obra
POST   /obras              - Salvar nova obra
GET    /obras/{id}         - Detalhes da obra
GET    /obras/{id}/edit    - Editar obra
PUT    /obras/{id}         - Atualizar obra
DELETE /obras/{id}         - Excluir obra

// Cronogramas
GET    /obras/{obra}/cronogramas/create    - Novo cronograma
POST   /obras/{obra}/cronogramas           - Salvar cronograma
GET    /cronogramas/{id}                   - Visualizar cronograma
GET    /cronogramas/{id}/editor            - Editor DAG
POST   /cronogramas/{id}/save-dag          - Salvar estrutura DAG
DELETE /cronogramas/{id}                   - Excluir cronograma
```

## 📦 Tecnologias Utilizadas

- **Backend**: Laravel 10+
- **Frontend**: AdminLTE 3 + Bootstrap 4
- **Editor de Grafos**: Drawflow 0.0.60 (via CDN)
- **Banco de Dados**: MySQL 8.0
- **Docker**: Para ambiente de desenvolvimento

## 🔜 Próximas Etapas (Etapa 2)

As próximas funcionalidades a serem implementadas:

1. **Geração de Gráfico de Gantt**
   - Converter o DAG em um cronograma Gantt visual
   - Calcular datas de início/fim de cada etapa
   - Identificar caminho crítico

2. **Relatórios Diários**
   - Registro de atividades diárias
   - Upload de fotos
   - Controle de presença da equipe

3. **Consolidação de Metas**
   - Metas semanais e mensais
   - Indicadores de progresso
   - Gráficos e dashboards

## 🐛 Troubleshooting

### Problema: Não consigo conectar ao banco de dados
**Solução**: Certifique-se de que os containers Docker estão rodando:
```bash
docker compose ps
docker compose up -d
```

### Problema: Erro ao salvar o cronograma
**Solução**: Verifique o console do navegador (F12) para mensagens de erro JavaScript e certifique-se de que o CSRF token está correto.

### Problema: Os nós não aparecem no editor
**Solução**: Verifique se a biblioteca Drawflow foi carregada corretamente (via CDN). Teste sua conexão com a internet.

## 📝 Notas Técnicas

- O JSON do DAG é armazenado na coluna `json_dag` da tabela `cronogramas`
- Os nós individuais são salvos na tabela `nos` para facilitar consultas
- As dependências entre nós são gerenciadas via `dependencia_id`
- O Drawflow é carregado via CDN para facilitar a implementação inicial
- A validação de dados é feita diretamente nos controllers (pode ser movida para Form Requests futuramente)

## 👥 Contribuições

Este módulo foi desenvolvido como parte da Etapa 1 do plano de desenvolvimento do sistema de gestão de obras.

---

**Versão**: 1.0.0  
**Data**: Novembro 2025  
**Status**: ✅ Etapa 1 Completa
