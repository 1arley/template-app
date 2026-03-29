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
                .expect((res) => {
                    expect(res.body.message).toContain('já cadastrado')
                })
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

        it('deve falhar sem campos obrigatórios', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({})
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
                    expect(res.body.user.email).toBe('test@example.com')
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
                .expect((res) => {
                    expect(res.body.message).toContain('inválidas')
                })
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

        it('deve falhar com email inválido', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'Password123!',
                })
                .expect(400)
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
                    expect(res.body.name).toBe('Test User')
                    expect(res.body.role).toBe('USER')
                    expect(res.body.password).toBeUndefined()
                })
        })

        it('deve falhar sem token', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .expect(401)
                .expect((res) => {
                    expect(res.body.message).toContain('Unauthorized')
                })
        })

        it('deve falhar com token inválido', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401)
        })

        it('deve falhar com formato de Authorization inválido', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', authToken) // Sem "Bearer "
                .expect(401)
        })
    })
})
