FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
EXPOSE 3000
# Avvio che crea le tabelle da solo (db push)
CMD ["sh", "-c", "npx prisma db push && npm run start"]