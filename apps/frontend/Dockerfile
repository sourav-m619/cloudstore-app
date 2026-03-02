# ── Stage 1: Build React app ──────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY public/ ./public/
COPY src/    ./src/
ARG  REACT_APP_API_URL=/api/v1
ENV  REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ── Stage 2: Development (hot reload) ─────────────────
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY public/ ./public/
COPY src/    ./src/
EXPOSE 3000
CMD ["npm", "start"]

# ── Stage 3: Production (hardened nginx) ──────────────
FROM nginx:1.25-alpine AS production

# Non-root nginx setup
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx   && \
    touch /var/run/nginx.pid  && \
    chown -R appuser:appgroup /var/run/nginx.pid

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=appuser:appgroup /app/build /usr/share/nginx/html

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
