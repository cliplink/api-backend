FROM node:20-alpine AS builder

WORKDIR /app

ARG CLIPLINK_PACKAGES_TOKEN
ENV CLIPLINK_PACKAGES_TOKEN=${CLIPLINK_PACKAGES_TOKEN}

COPY .npmrc ./
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

## Development
FROM node:20-alpine AS development

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

ARG CLIPLINK_PACKAGES_TOKEN
ENV CLIPLINK_PACKAGES_TOKEN=${CLIPLINK_PACKAGES_TOKEN}

COPY .npmrc ./
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

## Production
FROM node:20-alpine AS production

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG CLIPLINK_PACKAGES_TOKEN
ENV CLIPLINK_PACKAGES_TOKEN=${CLIPLINK_PACKAGES_TOKEN}

COPY .npmrc ./
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]