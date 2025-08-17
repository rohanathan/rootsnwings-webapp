# 1. Base Image: Use the official Node.js image
FROM node:18-alpine AS base
WORKDIR /app

# 2. Builder Stage: Install all dependencies and build the application
FROM base AS builder
# Copy package files and install ALL dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js app in standalone mode
RUN npm run build

# 3. Final Runner Stage: Create the lean production image
FROM base AS runner
ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only the necessary artifacts from the builder stage
# This includes the standalone server, public assets, and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose port and start the server
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]