import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Role } from '../common/enums/role.enum'

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Remove passwords from response
        return users.map(({ password, ...user }) => user)
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
    }

    async create(createUserDto: CreateUserDto) {
        const { name, email, password, role } = createUserDto

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            throw new ConflictException('Email já cadastrado.')
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || Role.USER,
            },
        })

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    }

    async update(id: string, updateUserDto: UpdateUserDto, requestingUser: any) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        // Authorization: Users can only update their own data, unless they're ADMIN/SUPERADMIN
        if (requestingUser.id !== id && requestingUser.role === Role.USER) {
            throw new ForbiddenException('Você não tem permissão para atualizar este usuário.')
        }

        // Check if email is being changed and if it's available
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            })

            if (emailExists) {
                throw new ConflictException('Email já cadastrado.')
            }
        }

        // Hash password if it's being updated
        const updateData: any = { ...updateUserDto }
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10)
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
        })

        const { password: _, ...userWithoutPassword } = updatedUser
        return userWithoutPassword
    }

    async remove(id: string) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        // Delete user
        await this.prisma.user.delete({
            where: { id },
        })

        return {
            message: 'Usuário removido com sucesso.',
        }
    }
}
