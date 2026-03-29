import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { name, email, password, role } = registerDto

        // Check if user already exists
        const userExists = await this.prisma.user.findUnique({
            where: { email },
        })

        if (userExists) {
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
                role: role || 'USER',
            },
        })

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return {
            message: 'Usuário cadastrado com sucesso.',
            user: userWithoutPassword,
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas.')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas.')
        }

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        const token = this.jwtService.sign(payload)

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return {
            access_token: token,
            user: userWithoutPassword,
        }
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado.')
        }

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    }
}
