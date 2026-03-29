# 🎯 FASE 10: Finalização e Verificação

## ⚠️ ATENÇÃO: Esta fase requer ação do desenvolvedor

Esta fase não pode ser automatizada e requer que você execute manualmente os seguintes passos.

---

## 📋 Checklist de Finalização

### 1️⃣ Instalar Dependências

```bash
npm install
```

**Verificar se instalação foi bem-sucedida:**
```bash
npm list
```

---

### 2️⃣ Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações locais:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nestjs_template?schema=public"

# JWT
JWT_SECRET="seu-secret-super-secreto-e-seguro-aqui"
JWT_EXPIRES_IN="7d"
```

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` com valores reais!

---

### 3️⃣ Configurar Banco de Dados

#### Opção A: Usando Docker (Recomendado)

```bash
# Inicia PostgreSQL e pgAdmin
npm run docker:up

# Aguarde alguns segundos para os containers subirem
# Acesse pgAdmin em http://localhost:5050
# Email: admin@admin.com
# Senha: admin
```

#### Opção B: PostgreSQL Local

1. Certifique-se de que o PostgreSQL está rodando
2. Crie o banco de dados:

```sql
CREATE DATABASE nestjs_template;
```

---

### 4️⃣ Executar Migrations

```bash
# Gera Prisma Client
npm run prisma:generate

# Executa migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de teste
npm run prisma:seed
```

---

### 5️⃣ Verificar Linting

```bash
# Rodar ESLint
npm run lint

# Se houver erros de formatação, execute:
npm run format
```

**Resultado esperado:** Nenhum erro de lint.

---

### 6️⃣ Executar Testes

#### Testes Unitários

```bash
npm run test
```

**Resultado esperado:** Todos os testes passando.

#### Testes com Coverage

```bash
npm run test:cov
```

**Meta:** > 80% de cobertura.

#### Testes E2E

```bash
npm run test:e2e
```

**Nota:** Testes e2e podem falhar se o banco não estiver configurado corretamente.

---

### 7️⃣ Build da Aplicação

```bash
npm run build
```

**Verificar:**
- Nenhum erro de TypeScript
- Pasta `dist/` criada com sucesso
- Arquivos `.js` e `.d.ts` gerados

---

### 8️⃣ Rodar Aplicação

#### Modo Desenvolvimento

```bash
npm run dev
# ou
npm run start:dev
```

#### Modo Produção

```bash
npm run build
npm run start:prod
```

**Verificar:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Swagger disponível em: http://localhost:3000/api
```

---

### 9️⃣ Testar Endpoints

Acesse a documentação Swagger:
```
http://localhost:3000/api
```

#### Teste Manual Básico:

**1. Registrar usuário:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

**2. Fazer login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

**3. Acessar perfil (use o token retornado no login):**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### 🔟 Configurar Git Hooks (Opcional)

Instale o Husky para hooks de pre-commit:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Adicione no `package.json`:

```json
"lint-staged": {
  "*.{ts,js}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

---

## ✅ Checklist Final

Marque cada item após completá-lo:

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Banco de dados rodando (Docker ou local)
- [ ] Migrations executadas (`npm run prisma:migrate`)
- [ ] Linting sem erros (`npm run lint`)
- [ ] Testes unitários passando (`npm run test`)
- [ ] Coverage > 80% (`npm run test:cov`)
- [ ] Build sem erros (`npm run build`)
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Swagger acessível em `/api`
- [ ] Endpoints testados manualmente
- [ ] Git hooks configurados (opcional)

---

## 🎉 Template Pronto!

Se todos os itens acima foram marcados, seu template está **production-ready** e você pode:

1. Começar a desenvolver novas features
2. Criar novos módulos seguindo `docs/MODULE_CREATION.md`
3. Adicionar mais testes seguindo `docs/TESTING.md`
4. Fazer deploy seguindo `docs/SETUP.md`

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module X"
**Solução:** Execute `npm install` novamente

### Erro: Prisma Client não gerado
**Solução:** Execute `npm run prisma:generate`

### Erro: Database connection failed
**Solução:** Verifique se o PostgreSQL está rodando e a `DATABASE_URL` está correta

### Erro: Port 3000 already in use
**Solução:** Mate o processo na porta 3000 ou altere a porta em `main.ts`

Windows:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

Linux/Mac:
```bash
lsof -ti:3000 | xargs kill -9
```

### Testes e2e falhando
**Solução:** Configure uma DATABASE_URL separada para testes ou use Docker

---

## 📚 Próximos Passos

- [ ] Ler toda a documentação em `docs/`
- [ ] Criar primeiro módulo customizado
- [ ] Configurar CI/CD no GitHub
- [ ] Configurar ambiente de staging/production
- [ ] Adicionar monitoramento e logs
- [ ] Configurar backup do banco de dados

---

## 🤝 Contribuindo

Se encontrar problemas ou tiver sugestões:

1. Abra uma issue no GitHub
2. Crie um Pull Request com melhorias
3. Atualize a documentação se necessário

**Mantenha este template atualizado para toda a equipe!**
