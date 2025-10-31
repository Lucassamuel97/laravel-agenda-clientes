# Laravel AdminLTE v3 Starter

🚀 Projeto base para aplicações administrativas em Laravel 10 com **AdminLTE 3** totalmente integrado. Ideal para iniciar rapidamente o desenvolvimento de painéis administrativos modernos, com um ambiente pronto para desenvolvimento local usando **Docker** e um **Makefile** com comandos automatizados.

## 🧰 Tecnologias Utilizadas

- **Laravel 10**
- **AdminLTE 3** (via `jeroennoten/laravel-adminlte`)
- **PHP 8.2+**
- **MySQL 8**
- **Docker + Docker Compose**
- **Makefile** (automação de setup e execução)

---

## 📁 Estrutura do Projeto

Este projeto já vem com:

- Laravel 10 instalado e configurado
- Pacote AdminLTE pré-configurado
- Docker Compose para ambiente de desenvolvimento local
- Makefile com comandos para facilitar o uso
- CRUD básico de *Produtos* para demonstração
- CRUD básico de usuários para administradores
- Configuração de autenticação padrão
- Migrações e seeders para usuários

---

## 🚀 Como Começar

### 1. Pré-requisitos

**Obrigatórios:**
- [Docker](https://www.docker.com/) e Docker Compose V2
- [Make](https://www.gnu.org/software/make/)

**Opcionais (para compilação de assets):**
- [Node.js e NPM](https://nodejs.org/) - apenas se for compilar CSS/JS

---

### 2. Subir o Projeto

#### Opção 1: Setup Rápido (Recomendado - SEM assets)

Execute no terminal:

```bash
make setup
```

Esse comando irá:

- Subir os containers com Docker (Laravel, MySQL, Redis, Soketi, WPPConnect)
- Instalar dependências do Composer
- Criar o arquivo `.env` se necessário
- Gerar a chave da aplicação
- Limpar e cachear as configurações
- Rodar as migrações e seeders

**⚠️ Este comando NÃO compila assets** (mais rápido, ideal para desenvolvimento de API)

#### Opção 2: Setup Completo (COM assets)

Se você precisa dos assets compilados (CSS/JS):

```bash
make setup-full
```

Este comando faz tudo do `setup` + instalação de dependências NPM e compilação de assets.

**Requisito:** Node.js/NPM instalado no host.

#### Compilar Assets Separadamente

Se já fez o setup e quer apenas compilar os assets depois:

```bash
make assets        # Para desenvolvimento (com watch)
make assets-prod   # Para produção (minificado)
```

Após finalizado, a aplicação estará disponível em: [http://localhost:8080](http://localhost:8080)

**Usuário Padrão:** `admin@admin.com`  
**Senha:** `password`

---

## 🛠️ Comandos Úteis

Todos os comandos são executados via `make`. Para ver todos os comandos disponíveis:

```bash
make help
```

### Comandos Principais

| Comando                | Descrição                                               |
|------------------------|--------------------------------------------------------|
| `make help`            | Mostra todos os comandos disponíveis                   |
| `make setup`           | Setup inicial rápido (SEM assets)                      |
| `make setup-full`      | Setup completo (COM assets - requer NPM)               |
| `make up`              | Sobe os containers Docker                              |
| `make down`            | Para e remove os containers Docker                     |
| `make stop`            | Apenas para os containers (sem remover)                |
| `make logs service=app`| Exibe os logs do serviço especificado                  |

### Comandos de Desenvolvimento

| Comando                | Descrição                                               |
|------------------------|--------------------------------------------------------|
| `make artisan cmd="migrate"`     | Executa comandos do Artisan            |
| `make composer cmd="install"`    | Executa comandos do Composer           |
| `make npm cmd="run dev"`         | Executa comandos do NPM                |
| `make assets`                    | Compila assets (dev mode)              |
| `make assets-prod`               | Compila assets (produção)              |
| `make test`                      | Executa os testes do PHPUnit           |

### Exemplos de Uso

```bash
# Ver logs do Laravel em tempo real
make logs service=app

# Criar uma nova migration
make artisan cmd="make:migration create_posts_table"

# Rodar migrações
make artisan cmd="migrate"

# Limpar cache
make artisan cmd="cache:clear"

# Instalar um novo pacote
make composer cmd="require spatie/laravel-permission"

# Compilar assets e assistir mudanças
make npm cmd="run dev"
```

---

## 🧑‍💻 Contribuindo

Sinta-se à vontade para clonar este projeto e adaptá-lo conforme as necessidades da sua aplicação.

```bash
git clone https://github.com/seu-usuario/laravel-adminlte-v3-starter.git
cd laravel-adminlte-v3-starter
make setup
```

---

❤️ **Créditos**  
Este projeto utiliza:

- [Laravel](https://laravel.com/)
- [AdminLTE](https://adminlte.io/)
- [Laravel-AdminLTE](https://github.com/jeroennoten/Laravel-AdminLTE)
