#!/bin/bash

# DSP Voice Processing Application - Start Script
# Usage: ./run.sh [backend|frontend|all]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

start_backend() {
    echo "🚀 Starting Backend..."
    source venv/bin/activate
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

start_frontend() {
    echo "🎨 Starting Frontend..."
    cd frontend
    npm run dev
}

start_all() {
    echo "🚀 Starting both Backend & Frontend..."
    # Start backend in background
    source venv/bin/activate
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Start frontend
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Services started:"
    echo "   Backend:  http://localhost:8000 (PID: $BACKEND_PID)"
    echo "   Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for both
    wait
}

case "${1:-all}" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    all|*)
        start_all
        ;;
esac
