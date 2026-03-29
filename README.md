# 🚀 SeedaBit NestJS Template

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-v11.0.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v6.16.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[![CI](https://github.com/seedabit/nestjs-template/actions/workflows/ci.yml/badge.svg)](https://github.com/seedabit/nestjs-template/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/seedabit/nestjs-template/branch/main/graph/badge.svg)](https://codecov.io/gh/seedabit/nestjs-template)

**Template backend production-ready com autenticação JWT, Swagger, Prisma e Docker**

[Documentação](#-documentação) • [Quick Start](#-quick-start) • [Features](#-features) • [Contribuir](#-contribuindo)

</div>

---

## 📖 Sobre o Template

Template oficial da **SeedaBit Systems** para projetos backend utilizando NestJS. Este template foi criado baseado em projetos reais da empresa, consolidando as melhores práticas e padrões de desenvolvimento.

### 🎯 Objetivo

Fornecer uma base sólida e padronizada para que qualquer desenvolvedor possa iniciar um novo projeto backend em minutos, com toda a estrutura essencial já configurada.

---

## ✨ Features

### ✅ Já Implementado

- 🔐 **Autenticação JWT completa**
  - Login e registro de usuários
  - Proteção de rotas com Guards
  - Sistema de Roles (USER, ADMIN, SUPERADMIN)
  - Hash de senhas com bcrypt

- 📚 **Documentação Swagger/OpenAPI**
  - Interface interativa em `/api`
  - Documentação automática de endpoints
  - Suporte a Bearer Authentication

- 🗄️ **Prisma ORM**
  - Type-safe database access
  - Migrations automáticas
  - PostgreSQL configurado

- 🐳 **Docker completo**
  - Dockerfile otimizado (multi-stage build)
  - docker-compose com PostgreSQL e pgAdmin
  - Ambiente de desenvolvimento pronto

- ✅ **Validação de dados**
  - class-validator e class-transformer
  - DTOs tipados e validados
  - Mensagens de erro customizadas

- 🧪 **Testes configurados**
  - Jest para testes unitários
  - Supertest para testes E2E
  - Cobertura de código

- 🎨 **Qualidade de código**
  - ESLint (flat config)
  - Prettier configurado
  - Hooks de pre-commit (futuro)

- 📦 **Estrutura modular**
  - Arquitetura escalável
  - Módulos reutilizáveis
  - Separation of concerns

### 🔮 Roadmap

- [ ] Sistema de logs com Winston/Pino
- [ ] Rate limiting
- [ ] Compressão de respostas (gzip)
- [ ] Health checks
- [ ] Metrics com Prometheus
- [ ] CI/CD com GitHub Actions
- [ ] Suporte a migrations automáticas
- [ ] Seed de dados inicial

---

## 🛠️ Stack Tecnológica

### Core
- **NestJS** v11.0.1 - Framework Node.js progressivo
- **TypeScript** v5.7.3 - Superset tipado do JavaScript
- **Node.js** ≥18.x - Runtime JavaScript

### Banco de Dados
- **Prisma** v6.16.3 - ORM moderno e type-safe
- **PostgreSQL** 15 - Banco de dados relacional

### Autenticação
- **@nestjs/jwt** - JSON Web Tokens
- **@nestjs/passport** - Estratégias de autenticação
- **passport-jwt** - Estratégia JWT do Passport
- **bcrypt** - Hashing de senhas

### Validação
- **class-validator** - Validação declarativa
- **class-transformer** - Transformação de objetos

### Documentação
- **@nestjs/swagger** - Geração automática de docs
- **swagger-ui-express** - Interface visual

### Qualidade
- **ESLint** - Linter de código
- **Prettier** - Formatador de código
- **Jest** - Framework de testes

### DevOps
- **Docker** - Containerização
- **docker-compose** - Orquestração de containers

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18.x ou superior ([Download](https://nodejs.org/))
- **npm** versão 9.x ou superior (vem com Node.js)
- **Docker** e **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

Opcional mas recomendado:
- **VSCode** com extensões: ESLint, Prettier, Prisma
- **Postman** ou **Insomnia** para testar APIs

---

## 🚀 Quick Start

### Opção 1: Usar como Template no GitHub

1. Clique no botão **"Use this template"** no topo da página do repositório
2. Clone seu novo repositório:
```bash
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto
```

### Opção 2: Clonar diretamente

```bash
# Clonar o repositório
git clone https://github.com/seedabit/seedabit-nestjs-template.git meu-projeto
cd meu-projeto

# Remover origin do template
git remote remove origin

# Adicionar seu próprio repositório
git remote add origin https://github.com/seu-usuario/seu-projeto.git
```

### 3️⃣ Instalação e Configuração

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# Mínimo necessário: DATABASE_URL e JWT_SECRET
```

### 4️⃣ Iniciar com Docker (Recomendado)

```bash
# Subir banco de dados e serviços
docker-compose up -d

# Aplicar migrations do Prisma
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar aplicação em modo desenvolvimento
npm run dev
```

### 5️⃣ Iniciar sem Docker

```bash
# Certifique-se de ter PostgreSQL instalado e rodando
# Configure DATABASE_URL no .env

# Aplicar migrations
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar aplicação
npm run dev
```

### 6️⃣ Acessar a aplicação

- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api
- **pgAdmin:** http://localhost:8080 (se usando Docker)

---

## 📁 Estrutura do Projeto

```
seedabit-nestjs-template/
├── docker/                          # Configurações Docker
│   ├── Dockerfile                   # Container da aplicação
│   └── docker-compose.yml           # Orquestração de serviços
│
├── docs/                            # Documentação adicional
│   ├── SETUP.md                     # Guia de setup detalhado
│   ├── MODULE_CREATION.md           # Como criar módulos
│   ├── AUTHENTICATION.md            # Guia de autenticação
│   └── TESTING.md                   # Guia de testes
│
├── prisma/                          # Configuração Prisma
│   ├── schema.prisma                # Schema do banco de dados
│   └── migrations/                  # Migrations versionadas
│
├── src/                             # Código-fonte
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Módulo raiz
│   │
│   ├── auth/                        # 🔐 Módulo de Autenticação
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts       # POST /auth/login, /auth/register
│   │   ├── auth.service.ts          # Lógica de autenticação
│   │   ├── jwt.strategy.ts          # Estratégia JWT
│   │   ├── jwt-auth.guard.ts        # Guard de proteção
│   │   ├── roles.decorator.ts       # Decorator @Roles()
│   │   ├── roles.guard.ts           # Guard de autorização
│   │   └── dto/                     # DTOs de autenticação
│   │
│   ├── user/                        # 👤 Módulo de Usuários
│   │   ├── user.module.ts
│   │   ├── user.controller.ts       # CRUD de usuários
│   │   ├── user.service.ts          # Lógica de negócio
│   │   └── dto/                     # DTOs de usuários
│   │
│   ├── prisma/                      # 🗄️ Módulo Prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts        # Conexão com banco
│   │
│   ├── common/                      # 🔧 Recursos Compartilhados
│   │   ├── filters/                 # Exception filters
│   │   ├── interceptors/            # Interceptors globais
│   │   ├── decorators/              # Decorators customizados
│   │   └── enums/                   # Enums compartilhados
│   │
│   └── config/                      # ⚙️ Configurações
│       ├── database.config.ts
│       └── jwt.config.ts
│
├── test/                            # Testes
│   ├── app.e2e-spec.ts             # Testes E2E
│   └── jest-e2e.json               # Config Jest E2E
│
├── .env.example                     # Template de variáveis
├── .gitignore                       # Arquivos ignorados
├── .prettierrc                      # Config Prettier
├── eslint.config.mjs               # Config ESLint
├── nest-cli.json                   # Config NestJS CLI
├── package.json                    # Dependências e scripts
├── tsconfig.json                   # Config TypeScript
└── README.md                        # Este arquivo
```

---

## ⚙️ Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Ambiente
NODE_ENV=development
PORT=3000

# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seedabit_db"

# JWT
JWT_SECRET="CHANGE-THIS-IN-PRODUCTION-USE-STRONG-SECRET"
JWT_EXPIRES_IN="7d"

# Docker (se usando docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=seedabit_db
PGADMIN_EMAIL=admin@seedabit.com
PGADMIN_PASSWORD=admin
```

### 🔒 Segurança

- **NUNCA** commite o arquivo `.env`
- Gere um `JWT_SECRET` forte em produção:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Use variáveis de ambiente diferentes por ambiente (dev, staging, prod)

---

## 📜 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia em modo watch (hot reload)
npm run start:debug      # Inicia em modo debug
```

### Build e Produção
```bash
npm run build            # Compila o projeto
npm run start:prod       # Inicia versão de produção
```

### Qualidade de Código
```bash
npm run lint             # Verifica e corrige problemas ESLint
npm run format           # Formata código com Prettier
npm run lint:check       # Apenas verifica (não corrige)
npm run format:check     # Apenas verifica formatação
```

### Testes
```bash
npm test                 # Roda testes unitários
npm run test:watch       # Testes em modo watch
npm run test:cov         # Testes com cobertura
npm run test:e2e         # Testes end-to-end
npm run test:debug       # Testes em modo debug
```

### Prisma
```bash
npm run prisma:migrate   # Cria e aplica migration
npm run prisma:generate  # Gera Prisma Client
npm run prisma:studio    # Abre interface visual
npm run prisma:seed      # Popula banco com dados
```

### Docker
```bash
npm run docker:up        # Sobe containers
npm run docker:down      # Para containers
npm run docker:logs      # Mostra logs
npm run docker:build     # Rebuilda imagens
```

---

## 🔐 Autenticação

O template já vem com sistema completo de autenticação JWT.

### Endpoints disponíveis

**POST** `/auth/register` - Registrar novo usuário
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**POST** `/auth/login` - Fazer login
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protegendo rotas

```typescript
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../common/enums/role.enum'

@Controller('users')
export class UserController {
  // Rota protegida - apenas usuários autenticados
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user) {
    return user
  }

  // Rota protegida - apenas admins
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll()
  }
}
```

### Testando no Swagger

1. Acesse http://localhost:3000/api
2. Faça POST em `/auth/login`
3. Copie o `access_token` da resposta
4. Clique no botão **"Authorize"** no topo
5. Cole o token no formato: `Bearer seu-token-aqui`
6. Agora você pode acessar rotas protegidas!

---

## 🗄️ Banco de Dados (Prisma)

### Criar nova migration

```bash
# Edite prisma/schema.prisma com suas mudanças
# Exemplo: adicionar novo model

npx prisma migrate dev --name add_posts_table
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Prisma Studio (GUI)

```bash
npx prisma studio
# Acesse http://localhost:5555
```

### Exemplo de uso no código

```typescript
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // Não retorna password
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    })
  }
}
```

---

## 🧪 Testes

### Estrutura de testes

```
src/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts      ← Testes unitários
test/
└── auth.e2e-spec.ts              ← Testes E2E
```

### Rodando testes

```bash
# Todos os testes unitários
npm test

# Testes em modo watch (recomendado durante desenvolvimento)
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Exemplo de teste unitário

```typescript
describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should hash password on register', async () => {
    const result = await service.register({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123'
    })
    
    expect(result.password).not.toBe('password123')
  })
})
```

---

## 🐳 Docker

### Serviços disponíveis

O `docker-compose.yml` configura:

- **postgres** - PostgreSQL 15 (porta 5432)
- **pgadmin** - Interface web do PostgreSQL (porta 8080)
- **app** - Aplicação NestJS (porta 3000)

### Comandos úteis

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar serviços
docker-compose down

# Rebuild após mudanças no Dockerfile
docker-compose up -d --build

# Acessar shell do container
docker-compose exec app sh

# Limpar volumes (⚠️ apaga dados do banco)
docker-compose down -v
```

