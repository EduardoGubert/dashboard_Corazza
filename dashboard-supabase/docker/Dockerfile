# Build stage
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production && npm cache clean --force

# Copia o restante dos arquivos do projeto
COPY . .

# Define as variáveis de ambiente de build (serão injetadas pelo EasyPanel)
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

# Build da aplicação para produção
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia o build do React para o nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]