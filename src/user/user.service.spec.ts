import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { PrismaService } from '../prisma/prisma.service'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { Role } from '../common/enums/role.enum'

describe('UserService', () => {
    let service: UserService
    let prisma: PrismaService

    const mockPrismaService = {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
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
                {
                    id: '2',
                    email: 'test2@example.com',
                    name: 'Test User 2',
                    role: Role.ADMIN,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            mockPrismaService.user.findMany.mockResolvedValue(users)

            const result = await service.findAll()

            expect(result).toEqual(users)
            expect(result).toHaveLength(2)
            expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
            expect(prisma.user.findMany).toHaveBeenCalledWith({
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

        it('deve retornar array vazio quando não há usuários', async () => {
            mockPrismaService.user.findMany.mockResolvedValue([])

            const result = await service.findAll()

            expect(result).toEqual([])
            expect(result).toHaveLength(0)
        })
    })

    describe('findOne', () => {
        it('deve retornar um usuário específico', async () => {
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

        it('deve lançar NotFoundException quando usuário não existe', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            await expect(service.findOne('999')).rejects.toThrow(
                NotFoundException,
            )
            await expect(service.findOne('999')).rejects.toThrow(
                'Usuário não encontrado.',
            )
        })
    })

    describe('update', () => {
        const updateDto = { name: 'Updated Name' }

        it('deve permitir usuário atualizar próprio perfil', async () => {
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
                name: updateDto.name,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)
            mockPrismaService.user.update.mockResolvedValue(updatedUser)

            const result = await service.update('1', updateDto, '1', Role.USER)

            expect(result.name).toBe(updateDto.name)
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateDto,
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

        it('deve permitir ADMIN atualizar qualquer usuário', async () => {
            const existingUser = {
                id: '2',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const updatedUser = {
                ...existingUser,
                name: updateDto.name,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)
            mockPrismaService.user.update.mockResolvedValue(updatedUser)

            const result = await service.update('2', updateDto, '1', Role.ADMIN)

            expect(result.name).toBe(updateDto.name)
            expect(prisma.user.update).toHaveBeenCalled()
        })

        it('deve lançar ForbiddenException se usuário tentar atualizar outro', async () => {
            const existingUser = {
                id: '2',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)

            await expect(
                service.update('2', updateDto, '1', Role.USER),
            ).rejects.toThrow(ForbiddenException)
            expect(prisma.user.update).not.toHaveBeenCalled()
        })

        it('deve lançar NotFoundException se usuário não existir', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            await expect(
                service.update('999', updateDto, '1', Role.ADMIN),
            ).rejects.toThrow(NotFoundException)
            expect(prisma.user.update).not.toHaveBeenCalled()
        })
    })

    describe('remove', () => {
        it('deve permitir ADMIN deletar usuário', async () => {
            const existingUser = {
                id: '2',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)
            mockPrismaService.user.delete.mockResolvedValue(existingUser)

            const result = await service.remove('2', '1', Role.ADMIN)

            expect(result).toHaveProperty('message')
            expect(result.message).toBe('Usuário removido com sucesso.')
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: '2' },
            })
        })

        it('deve lançar ForbiddenException se USER tentar deletar outro', async () => {
            const existingUser = {
                id: '2',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.findUnique.mockResolvedValue(existingUser)

            await expect(
                service.remove('2', '1', Role.USER),
            ).rejects.toThrow(ForbiddenException)
            expect(prisma.user.delete).not.toHaveBeenCalled()
        })

        it('deve lançar NotFoundException se usuário não existir', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null)

            await expect(
                service.remove('999', '1', Role.ADMIN),
            ).rejects.toThrow(NotFoundException)
            expect(prisma.user.delete).not.toHaveBeenCalled()
        })
    })
})
