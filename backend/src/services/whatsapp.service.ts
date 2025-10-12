import { Boom } from '@hapi/boom';
import { io } from '../app';
import { SessionModel } from '../models/Session';
import { ScheduledMessageModel } from '../models/ScheduledMessage';
import {
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  Browsers,
  proto
} from '@whiskeysockets/baileys';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import axios from 'axios';
import cron from 'node-cron';
import pino from 'pino';
import { QueuedMessageModel } from '../models/QueuedMessage';
import { MessageModel } from '../models/Message';
import { ApiConfigModel } from '../models/ApiConfig';

// Connection state manager
class WhatsAppService {
  private connections: Map<string, any> = new Map();
  private connectingSessions: Set<string> = new Set(); // LOCKING MECHANISM
  private latestQr: Map<string, string> = new Map();

  constructor() {
    this.startScheduler();
  }

  async createConnection(sessionId: string) {
    // Lock to prevent multiple concurrent connection attempts
    if (this.connectingSessions.has(sessionId)) {
      console.log(`[Lock] Connection attempt already in progress for ${sessionId}, skipping.`);
      return;
    }
    this.connectingSessions.add(sessionId); // Acquire lock

    try {
      console.log(`Creating connection for session: ${sessionId}`);
      
      const { state, saveCreds } = await this.useDBAuthState(sessionId);
      const { version } = await fetchLatestBaileysVersion();
      
      if (!state) {
        this.connectingSessions.delete(sessionId); // Release lock on failure
        throw new Error('Auth state is not properly initialized');
      }
      
      let logger: any;
      try {
        logger = pino({ level: process.env.BAILEYS_LOG_LEVEL || 'debug' });
      } catch (err) {
        logger = {
          level: 'info', child: (opts: any) => logger, trace: (..._args: any[]) => {},
          debug: (..._args: any[]) => {}, info: (..._args: any[]) => {},
          warn: (..._args: any[]) => {}, error: (..._args: any[]) => {},
        } as any;
      }

      const sock = await import('@whiskeysockets/baileys').then(({ default: makeWASocket }) => 
        makeWASocket({
          version, auth: state, logger, printQRInTerminal: false,
          browser: Browsers.baileys('Desktop'), syncFullHistory: false,
          getMessage: async (key) => ({ conversation: 'Hello' }),
          connectTimeoutMs: 60000, emitOwnEvents: true,
          fireInitQueries: true, markOnlineOnConnect: true,
        })
      );
      
      try {
        const sockAny = sock as any;
        if (!sockAny.chats || typeof sockAny.chats.all !== 'function') {
          const _chats = new Map<string, any>();
          sockAny.chats = {
            all: () => Array.from(_chats.values()), get: (id: string) => _chats.get(id),
            set: (id: string, chat: any) => _chats.set(id, chat), delete: (id: string) => _chats.delete(id),
          } as any;

          sockAny.ev.process(async (events: any) => {
            if (events['chats.set']) {
              for (const chat of events['chats.set']) {
                if (chat.id) _chats.set(chat.id, chat);
              }
            }
            if (events['chats.update']) {
              for (const upd of events['chats.update']) {
                if (upd.id) {
                  const existing = _chats.get(upd.id) || {};
                  _chats.set(upd.id, { ...existing, ...upd });
                }
              }
            }
            try {
              console.log(`In-memory chats store size for ${sessionId}: ${_chats.size}`);
            } catch (err) {}
          });
        }
      }
      catch (err) {
        console.warn('Could not attach in-memory chats store to socket:', err);
      }

      this.connections.set(sessionId, sock);

      try {
        sock.ev.on('creds.update', async () => {
          try {
            console.log(`Creds update detected for ${sessionId}, saving...`);
            await saveCreds();
            console.log(`Creds saved for ${sessionId}`);
          } catch (err) {
            console.error(`Error saving creds for ${sessionId}:`, err);
          }
        });
      } catch (err) {}
      
      sock.ev.process(async (events) => {
        if (events['connection.update']) {
          const update = events['connection.update'];
          const { connection, lastDisconnect, qr } = update;

          // Release lock once connection is established or definitively closed
          if (connection === 'open' || connection === 'close') {
              this.connectingSessions.delete(sessionId);
          }
          
          console.log(`Connection update for ${sessionId}:`, connection);
          
          if (qr) {
            this.latestQr.set(sessionId, qr);
            io.emit('qr_update', { sessionId, qr });
          }
          
          if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`Connection closed for ${sessionId}. Reason: ${Object.keys(DisconnectReason).find(key => DisconnectReason[key as keyof typeof DisconnectReason] === statusCode) || 'unknown'}. Reconnecting: ${shouldReconnect}`);

            io.emit('connection_closed', { sessionId, reason: statusCode || 'unknown' });
            this.connections.delete(sessionId);

            if (shouldReconnect) {
              try {
                await SessionModel.updateOne({ sessionId }, { status: 'DISCONNECTED' });
              } catch (err) {
                console.warn('Failed updating session status to DISCONNECTED:', err);
              }

              setTimeout(() => {
                console.log(`Attempting to reconnect session ${sessionId}...`);
                this.createConnection(sessionId).catch((err) => {
                  console.error(`Reconnect attempt failed for ${sessionId}:`, err);
                });
              }, 5000);
            } else {
              console.log(`Session ${sessionId} logged out, not reconnecting.`);
              try {
                await SessionModel.deleteOne({ sessionId });
                const sessionDir = resolve(`./temp_sessions/${sessionId}`);
                if (existsSync(sessionDir)) {
                  require('fs').rmSync(sessionDir, { recursive: true, force: true });
                }
              } catch (err) {
                console.error(`Failed to clean up session ${sessionId} after logout:`, err);
              }
            }
          }
          
          if (connection === 'open') {
            console.log('Connection opened for session:', sessionId);
            await saveCreds();
            
            await SessionModel.updateOne(
              { sessionId },
              { status: 'CONNECTED', phoneNumber: sock.user?.id?.split(':')[0] }
            );
            
            io.emit('connection_open', { sessionId, phoneNumber: sock.user?.id });
          }
        }
        
        // Handle received messages
        if (events['messages.upsert']) {
          const upsert = events['messages.upsert'];
          if (upsert.messages) {
            for (const msg of upsert.messages) {
              const messageData = {
                sessionId,
                chatId: msg.key.remoteJid,
                messageId: msg.key.id,
                fromMe: !!msg.key.fromMe,
                content: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
                timestamp: msg.messageTimestamp,
                type: msg.message?.imageMessage ? 'image' : (msg.message?.videoMessage ? 'video' : 'text'), 
                status: 'sent',
              };

              try {
                await MessageModel.updateOne(
                  { sessionId, messageId: messageData.messageId },
                  { $set: messageData },
                  { upsert: true }
                );
              } catch (dbErr) {
                console.error('Error saving message to DB:', dbErr);
              }

              if (!messageData.fromMe) {
                console.log('Received message:', msg);
                try {
                  const payload = {
                    sessionId,
                    message: {
                      id: messageData.messageId,
                      chatId: messageData.chatId,
                      fromMe: false,
                      content: messageData.content,
                      timestamp: messageData.timestamp,
                      type: messageData.type
                    }
                  };
                  io.emit('message_received', payload);

                  // Trigger webhook if configured
                  (async () => {
                      try {
                          const config = await ApiConfigModel.findOne({});
                          if (config && config.webhookUrl) {
                              const webhookPayload = {
                                  event: 'message.received',
                                  sessionId,
                                  data: payload.message
                              };
                              await axios.post(config.webhookUrl, webhookPayload, { timeout: 5000 });
                              console.log(`Webhook sent for message ${messageData.messageId} to ${config.webhookUrl}`);
                          }
                      } catch (webhookError: any) {
                          console.error(`Failed to send webhook for message ${messageData.messageId}:`, webhookError.message);
                      }
                  })();

                } catch (emitErr) {
                  console.error('Error emitting message_received:', emitErr);
                }
                this.processAutoReply(msg, sessionId, sock);
              } else {
                console.log('Processed outgoing message confirmation:', msg.key.id);
                try {
                    const payload = {
                        sessionId,
                        message: {
                            id: messageData.messageId,
                            chatId: messageData.chatId,
                            fromMe: true,
                            content: messageData.content,
                            timestamp: messageData.timestamp,
                            type: messageData.type,
                            status: 'sent'
                        }
                    };
                    io.emit('message_sent', payload);
                } catch (emitErr) {
                    console.error('Error emitting message_sent:', emitErr);
                }
              }
            }
          }
        }
        
        if (events['messages.update']) console.log('Messages update:', events['messages.update']);
        if (events['presence.update']) console.log('Presence update:', events['presence.update']);
        if (events['contacts.update']) console.log('Contacts update:', events['contacts.update']);
        if (events['chats.update']) console.log('Chats update:', events['chats.update']);
        if (events['groups.update']) console.log('Groups update:', events['groups.update']);
      });
      
