# 📋 Guia de Comandos do Makefile

Este projeto utiliza um `Makefile` para automatizar tarefas comuns de desenvolvimento. Este guia explica todos os comandos disponíveis.

## 🚀 Comandos Rápidos

```bash
make help        # Ver todos os comandos disponíveis
make setup       # Setup inicial rápido (recomendado)
make up          # Subir containers
make down        # Parar e remover containers
```

---

## 📦 Comandos de Setup

### `make setup` (Recomendado)
**Setup inicial rápido sem compilação de assets**

```bash
make setup
```

O que faz:
- ✅ Sobe todos os containers Docker (Laravel, MySQL, Redis, Soketi, WPPConnect)
- ✅ Instala dependências do Composer
- ✅ Cria o arquivo `.env` (se não existir)
- ✅ Gera a chave da aplicação Laravel
- ✅ Limpa e cacheia as configurações
- ✅ Roda migrações e seeders
- ❌ NÃO compila assets (CSS/JS)

**Vantagens:**
- Mais rápido (não precisa de Node.js/NPM)
- Ideal para desenvolvimento de API
- Ideal para backend puro

---

### `make setup-full`
**Setup completo incluindo compilação de assets**

```bash
make setup-full
```

O que faz:
- Tudo que o `make setup` faz
- ✅ Instala dependências NPM
- ✅ Compila assets (CSS/JS) para desenvolvimento

**Requisitos:**
- Node.js e NPM instalados no host

**Quando usar:**
- Quando você precisa do frontend completo
- Primeira vez configurando em máquina nova com Node.js

---

## 🐳 Gerenciamento de Containers

### `make up`
**Sobe os containers Docker**

```bash
make up
```

Apenas sobe os containers sem executar comandos do Laravel. Use depois do primeiro `make setup`.

---

### `make down`
**Para e remove os containers**

```bash
make down
```

Remove os containers mas mantém os volumes (seus dados não são perdidos).

---

### `make stop`
**Apenas para os containers**

```bash
make stop
```

Para os containers sem removê-los. Use `docker compose start` para iniciar novamente.

---

### `make logs`
**Visualiza logs de um serviço**

```bash
make logs service=app           # Logs do Laravel
make logs service=mysql         # Logs do MySQL
make logs service=redis         # Logs do Redis
make logs service=soketi        # Logs do Soketi (WebSocket)
make logs service=wppconnect    # Logs do WPPConnect
```

Exibe logs em tempo real (use Ctrl+C para sair).

---

## 🛠️ Comandos de Desenvolvimento

### `make artisan`
**Executa comandos do Artisan**

```bash
# Exemplos:
make artisan cmd="migrate"
make artisan cmd="migrate:fresh --seed"
make artisan cmd="make:model Post -m"
make artisan cmd="make:controller PostController --resource"
make artisan cmd="db:seed"
make artisan cmd="cache:clear"
make artisan cmd="config:clear"
make artisan cmd="route:list"
make artisan cmd="tinker"
```

---

### `make composer`
**Executa comandos do Composer**

```bash
# Exemplos:
make composer cmd="install"
make composer cmd="update"
make composer cmd="require spatie/laravel-permission"
make composer cmd="require --dev barryvdh/laravel-debugbar"
make composer cmd="dump-autoload"
```

---

### `make npm`
**Executa comandos do NPM no host**

```bash
# Exemplos:
make npm cmd="install"
make npm cmd="run dev"
make npm cmd="run build"
make npm cmd="run watch"
make npm cmd="install axios"
```

**Requisito:** Node.js/NPM instalado no host.

---

### `make assets`
**Instala dependências NPM e compila assets para desenvolvimento**

```bash
make assets
```

Equivalente a:
```bash
npm install
npm run dev
```

**Requisito:** Node.js/NPM instalado no host.

---

### `make assets-prod`
**Compila assets para produção**

```bash
make assets-prod
```

Equivalente a:
```bash
npm install
npm run build
```

Gera arquivos minificados e otimizados.

**Requisito:** Node.js/NPM instalado no host.

---

### `make test`
**Executa os testes do PHPUnit**

```bash
make test
```

Limpa o cache de configuração e roda todos os testes.

---

## 🔄 Workflows Comuns

### Primeira vez no projeto

```bash
git clone <repositorio>
cd laravel-agenda-clientes
make setup                    # Setup rápido (recomendado)
# OU
make setup-full              # Se você tem Node.js e precisa dos assets
```

### Dia a dia de desenvolvimento

```bash
make up                      # Subir containers
make logs service=app        # Ver logs (em outro terminal)
make artisan cmd="migrate"   # Rodar migrations
make test                    # Rodar testes
```

### Atualizar dependências

```bash
make composer cmd="update"
make assets                  # Se você usa frontend
```

### Resetar banco de dados

```bash
make artisan cmd="migrate:fresh --seed"
```

### Limpar caches

```bash
make artisan cmd="cache:clear"
make artisan cmd="config:clear"
make artisan cmd="route:clear"
make artisan cmd="view:clear"
```

### Parar tudo

```bash
make down
```

---

## 🆘 Troubleshooting

### "service app is not running"

```bash
make down
make up
docker compose logs app
```

### "Composer install failed"

```bash
docker compose run --rm app composer install
docker compose up -d app
```

### "NPM not found"

Você tem duas opções:

1. **Instalar Node.js/NPM** no seu host
2. **Usar apenas `make setup`** (sem assets) se você só precisa da API

### Ver status dos containers

```bash
docker compose ps
```

### Acessar o container

```bash
docker compose exec app bash
```

---

## 📚 Recursos

- [Documentação do Laravel](https://laravel.com/docs)
- [Documentação do Docker](https://docs.docker.com/)
- [Documentação do Make](https://www.gnu.org/software/make/manual/)

---

## 🔗 Links Úteis do Projeto

- **Aplicação Laravel:** http://localhost:8080
- **MySQL:** localhost:3306
- **Redis:** localhost:6379
- **Soketi WebSocket:** http://localhost:6001
- **Soketi Dashboard:** http://localhost:9601
- **WPPConnect:** http://localhost:21465

---

**💡 Dica:** Execute `make help` a qualquer momento para ver todos os comandos disponíveis!
