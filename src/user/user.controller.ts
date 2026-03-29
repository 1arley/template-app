import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: 'Listar todos os usuários (apenas ADMIN/SUPERADMIN)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuários retornada com sucesso',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN/SUPERADMIN)' })
    findAll() {
        return this.userService.findAll()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar usuário por ID' })
    @ApiResponse({ status: 200, description: 'Usuário encontrado' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: 'Criar novo usuário (apenas ADMIN/SUPERADMIN)' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN/SUPERADMIN)' })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar usuário (próprio usuário ou ADMIN/SUPERADMIN)' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
        return this.userService.update(id, updateUserDto, user)
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPERADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remover usuário (apenas ADMIN/SUPERADMIN)' })
    @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão (apenas ADMIN/SUPERADMIN)' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    remove(@Param('id') id: string) {
        return this.userService.remove(id)
    }
}
