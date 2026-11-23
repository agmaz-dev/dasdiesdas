# ---- Abhängigkeiten & Build ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---- Laufzeit (schlankes Standalone-Image) ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/data/uploads
RUN useradd --system --uid 1001 app && mkdir -p /data/uploads && chown -R app /data
COPY --from=builder --chown=app /app/.next/standalone ./
COPY --from=builder --chown=app /app/.next/static ./.next/static
COPY --from=builder --chown=app /app/public ./public
USER app
EXPOSE 3000
VOLUME ["/data/uploads"]
CMD ["node", "server.js"]
