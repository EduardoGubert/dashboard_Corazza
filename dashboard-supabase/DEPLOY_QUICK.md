# 🚀 GUIA RÁPIDO - Deploy no Easypanel

## Passo 1: Gerar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie o resultado!

## Passo 2: Fazer Push do Código
```bash
git add .
git commit -m "Deploy to Easypanel"
git push origin main
```

## Passo 3: Criar Projeto no Easypanel

### Backend (auth-server):
- **Type:** App
- **Source:** Git
- **Repository:** seu-usuario/dashboard_Corazza
- **Branch:** main
- **Build Path:** `/server`
- **Dockerfile:** `Dockerfile`
- **Port:** 5000

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=<seu-jwt-secret-gerado>
```

**Volumes:**
- Mount Path: `/app/data`
- Size: 1GB

### Frontend (dashboard):
- **Type:** App
- **Source:** Git
- **Repository:** seu-usuario/dashboard_Corazza
- **Branch:** main
- **Build Path:** `/`
- **Dockerfile:** `Dockerfile`
- **Port:** 80

**Build Arguments:**
```
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-supabase
REACT_APP_AUTH_API_URL=https://seu-dominio-backend.com/api/auth
```

## Passo 4: Deploy!

Clique em **Deploy** em cada serviço.

## Passo 5: Login
- **Usuário:** admin
- **Senha:** admin123

⚠️ **MUDE A SENHA IMEDIATAMENTE!**

---

Veja `DEPLOY_EASYPANEL.md` para documentação completa.