      return sock;
    } catch (error) {
      console.error(`[Error] Failed to create connection for ${sessionId}:`, error);
      this.connectingSessions.delete(sessionId); // Ensure lock is released on catastrophic failure
    }
  }

  getQr(sessionId: string) {
    return this.latestQr.get(sessionId) || null;
  }
  
  async useDBAuthState(sessionId: string) {
    const sessionDir = resolve(`./temp_sessions/${sessionId}`);
    if (!existsSync(sessionDir)) {
      require('fs').mkdirSync(sessionDir, { recursive: true });
    }

    try {
      const existingSession = await SessionModel.findOne({ sessionId });
      if (existingSession?.sessionData) {
        const { creds, keys } = existingSession.sessionData as any;
        if (creds) {
          writeFileSync(resolve(sessionDir, 'creds.json'), JSON.stringify(creds, null, 2));
        }
        if (keys) {
            for (const [type, keyMap] of Object.entries(keys)) {
                for (const [id, data] of Object.entries(keyMap as any)) {
                    writeFileSync(resolve(sessionDir, `${type}-${id}.json`), JSON.stringify(data, null, 2));
                }
            }
        }
        console.log(`Restored session ${sessionId} from database to file system cache.`);
      }
    } catch (error) {
      console.error(`Error restoring session ${sessionId} from DB to file system:`, error);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const saveCredsToDB = async () => {
      try {
        await saveCreds();
        
        const fileList = require('fs').readdirSync(sessionDir);
        const keyCache: { [type: string]: { [id: string]: any } } = {};
        let creds: any = {};

        for (const file of fileList) {
            const filePath = resolve(sessionDir, file);
            const content = readFileSync(filePath, 'utf-8');
            if (!content) continue;

            try {
                if (file === 'creds.json') {
                    creds = JSON.parse(content);
                } else if (file.endsWith('.json')) {
                    const [type, id] = file.replace('.json', '').split('-');
                    if (type && id) {
                        if (!keyCache[type]) keyCache[type] = {};
                        keyCache[type][id] = JSON.parse(content);
                    }
                }
            } catch (e) {
                console.error(`Failed to parse JSON from ${file}:`, e);
            }
        }
        
        const sessionData = { creds, keys: keyCache };

        if (!sessionData.creds || Object.keys(sessionData.creds).length === 0) {
            console.log(`Skipping save to DB for ${sessionId} due to empty creds.`);
            return;
        }

        await SessionModel.updateOne(
          { sessionId },
          { $set: { sessionData, updatedAt: new Date() } },
          { upsert: true }
        );
        console.log(`Saved session ${sessionId} state to database.`);
      } catch (error) {
        console.error(`Error saving creds for ${sessionId} to DB:`, error);
      }
    };
    
    return { state, saveCreds: saveCredsToDB };
  }
  
  async logout(sessionId: string) {
    const sock = this.connections.get(sessionId);
    if (sock) {
      await sock.logout();
      this.connections.delete(sessionId);
      await SessionModel.deleteOne({ sessionId });
    }
  }
  
  async sendMessage(sessionId: string, jid: string, message: proto.IMessage) {
    const sock = this.connections.get(sessionId);

    if (!sock) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    // The controller should have already checked the readyState. If we still get here and it's not open, throw.
    if (sock.ws?.readyState !== 1) {
      throw new Error(`Session ${sessionId} is not connected. readyState: ${sock.ws?.readyState}`);
    }

    try {
      return await sock.sendMessage(jid, message);
    } catch (error) {
      console.error('Error sending message:', error);
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }


    
  async sendMediaMessage(sessionId: string, jid: string, media: Express.Multer.File, mediaType: string, message?: string) {
    const sock = this.connections.get(sessionId);

    if (!sock) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    if (sock.ws?.readyState !== 1) {
      throw new Error(`Session ${sessionId} is not connected. readyState: ${sock.ws?.readyState}`);
    }

    const mediaMessage = { caption: message, [mediaType]: { url: media.path } };
    
    try {
      return await sock.sendMessage(jid, mediaMessage);
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }
    
  async loadPreviousSessions() {
    console.log('Loading previous sessions...');
    try {
      const mongoose = require('mongoose');
      await delay(2000); // Wait for mongoose to connect

      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB not connected - aborting loadPreviousSessions');
      }

      const sessions = await SessionModel.find({ status: 'CONNECTED' });
  
      for (const session of sessions) {
        console.log(`Reconnecting to session: ${session.sessionId}`);
        this.createConnection(session.sessionId).catch(err => {
            console.error(`Failed to reconnect session ${session.sessionId} on startup:`, err);
        });
      }
    } catch (error) {
      console.error('Error loading previous sessions:', error);
    }
  }

  startScheduler() {
    cron.schedule('* * * * *', async () => {
      const messages = await ScheduledMessageModel.find({ sent: false, schedule: { $lte: new Date() } });
      for (const msg of messages) {
        try {
          await this.sendMessage(msg.sessionId, msg.chatId, { conversation: msg.message });
          msg.sent = true;
          await msg.save();
        } catch (error) {
          console.error(`Error sending scheduled message ${msg._id}:`, error);
        }
      }

      try {
        const queued = await QueuedMessageModel.find({ status: 'queued', nextAttemptAt: { $lte: new Date() } }).limit(20);
        for (const q of queued) {
          try {
            q.status = 'sending';
            await q.save();

            try {
              const payload: any = q.content ? { conversation: q.content } : {};
              if (q.mediaUrl && q.mediaType) {
                payload[q.mediaType] = { url: q.mediaUrl };
                payload.caption = q.content || '';
              }

              await this.sendMessage(q.sessionId, q.chatId, payload);
              q.status = 'sent';
              await q.save();
              io.emit('queued_message_sent', { queuedId: q._id.toString(), sessionId: q.sessionId, chatId: q.chatId });
            } catch (sendErr) {
              q.attempts = (q.attempts || 0) + 1;
              const maxAttempts = q.maxAttempts || 5;
              q.lastError = (sendErr as Error).message;
              if (q.attempts >= maxAttempts) {
                q.status = 'failed';
              } else {
                q.status = 'queued';
                const backoffMs = Math.pow(2, q.attempts - 1) * 30000;
                q.nextAttemptAt = new Date(Date.now() + backoffMs);
              }
              await q.save();
              io.emit('queued_message_failed_attempt', { queuedId: q._id.toString(), sessionId: q.sessionId, attempts: q.attempts, lastError: q.lastError });
            }
          } catch (procErr) {
            console.error('Error processing queued message:', procErr);
          }
        }
      } catch (err) {
        console.error('Error processing queued messages:', err);
      }
    });
  }

  async enqueueMessage(opts: {
    sessionId: string; chatId: string; content?: string;
    mediaUrl?: string; mediaType?: string; maxAttempts?: number;
  }) {
    const { sessionId, chatId, content, mediaUrl, mediaType, maxAttempts = 5 } = opts;
    const q = new QueuedMessageModel({
      sessionId, chatId, content, mediaUrl, mediaType,
      attempts: 0, maxAttempts, status: 'queued', nextAttemptAt: new Date(),
    });
    await q.save();
    io.emit('queued_message_created', { queuedId: q._id.toString(), sessionId, chatId });
    return q;
  }
  
  getConnection(sessionId: string) {
    return this.connections.get(sessionId);
  }
  
  async isConnectionHealthy(sessionId: string) {
    const sock = this.connections.get(sessionId);
    if (!sock) return { connected: false, status: 'DISCONNECTED' };
    if (sock.ws) return { connected: sock.ws.readyState === 1, status: sock.ws.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED' };
    return { connected: true, status: 'CONNECTED' };
  }
  
  getAllConnections() {
    return Array.from(this.connections.keys());
  }
  
  async processAutoReply(msg: any, sessionId: string, sock: any) {
    const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (messageContent) {
      try {
        const { ApiConfigModel } = await import('../models/ApiConfig');
        const config = await ApiConfigModel.findOne();
        
        if (config?.autoReplyEnabled && config.autoReplyRules?.length > 0) {
          const lowerContent = messageContent.toLowerCase();
          for (const rule of config.autoReplyRules) {
            if (rule.enabled && lowerContent.includes(rule.keyword.toLowerCase())) {
              await sock.sendMessage(msg.key.remoteJid, { text: rule.response });
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error processing auto-reply:', error);
      }
    }
  }

  async createGroup(sessionId: string, name: string, participants: string[]) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    return await sock.groupCreate(name, participants);
  }

  async getGroupMetadata(sessionId: string, groupId: string) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    return await sock.groupMetadata(groupId);
  }

  async updateGroupSubject(sessionId: string, groupId: string, subject: string) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    await sock.groupUpdateSubject(groupId, subject);
  }

  async addParticipants(sessionId: string, groupId: string, participants: string[]) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    await sock.groupParticipantsUpdate(groupId, participants, 'add');
  }

  async removeParticipants(sessionId: string, groupId: string, participants: string[]) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    await sock.groupParticipantsUpdate(groupId, participants, 'remove');
  }

  async leaveGroup(sessionId: string, groupId: string) {
    const sock = this.connections.get(sessionId);
    if (!sock) throw new Error(`Connection for session ${sessionId} not found`);
    await sock.groupLeave(groupId);
  }
}

export const whatsappService = new WhatsAppService();