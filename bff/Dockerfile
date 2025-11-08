FROM node:20
RUN apt-get update && apt-get install -y libreoffice
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "./src/server.js"]