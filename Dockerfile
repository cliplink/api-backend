FROM node:20-alpine

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

ARG CLIPLINK_PACKAGES_TOKEN
ENV CLIPLINK_PACKAGES_TOKEN=${CLIPLINK_PACKAGES_TOKEN}

COPY .npmrc ./
COPY package*.json ./

RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm install; fi

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node dist/main.js; else npm run start:dev; fi"]