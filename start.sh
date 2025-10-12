#!/bin/bash
echo "Starting WhatsApp Dashboard Application..."

# Start the backend server in development mode
echo "Starting backend server..."
cd backend
npx nodemon src/app.ts &
BACKEND_PID=$!

# Start the frontend in development mode  
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Function to stop servers on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap exit signal
trap cleanup EXIT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID