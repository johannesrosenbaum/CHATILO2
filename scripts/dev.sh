#!/bin/bash

echo "🚀 Starting CHATILO Development Environment..."

# Stop existing containers
docker-compose down

# Build and start services
docker-compose up --build

echo "✅ CHATILO Development Environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:1113"
echo "📊 MongoDB: localhost:27017"
