import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common'
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
        // Ignoramos completamente a 'role' que vier do front-end por segurança
        const { name, email, password, role } = registerDto

        const userExists = await this.prisma.user.findUnique({
            where: { email },
        })

        if (role === 'ADMIN' || role === 'SUPERADMIN') {
            throw new ForbiddenException(
                'Tentando escalar privilégio no cadastro, safado? Achou que Iarley ia deixar essa brecha? Aqui você é mero mortal!'
            )
        }

        if (userExists) {
            throw new ConflictException('Email já cadastrado.')
        }

        // Aumentado o custo do hash de 10 para 12 (mais seguro contra brute force)
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER', // Força estritamente como USER
            },
        })

        // Remove campos sensíveis
        const { password: _, refreshToken: __, ...userClean } = user

        return {
            message: 'Usuário cadastrado com sucesso.',
            user: userClean,
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto

        const user = await this.prisma.user.findUnique({
            where: { email },
        })

        if (!user) throw new UnauthorizedException('Credenciais inválidas.')

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas.')

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        const token = this.jwtService.sign(payload, { expiresIn: '15m' })
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }) 
        
        // HASH do refresh token ANTES de salvar no banco!
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        })

        // Limpa senha E refreshToken (agora hasheado) para não ir no objeto user
        const { password: _, refreshToken: __, ...userClean } = user

        return {
            access_token: token,
            refresh_token: refreshToken,
            user: userClean,
        }
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) throw new UnauthorizedException('Usuário não encontrado.')

        const { password: _, refreshToken: __, ...userClean } = user
        return userClean
    }

    async refreshTokens(refreshToken: string) {
        try {
            // 1. Verifica se a string do token ainda é um JWT válido
            const payload = this.jwtService.verify(refreshToken)

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            })

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Acesso negado.')
            }

            // 2. Compara o token enviado com o HASH salvo no banco
            const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken)
            
            if (!isRefreshTokenValid) {
                throw new UnauthorizedException('Acesso negado. Token inválido.')
            }

            // 3. Gera novos tokens
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            }

            const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' })
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' })

            // 4. Salva o NOVO token também como hash
            const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10)
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: hashedRefreshToken },
            })

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            }

        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido ou expirado. Faça login novamente.')
        }
    }
}