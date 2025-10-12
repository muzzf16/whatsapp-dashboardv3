import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { sessionRoutes } from './routes/session.routes';
import { messageRoutes } from './routes/message.routes';
import { groupRoutes } from './routes/group.routes';
import { templateRoutes } from './routes/template.routes';
import { scheduledMessageRoutes } from './routes/scheduled-message.routes';
import { apiConfigRoutes } from './routes/api-config.routes';
import { queuedMessageRoutes } from './routes/queued-message.routes';
import { v1ApiRoutes } from './routes/v1/message.routes';
import { v1GroupRoutes } from './routes/v1/group.routes';
import { v1ContactRoutes } from './routes/v1/contact.routes';
import { v1SessionRoutes } from './routes/v1/session.routes';
import { apiDocsRoutes } from './routes/api-docs.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { whatsappService } from './services/whatsapp.service';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/scheduled-messages', scheduledMessageRoutes);
app.use('/api/config', apiConfigRoutes);
app.use('/api/queued-messages', queuedMessageRoutes);

// V1 API routes with authentication
app.use('/api/v1', v1ApiRoutes);
app.use('/api/v1', v1GroupRoutes);
app.use('/api/v1', v1ContactRoutes);
app.use('/api/v1', v1SessionRoutes);
app.use('/api/v1', apiDocsRoutes);
app.use('/api/v1', webhookRoutes);

// Lightweight health endpoint
app.get('/health', (req, res) => {
  try {
    const active = whatsappService.getAllConnections();
    res.status(200).json({ status: 'ok', activeConnections: active });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-dashboard';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      whatsappService.loadPreviousSessions();
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

export { io };