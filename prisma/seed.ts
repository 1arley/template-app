import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Criar usuário SUPERADMIN
    const superadminPassword = await bcrypt.hash('admin123', 10)
    const superadmin = await prisma.user.upsert({
        where: { email: 'superadmin@seedabit.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'superadmin@seedabit.com',
            password: superadminPassword,
            role: Role.SUPERADMIN,
        },
    })
    console.log('✅ Superadmin criado:', superadmin.email)

    // Criar usuário ADMIN
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@seedabit.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@seedabit.com',
            password: adminPassword,
            role: Role.ADMIN,
        },
    })
    console.log('✅ Admin criado:', admin.email)

    // Criar usuário normal
    const userPassword = await bcrypt.hash('user123', 10)
    const user = await prisma.user.upsert({
        where: { email: 'user@seedabit.com' },
        update: {},
        create: {
            name: 'Regular User',
            email: 'user@seedabit.com',
            password: userPassword,
            role: Role.USER,
        },
    })
    console.log('✅ Usuário criado:', user.email)

    console.log('\n🎉 Seeding concluído com sucesso!')
    console.log('\n📋 Credenciais de teste:')
    console.log('┌────────────────────────────────────────────────┐')
    console.log('│ SUPERADMIN:                                    │')
    console.log('│ Email: superadmin@seedabit.com                 │')
    console.log('│ Senha: admin123                                │')
    console.log('├────────────────────────────────────────────────┤')
    console.log('│ ADMIN:                                         │')
    console.log('│ Email: admin@seedabit.com                      │')
    console.log('│ Senha: admin123                                │')
    console.log('├────────────────────────────────────────────────┤')
    console.log('│ USER:                                          │')
    console.log('│ Email: user@seedabit.com                       │')
    console.log('│ Senha: user123                                 │')
    console.log('└────────────────────────────────────────────────┘\n')
}

main()
    .catch((e) => {
        console.error('❌ Erro ao fazer seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
