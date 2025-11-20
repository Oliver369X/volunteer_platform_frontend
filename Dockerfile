# ============================================
# MULTI-STAGE BUILD - Frontend con Nginx
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Argumento de build para la URL del API (se puede sobreescribir)
ARG VITE_API_BASE_URL=https://api.example.com/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build de producción
RUN npm run build

# ============================================
# Stage 2: Production con Nginx
FROM nginx:alpine

# Información del mantenedor
LABEL maintainer="La Causa Platform Team"
LABEL description="Frontend - Volunteer Intelligence Platform"

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]

