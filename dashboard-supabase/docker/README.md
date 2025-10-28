# 🚀 Deploy do Dashboard Corazza

## 📋 Pré-requisitos

- Docker instalado no servidor
- Docker Compose instalado
- Domínio configurado: `dashboard.atendimentodeia.com.br`
- Credenciais do Supabase

## 🔧 Configuração

### 1. Clone o repositório no servidor

```bash
git clone https://github.com/EduardoGubert/dashboard_Corazza.git
cd dashboard_Corazza/dashboard-supabase
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env
```

Preencha com suas informações:
```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
NODE_ENV=production
```

### 3. Build e start do container

```bash
# Build da imagem
docker-compose -f docker/docker-compose.yml build

# Iniciar o container
docker-compose -f docker/docker-compose.yml up -d
```

## 🌐 Configuração do Reverse Proxy (Nginx/Traefik)

### Opção 1: Nginx no host

Se você já tem Nginx no servidor, adicione esta configuração:

```nginx
server {
    listen 80;
    server_name dashboard.atendimentodeia.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.atendimentodeia.com.br;

    ssl_certificate /etc/letsencrypt/live/dashboard.atendimentodeia.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.atendimentodeia.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Opção 2: Traefik (já configurado no docker-compose.yml)

Se usar Traefik, ele já está configurado no `docker-compose.yml` com Let's Encrypt automático.

## 📊 Comandos Úteis

```bash
# Ver logs do container
docker-compose -f docker/docker-compose.yml logs -f

# Parar o container
docker-compose -f docker/docker-compose.yml stop

# Reiniciar o container
docker-compose -f docker/docker-compose.yml restart

# Remover o container
docker-compose -f docker/docker-compose.yml down

# Rebuild completo (após mudanças no código)
docker-compose -f docker/docker-compose.yml up -d --build

# Ver status do container
docker-compose -f docker/docker-compose.yml ps

# Acessar o container
docker exec -it dashboard-corazza sh
```

## 🔐 SSL/HTTPS com Let's Encrypt

### Usando Certbot (Nginx)

```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d dashboard.atendimentodeia.com.br

# Renovação automática (já configurado pelo certbot)
sudo certbot renew --dry-run
```

## 🔄 Atualização do Projeto

```bash
# 1. Puxar últimas mudanças
git pull origin main

# 2. Rebuild e restart
docker-compose -f docker/docker-compose.yml up -d --build
```

## 🐛 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose -f docker/docker-compose.yml logs

# Verificar se a porta 80 está em uso
sudo netstat -tlnp | grep :80

# Verificar status do Docker
sudo systemctl status docker
```

### Erro de variáveis de ambiente
```bash
# Verificar se o .env existe e está correto
cat .env

# Recriar o container
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d --build
```

### Problemas de conexão com Supabase
- Verifique se as URLs e keys no `.env` estão corretas
- Confirme que o Supabase está acessível do servidor
- Verifique os logs do navegador (F12 > Console)

## 📈 Monitoramento

```bash
# CPU e Memória do container
docker stats dashboard-corazza

# Healthcheck status
docker inspect --format='{{.State.Health.Status}}' dashboard-corazza
```

## 🔒 Segurança

- ✅ HTTPS obrigatório em produção
- ✅ Variáveis de ambiente nunca commitadas no Git
- ✅ Headers de segurança configurados no Nginx
- ✅ Gzip compression habilitado
- ✅ Cache de assets estáticos configurado

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do container: `docker-compose logs -f`
2. Status do DNS: `nslookup dashboard.atendimentodeia.com.br`
3. Firewall: porta 80 e 443 abertas
4. Conexão com Supabase

---

**Domínio:** https://dashboard.atendimentodeia.com.br
**Repositório:** https://github.com/EduardoGubert/dashboard_Corazza
