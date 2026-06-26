# Reliable Node build for Coolify's "Dockerfile" build pack.
# Avoids Nixpacks' flaky cold nixpkgs fetch (the recurring exit-255 in stage
# "nix-env -if ..."). To use: set this app's Build Pack to "Dockerfile" in Coolify.
# (No `# syntax=` directive on purpose — we use no BuildKit-frontend features,
#  so we skip pulling docker/dockerfile:1.)

# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* must be present at BUILD time — Next inlines them into the client
# bundle. Coolify passes these as --build-arg from the app's env vars.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY package.json package-lock.json ./
# Use `npm install` (not `npm ci`): the lockfile is generated on Windows and is
# missing some Linux-only optional deps (e.g. @emnapi/*), which makes strict
# `npm ci` fail. `npm install` resolves them — same behavior Nixpacks used.
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
