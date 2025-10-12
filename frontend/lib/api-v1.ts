import { useApiKey } from '@/hooks/useApiKey';

// Get the backend API URL from environment variables or use default
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

// Session API for v1
export const sessionAPIv1 = {
  // Get all sessions
  getSessions: async (apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Initialize a new session
  initSession: async (apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete a session
  deleteSession: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Get specific session
  getSessionById: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Logout from session
  logout: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions/${sessionId}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Get session QR code
  getSessionQr: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/sessions/${sessionId}/qr`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Message API for v1
export const messageAPIv1 = {
  // Send a text message
  sendMessage: async (apiKey: string, sessionId: string, jid: string, message: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ sessionId, jid, message }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Send a message with media
  sendMessageWithMedia: async (
    apiKey: string,
    sessionId: string, 
    jid: string, 
    message: string, 
    media: File,
    mediaType: string
  ) => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('jid', jid);
    formData.append('message', message);
    formData.append('media', media);
    formData.append('mediaType', mediaType);

    const response = await fetch(`${BACKEND_API_URL}/api/v1/messages/send-media`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get chats for a session
  getChats: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/chats/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get messages for a chat
  getMessages: async (chatId: string, apiKey: string, page: number = 1, limit: number = 20) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/messages/${chatId}?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Send template message
  sendTemplateMessage: async (
    apiKey: string,
    sessionId: string,
    jid: string,
    templateName: string,
    parameters: any[]
  ) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/messages/send-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ sessionId, jid, templateName, parameters }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Group API for v1
export const groupAPIv1 = {
  createGroup: async (apiKey: string, sessionId: string, name: string, participants: string[]) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ sessionId, name, participants }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getGroupMetadata: async (apiKey: string, sessionId: string, groupId: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups/${groupId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  updateGroupSubject: async (apiKey: string, sessionId: string, groupId: string, subject: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups/${groupId}/subject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ subject }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  addParticipants: async (apiKey: string, sessionId: string, groupId: string, participants: string[]) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups/${groupId}/participants/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ participants }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  removeParticipants: async (apiKey: string, sessionId: string, groupId: string, participants: string[]) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups/${groupId}/participants/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ participants }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  leaveGroup: async (apiKey: string, sessionId: string, groupId: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Contact API for v1
export const contactAPIv1 = {
  getContacts: async (sessionId: string, apiKey: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/contacts/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  searchContacts: async (sessionId: string, apiKey: string, query: string) => {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/contacts/${sessionId}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};