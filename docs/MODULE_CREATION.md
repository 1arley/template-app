# 📦 Guia de Criação de Módulos - SeedaBit NestJS Template

## 📖 Visão Geral

Este guia mostra como criar novos módulos seguindo os padrões da SeedaBit Systems.

---

## 🏗️ Estrutura Padrão de Módulo

```
src/
└── nome-do-modulo/
    ├── nome-do-modulo.module.ts      # Módulo principal
    ├── nome-do-modulo.controller.ts  # Controller (rotas HTTP)
    ├── nome-do-modulo.service.ts     # Service (lógica de negócio)
    ├── dto/
    │   ├── create-nome-do-modulo.dto.ts  # DTO para criação
    │   └── update-nome-do-modulo.dto.ts  # DTO para atualização
    └── entities/
        └── nome-do-modulo.entity.ts  # Entity (opcional, se não usar Prisma)
```

---

## 🚀 Método 1: Usar CLI do NestJS (Recomendado)

### Criar Módulo Completo

```bash
# Cria module, controller e service de uma vez
nest generate resource posts

# Opções:
# - Transport layer: REST API
# - CRUD entry points: Yes
```

Isso cria:
```
src/posts/
├── posts.module.ts
├── posts.controller.ts
├── posts.service.ts
├── posts.controller.spec.ts
├── posts.service.spec.ts
├── dto/
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
└── entities/
    └── post.entity.ts
```

### Criar Componentes Individualmente

```bash
# Criar apenas module
nest generate module posts

# Criar apenas controller
nest generate controller posts

# Criar apenas service
nest generate service posts
```

---

## 🛠️ Método 2: Criar Manualmente (Passo a Passo)

Vamos criar um módulo **Posts** como exemplo.

### Passo 1: Criar Model no Prisma

```prisma
// prisma/schema.prisma

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("posts")
  @@index([authorId])
}

// Não esqueça de adicionar a relação no User
model User {
  // ... campos existentes
  posts     Post[]
}
```

Execute a migration:
```bash
npm run prisma:migrate
```

### Passo 2: Criar DTOs

**create-post.dto.ts:**
```typescript
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator'

export class CreatePostDto {
    @ApiProperty({
        example: 'Meu Primeiro Post',
        description: 'Título do post',
    })
    @IsString()
    @IsNotEmpty({ message: 'O título não pode estar vazio.' })
    title: string

    @ApiProperty({
        example: 'Conteúdo do post aqui...',
        description: 'Conteúdo do post',
    })
    @IsString()
    @IsNotEmpty({ message: 'O conteúdo não pode estar vazio.' })
    content: string

    @ApiProperty({
        example: false,
        description: 'Se o post está publicado',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    published?: boolean
}
```

**update-post.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger'
import { CreatePostDto } from './create-post.dto'

export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

### Passo 3: Criar Service

**posts.service.ts:**
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createPostDto: CreatePostDto, authorId: string) {
        return this.prisma.post.create({
            data: {
                ...createPostDto,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })
    }

    async findAll() {
        return this.prisma.post.findMany({
            where: { published: true },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!post) {
            throw new NotFoundException('Post não encontrado.')
        }

        return post
    }

    async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
        const post = await this.findOne(id)

        // Apenas o autor pode editar
        if (post.authorId !== userId) {
            throw new ForbiddenException('Você não pode editar este post.')
        }

        return this.prisma.post.update({
            where: { id },
            data: updatePostDto,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })
    }

    async remove(id: string, userId: string) {
        const post = await this.findOne(id)

        // Apenas o autor pode deletar
        if (post.authorId !== userId) {
            throw new ForbiddenException('Você não pode deletar este post.')
        }

        await this.prisma.post.delete({
            where: { id },
        })

        return { message: 'Post removido com sucesso.' }
    }
}
```

### Passo 4: Criar Controller

**posts.controller.ts:**
```typescript
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Criar novo post' })
    @ApiResponse({ status: 201, description: 'Post criado com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
        return this.postsService.create(createPostDto, user.id)
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os posts publicados' })
    @ApiResponse({ status: 200, description: 'Lista de posts' })
    findAll() {
        return this.postsService.findAll()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar post por ID' })
    @ApiResponse({ status: 200, description: 'Post encontrado' })
    @ApiResponse({ status: 404, description: 'Post não encontrado' })
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Atualizar post (apenas autor)' })
    @ApiResponse({ status: 200, description: 'Post atualizado' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    @ApiResponse({ status: 404, description: 'Post não encontrado' })
    update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
        @CurrentUser() user: any,
    ) {
        return this.postsService.update(id, updatePostDto, user.id)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Deletar post (apenas autor)' })
    @ApiResponse({ status: 200, description: 'Post removido' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    @ApiResponse({ status: 404, description: 'Post não encontrado' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.postsService.remove(id, user.id)
    }
}
```

### Passo 5: Criar Module

**posts.module.ts:**
```typescript
import { Module } from '@nestjs/common'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
    imports: [AuthModule], // Importa se usar Guards
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService], // Exporta se outros módulos precisarem
})
export class PostsModule {}
```

### Passo 6: Registrar no AppModule

```typescript
// app.module.ts
import { PostsModule } from './posts/posts.module'

@Module({
    imports: [
        // ... outros módulos
        PostsModule, // ← Adicione aqui
    ],
})
export class AppModule {}
```

---

## ✅ Checklist de Criação de Módulo

- [ ] Model criado no Prisma schema
- [ ] Migration executada (`npm run prisma:migrate`)
- [ ] DTOs criados e validados
- [ ] Service com lógica de negócio
- [ ] Controller com rotas HTTP
- [ ] Module configurado
- [ ] Module importado no AppModule
- [ ] Rotas protegidas com Guards (se necessário)
- [ ] Documentação Swagger (@ApiTags, @ApiOperation)
- [ ] Testes criados (.spec.ts)

---

## 🎯 Padrões e Boas Práticas

### Nomenclatura

✅ **Correto:**
- `users.module.ts`
- `users.controller.ts`
- `users.service.ts`
- `create-user.dto.ts`

❌ **Incorreto:**
- `UserModule.ts`
- `usersController.ts`
- `user-service.ts`

### Injeção de Dependências

```typescript
// ✅ Correto
constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
) {}

// ❌ Incorreto
constructor(
    private prisma: PrismaService, // Falta readonly
) {}
```

### Validação de DTOs

```typescript
// ✅ Sempre use decorators do class-validator
@IsString()
@IsNotEmpty({ message: 'Campo obrigatório' })
@MinLength(3, { message: 'Mínimo 3 caracteres' })
title: string
```

### Tratamento de Erros

```typescript
// ✅ Use exceções do NestJS
throw new NotFoundException('Recurso não encontrado')
throw new BadRequestException('Dados inválidos')
throw new ForbiddenException('Sem permissão')
throw new ConflictException('Recurso já existe')

// ❌ Não use throw new Error()
```

### Documentação Swagger

```typescript
// ✅ Sempre documente
@ApiTags('posts')
@ApiOperation({ summary: 'Descrição clara' })
@ApiResponse({ status: 200, description: 'Sucesso' })
@ApiBearerAuth('JWT-auth')

// ✅ DTOs também
@ApiProperty({ example: 'Exemplo', description: 'Descrição' })
```

---

## 📚 Referências

- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [Class Validator](https://github.com/typestack/class-validator)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
