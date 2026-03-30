import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Res, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ref } from 'process'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Registrar novo usuário' })
    @ApiResponse({
        status: 201,
        description: 'Usuário cadastrado com sucesso',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Usuário cadastrado com sucesso.' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', example: 'joao@seedabit.com' },
                        role: { type: 'string', example: 'USER' },
                        createdAt: { type: 'string', example: '2026-03-30T10:00:00.000Z' },
                        updatedAt: { type: 'string', example: '2026-03-30T10:00:00.000Z' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Realizar login (Retorna Access Token no JSON e Refresh Token em Cookie HttpOnly)' })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi... (15 minutos)',
                },
                
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', example: 'joao@seedabit.com' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi... (7 dias)' },
                        role: { type: 'string', example: 'USER' },
                        createdAt: { type: 'string', example: '2026-03-30T10:00:00.000Z' },
                        updatedAt: { type: 'string', example: '2026-03-30T10:00:00.000Z' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        // Segurança Web: Injeta o Refresh Token num cookie protegido
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true, // Bloqueia leitura por JavaScript (Mata o XSS)
            secure: process.env.NODE_ENV === 'production', // Só trafega em HTTPS em produção
            sameSite: 'strict', // Protege contra CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        // Remove o refresh_token do objeto visual antes de devolver o JSON
        const { refresh_token, ...safeResult } = result;

        return safeResult;
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Atualizar token de acesso (Lê automaticamente o Cookie HttpOnly)' })
    @ApiResponse({ 
        status: 200,
        description: 'Novo Access Token gerado com sucesso (Refresh Token atualizado no Cookie)',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', example: 'novo_token_de_15_minutos_aqui' },
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Refresh token não fornecido, inválido ou expirado' })
    // Remove o @ApiBody porque não precisamos mais de JSON para essa rota
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // Busca o token silenciosamente nos cookies da requisição
        const refreshToken = req.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token não fornecido ou expirado.');
        }

        const result = await this.authService.refreshTokens(refreshToken);

        // Atualiza o cookie com o novo Refresh Token (Rotação de Token)
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { refresh_token, ...safeResult } = result;
        
        return safeResult;
    }
}