import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

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
                        createdAt: {
                            type: 'string',
                            example: '2025-10-24T10:00:00.000Z',
                        },
                        updatedAt: {
                            type: 'string',
                            example: '2025-10-24T10:00:00.000Z',
                        },
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
    @ApiOperation({ summary: 'Realizar login' })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', example: 'joao@seedabit.com' },
                        role: { type: 'string', example: 'USER' },
                        createdAt: {
                            type: 'string',
                            example: '2025-10-24T10:00:00.000Z',
                        },
                        updatedAt: {
                            type: 'string',
                            example: '2025-10-24T10:00:00.000Z',
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }
}