### Acessar pgAdmin

1. Abra http://localhost:8080
2. Login: `admin@seedabit.com` / `admin`
3. Adicionar servidor:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

---

## 📚 Documentação

### Documentação principal
- [Setup Detalhado](docs/SETUP.md)
- [Criação de Módulos](docs/MODULE_CREATION.md)
- [Guia de Autenticação](docs/AUTHENTICATION.md)
- [Guia de Testes](docs/TESTING.md)

### Documentação externa
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

---

## 🎨 Padrões e Convenções

### Nomenclatura de arquivos
- Módulos: `*.module.ts`
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- DTOs: `create-*.dto.ts`, `update-*.dto.ts`
- Guards: `*-auth.guard.ts`
- Testes: `*.spec.ts`, `*.e2e-spec.ts`

### Nomenclatura de código
- Classes: `PascalCase`
- Variáveis/funções: `camelCase`
- Constantes: `UPPER_CASE`
- Interfaces: `PascalCase` com prefixo `I` (opcional)

### Estrutura de commit
```
feat: adiciona novo módulo de posts
fix: corrige validação de email
docs: atualiza README com exemplos
refactor: melhora estrutura de auth
test: adiciona testes para user service
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Checklist antes do PR
- [ ] Código passa em `npm run lint`
- [ ] Código formatado com `npm run format`
- [ ] Testes passando: `npm test`
- [ ] Documentação atualizada se necessário
- [ ] Commit messages seguem convenção

---

## 📝 Licença

Copyright © 2025 SeedaBit Systems, Inc - Todos os direitos reservados

Este software é proprietário e confidencial. Cópia não autorizada deste arquivo, via qualquer meio, é estritamente proibida.

---

## 👥 Autores

- **Elton Oliveira** - *Desenvolvimento inicial* - [eltoncostadev@gmail.com](mailto:eltoncostadev@gmail.com)
- **Equipe SeedaBit** - *Contribuições e manutenção*

---

## 🆘 Suporte

Encontrou um bug ou tem uma sugestão?

- 📧 Email: dev@seedabit.com
- 🐛 Issues: [GitHub Issues](https://github.com/seedabit/seedabit-nestjs-template/issues)
- 📖 Docs: [Documentação Completa](docs/)

---

<div align="center">

**Feito com ❤️ pela equipe SeedaBit Systems**

[⬆ Voltar ao topo](#-seedabit-nestjs-template)

</div>