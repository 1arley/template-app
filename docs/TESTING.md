# 🧪 Guia de Testes - SeedaBit NestJS Template

## 📖 Visão Geral

Este template está configurado com **Jest** para testes unitários e e2e (end-to-end).

---

## 🏗️ Estrutura de Testes

```
nestjs-template/
├── src/
│   └── module/
│       ├── module.controller.spec.ts  # Testes unitários do controller
│       └── module.service.spec.ts     # Testes unitários do service
└── test/
    ├── app.e2e-spec.ts               # Testes e2e principais
    └── jest-e2e.json                 # Configuração do Jest e2e
```

---

## 🚀 Comandos de Teste

```bash
# Rodar todos os testes unitários
npm run test

# Rodar testes em modo watch (desenvolvimento)
npm run test:watch

# Rodar testes com coverage
npm run test:cov

# Rodar testes e2e
npm run test:e2e

# Rodar teste específico
npm run test -- users.service.spec.ts

# Rodar testes com debug
npm run test:debug
```

---

## 🧪 Testes Unitários

### Service Example - users.service.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { PrismaService } from '../prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'
import { Role } from '../common/enums/role.enum'

describe('UserService', () => {
    let service: UserService
    let prisma: PrismaService

    const mockPrismaService = {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        service = module.get<UserService>(UserService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('findAll', () => {
        it('deve retornar array de usuários', async () => {
            const users = [
                {
                    id: '1',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: Role.USER,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            mockPrismaService.user.findMany.mockResolvedValue(users)

            const result = await service.findAll()

            expect(result).toEqual(users)
            expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
        })
    })

    describe('findOne', () => {
        it('deve retornar um usuário', async () => {
            const user = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user)

            const result = await service.findOne('1')

            expect(result).toEqual(user)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: expect.any(Object),
            })
        })

        it('deve lançar NotFoundException quando usuário não existe', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            await expect(service.findOne('999')).rejects.toThrow(
                NotFoundException,
            )
        })
    })

    describe('update', () => {
        it('deve atualizar usuário', async () => {
            const existingUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const updatedUser = {
                ...existingUser,
                name: 'Updated Name',
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)
            mockPrismaService.user.update.mockResolvedValue(updatedUser)

            const result = await service.update('1', { name: 'Updated Name' })

            expect(result.name).toBe('Updated Name')
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { name: 'Updated Name' },
                select: expect.any(Object),
            })
        })
    })
})
```

### Controller Example - users.controller.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Role } from '../common/enums/role.enum'

describe('UserController', () => {
    let controller: UserController
    let service: UserService

    const mockUserService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile()

        controller = module.get<UserController>(UserController)
        service = module.get<UserService>(UserService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('findAll', () => {
        it('deve retornar array de usuários', async () => {
            const users = [
                {
                    id: '1',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: Role.USER,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            mockUserService.findAll.mockResolvedValue(users)

            const result = await controller.findAll()

            expect(result).toEqual(users)
            expect(service.findAll).toHaveBeenCalledTimes(1)
        })
    })

    describe('findOne', () => {
        it('deve retornar um usuário', async () => {
            const user = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUserService.findOne.mockResolvedValue(user)

            const result = await controller.findOne('1')

            expect(result).toEqual(user)
            expect(service.findOne).toHaveBeenCalledWith('1')
        })
    })

    describe('update', () => {
        it('deve atualizar usuário', async () => {
            const updatedUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Updated Name',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUserService.update.mockResolvedValue(updatedUser)

            const result = await controller.update('1', { name: 'Updated Name' })

            expect(result).toEqual(updatedUser)
            expect(service.update).toHaveBeenCalledWith('1', {
                name: 'Updated Name',
            })
        })
    })
})
```

---

## 🌐 Testes E2E (End-to-End)

### Configuração - test/jest-e2e.json

```json
{
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testEnvironment": "node",
    "testRegex": ".e2e-spec.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    }
}
```

