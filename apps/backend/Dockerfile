# ── Stage 1: Dependencies ─────────────────────────────
FROM node:20-alpine3.9 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Development (hot reload) ─────────────────
FROM node:20-alpine3.9 AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
EXPOSE 8080
CMD ["node", "src/server.js"]

# ── Stage 3: Production (hardened) ────────────────────
FROM node:20-alpine3.9 AS production

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

WORKDIR /app

# Copy production deps only
COPY --from=deps --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs src/ ./src/
COPY --chown=nodeapp:nodejs package.json ./

USER nodeapp
EXPOSE 8080

# Built-in health check for K8s
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

CMD ["node", "src/server.js"]
