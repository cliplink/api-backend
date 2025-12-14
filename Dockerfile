FROM node:20-alpine

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./

# Устанавливаем зависимости
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm install; fi

COPY . .

# Сборка только для прод
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# Команды по режиму
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node dist/main.js; else npm run start:dev; fi"]