// API service for interacting with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Session API
export const sessionAPI = {
  // Initialize a new session
  initSession: async () => {
    const response = await fetch(`${API_BASE_URL}/sessions/init`, {
      method: 'POST',
    });
    return response.json();
  },

  // Get all sessions
  getSessions: async () => {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    return response.json();
  },

  // Delete a session
  deleteSession: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
  ,
  reconnectSession: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reconnect`, {
      method: 'POST'
    });
    return response.json();
  }
};

// Message API
export const messageAPI = {
  // Send a text message
  sendMessage: async (sessionId: string, jid: string, message: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, jid, message }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errMsg = (data && data.message) || `Request failed with status ${response.status}`;
      throw new Error(errMsg);
    }
    return data;
  },

  // Send a message with media
  sendMessageWithMedia: async (
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

    const response = await fetch(`${API_BASE_URL}/messages/send-media`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  // Get chats for a session
  getChats: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/chats/${sessionId}`);
    return response.json();
  },

  // Get messages for a chat
  getMessages: async (chatId: string, page: number = 1, limit: number = 20) => {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${chatId}?page=${page}&limit=${limit}`);
    return response.json();
  },

  // Group API
  createGroup: async (sessionId: string, name: string, participants: string[]) => {
    const response = await fetch(`${API_BASE_URL}/groups/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, name, participants }),
    });
    return response.json();
  },

  getGroupMetadata: async (sessionId: string, groupId: string) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}?sessionId=${sessionId}`);
    return response.json();
  },

  updateGroupSubject: async (sessionId: string, groupId: string, subject: string) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/subject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, subject }),
    });
    return response.json();
  },

  addParticipants: async (sessionId: string, groupId: string, participants: string[]) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/participants/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, participants }),
    });
    return response.json();
  },

  removeParticipants: async (sessionId: string, groupId: string, participants: string[]) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/participants/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, participants }),
    });
    return response.json();
  },

  leaveGroup: async (sessionId: string, groupId: string) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

// Template API
export const templateAPI = {
  createTemplate: async (name: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, content }),
    });
    return response.json();
  },

  getTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/templates`);
    return response.json();
  },

  updateTemplate: async (id: string, name: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, content }),
    });
    return response.json();
  },

  deleteTemplate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// Scheduled Message API
export const scheduledMessageAPI = {
  createScheduledMessage: async (sessionId: string, chatId: string, message: string, schedule: Date) => {
    const response = await fetch(`${API_BASE_URL}/scheduled-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, chatId, message, schedule }),
    });
    return response.json();
  },

  getScheduledMessages: async () => {
    const response = await fetch(`${API_BASE_URL}/scheduled-messages`);
    return response.json();
  },

  updateScheduledMessage: async (id: string, sessionId: string, chatId: string, message: string, schedule: Date) => {
    const response = await fetch(`${API_BASE_URL}/scheduled-messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, chatId, message, schedule }),
    });
    return response.json();
  },

  deleteScheduledMessage: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/scheduled-messages/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};