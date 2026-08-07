# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arguments — override in docker-compose to point at your API origins
ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_PUBLIC_API_ORIGIN=http://localhost:3000
ARG VITE_AI_SERVICE_URL=http://localhost:8000

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_PUBLIC_API_ORIGIN=${VITE_PUBLIC_API_ORIGIN}
ENV VITE_AI_SERVICE_URL=${VITE_AI_SERVICE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve static files ──
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]