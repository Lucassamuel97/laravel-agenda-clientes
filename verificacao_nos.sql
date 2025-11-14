-- Script de Verificação - Salvamento de Nós
-- Execute este script para verificar se os nós estão sendo salvos corretamente

-- 1. Ver todos os cronogramas
SELECT 
    id,
    obra_id,
    nome,
    CASE 
        WHEN json_dag IS NULL THEN 'Vazio'
        WHEN LENGTH(json_dag) > 100 THEN 'Tem dados'
        ELSE 'Inválido'
    END as status_json,
    created_at
FROM cronogramas
ORDER BY id DESC;

-- 2. Ver nós de um cronograma específico (substitua X pelo ID do cronograma)
SELECT 
    n1.id,
    n1.nome as etapa,
    n1.duracao_dias as duracao,
    n1.responsavel,
    n1.custo_estimado as custo,
    n1.dependencia_id,
    n2.nome as depende_de,
    n1.pos_x,
    n1.pos_y
FROM nos n1
LEFT JOIN nos n2 ON n1.dependencia_id = n2.id
WHERE n1.cronograma_id = 1  -- Altere aqui
ORDER BY n1.id;

-- 3. Verificar se há dependências NULL quando não deveria
SELECT 
    COUNT(*) as total_nos,
    COUNT(dependencia_id) as nos_com_dependencia,
    COUNT(*) - COUNT(dependencia_id) as nos_sem_dependencia
FROM nos
WHERE cronograma_id = 1;  -- Altere aqui

-- 4. Verificar nós com responsável preenchido
SELECT 
    id,
    nome,
    responsavel,
    custo_estimado
FROM nos
WHERE cronograma_id = 1  -- Altere aqui
  AND (responsavel IS NOT NULL OR custo_estimado IS NOT NULL);

-- 5. Ver estrutura de dependências (árvore)
SELECT 
    n1.id,
    CONCAT(REPEAT('  ', COUNT(n2.id) - 1), n1.nome) as hierarquia,
    n1.duracao_dias
FROM nos n1
LEFT JOIN nos n2 ON n1.dependencia_id = n2.id
WHERE n1.cronograma_id = 1  -- Altere aqui
GROUP BY n1.id, n1.nome, n1.duracao_dias
ORDER BY n1.id;

-- 6. Verificar ciclos (dependências circulares) - NÃO DEVE RETORNAR NADA
WITH RECURSIVE ciclos AS (
    SELECT id, dependencia_id, nome, 1 as nivel, CAST(id AS CHAR(200)) as caminho
    FROM nos
    WHERE cronograma_id = 1  -- Altere aqui
    
    UNION ALL
    
    SELECT n.id, n.dependencia_id, n.nome, c.nivel + 1, CONCAT(c.caminho, '->', n.id)
    FROM nos n
    INNER JOIN ciclos c ON n.id = c.dependencia_id
    WHERE n.cronograma_id = 1  -- Altere aqui
      AND c.nivel < 10
      AND FIND_IN_SET(n.id, c.caminho) = 0
)
SELECT * FROM ciclos WHERE nivel > 5;

-- 7. Estatísticas gerais
SELECT 
    c.id as cronograma_id,
    c.nome as cronograma,
    COUNT(n.id) as total_nos,
    SUM(n.duracao_dias) as duracao_total,
    SUM(n.custo_estimado) as custo_total,
    COUNT(DISTINCT n.responsavel) as total_responsaveis
FROM cronogramas c
LEFT JOIN nos n ON c.id = n.cronograma_id
GROUP BY c.id, c.nome
ORDER BY c.id DESC;

-- 8. Nós órfãos (sem conexão de entrada e sem ser o primeiro)
SELECT 
    n1.id,
    n1.nome,
    'Possível nó órfão' as status
FROM nos n1
WHERE n1.cronograma_id = 1  -- Altere aqui
  AND n1.dependencia_id IS NULL
  AND EXISTS (
      SELECT 1 FROM nos n2 
      WHERE n2.cronograma_id = n1.cronograma_id 
        AND n2.id != n1.id
  );

-- 9. Ver último cronograma criado com detalhes
SELECT 
    c.id as cronograma_id,
    c.nome as cronograma,
    c.created_at,
    n.id as no_id,
    n.nome as etapa,
    n.responsavel,
    n.custo_estimado,
    n.dependencia_id,
    n2.nome as depende_de
FROM cronogramas c
LEFT JOIN nos n ON c.id = n.cronograma_id
LEFT JOIN nos n2 ON n.dependencia_id = n2.id
WHERE c.id = (SELECT MAX(id) FROM cronogramas)
ORDER BY n.id;

-- 10. Análise de qualidade dos dados
SELECT 
    'Total de Nós' as metrica,
    COUNT(*) as valor
FROM nos
WHERE cronograma_id = 1  -- Altere aqui

UNION ALL

SELECT 
    'Nós com Responsável',
    COUNT(*)
FROM nos
WHERE cronograma_id = 1  -- Altere aqui
  AND responsavel IS NOT NULL

UNION ALL

SELECT 
    'Nós com Custo',
    COUNT(*)
FROM nos
WHERE cronograma_id = 1  -- Altere aqui
  AND custo_estimado IS NOT NULL

UNION ALL

SELECT 
    'Nós com Dependência',
    COUNT(*)
FROM nos
WHERE cronograma_id = 1  -- Altere aqui
  AND dependencia_id IS NOT NULL;
