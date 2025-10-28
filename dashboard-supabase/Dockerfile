# Build stage
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json E package-lock.json da pasta pai
COPY ../package.json ../package-lock.json ./

# Instala dependências
RUN npm ci

# Copia todo o código fonte da pasta pai
COPY ../ ./

# Build args
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

# Debug
RUN echo "Building with URL: $REACT_APP_SUPABASE_URL"

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