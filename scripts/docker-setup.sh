#!/bin/bash

# CHATILO3 Docker Setup Script
# This script helps you set up and manage the CHATILO3 Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! docker-compose --version > /dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to build and start production environment
start_production() {
    print_status "Starting CHATILO3 in production mode..."
    
    # Build and start all services
    docker-compose up -d --build
    
    print_success "CHATILO3 production environment started!"
    print_status "Access points:"
    echo "  🌐 Frontend: http://localhost"
    echo "  🔧 Backend API: http://localhost:1113"
    echo "  🗄️  MongoDB Express: http://localhost:8081 (admin/chatilo123)"
    echo "  📊 MongoDB: localhost:27017"
}

# Function to start development environment
start_development() {
    print_status "Starting CHATILO3 in development mode..."
    
    # Start only MongoDB and server in development mode
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "CHATILO3 development environment started!"
    print_status "Access points:"
    echo "  🔧 Backend API: http://localhost:1113"
    echo "  🗄️  MongoDB Express: http://localhost:8081 (admin/chatilo123)"
    echo "  📊 MongoDB: localhost:27017"
    echo ""
    print_warning "For frontend development, run 'npm start' in the client directory"
}

# Function to stop all containers
stop_all() {
    print_status "Stopping all CHATILO3 containers..."
    
    # Stop production containers
    docker-compose down
    
    # Stop development containers
    docker-compose -f docker-compose.dev.yml down
    
    print_success "All containers stopped"
}

# Function to clean up everything
cleanup() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up CHATILO3 environment..."
        
        # Stop and remove containers
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        
        # Remove images
        docker rmi chatilo-app_client chatilo-app_server 2>/dev/null || true
        
        # Remove volumes
        docker volume rm chatilo-app_mongodb_data chatilo-app_mongodb_data_dev 2>/dev/null || true
        
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to show logs
show_logs() {
    local service=${1:-"all"}
    
    if [ "$service" = "all" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Function to show status
show_status() {
    print_status "CHATILO3 container status:"
    docker-compose ps
    
    echo ""
    print_status "Development container status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to restart services
restart_services() {
    local service=${1:-"all"}
    
    if [ "$service" = "all" ]; then
        print_status "Restarting all services..."
        docker-compose restart
    else
        print_status "Restarting $service..."
        docker-compose restart "$service"
    fi
}

# Function to show help
show_help() {
    echo "CHATILO3 Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod          Start production environment (all services)"
    echo "  dev           Start development environment (MongoDB + Server only)"
    echo "  stop          Stop all containers"
    echo "  restart       Restart all services"
    echo "  restart [svc] Restart specific service"
    echo "  logs          Show logs for all services"
    echo "  logs [svc]    Show logs for specific service"
    echo "  status        Show container status"
    echo "  cleanup       Remove all containers, volumes, and images"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod       # Start production environment"
    echo "  $0 dev        # Start development environment"
    echo "  $0 logs server # Show server logs"
    echo "  $0 restart client # Restart client service"
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_docker_compose
    
    case "${1:-help}" in
        "prod"|"production")
            start_production
            ;;
        "dev"|"development")
            start_development
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            restart_services "$2"
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 