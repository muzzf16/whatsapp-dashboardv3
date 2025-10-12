# WhatsApp Dashboard

## Project Overview

WhatsApp Dashboard is a full-stack application that provides a web-based interface for managing WhatsApp sessions using the Baileys library (WhatsApp Web API). It allows users to connect multiple WhatsApp accounts, scan QR codes, manage chats, and send/receive messages through a web dashboard.

**Architecture**: The application follows a modern full-stack architecture with:
- **Frontend**: Next.js 14 application with TypeScript, Tailwind CSS, and Socket.IO client
- **Backend**: Node.js/Express server with TypeScript, Baileys library, MongoDB, and Socket.IO
- **Database**: MongoDB for storing session information

## Building and Running

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

### Setup Instructions

1. **Clone and navigate to project directory**
   ```bash
   cd whatsapp-dashboard
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in `backend/` with:
     ```
     MONGODB_URI=mongodb://localhost:27017/whatsapp-dashboard
     FRONTEND_URL=http://localhost:3000
     PORT=5000
     ```
   - Frontend uses `.env.local` for environment variables

4. **Running the Application**

   **Option 1: Using start scripts**
   ```bash
   # On Windows (PowerShell)
   .\start.ps1
   
   # On Linux/Mac
   ./start.sh
   ```

   **Option 2: Manual start**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

### Available Scripts

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Conventions

### Backend Architecture
- **Routes**: Organized by feature (sessions, messages)
- **Controllers**: Handle request/response logic
- **Services**: Business logic and external API integration (whatsapp.service.ts)
- **Models**: Mongoose schemas for MongoDB

### Frontend Architecture
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for state management
- **Lib**: API clients and utility functions
- **App Router**: Next.js 14 file-based routing system

### Code Style
- TypeScript with strict typing
- Asynchronous operations using async/await
- Error handling with try/catch blocks
- Consistent naming conventions (camelCase for variables, PascalCase for components)
