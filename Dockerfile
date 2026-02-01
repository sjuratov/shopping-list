FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY server.js .
COPY shopping-list.html .
COPY .env.example .

EXPOSE 3000

CMD ["node", "server.js"]
