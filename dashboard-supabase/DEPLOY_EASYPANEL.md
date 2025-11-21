# 🚀 Deploy no Easypanel - Dashboard Corazza

Guia completo para fazer deploy do Dashboard Corazza no Easypanel.

---

## 📋 Pré-requisitos

1. ✅ Conta no [Easypanel](https://easypanel.io)
2. ✅ Repositório Git (GitHub, GitLab, etc.)
3. ✅ Credenciais do Supabase
4. ✅ Domínio configurado (opcional, mas recomendado)

---

## 🔧 Passo 1: Preparar o Projeto

### 1.1 Gerar JWT Secret

Execute no terminal local:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o valor gerado. Você vai precisar dele.

### 1.2 Commit e Push

```bash
git add .
git commit -m "Add authentication system and Docker support"
git push origin main
```

---

## 🐳 Passo 2: Configurar no Easypanel

### 2.1 Criar novo projeto

1. Acesse seu Easypanel
2. Clique em **"+ New Project"**
3. Nome: `dashboard-corazza`
4. Clique em **"Create"**

### 2.2 Adicionar serviço Backend (Auth Server)

1. No projeto, clique em **"+ Add Service"**
2. Escolha **"App"**
3. Configure:
   - **Name:** `auth-server`
   - **Source:** Git Repository
   - **Repository:** `seu-usuario/dashboard_Corazza`
   - **Branch:** `main`
   - **Build Path:** `/server`
   - **Dockerfile Path:** `Dockerfile`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=seu_jwt_secret_gerado_no_passo_1.1
   ```

5. **Domains:**
   - Adicione um subdomínio, ex: `api-dashboard.seu-dominio.com`
   - Ou use o domínio fornecido pelo Easypanel

6. **Port:** `5000`

7. Clique em **"Deploy"**

### 2.3 Adicionar serviço Frontend (Dashboard)

1. Clique em **"+ Add Service"** novamente
2. Escolha **"App"**
3. Configure:
   - **Name:** `dashboard`
   - **Source:** Git Repository
   - **Repository:** `seu-usuario/dashboard_Corazza`
   - **Branch:** `main`
   - **Build Path:** `/`
   - **Dockerfile Path:** `Dockerfile`

4. **Build Arguments:**
   ```
   REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_supabase
   REACT_APP_AUTH_API_URL=https://api-dashboard.seu-dominio.com/api/auth
   ```
   
   ⚠️ **IMPORTANTE:** A URL da API deve ser a URL PÚBLICA do backend (não use `http://auth-server:5000`)

5. **Domains:**
   - Adicione seu domínio principal, ex: `dashboard.seu-dominio.com`
   - Ou use o domínio fornecido pelo Easypanel

6. **Port:** `80`

7. Clique em **"Deploy"**

---

## 🔐 Passo 3: Configurar Volumes (Persistência do Banco)

### 3.1 Adicionar volume ao auth-server

1. Vá em **auth-server** → **Volumes**
2. Clique em **"+ Add Volume"**
3. Configure:
   - **Mount Path:** `/app/data`
   - **Size:** `1GB` (suficiente para o SQLite)
4. Clique em **"Save"**
5. Redeploy o serviço

---

## 🌐 Passo 4: Configurar DNS (Se usar domínio próprio)

Configure no seu provedor DNS:

### Para o Backend:
```
Type: A ou CNAME
Name: api-dashboard
Value: IP do Easypanel ou CNAME fornecido
```

### Para o Frontend:
```
Type: A ou CNAME
Name: dashboard (ou @)
Value: IP do Easypanel ou CNAME fornecido
```

---

## ✅ Passo 5: Testar o Deploy

### 5.1 Verificar Backend

Acesse: `https://api-dashboard.seu-dominio.com/api/health`

Resposta esperada:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 5.2 Verificar Frontend

Acesse: `https://dashboard.seu-dominio.com`

Você deve ver a tela de login.

### 5.3 Fazer Login

- **Usuário:** `admin`
- **Senha:** `admin123`

⚠️ **ALTERE A SENHA IMEDIATAMENTE!**

---

## 🔄 Passo 6: Configurar Auto-Deploy (Opcional)

1. Vá em **Settings** de cada serviço
2. Ative **"Auto Deploy"**
3. Agora cada push no GitHub fará deploy automático

---

## 📊 Passo 7: Monitoramento

### Ver Logs do Backend:
1. Acesse **auth-server** → **Logs**
2. Verifique se não há erros

### Ver Logs do Frontend:
1. Acesse **dashboard** → **Logs**
2. Verifique se o build foi bem-sucedido

---

## 🐛 Troubleshooting

### ❌ Erro: "ERR_CONNECTION_REFUSED"

**Causa:** Frontend não consegue conectar ao backend

**Solução:**
1. Verifique se o backend está rodando (veja os logs)
2. Confirme que `REACT_APP_AUTH_API_URL` aponta para a URL PÚBLICA do backend
3. Verifique se o domínio do backend está acessível

### ❌ Erro: "Cannot read properties of undefined"

**Causa:** Variáveis de ambiente não configuradas corretamente

**Solução:**
1. Verifique os Build Arguments do frontend
2. Rebuild o frontend após corrigir
3. Limpe o cache do navegador

### ❌ Erro 500 no backend

**Causa:** Banco de dados não persistido ou erro de permissão

**Solução:**
1. Verifique se o volume está configurado em `/app/data`
2. Veja os logs do backend para mais detalhes
3. Redeploy o backend

### ❌ Login não funciona

**Causa:** JWT_SECRET não configurado ou diferente entre deployments

**Solução:**
1. Verifique se `JWT_SECRET` está configurado no backend
2. Use o mesmo valor em todos os deployments
3. Redeploy o backend

---

## 🔒 Segurança em Produção

### ✅ Checklist de Segurança:

- [ ] Alterar senha do admin após primeiro login
- [ ] Usar JWT_SECRET forte (mínimo 32 caracteres aleatórios)
- [ ] Habilitar HTTPS (Easypanel faz automaticamente)
- [ ] Configurar backup do volume do banco de dados
- [ ] Não commitar arquivos `.env` no Git
- [ ] Usar domínio próprio com SSL
- [ ] Monitorar logs regularmente

---

## 📦 Backup do Banco de Dados

### Via Easypanel:

1. Acesse **auth-server** → **Volumes**
2. Clique no volume `/app/data`
3. Clique em **"Download"**
4. Salve o arquivo `auth.db`

### Via CLI (se tiver acesso SSH):

```bash
docker cp dashboard-auth-server:/app/data/auth.db ./backup-$(date +%Y%m%d).db
```

---

## 🎯 Próximos Passos

1. ✅ Alterar senha do admin
2. ✅ Criar usuários corretores
3. ✅ Configurar domínios customizados
4. ✅ Configurar backup automático
5. ✅ Monitorar uso de recursos
6. ✅ Adicionar analytics (opcional)

---

## 📞 Suporte

- **Easypanel Docs:** https://easypanel.io/docs
- **Dashboard Issues:** https://github.com/seu-usuario/dashboard_Corazza/issues

---

**Deploy realizado com sucesso!** 🎉

Desenvolvido para **Dashboard Corazza** 🏢
