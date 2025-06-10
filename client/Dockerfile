# Vite-basiertes Build - löst AJV-Probleme
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install with specific fixes für AJV Problem
RUN npm install --legacy-peer-deps --force && \
    npm install ajv@^8.0.0 --save-dev --legacy-peer-deps

# Copy source code
COPY . .

# Build environment variables
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=http://localhost:1113
ENV REACT_APP_SOCKET_URL=http://localhost:1113
ENV CI=false

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Create nginx cache directories
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]