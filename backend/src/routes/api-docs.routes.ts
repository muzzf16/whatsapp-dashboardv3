import { Router } from 'express';
import { apiKeyAuth } from '../middleware/auth';

const router = Router();

// Apply API key authentication to all routes in this router
router.use(apiKeyAuth);

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      api: 'WhatsApp HTTP API',
      version: 'v1',
      description: 'A powerful REST API for WhatsApp automation',
      authentication: {
        method: 'API Key in header',
        header: 'X-API-Key',
        example: 'X-API-Key: your-api-key-here'
      },
      endpoints: {
        session: {
          'GET /api/v1/sessions': {
            description: 'Get all WhatsApp sessions',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              data: {
                sessions: [],
                total: 0
              }
            }
          },
          'POST /api/v1/sessions': {
            description: 'Initialize a new WhatsApp session',
            headers: ['X-API-Key: your-api-key'],
            body: {},
            response: {
              success: true,
              data: {
                sessionId: 'session_id_here'
              }
            }
          },
          'GET /api/v1/sessions/{id}': {
            description: 'Get specific session details',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              data: {}
            }
          },
          'DELETE /api/v1/sessions/{id}': {
            description: 'Delete a session',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              message: 'Session deleted successfully'
            }
          },
          'POST /api/v1/sessions/{id}/logout': {
            description: 'Logout from a session',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              message: 'Logged out successfully'
            }
          },
          'GET /api/v1/sessions/status': {
            description: 'Get connection status of all sessions',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              data: {
                activeConnections: [],
                total: 0
              }
            }
          },
          'GET /api/v1/sessions/{id}/qr': {
            description: 'Get latest QR code for a session (if available)',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              data: {
                qr: 'qr_code_string'
              }
            }
          },
          'GET /api/v1/sessions/{id}/health': {
            description: 'Check health status of a specific session',
            headers: ['X-API-Key: your-api-key'],
            response: {
              success: true,
              data: {
                sessionId: 'session_id',
                connected: true,
                status: 'CONNECTED'
              }
            }
          }
        },
        message: {
          'POST /api/v1/messages/send': {
            description: 'Send a text message to a WhatsApp contact/group',
            headers: ['X-API-Key: your-api-key'],
            body: {
              sessionId: 'session_id',
              jid: 'recipient_phone_number@s.whatsapp.net',
              message: 'Your message here',
              options: {}
            },
            response: {
              success: true,
              message: 'Message sent successfully',
              messageId: 'message_id'
            }
          },
          'POST /api/v1/messages/send-media': {
            description: 'Send a media message (image, video, document, etc.)',
            headers: ['X-API-Key: your-api-key'],
            multipart: {
              fields: [
                { name: 'sessionId', type: 'text', description: 'Session ID' },
                { name: 'jid', type: 'text', description: 'Recipient JID' },
                { name: 'message', type: 'text', description: 'Caption for media' },
                { name: 'mediaType', type: 'text', description: 'Type of media (image, video, document, etc.)' },
                { name: 'media', type: 'file', description: 'The media file to send' }
              ]
            },
            response: {
              success: true,
              message: 'Media message sent successfully',
              messageId: 'message_id'
            }
          },
          'POST /api/v1/messages/send-template': {
            description: 'Send a template message',
            headers: ['X-API-Key: your-api-key'],
            body: {
              sessionId: 'session_id',
              jid: 'recipient_phone_number@s.whatsapp.net',
              templateName: 'name_of_template',
              parameters: []
            },
            response: {
              success: true,
              message: 'Template message sent successfully',
              messageId: 'message_id'
            }
          },
          'GET /api/v1/messages/{chatId}': {
            description: 'Get messages from a specific chat',
            headers: ['X-API-Key: your-api-key'],
            params: {
              chatId: 'Chat ID to fetch messages from'
            },
            query: {
              page: 'Page number (default: 1)',
              limit: 'Number of messages per page (default: 20)'
            },
            response: {
              success: true,
              data: {
                messages: [],
                totalPages: 0,
                currentPage: 1,
                totalMessages: 0
              }
            }
          }
        },
        chat: {
          'GET /api/v1/chats/{sessionId}': {
            description: 'Get all chats for a specific session',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'Session ID to get chats for'
            },
            response: {
              success: true,
              data: []
            }
          }
        },
        group: {
          'POST /api/v1/groups': {
            description: 'Create a new WhatsApp group',
            headers: ['X-API-Key: your-api-key'],
            body: {
              sessionId: 'session_id',
              name: 'Group name',
              participants: ['phone_number@s.whatsapp.net']
            },
            response: {
              success: true,
              data: {},
              message: 'Group created successfully'
            }
          },
          'GET /api/v1/groups/{groupId}': {
            description: 'Get metadata for a specific group',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'session_id',
              groupId: 'Group ID'
            },
            response: {
              success: true,
              data: {},
              message: 'Group metadata retrieved successfully'
            }
          },
          'PUT /api/v1/groups/{groupId}/subject': {
            description: 'Update group subject/title',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'session_id',
              groupId: 'Group ID'
            },
            body: {
              subject: 'New group subject'
            },
            response: {
              success: true,
              message: 'Group subject updated successfully'
            }
          },
          'POST /api/v1/groups/{groupId}/participants/add': {
            description: 'Add participants to a group',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'session_id',
              groupId: 'Group ID'
            },
            body: {
              participants: ['phone_number1@s.whatsapp.net', 'phone_number2@s.whatsapp.net']
            },
            response: {
              success: true,
              message: 'Participants added successfully'
            }
          },
          'POST /api/v1/groups/{groupId}/participants/remove': {
            description: 'Remove participants from a group',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'session_id',
              groupId: 'Group ID'
            },
            body: {
              participants: ['phone_number1@s.whatsapp.net', 'phone_number2@s.whatsapp.net']
            },
            response: {
              success: true,
              message: 'Participants removed successfully'
            }
          },
          'POST /api/v1/groups/{groupId}/leave': {
            description: 'Leave a group',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'session_id',
              groupId: 'Group ID'
            },
            response: {
              success: true,
              message: 'Left group successfully'
            }
          }
        },
        contact: {
          'GET /api/v1/contacts/{sessionId}': {
            description: 'Get contacts for a session',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'Session ID to get contacts for'
            },
            response: {
              success: true,
              data: []
            }
          },
          'GET /api/v1/contacts/{sessionId}/search': {
            description: 'Search contacts',
            headers: ['X-API-Key: your-api-key'],
            params: {
              sessionId: 'Session ID to search contacts in'
            },
            query: {
              query: 'Search query string'
            },
            response: {
              success: true,
              data: [],
              query: 'Search query'
            }
          }
        }
      }
    }
  });
});

export const apiDocsRoutes = router;