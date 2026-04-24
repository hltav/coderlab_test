FROM node:22-alpine
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend .
RUN npx prisma generate --config prisma.config.ts
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]