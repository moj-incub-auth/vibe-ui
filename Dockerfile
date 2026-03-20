# Base image
FROM registry.redhat.io/ubi8/nodejs-20-minimal:latest AS base
# Install dependencies only when needed
FROM base AS deps
#RUN apk add --no-cache libc6-compat

WORKDIR /opt/app-root/src

# Copy package files
COPY package*.json ./


# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /opt/app-root/src
USER root
COPY --from=deps /opt/app-root/src/node_modules ./node_modules
COPY . .

# Environment variables for build
# Next.js collects anonymous telemetry data about general usage
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /opt/app-root/src

RUN mkdir -p  /tmp/nextjs/
COPY testconfig /tmp/nextjs/.env

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime configuration - these can be overridden when starting the container
# Example: docker run -e SEARCH_API_URL=https://api.example.com -e ENABLE_FILTERS=true
ENV SEARCH_API_URL=
ENV ENABLE_FILTERS=false

USER 1001

# Copy built application
COPY --from=builder /opt/app-root/src/public ./public
COPY --from=builder /opt/app-root/src/.next/standalone ./
COPY --from=builder /opt/app-root/src/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

