# 🚀 Guia de Deploy - Dashboard Corazza

## 📋 Problema Identificado

As variáveis de ambiente `REACT_APP_*` precisam estar disponíveis **durante o build** da aplicação React, não apenas em runtime. Isso acontece porque:

1. React apps são aplicações estáticas compiladas
2. Durante o `npm run build`, o Webpack/React substitui `process.env.REACT_APP_*` pelos valores reais
3. O resultado é um bundle JavaScript com os valores "hardcoded"
4. Definir variáveis de ambiente no `docker-compose.yml` ou Portainer **não funciona** para React apps já compilados

## ✅ Solução: Build com Variáveis Corretas

### Opção 1: Usando o Script Automatizado (Recomendado)

#### No Windows:
```bash
# Execute o script que já lê o .env.production
.\build-and-push.bat
```

#### No Linux/Mac:
```bash
# Dê permissão de execução
chmod +x build-and-push.sh

# Execute o script
./build-and-push.sh
```

O script irá:
1. ✅ Ler as variáveis do `.env.production`
2. ✅ Fazer build da imagem Docker com as variáveis corretas
3. ✅ Perguntar se deseja fazer push para o Docker Hub
4. ✅ Fazer push da nova imagem

### Opção 2: Manualmente

```bash
# 1. Faça login no Docker Hub
docker login

# 2. Build com as variáveis de ambiente do .env.production
docker build \
  --build-arg REACT_APP_SUPABASE_URL="https://lfwskweeqcuvgoeoreyb.supabase.co" \
  --build-arg REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd3Nrd2VlcWN1dmdvZW9yZXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzQzMzMsImV4cCI6MjA2MzUxMDMzM30.bSg4_NPEoSX4Q9k5G58NXlHeUKFYG7D-X-3MYe3r7xA" \
  --build-arg REACT_APP_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd3Nrd2VlcWN1dmdvZW9yZXliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzNDMzMywiZXhwIjoyMDYzNTEwMzMzfQ.QS2iVn9oOh5Xs-TXZXGbSSu9OGnQeK2aIj2MxXsr0Fs" \
  -t eduardogubert/dashboard-corazza:latest \
  .

# 3. Push para o Docker Hub
docker push eduardogubert/dashboard-corazza:latest
```

## 🔄 Atualizar no Portainer

Após fazer o push da nova imagem:

1. Acesse o Portainer
2. Vá em **Stacks** → Selecione seu stack
3. Clique em **"Pull and redeploy"** ou **"Update the stack"**
4. Aguarde o deployment
5. Verifique os logs para confirmar que não há mais erros de conexão

## 🔍 Verificar se Funcionou

Após o deploy, abra o navegador e:

1. Acesse: https://dashboard.atendimentodeia.com.br
2. Abra o DevTools (F12)
3. Vá na aba **Console**
4. Se não aparecer erro `supabaseUrl is required`, está funcionando! ✅

## 🛠️ Alternativa: Runtime Configuration (Mais Complexo)

Se você precisa mudar as variáveis sem rebuild, pode usar configuração em runtime:

### 1. Criar arquivo de configuração
Crie `public/config.js`:
```javascript
window._env_ = {
  REACT_APP_SUPABASE_URL: 'https://lfwskweeqcuvgoeoreyb.supabase.co',
  REACT_APP_SUPABASE_ANON_KEY: 'sua-chave-anon'
};
```

### 2. Incluir no HTML
No `public/index.html`, adicione antes de outros scripts:
```html
<script src="%PUBLIC_URL%/config.js"></script>
```

### 3. Usar no código
No `supabase.ts`, o código já está preparado:
```typescript
const supabaseUrl = (window as any)._env_?.REACT_APP_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
```

### 4. Substituir em runtime com Docker
```dockerfile
# No Dockerfile, adicione antes do CMD:
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

Crie `docker-entrypoint.sh`:
```bash
#!/bin/sh
# Substitui variáveis no config.js
envsubst < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.js.tmp
mv /usr/share/nginx/html/config.js.tmp /usr/share/nginx/html/config.js

# Inicia nginx
nginx -g 'daemon off;'
```

**⚠️ Nota:** Esta alternativa é mais complexa. Use apenas se realmente precisar mudar variáveis sem rebuild.

## 📝 Checklist de Deploy

- [ ] Verificar que `.env.production` tem as credenciais corretas
- [ ] Executar `build-and-push.bat` (Windows) ou `build-and-push.sh` (Linux/Mac)
- [ ] Confirmar push para Docker Hub
- [ ] Atualizar stack no Portainer com "Pull and redeploy"
- [ ] Verificar logs no Portainer (sem erros de Supabase)
- [ ] Testar acesso ao dashboard no navegador
- [ ] Verificar DevTools Console (sem erros de conexão)

## ⚠️ Importante

- **Nunca** commite `.env.production` no Git (já está no .gitignore)
- As credenciais do Supabase devem ser mantidas seguras
- Ao mudar credenciais, sempre faça novo build + push da imagem

## 🆘 Troubleshooting

### Erro: "supabaseUrl is required"
- ➡️ A imagem foi buildada sem as variáveis de ambiente
- ✅ Solução: Rebuild com `build-and-push.bat/sh`

### Erro: "Failed to load resource: 404"
- ➡️ Problema de configuração do Nginx ou Traefik
- ✅ Verifique os logs do container e configuração de rotas

### Erro: "Invalid API key"
- ➡️ A chave do Supabase está incorreta
- ✅ Verifique no dashboard do Supabase e atualize `.env.production`

---

**Última atualização:** 2025-12-04
