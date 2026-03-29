import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import {
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common'
import { Role } from '../common/enums/role.enum'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
    let service: AuthService
    let prisma: PrismaService
    let jwtService: JwtService

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    }

    const mockJwtService = {
        sign: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
        prisma = module.get<PrismaService>(PrismaService)
        jwtService = module.get<JwtService>(JwtService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('register', () => {
        const registerDto = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123!',
        }

        it('deve registrar um novo usuário com sucesso', async () => {
            const hashedPassword = await bcrypt.hash(registerDto.password, 10)
            const createdUser = {
                id: '1',
                name: registerDto.name,
                email: registerDto.email,
                password: hashedPassword,
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(null)
            mockPrismaService.user.create.mockResolvedValue(createdUser)
            mockJwtService.sign.mockReturnValue('fake-jwt-token')

            const result = await service.register(registerDto)

            expect(result).toHaveProperty('user')
            expect(result).toHaveProperty('access_token')
            expect(result.user.email).toBe(registerDto.email)
            expect(result.user.password).toBeUndefined()
            expect(result.access_token).toBe('fake-jwt-token')
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            })
            expect(prisma.user.create).toHaveBeenCalled()
        })

        it('deve lançar ConflictException se email já existir', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: '1',
                email: registerDto.email,
            })

            await expect(service.register(registerDto)).rejects.toThrow(
                ConflictException,
            )
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            })
            expect(prisma.user.create).not.toHaveBeenCalled()
        })
    })

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'Password123!',
        }

        it('deve fazer login com credenciais válidas', async () => {
            const hashedPassword = await bcrypt.hash(loginDto.password, 10)
            const user = {
                id: '1',
                name: 'Test User',
                email: loginDto.email,
                password: hashedPassword,
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user)
            mockJwtService.sign.mockReturnValue('fake-jwt-token')

            const result = await service.login(loginDto)

            expect(result).toHaveProperty('user')
            expect(result).toHaveProperty('access_token')
            expect(result.user.email).toBe(loginDto.email)
            expect(result.user.password).toBeUndefined()
            expect(result.access_token).toBe('fake-jwt-token')
        })

        it('deve lançar UnauthorizedException se usuário não existe', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            )
        })

        it('deve lançar UnauthorizedException se senha estiver incorreta', async () => {
            const user = {
                id: '1',
                email: loginDto.email,
                password: await bcrypt.hash('DifferentPassword', 10),
                role: Role.USER,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user)

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            )
        })
    })

    describe('validateUser', () => {
        it('deve retornar usuário se ID for válido', async () => {
            const user = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user)

            const result = await service.validateUser('1')

            expect(result).toEqual(user)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
        })

        it('deve retornar null se usuário não existir', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            const result = await service.validateUser('999')

            expect(result).toBeNull()
        })
    })
})
