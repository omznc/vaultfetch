FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS release
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]

