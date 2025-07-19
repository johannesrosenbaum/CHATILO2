# Node.js Server Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/avatars uploads/images uploads/videos uploads/files

# Create logs directory
RUN mkdir -p logs

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 1113

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]
