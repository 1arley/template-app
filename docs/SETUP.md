# 🚀 Guia de Setup - SeedaBit NestJS Template

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** >= 9.x (vem com Node.js)
- **Docker** e **Docker Compose** (opcional, mas recomendado) ([Download](https://www.docker.com/))
- **PostgreSQL** 15+ (se não usar Docker) ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))

---

## 🎯 Método 1: Setup com Docker (Recomendado)

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/seedabit/nestjs-template.git meu-projeto
cd meu-projeto
```

### Passo 2: Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seedabit_db?schema=public"

# JWT
JWT_SECRET="seu-segredo-super-forte-aqui"
JWT_EXPIRES_IN="7d"

# Docker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=seedabit_db

PGADMIN_EMAIL=admin@seedabit.com
PGADMIN_PASSWORD=admin
```

### Passo 3: Iniciar Containers Docker

```bash
npm run docker:up
```

Este comando irá:
- ✅ Criar e iniciar o container PostgreSQL
- ✅ Criar e iniciar o container pgAdmin
- ✅ Criar e iniciar o container da aplicação
- ✅ Aplicar migrations automaticamente
- ✅ Popular o banco com dados de teste (seed)

### Passo 4: Acessar a Aplicação

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (email: admin@seedabit.com, senha: admin)

### Comandos Docker Úteis

```bash
# Ver logs dos containers
npm run docker:logs

# Parar containers
npm run docker:down

# Rebuild containers
npm run docker:build

# Acessar shell do container da aplicação
docker exec -it seedabit-app-dev sh

# Acessar PostgreSQL
docker exec -it seedabit-postgres psql -U postgres -d seedabit_db
```

---

## 🛠️ Método 2: Setup sem Docker (Instalação Local)

### Passo 1: Clonar e Configurar

```bash
git clone https://github.com/seedabit/nestjs-template.git meu-projeto
cd meu-projeto
cp .env.example .env
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie um banco:

```sql
CREATE DATABASE seedabit_db;
```

Atualize o `.env` com a connection string correta:

```env
DATABASE_URL="postgresql://seu_user:sua_senha@localhost:5432/seedabit_db?schema=public"
```

### Passo 4: Executar Migrations e Seeds

```bash
# Gerar Prisma Client
npm run prisma:generate

# Aplicar migrations
npm run prisma:migrate

# Popular banco com dados de teste
npm run prisma:seed
```

### Passo 5: Iniciar Aplicação

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# OU modo padrão
npm run start:dev
```

---

## 🧪 Verificar Instalação

### 1. Testar Health Check

```bash
curl http://localhost:3000/api
```

Resposta esperada:
```json
{
  "message": "SeedaBit NestJS Template API",
  "version": "1.0.0",
  "timestamp": "2025-10-24T10:00:00.000Z"
}
```

### 2. Testar Autenticação

Acesse o Swagger: http://localhost:3000/api/docs

Faça login com um dos usuários de teste:

**SUPERADMIN:**
- Email: `superadmin@seedabit.com`
- Senha: `admin123`

**ADMIN:**
- Email: `admin@seedabit.com`
- Senha: `admin123`

**USER:**
- Email: `user@seedabit.com`
- Senha: `user123`

### 3. Testar Endpoint Protegido

No Swagger:
1. Faça login em `/auth/login`
2. Copie o `access_token`
3. Clique em "Authorize" no topo da página
4. Cole o token
5. Teste o endpoint `/users` (apenas ADMIN/SUPERADMIN)

---

## 🗄️ Comandos Prisma Úteis

```bash
# Gerar Prisma Client após mudanças no schema
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Abrir Prisma Studio (GUI para o banco)
npm run prisma:studio

# Popular banco novamente
npm run prisma:seed

# Reset completo do banco
npx prisma migrate reset
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento
npm run start:debug      # Inicia com debug habilitado

# Build & Produção
npm run build            # Compila o projeto
npm run start:prod       # Inicia em modo produção

# Qualidade de Código
npm run lint             # Executa ESLint e corrige
npm run lint:check       # Apenas verifica erros
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação

# Testes
npm run test             # Executa testes unitários
npm run test:watch       # Testes em watch mode
npm run test:cov         # Testes com coverage
npm run test:e2e         # Testes end-to-end

# Docker
npm run docker:up        # Inicia containers
npm run docker:down      # Para containers
npm run docker:logs      # Ver logs
npm run docker:build     # Rebuild imagens
```

---

## 🚨 Troubleshooting

### Erro: "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Erro: "Prisma Client not generated"

```bash
npm run prisma:generate
```

### Erro: "Can't connect to database"

Verifique:
1. PostgreSQL está rodando
2. Credenciais no `.env` estão corretas
3. Porta 5432 não está em uso

### Erro: Docker não inicia

```bash
# Limpar containers e volumes
docker-compose down -v
docker system prune -a

# Reiniciar Docker
```

### Migrations não aplicadas

```bash
# Verificar status
npx prisma migrate status

# Aplicar pendentes
npx prisma migrate deploy

# Reset completo (CUIDADO: apaga dados)
npx prisma migrate reset
```

---

## 📚 Próximos Passos

- ✅ Leia [MODULE_CREATION.md](./MODULE_CREATION.md) para criar novos módulos
- ✅ Leia [AUTHENTICATION.md](./AUTHENTICATION.md) para entender autenticação
- ✅ Leia [TESTING.md](./TESTING.md) para escrever testes
- ✅ Configure CI/CD no GitHub Actions
- ✅ Customize para seu projeto

---

## 💡 Dicas

1. **Use TypeScript paths**: Imports absolutos já configurados (@auth/*, @user/*, etc)
2. **Swagger sempre atualizado**: Documente com decorators @ApiProperty, @ApiOperation
3. **Validação automática**: Use class-validator nos DTOs
4. **Logs estruturados**: LoggingInterceptor já configurado
5. **Erros padronizados**: HttpExceptionFilter trata tudo

---

## 🆘 Suporte

- 📧 Email: suporte@seedabit.com
- 📝 Issues: [GitHub Issues](https://github.com/seedabit/nestjs-template/issues)
- 📚 Docs NestJS: https://docs.nestjs.com
- 📚 Docs Prisma: https://www.prisma.io/docs