### Example - auth.e2e-spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AuthController (e2e)', () => {
    let app: INestApplication
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()

        // Aplica validação global
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )

        await app.init()

        prisma = app.get<PrismaService>(PrismaService)
    })

    afterAll(async () => {
        await prisma.$disconnect()
        await app.close()
    })

    beforeEach(async () => {
        // Limpa banco de dados antes de cada teste
        await prisma.user.deleteMany()
    })

    describe('/auth/register (POST)', () => {
        it('deve registrar novo usuário', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.user).toBeDefined()
                    expect(res.body.user.email).toBe('test@example.com')
                    expect(res.body.user.password).toBeUndefined()
                    expect(res.body.access_token).toBeDefined()
                })
        })

        it('deve falhar com email duplicado', async () => {
            // Primeiro registro
            await request(app.getHttpServer()).post('/auth/register').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
            })

            // Segundo registro com mesmo email
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Another User',
                    email: 'test@example.com',
                    password: 'Password456!',
                })
                .expect(409)
        })

        it('deve falhar com dados inválidos', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Te', // Muito curto
                    email: 'invalid-email', // Email inválido
                    password: '123', // Senha muito curta
                })
                .expect(400)
        })
    })

    describe('/auth/login (POST)', () => {
        beforeEach(async () => {
            // Cria usuário para login
            await request(app.getHttpServer()).post('/auth/register').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
            })
        })

        it('deve fazer login com credenciais válidas', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toBeDefined()
                    expect(res.body.access_token).toBeDefined()
                })
        })

        it('deve falhar com senha incorreta', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword!',
                })
                .expect(401)
        })

        it('deve falhar com usuário inexistente', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123!',
                })
                .expect(401)
        })
    })

    describe('/auth/profile (GET)', () => {
        let authToken: string

        beforeEach(async () => {
            // Registra e faz login
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!',
                })

            authToken = response.body.access_token
        })

        it('deve retornar perfil do usuário autenticado', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.email).toBe('test@example.com')
                    expect(res.body.password).toBeUndefined()
                })
        })

        it('deve falhar sem token', () => {
            return request(app.getHttpServer()).get('/auth/profile').expect(401)
        })

        it('deve falhar com token inválido', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401)
        })
    })
})
```

---

## 🗄️ Configuração de Banco de Dados para Testes

### Usar Banco Separado

Crie `.env.test`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/nestjs_template_test"
JWT_SECRET="test-secret-key"
JWT_EXPIRES_IN="1h"
```

### Script de Setup

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
    // Executa migrations no banco de teste
    // Use: DATABASE_URL=... npx prisma migrate deploy
})

afterAll(async () => {
    await prisma.$disconnect()
})

beforeEach(async () => {
    // Limpa dados entre testes
    await prisma.user.deleteMany()
    await prisma.post.deleteMany()
    // ... outros models
})
```

---

## 📊 Coverage Report

Configuração já inclusa no `package.json`:

```bash
npm run test:cov
```

Resultado:
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.42 |    75.00 |   83.33 |   85.00 |
 src/auth           |   90.00 |    80.00 |   87.50 |   89.47 |
  auth.service.ts   |   90.00 |    80.00 |   87.50 |   89.47 | 45,67
 src/user           |   82.35 |    70.00 |   80.00 |   81.81 |
  user.service.ts   |   82.35 |    70.00 |   80.00 |   81.81 | 23,89-92
--------------------|---------|----------|---------|---------|-------------------
```

Meta: **> 80% de cobertura**

---

## ✅ Boas Práticas

### 1. Organize os Testes

```typescript
describe('UserService', () => {
    describe('findAll', () => {
        it('deve retornar array vazio quando não há usuários', () => {})
        it('deve retornar todos os usuários', () => {})
    })

    describe('findOne', () => {
        it('deve retornar usuário específico', () => {})
        it('deve lançar NotFoundException', () => {})
    })
})
```

### 2. Use Mocks Adequados

```typescript
// ✅ Mock do PrismaService
const mockPrismaService = {
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}
```

### 3. Limpe os Mocks

```typescript
afterEach(() => {
    jest.clearAllMocks()
})
```

### 4. Use beforeEach para Setup

```typescript
beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        // ... configuração
    }).compile()

    service = module.get<UserService>(UserService)
})
```

### 5. Teste Casos de Erro

```typescript
it('deve lançar NotFoundException', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null)

    await expect(service.findOne('999')).rejects.toThrow(NotFoundException)
})
```

### 6. E2E: Limpe o Banco Entre Testes

```typescript
beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.post.deleteMany()
})
```

---

## 🎯 Checklist de Testes

- [ ] Testes unitários para Services
- [ ] Testes unitários para Controllers
- [ ] Testes e2e para fluxos principais
- [ ] Testes de validação de DTOs
- [ ] Testes de autenticação e autorização
- [ ] Testes de casos de erro
- [ ] Coverage > 80%
- [ ] Banco de dados separado para testes

---

## 📚 Referências

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
