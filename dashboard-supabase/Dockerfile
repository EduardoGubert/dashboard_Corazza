# Build stage
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências (usa legacy-peer-deps para resolver conflitos)
RUN npm install --legacy-peer-deps

# Copia todo o código fonte
COPY . ./
RUN npm run build
# Build args - variáveis de ambiente do Supabase
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia build
COPY --from=builder /app/build /usr/share/nginx/html

# Copia nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]