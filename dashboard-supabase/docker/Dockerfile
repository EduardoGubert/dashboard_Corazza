FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]