# Define o shell padrão
SHELL := /bin/bash

# Comandos Docker Compose
COMPOSE_UP        = docker compose up --build -d
COMPOSE_DOWN      = docker compose down
COMPOSE_EXEC_APP  = docker compose exec app

# Comandos Artisan e Composer
ARTISAN = $(COMPOSE_EXEC_APP) php artisan
COMPOSER = $(COMPOSE_EXEC_APP) composer

# Silenciar saídas padrão
.SILENT:

# Alvos que não são arquivos
.PHONY: help setup setup-full up down stop logs artisan composer npm assets assets-prod test

# Comando padrão: mostra a ajuda
.DEFAULT_GOAL := help

help:  ## Mostra esta mensagem de ajuda
	@echo "📋 Comandos disponíveis no Makefile:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

## --------------------------------------
## Gerenciamento do Ambiente
## --------------------------------------

up: .env  ## Sobe os containers (sem executar comandos do Laravel por padrão)
	@echo "🐳 Subindo containers Docker..."
	$(COMPOSE_UP)
	@sleep 10 # Dê um tempo para o MySQL inicializar
	@echo "🚀 Aplicação (e banco) subindo em segundo plano."
	@echo "Acesse http://localhost:8080 após o setup inicial, se já rodou."

down:      ## Para e remove os containers
	@echo "🛑 Parando e removendo containers..."
	$(COMPOSE_DOWN)

stop:      ## Apenas para os containers, sem remover
	@echo "⏸️ Parando containers..."
	docker compose stop

logs:      ## Mostra os logs de um serviço (ex: make logs service=app)
	@echo "📋 Logs do serviço: $(service)..."
	docker compose logs -f $(service)

## --------------------------------------
## Setup Inicial (executar apenas na primeira vez ou para reinstalação de dependências)
## --------------------------------------

setup: up  ## Executa a configuração inicial do projeto Laravel (SEM assets - mais rápido)
	@echo "📦 Instalando dependências do Composer..."
	$(COMPOSER) install
	@echo "📁 Copiando .env.example para .env (se necessário)..."
	cp -n .env.example .env || true
	@echo "🔑 Gerando chave da aplicação..."
	$(ARTISAN) key:generate
	@echo "🔧 Limpando e cacheando configs..."
	$(ARTISAN) config:clear
	$(ARTISAN) cache:clear
	$(ARTISAN) config:cache
	@echo "🧬 Rodando migrações e seeders..."
	$(ARTISAN) migrate --seed
	@echo "✅ Setup inicial do ambiente concluído! Aplicação rodando em http://localhost:8080"
	@echo "⚠️  ATENÇÃO: Assets não foram compilados. Use 'make assets' se precisar compilar JS/CSS."

setup-full: up  ## Setup completo incluindo instalação e compilação de assets (requer NPM no host)
	@echo "📦 Instalando dependências do Composer..."
	$(COMPOSER) install
	@echo "📁 Copiando .env.example para .env (se necessário)..."
	cp -n .env.example .env || true
	@echo "🔑 Gerando chave da aplicação..."
	$(ARTISAN) key:generate
	@echo "🔧 Limpando e cacheando configs..."
	$(ARTISAN) config:clear
	$(ARTISAN) cache:clear
	$(ARTISAN) config:cache
	@echo "🧬 Rodando migrações e seeders..."
	$(ARTISAN) migrate --seed
	@echo "📦 Instalando dependências NPM..."
	@command -v npm >/dev/null 2>&1 || { echo "❌ NPM não encontrado. Instale Node.js/NPM ou use 'make setup' sem assets."; exit 1; }
	npm install
	@echo "⚙️ Compilando assets..."
	npm run dev
	@echo "✅ Setup completo concluído! Aplicação rodando em http://localhost:8080"

.env:
	@if [ ! -f .env ]; then \
		echo "Copiando .env.example para .env..."; \
		cp .env.example .env; \
	fi

## --------------------------------------
## Comandos Auxiliares
## --------------------------------------

artisan:   ## Executa um comando Artisan (ex: make artisan cmd="migrate:fresh")
	@echo "⚙️ Executando: php artisan $(cmd)"
	$(ARTISAN) $(cmd)

composer:  ## Executa um comando Composer (ex: make composer cmd="require spatie/laravel-permission")
	@echo "🎼 Executando: composer $(cmd)"
	$(COMPOSER) $(cmd)

npm:       ## Executa um comando npm no host (ex: make npm cmd="run dev")
	@command -v npm >/dev/null 2>&1 || { echo "❌ NPM não encontrado. Instale Node.js primeiro."; exit 1; }
	@echo "📦 Executando: npm $(cmd)"
	npm $(cmd)

assets:    ## Instala dependências NPM e compila assets (requer NPM no host)
	@command -v npm >/dev/null 2>&1 || { echo "❌ NPM não encontrado. Instale Node.js/NPM primeiro."; exit 1; }
	@echo "📦 Instalando dependências NPM..."
	npm install
	@echo "⚙️ Compilando assets..."
	npm run dev
	@echo "✅ Assets compilados com sucesso!"

assets-prod:  ## Compila assets para produção (requer NPM no host)
	@command -v npm >/dev/null 2>&1 || { echo "❌ NPM não encontrado. Instale Node.js/NPM primeiro."; exit 1; }
	@echo "📦 Instalando dependências NPM..."
	npm install
	@echo "⚙️ Compilando assets para produção..."
	npm run build
	@echo "✅ Assets de produção compilados com sucesso!"
	
test:  ## Executa os testes com config:clear antes
	@echo "🧹 Limpando cache de configuração..."
	$(ARTISAN) config:clear
	@echo "✅ Rodando testes (ambiente .env.testing)..."
	APP_ENV=testing $(ARTISAN) test
