# 🔐 Guia de Autenticação - SeedaBit NestJS Template

## 📖 Visão Geral

Este template utiliza **JWT (JSON Web Tokens)** para autenticação e um sistema de **Roles** (papéis) para autorização.

### Tecnologias Utilizadas

- **@nestjs/jwt**: Geração e validação de tokens JWT
- **@nestjs/passport**: Estratégias de autenticação
- **passport-jwt**: Estratégia JWT para Passport
- **bcrypt**: Hash de senhas

---

## 🔑 Como Funciona a Autenticação

### 1. Registro de Usuário

Endpoint: `POST /api/auth/register`

```typescript
// Request Body
{
  "name": "João Silva",
  "email": "joao@seedabit.com",
  "password": "senha123",
  "role": "USER" // Opcional, padrão é USER
}

// Response
{
  "message": "Usuário cadastrado com sucesso.",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@seedabit.com",
    "role": "USER",
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  }
}
```

**O que acontece:**
1. Verifica se o email já existe
2. Faz hash da senha com bcrypt (salt 10)
3. Cria o usuário no banco
4. Retorna usuário SEM a senha

### 2. Login

Endpoint: `POST /api/auth/login`

```typescript
// Request Body
{
  "email": "joao@seedabit.com",
  "password": "senha123"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@seedabit.com",
    "role": "USER",
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  }
}
```

**O que acontece:**
1. Busca usuário por email
2. Compara senha com bcrypt.compare()
3. Gera JWT token com payload: { sub: userId, email, role }
4. Retorna token + dados do usuário (sem senha)

### 3. Validação do Token

Quando você envia o token em requisições protegidas:

```typescript
// Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**O que acontece:**
1. JwtAuthGuard extrai o token do header
2. JWT Strategy valida a assinatura
3. Busca o usuário no banco pelo ID do payload
4. Adiciona o usuário completo no `request.user`

---

## 🛡️ Sistema de Roles (Papéis)

### Roles Disponíveis

```typescript
enum Role {
  USER = 'USER',           // Usuário comum
  ADMIN = 'ADMIN',         // Administrador
  SUPERADMIN = 'SUPERADMIN' // Super Administrador
}
```

### Hierarquia de Permissões

- **USER**: Acesso básico, pode ver e editar seus próprios dados
- **ADMIN**: Pode gerenciar usuários, criar/editar/deletar recursos
- **SUPERADMIN**: Acesso total ao sistema

---

## 🔒 Como Proteger Rotas

### 1. Proteger com Autenticação (Apenas usuários logados)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('example')
@UseGuards(JwtAuthGuard) // Aplica a TODAS as rotas deste controller
@ApiBearerAuth('JWT-auth') // Documenta no Swagger
export class ExampleController {
  
  @Get('protected')
  getProtectedData() {
    return { message: 'Dados protegidos' }
  }
}
```

### 2. Proteger com Role (Apenas roles específicas)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../common/enums/role.enum'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Ordem importa!
@ApiBearerAuth('JWT-auth')
export class AdminController {
  
  @Get('dashboard')
  @Roles(Role.ADMIN, Role.SUPERADMIN) // Apenas ADMIN e SUPERADMIN
  getDashboard() {
    return { message: 'Dashboard administrativo' }
  }
  
  @Get('super-secret')
  @Roles(Role.SUPERADMIN) // Apenas SUPERADMIN
  getSuperSecret() {
    return { message: 'Dados super secretos' }
  }
}
```

### 3. Acessar Dados do Usuário Logado

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  
  @Get()
  getProfile(@CurrentUser() user: any) {
    // user contém: { id, name, email, role, createdAt, updatedAt }
    return {
      message: `Olá, ${user.name}!`,
      email: user.email,
      role: user.role
    }
  }
}
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Rota Pública (Sem Autenticação)

```typescript
@Controller('public')
export class PublicController {
  
  @Get('info')
  getInfo() {
    return { message: 'Esta rota é pública' }
  }
}
```

### Exemplo 2: Rota Autenticada (Qualquer Usuário Logado)

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsController {
  
  @Get()
  findAll() {
    return { message: 'Todos os posts' }
  }
  
  @Post()
  create(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    return {
      message: 'Post criado',
      authorId: user.id
    }
  }
}
```

### Exemplo 3: Rota com Autorização por Role

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  
  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  findAll() {
    // Apenas ADMIN e SUPERADMIN podem listar todos usuários
    return { users: [] }
  }
  
  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    // Apenas SUPERADMIN pode deletar usuários
    return { message: 'Usuário removido' }
  }
}
```

### Exemplo 4: Autorização Customizada

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsController {
  constructor(private postsService: PostsService) {}
  
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const post = await this.postsService.findOne(id)
    
    // Apenas o autor ou ADMIN pode editar
    if (post.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Você não pode editar este post')
    }
    
    return this.postsService.update(id, updatePostDto)
  }
}
```

---

## 🧪 Testando no Swagger

### Passo 1: Acessar Swagger

Abra: http://localhost:3000/api/docs

### Passo 2: Fazer Login

1. Encontre o endpoint `POST /auth/login`
2. Clique em "Try it out"
3. Use um dos usuários de teste:
   ```json
   {
     "email": "admin@seedabit.com",
     "password": "admin123"
   }
   ```
4. Clique em "Execute"
5. Copie o `access_token` da resposta

### Passo 3: Autorizar no Swagger

1. Clique no botão **"Authorize"** (cadeado) no topo da página
2. Cole o token no campo
3. Clique em "Authorize"
4. Agora você pode testar rotas protegidas!

### Passo 4: Testar Rota Protegida

1. Tente `GET /users` (requer ADMIN)
2. Se logou como ADMIN, deve funcionar
3. Se logou como USER, deve retornar 403 Forbidden

---

## 🔐 Configuração de Segurança

### Variáveis de Ambiente

```env
# .env
JWT_SECRET="mude-isso-em-producao-use-string-forte-e-longa"
JWT_EXPIRES_IN="7d"
```

### Gerar JWT_SECRET Forte

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Boas Práticas

✅ **NUNCA** commite o arquivo `.env`
✅ Use JWT_SECRET forte em produção (mínimo 32 caracteres)
✅ Configure expiração adequada do token
✅ Implemente refresh tokens em produção
✅ Use HTTPS em produção
✅ Configure CORS adequadamente
✅ Limite tentativas de login (rate limiting)
✅ Implemente logout (blacklist de tokens)

---

## 🛠️ Customizações Comuns

### Adicionar Campos ao Payload do JWT

```typescript
// auth.service.ts
async login(loginDto: LoginDto) {
  // ...
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name, // ← Adicione campos extras aqui
  }
  
  const token = this.jwtService.sign(payload)
  // ...
}
```

### Criar Nova Role

```typescript
// common/enums/role.enum.ts
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  MODERATOR = 'MODERATOR', // ← Nova role
}
```

Não esqueça de atualizar o Prisma schema também!

### Implementar Refresh Token

Consulte: https://docs.nestjs.com/security/authentication#jwt-refresh-token

---

## 📚 Referências

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS Authorization](https://docs.nestjs.com/security/authorization)
- [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)
- [JWT.io](https://jwt.io/) - Decodificar tokens
