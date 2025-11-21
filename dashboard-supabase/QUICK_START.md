# 🚀 Guia Rápido de Instalação

## Passo 1: Instalar dependências do servidor
```powershell
cd dashboard-supabase\server
npm install
```

## Passo 2: Criar usuário admin inicial
```powershell
npm run seed
```

Credenciais criadas:
- **Usuário:** admin
- **Senha:** admin123

## Passo 3: Instalar dependências do frontend
```powershell
cd ..
npm install --legacy-peer-deps
```

**Nota:** Usamos `--legacy-peer-deps` para resolver conflitos de dependências do TypeScript.

## Passo 4: Configurar .env do frontend
Copie `.env.example` para `.env` e adicione suas credenciais do Supabase:
```env
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima
REACT_APP_AUTH_API_URL=http://localhost:5000/api/auth
```

## Passo 5: Executar (2 terminais)

### Terminal 1 - Backend:
```powershell
cd dashboard-supabase\server
npm run dev
```

Você verá:
```
🚀 Servidor rodando na porta 5000
📊 Health check: http://localhost:5000/api/health
✅ Conectado ao banco SQLite
✅ Tabela users criada/verificada
```

### Terminal 2 - Frontend:
```powershell
cd dashboard-supabase
npm start
```

## Passo 6: Acessar
Abra `http://localhost:3000` e faça login com:
- **Usuário:** admin
- **Senha:** admin123

## ✅ Pronto!

Consulte `AUTH_README.md` para documentação completa.

## 🐛 Troubleshooting

### Erro ao instalar better-sqlite3
✅ **Resolvido!** Mudamos para `sqlite3` que não precisa de Python.

### Conflito de dependências TypeScript
✅ **Resolvido!** Use `npm install --legacy-peer-deps`

### CORS error
Certifique-se de que o servidor backend está rodando na porta 5000.
