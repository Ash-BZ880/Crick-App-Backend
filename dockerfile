# Backend Dockerfile
FROM node:18.17-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

EXPOSE 5000

CMD ["node", "server.js"]
