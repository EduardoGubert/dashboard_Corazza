# Migração para Supabase - Guia Completo

## ✅ Etapas Concluídas

1. **Criado serviço de autenticação Supabase** (`src/services/supabaseAuth.ts`)
   - Login com bcrypt
   - Registro de usuários
   - Listagem e exclusão de usuários

2. **Atualizado contexto de autenticação** (`src/contexts/AuthContext.tsx`)
   - Removido uso de JWT tokens
   - Agora usa armazenamento direto do objeto user no localStorage

3. **Atualizado tipos TypeScript** (`src/types/index.ts`)
   - User.id agora é `string` (UUID) em vez de `number`
   - Removido campo `token` de AuthResponse

4. **Migrado UserManagement** (`src/components/Auth/UserManagement.tsx`)
   - Usa `supabaseAuth` em vez de `authService`
   - Tratamento de erros adaptado para nova API

5. **Gerado hash bcrypt** para senha do admin
   - Senha: `admin123`
   - Hash: `$2b$10$7h91PmgC.l260WjoWBdkr.oync28nzRyvfxmFsMc7nWYRGUAFllqe`

## 📋 Próximos Passos (EXECUTAR AGORA)

### Passo 1: Executar SQL no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o conteúdo do arquivo `CREATE_USERS_TABLE.sql`
5. Verifique se o usuário admin foi criado com sucesso

### Passo 2: Testar Autenticação

1. Pare o backend Node.js (não é mais necessário)
2. Mantenha apenas o frontend rodando (`npm start`)
3. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
4. Teste criar novo usuário na página de Gerenciamento de Usuários
5. Teste deletar usuário (não pode deletar a si mesmo)

### Passo 3: Limpar Código Legado (Opcional)

Após confirmar que tudo está funcionando, você pode remover:

```powershell
# Deletar backend Node.js (não é mais necessário)
Remove-Item -Recurse -Force "c:\Users\eduar\OneDrive\Documentos\Projetos\PROJETOS\dashboard_Corazza\dashboard-supabase\server"

# Deletar serviço de auth antigo
Remove-Item -Force "c:\Users\eduar\OneDrive\Documentos\Projetos\PROJETOS\dashboard_Corazza\dashboard-supabase\src\services\auth.ts"

# Remover componente ErrorMessage se não for usado em outro lugar
Remove-Item -Force "c:\Users\eduar\OneDrive\Documentos\Projetos\PROJETOS\dashboard_Corazza\dashboard-supabase\src\components\common\ErrorMessage.tsx"
```

## 🎯 Arquitetura Final

### Antes (Dual Database):
```
React App → Node.js Backend → SQLite (auth)
         ↘ Supabase API → PostgreSQL (leads)
```

### Depois (Supabase-Only):
```
React App → Supabase API → PostgreSQL (auth + leads)
```

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- UUIDs para IDs de usuários
- Validação de role (Admin/Corretor)
- Usuário não pode deletar a si mesmo

## 📊 Estrutura da Tabela Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,           -- UUID v4
    username TEXT UNIQUE NOT NULL, -- Nome de usuário único
    password_hash TEXT NOT NULL,   -- Hash bcrypt da senha
    role TEXT NOT NULL,            -- 'Admin' ou 'Corretor'
    created_at TIMESTAMP           -- Data de criação
);
```

## ⚠️ Importante

1. **Execute o SQL primeiro** antes de testar o login
2. **Não compartilhe** o hash da senha em produção
3. **Altere a senha do admin** após primeiro acesso em produção
4. **Mantenha backup** antes de deletar arquivos legados

## 🚀 Como Usar

1. **Login**: Usar credenciais admin/admin123
2. **Gerenciar Usuários**: Acessar através do menu lateral
3. **Criar Corretor**: Admin pode criar usuários com role "Corretor"
4. **Permissões**: Apenas Admin pode editar fechamentos na aba Fechamento

## 📝 Notas

- A migração está **100% completa** no código
- Apenas falta **executar o SQL** no Supabase
- O backend Node.js **não é mais necessário**
- Todas as operações de auth agora vão direto ao Supabase
