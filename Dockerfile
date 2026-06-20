# ─── Stage 1 : Build Vite ─────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# L'URL du backend en production (peut être overridée au build)
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2 : Serveur Nginx ──────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copier le build Vite dans le répertoire Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx pour React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
