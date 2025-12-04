#!/bin/bash

# Script para fazer build e push da imagem Docker com variáveis de ambiente
# Este script lê as variáveis do .env.production e passa como build args

# Carrega variáveis do .env.production
set -a
source .env.production
set +a

# Nome da imagem
IMAGE_NAME="eduardogubert/dashboard-corazza"
TAG="latest"

echo "🔨 Construindo imagem Docker com variáveis de ambiente..."
echo "📦 Imagem: $IMAGE_NAME:$TAG"
echo ""

# Build da imagem passando as variáveis como build args
docker build \
  --build-arg REACT_APP_SUPABASE_URL="$REACT_APP_SUPABASE_URL" \
  --build-arg REACT_APP_SUPABASE_ANON_KEY="$REACT_APP_SUPABASE_ANON_KEY" \
  --build-arg REACT_APP_SUPABASE_SERVICE_ROLE_KEY="$REACT_APP_SUPABASE_SERVICE_ROLE_KEY" \
  -t $IMAGE_NAME:$TAG \
  .

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build concluído com sucesso!"
  echo ""
  read -p "Deseja fazer push para o Docker Hub? (s/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "📤 Fazendo push da imagem..."
    docker push $IMAGE_NAME:$TAG

    if [ $? -eq 0 ]; then
      echo "✅ Push concluído! Agora você pode atualizar no Portainer."
      echo ""
      echo "📋 No Portainer:"
      echo "   1. Vá em Stacks → Seu stack"
      echo "   2. Clique em 'Pull and redeploy'"
      echo "   3. Aguarde o deploy"
    else
      echo "❌ Erro ao fazer push da imagem"
      exit 1
    fi
  else
    echo "ℹ️  Push cancelado. Para fazer push manualmente:"
    echo "   docker push $IMAGE_NAME:$TAG"
  fi
else
  echo "❌ Erro no build da imagem"
  exit 1
fi
