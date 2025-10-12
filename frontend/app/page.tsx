'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import QRCodeModal from '@/components/QRCodeModal';
import CreateGroupModal from '@/components/CreateGroupModal';
import GroupInfoModal from '@/components/GroupInfoModal';
import { useSessionStore } from '@/hooks/useSessionStore';
import { messageAPI } from '@/lib/api';

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const { sessions, activeSession, setActiveSession, loadSessions } = useSessionStore();

  useEffect(() => {
    // Load sessions on component mount
    loadSessions();
    // Setup socket listeners for session status updates
    import('../lib/socket').then(({ socketService }) => {
      socketService.connect().then(() => {
        socketService.on('connection_open', (data: any) => {
          const { sessionId } = data;
          // update session status in store
          useSessionStore.getState().updateSessionStatus(sessionId, 'CONNECTED');
        });

        socketService.on('connection_closed', (data: any) => {
          const { sessionId } = data;
          useSessionStore.getState().updateSessionStatus(sessionId, 'DISCONNECTED');
        });

        socketService.on('connection_unhealthy', (data: any) => {
          const { sessionId } = data;
          useSessionStore.getState().updateSessionStatus(sessionId, 'DISCONNECTED');
        });

        socketService.on('queued_message_created', (d: any) => {
          // optional: show toast or refresh messages
          console.log('Queued message created:', d);
        });
      }).catch(() => {});
    }).catch(() => {});
  }, [loadSessions]);

  useEffect(() => {
    if (activeSession) {
      // Load chats for the active session
      loadChatsForSession(activeSession);
    } else {
      setChats([]); // Clear chats if no active session
    }
  }, [activeSession]);

  // Listen for incoming messages to update chats and auto-select if needed
  useEffect(() => {
    const handleIncoming = (data: any) => {
      try {
        if (!activeSession) return;
        if (data.sessionId !== activeSession) return;

        const normalize = (id?: string) => id ? id.split('@')[0] : '';
        const fromRaw = data.message.from as string;
        const from = normalize(fromRaw);
        // If chat not present in list, add it (store normalized id)
        setChats(prev => {
          const exists = prev.find(c => c.id === from);
          if (exists) return prev;
          const added = [...prev, { id: from, name: fromRaw }];
          return added;
        });

        // If no chat selected, select the incoming chat (normalized)
        setSelectedChat(prev => prev || from);
      } catch (err) {
        console.error('Error handling incoming message in Dashboard:', err);
      }
    };

    // attach listener
    import('../lib/socket').then(({ socketService }) => {
      socketService.connect().then(() => socketService.on('message_received', handleIncoming)).catch(() => {});
    }).catch(() => {});

    return () => {
      // remove listener
      import('../lib/socket').then(({ socketService }) => socketService.off('message_received')).catch(() => {});
    };
  }, [activeSession]);

  const loadChatsForSession = async (sessionId: string) => {
    try {
      console.log('Loading chats for session:', sessionId); // Add logging
      // Using the existing API service
      const data = await messageAPI.getChats(sessionId);
      console.log('Chats data received:', data); // Add logging
      if (data.success) {
        setChats(data.chats);
      } else {
        console.error('Failed to load chats:', data.message);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const handleCreateGroup = async (name: string, participants: string[]) => {
    if (activeSession) {
      try {
        await messageAPI.createGroup(activeSession, name, participants);
        // You might want to refresh the chat list here
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  const handleOpenGroupInfo = (groupId: string) => {
    setSelectedGroup(groupId);
    setIsGroupInfoModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        onAddSession={() => setIsQRModalOpen(true)}
        onCreateGroup={() => setIsCreateGroupModalOpen(true)}
        onOpenGroupInfo={handleOpenGroupInfo}
        activeSession={activeSession}
        sessions={sessions}
        chats={chats}
        onSelectSession={setActiveSession}
        onSelectChat={setSelectedChat}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="px-4 py-6 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          <ChatWindow 
            chatId={selectedChat}
            activeSession={activeSession}
          />
        </div>
      </div>
      
      <QRCodeModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />

      {selectedGroup && activeSession && (
        <GroupInfoModal
          isOpen={isGroupInfoModalOpen}
          onClose={() => setIsGroupInfoModalOpen(false)}
          sessionId={activeSession}
          groupId={selectedGroup}
        />
      )}
    </div>
  );
}