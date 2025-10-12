# WhatsApp Dashboard - QWEN Context

## Project Overview

WhatsApp Dashboard is a full-stack application that provides a web-based interface for managing WhatsApp sessions using the Baileys library (WhatsApp Web API). It allows users to connect multiple WhatsApp accounts, scan QR codes, manage chats, and send/receive messages through a web dashboard.

**Architecture**: The application follows a modern full-stack architecture with:
- **Frontend**: Next.js 14 application with TypeScript, Tailwind CSS, and Socket.IO client
- **Backend**: Node.js/Express server with TypeScript, Baileys library, MongoDB, and Socket.IO
- **Database**: MongoDB for storing session information

## Key Features

- **Multi-Session Management**: Create and manage multiple WhatsApp sessions simultaneously
- **QR Code Authentication**: Secure login via QR code scanning through the web interface
- **Real-time Messaging**: WebSockets for real-time message synchronization
- **Chat Interface**: Web-based chat interface to view and respond to messages
- **Session Persistence**: Sessions are stored in MongoDB with authentication state persistence
- **Auto-reply Functionality**: Basic auto-reply rules implementation

## Project Structure

```
whatsapp-dashboard/
├── backend/                    # Express.js backend server
│   ├── src/
│   │   ├── app.ts             # Main server file
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (WhatsApp service)
│   │   └── utils/             # Utility functions
│   ├── temp_sessions/         # Temporary session files for Baileys
│   └── package.json
└── frontend/                   # Next.js frontend application
    ├── app/                   # Next.js 14 app directory
    ├── components/            # React components
    ├── lib/                   # Utility libraries (Socket.IO client, API calls)
    ├── hooks/                 # Custom React hooks (useSessionStore)
    └── package.json
```

## Technologies Used

### Backend
- **Node.js/Express**: Web server framework
- **TypeScript**: Type-safe JavaScript
- **Baileys**: WhatsApp Web API library (@whiskeysockets/baileys)
- **MongoDB/Mongoose**: Database and ODM
- **Socket.IO**: Real-time bidirectional event-based communication
- **QRCode**: QR code generation
- **CORS**: Cross-origin resource sharing

### Frontend
- **Next.js 14**: React framework with app directory
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication client
- **Zustand**: State management
- **Lucide React**: Icon library

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

## Key Components

### Backend Services
- **whatsapp.service.ts**: Core WhatsApp integration using Baileys library
- **Session management**: Handles QR code generation, authentication, and connection persistence
- **Socket.IO integration**: Real-time communication with frontend

### Frontend Components
- **Dashboard (page.tsx)**: Main application layout
- **Sidebar**: Session management UI
- **QRCodeModal**: Modal for QR code scanning
- **ChatList/ChatWindow**: Messaging interface
- **useSessionStore**: Zustand store for session management

## API Endpoints

### Sessions API
- `POST /api/sessions/init` - Initialize new WhatsApp session and generate QR code
- `GET /api/sessions` - Get list of active sessions
- `DELETE /api/sessions/:id` - Delete/clear session

### Messages API
- Endpoints for sending and receiving messages are handled via Socket.IO events

### Socket.IO Events
- `qr_update` - Emit QR code to frontend when new session created
- `connection_open` - Emit when WhatsApp connection is established
- `message_received` - Emit when new message arrives

## Database Schema

### Session Model
- `sessionId` - Unique identifier for each session
- `sessionData` - Authentication credentials and keys (stored in encrypted form)
- `status` - Connection status (CONNECTED/DISCONNECTED)
- `phoneNumber` - Associated phone number (when available)
- `updatedAt` - Last update timestamp

## Security Considerations

- Session data is stored in both temporary files and MongoDB
- Authentication state is persisted for reconnection capability
- QR codes are transmitted via WebSockets and displayed only during connection setup
- Input validation is implemented in API routes

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Port Conflicts**: Default ports are 3000 (frontend) and 5000 (backend)
3. **QR Code Issues**: Session files are stored in `temp_sessions/` directory
4. **Authentication**: Session persistence may fail if temporary files are removed

### Connection Flow
1. User initiates new session via frontend
2. Backend generates unique session ID and creates DB entry
3. Baileys library generates QR code and emits to frontend via Socket.IO
4. User scans QR code with WhatsApp mobile app
5. Connection is established and status is updated in DB
6. Subsequent messages are relayed via Socket.IO

## Future Enhancements

Potential areas for improvement:
- Enhanced auto-reply rules with n8n integration
- Message history pagination
- Group chat management
- File/media message support
- Advanced session management features
- Message templates and scheduled messages