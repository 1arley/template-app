import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { Role } from '../../common/enums/role.enum'

export class CreateUserDto {
    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do usuário',
    })
    @IsString()
    @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
    name: string

    @ApiProperty({
        example: 'joao@seedabit.com',
        description: 'Email do usuário',
    })
    @IsEmail({}, { message: 'O email informado não é válido.' })
    @IsNotEmpty({ message: 'O email não pode estar vazio.' })
    email: string

    @ApiProperty({
        example: 'senha123',
        description: 'Senha do usuário (mínimo 8 caracteres)',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
    @MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres.' })
    password: string

    @ApiProperty({
        example: 'USER',
        description: 'Role do usuário',
        enum: Role,
        required: false,
        default: Role.USER,
    })
    @IsEnum(Role, { message: 'Role inválida.' })
    @IsOptional()
    role?: Role
}
