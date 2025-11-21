FROM node:18-alpine

WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia código fonte
COPY . .

# Expõe a porta
EXPOSE 5000

# Comando de inicialização
CMD ["node", "server.js"]
