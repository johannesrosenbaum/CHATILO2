# Server Dockerfile - OPTIMIERT
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Create user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatilo -u 1001

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY --chown=chatilo:nodejs . .

# Create uploads directory
RUN mkdir -p uploads/images && \
    chown -R chatilo:nodejs uploads

# Switch to non-root user
USER chatilo

# Expose port
EXPOSE 1113

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1113/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start server
CMD ["node", "server.js"]
