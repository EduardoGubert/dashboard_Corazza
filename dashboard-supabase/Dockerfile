# Build stage
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala dependências (usa legacy-peer-deps para resolver conflitos)
RUN npm install --legacy-peer-deps

# Copia todo o código fonte
COPY . ./

# Build args - variáveis de ambiente
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_AUTH_API_URL

ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_AUTH_API_URL=$REACT_APP_AUTH_API_URL

# Debug
RUN echo "Building with Supabase URL: $REACT_APP_SUPABASE_URL"
RUN echo "Building with Auth API: $REACT_APP_AUTH_API_URL"

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