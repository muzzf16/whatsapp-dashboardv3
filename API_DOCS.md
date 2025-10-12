# WhatsApp HTTP API (REST API) Documentation

## Overview
This document provides comprehensive information about the WhatsApp HTTP API (REST API) that can be configured with a click. The API allows you to send and receive messages, manage WhatsApp sessions, and configure settings through a simple REST interface.

## Authentication
All API requests require an API key in the header:
```
X-API-Key: your-api-key-here
```

## Base URL
```
http://your-server:5000/api/v1
```

## Session Management

### Create New Session
```
POST /sessions
```
Initiates a new WhatsApp session and returns a session ID.

### Get All Sessions
```
GET /sessions
```
Returns a list of all active sessions.

### Get Session By ID
```
GET /sessions/{id}
```
Returns details for a specific session.

### Delete Session
```
DELETE /sessions/{id}
```
Deletes the specified session.

### Logout Session
```
POST /sessions/{id}/logout
```
Logs out the specified session from WhatsApp.

### Get Sessions Status
```
GET /sessions/status
```
Returns status of all active connections.

### Get Session QR Code
```
GET /sessions/{id}/qr
```
Returns the latest QR code for the session if available.

## Message Management

### Send Text Message
```
POST /messages/send
```
Sends a text message to a WhatsApp contact or group.

**Request Body:**
```json
{
  "sessionId": "session_id",
  "jid": "recipient@s.whatsapp.net",
  "message": "Your message here",
  "options": {}
}
```

### Send Media Message
```
POST /messages/send-media
```
Sends a media message (image, video, document, etc.) to a WhatsApp contact or group.

**Form Data:**
- `sessionId`: Session ID
- `jid`: Recipient JID
- `message`: Caption for media
- `mediaType`: Type of media (image, video, document, etc.)
- `media`: The media file to send

### Send Template Message
```
POST /messages/send-template
```
Sends a template message to a WhatsApp contact or group.

**Request Body:**
```json
{
  "sessionId": "session_id",
  "jid": "recipient@s.whatsapp.net",
  "templateName": "name_of_template",
  "parameters": []
}
```

### Get Messages from Chat
```
GET /messages/{chatId}
```
Returns messages from a specific chat.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of messages per page (default: 20)

## Chat Management

### Get Chats for Session
```
GET /chats/{sessionId}
```
Returns all chats for a specific session.

## Group Management

### Create Group
```
POST /groups
```
Creates a new WhatsApp group.

**Request Body:**
```json
{
  "sessionId": "session_id",
  "name": "Group name",
  "participants": ["phone_number@s.whatsapp.net"]
}
```

### Get Group Metadata
```
GET /groups/{groupId}
```
Returns metadata for a specific group.

### Update Group Subject
```
PUT /groups/{groupId}/subject
```
Updates the subject/title of a group.

**Request Body:**
```json
{
  "subject": "New group subject"
}
```

### Add Participants to Group
```
POST /groups/{groupId}/participants/add
```
Adds participants to a group.

**Request Body:**
```json
{
  "participants": ["phone_number1@s.whatsapp.net", "phone_number2@s.whatsapp.net"]
}
```

### Remove Participants from Group
```
POST /groups/{groupId}/participants/remove
```
Removes participants from a group.

**Request Body:**
```json
{
  "participants": ["phone_number1@s.whatsapp.net", "phone_number2@s.whatsapp.net"]
}
```

### Leave Group
```
POST /groups/{groupId}/leave
```
Leaves a group.

## Contact Management

### Get Contacts
```
GET /contacts/{sessionId}
```
Returns contacts for a specific session.

### Search Contacts
```
GET /contacts/{sessionId}/search
```
Searches contacts in a specific session.

**Query Parameters:**
- `query`: Search query string

## API Configuration

### Get API Configuration
```
GET /config
```
Returns the current API configuration.

### Update API Configuration
```
PUT /config
```
Updates the API configuration.

### Generate New API Key
```
POST /config/generate-key
```
Generates a new API key.

## Webhook Configuration

### Get Webhook Configuration
```
GET /webhooks
```
Returns the current webhook configuration.

### Update Webhook Configuration
```
POST /webhooks (or PUT /webhooks)
```
Updates the webhook configuration.

**Request Body:**
```json
{
  "webhookUrl": "https://yourdomain.com/webhook",
  "webhookEvents": ["message_received", "message_sent", "connection_open", "connection_close", "qr_generated"]
}
```

### Remove Webhook Configuration
```
DELETE /webhooks
```
Removes the webhook configuration.

## API Settings UI

You can configure your API settings through the web interface at:
```
http://your-server:3000/api-config
```

This interface allows you to:
- Manage your API key
- Configure webhook settings
- Set rate limiting
- Configure auto-reply rules