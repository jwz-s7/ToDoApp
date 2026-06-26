FROM node:22-bullseye-slim

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências primeiro para aproveitar cache de camadas
COPY package*.json ./

# Instala dependências: usa npm ci quando existe package-lock, senão npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código para o container
COPY . .

# Expõe a porta usada pela aplicação
EXPOSE 3000

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
