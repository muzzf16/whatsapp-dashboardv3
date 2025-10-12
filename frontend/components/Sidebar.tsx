import { PlusCircle, MessageSquare, Users, Settings, Phone, Clock, FileText } from 'lucide-react';
import { useState } from 'react';
import { messageAPI } from '@/lib/api'; // Keep this for group operations
import { useSessionStore } from '@/hooks/useSessionStore';
import Link from 'next/link';

interface SidebarProps {
  onAddSession: () => void;
  onCreateGroup: () => void;
  onOpenGroupInfo: (groupId: string) => void;
  activeSession: string | null;
  sessions: any[];
  onSelectSession: (sessionId: string) => void;
  onSelectChat: (chatId: string) => void;
  chats: any[]; // Add chats prop
}

export default function Sidebar({ 
  onAddSession, 
  onCreateGroup,
  onOpenGroupInfo,
  activeSession, 
  sessions,
  chats, // Use chats from props instead of local state
  onSelectSession,
  onSelectChat
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: any, type: 'chat' | 'session' } | null>(null);
  const { logout } = useSessionStore();

  const handleContextMenu = (e: React.MouseEvent, item: any, type: 'chat' | 'session') => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleGroupInfo = () => {
    if (contextMenu && contextMenu.type === 'chat') {
      onOpenGroupInfo(contextMenu.item.id);
    }
  };

  const handleLeaveGroup = async () => {
    if (contextMenu && contextMenu.type === 'chat' && activeSession) {
      try {
        await messageAPI.leaveGroup(activeSession, contextMenu.item.id);
        // You might want to refresh the chat list here
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  const handleLogout = async () => {
    if (contextMenu && contextMenu.type === 'session') {
      await logout(contextMenu.item.sessionId);
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col" onClick={closeContextMenu}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">WhatsApp Dashboard</h2>
      </div>
      
      <div className="p-4 flex gap-2">
        <button
          onClick={onAddSession}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <PlusCircle size={18} />
          Tambah Sesi
        </button>
        <button
          onClick={onCreateGroup}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <Users size={18} />
          Create Group
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-2 mt-6">
          <h3 className="px-2 text-sm font-medium text-gray-400">Menu</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/templates" className="flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-700 rounded-md">
                <FileText size={18} />
                <span>Templates</span>
              </Link>
            </li>
            <li>
              <Link href="/scheduled-messages" className="flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-700 rounded-md">
                <Clock size={18} />
                <span>Scheduled Messages</span>
              </Link>
            </li>
            <li>
              <Link href="/api-config" className="flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-700 rounded-md">
                <Phone size={18} />
                <span>API Configuration</span>
              </Link>
            </li>
            <li>
              <Link href="/settings" className="flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-700 rounded-md">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="px-2 mt-6">
          <h3 className="px-2 text-sm font-medium text-gray-400">Sesi Aktif</h3>
          <ul className="mt-2 space-y-1">
            {sessions.map((session) => (
              <li key={session.sessionId} onContextMenu={(e) => handleContextMenu(e, session, 'session')}>
                <div
                  onClick={() => onSelectSession(session.sessionId)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md text-left cursor-pointer ${
                    activeSession === session.sessionId 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="truncate">
                    {session.phoneNumber || session.sessionId}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {session.status !== 'CONNECTED' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await (await import('@/lib/api')).sessionAPI.reconnectSession(session.sessionId);
                            // refresh sessions list
                            await (await import('@/hooks/useSessionStore')).useSessionStore.getState().loadSessions();
                          } catch (err) {
                            console.error('Reconnect failed:', err);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-yellow-500 text-black rounded"
                      >
                        Reconnect
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-2 mt-6">
          <h3 className="px-2 text-sm font-medium text-gray-400">Chats</h3>
          <ul className="mt-2 space-y-1">
            {chats.map((chat) => (
              <li key={chat.id} onContextMenu={(e) => handleContextMenu(e, chat, 'chat')}>
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-md text-left text-gray-300 hover:bg-gray-700"
                >
                  <span className="truncate">
                    {chat.name || chat.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {contextMenu && (
        <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute bg-white text-black rounded-md shadow-lg">
          {contextMenu.type === 'chat' ? (
            <ul>
              <li onClick={handleGroupInfo} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Group Info</li>
              <li onClick={handleLeaveGroup} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Leave Group</li>
            </ul>
          ) : (
            <ul>
              <li onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
            </ul>
          )}
        </div>
      )}

      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>WhatsApp Dashboard v1.0</p>
      </div>
    </div>
  );
}