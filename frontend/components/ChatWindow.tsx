import { useState, useRef, useEffect, useCallback } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Smile, Send, FileText, Clock } from 'lucide-react';
import { socketService } from '@/lib/socket';
import { messageAPI, scheduledMessageAPI } from '@/lib/api';
import TemplateModal from './TemplateModal';
import ScheduleMessageModal from './ScheduleMessageModal';

interface ChatWindowProps {
  chatId: string | null;
  activeSession: string | null;
}

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: Date;
  fromMe: boolean;
  mediaUrl?: string;
  type: string;
}

export default function ChatWindow({ chatId, activeSession }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<null | HTMLInputElement>(null);

  const addMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      if (prev.some(m => m.id === newMessage.id)) {
        return prev;
      }
      const updatedMessages = [...prev, newMessage];
      return updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, []);

  // Listen for new messages via socket
  useEffect(() => {
    if (!activeSession || !chatId) return;

    socketService.connect();

    const handleMessage = (data: any) => {
      if (data.sessionId === activeSession && data.message.chatId?.startsWith(chatId)) {
        addMessage({
          id: data.message.id,
          from: data.message.chatId,
          content: data.message.content,
          timestamp: new Date(data.message.timestamp * 1000 || Date.now()),
          fromMe: data.message.fromMe,
          mediaUrl: data.message.mediaUrl,
          type: data.message.type
        });
      }
    };

    socketService.on('message_received', handleMessage);
    socketService.on('message_sent', handleMessage);

    return () => {
      socketService.off('message_received');
      socketService.off('message_sent');
    };
  }, [activeSession, chatId, addMessage]);

  const loadMessages = useCallback(async (page: number) => {
    if (!chatId) return;

    try {
      const data = await messageAPI.getMessages(chatId, page);
      if (data.success) {
        const newMessages = data.messages.map((msg: any) => ({
          id: msg.messageId || msg._id,
          from: msg.chatId,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          fromMe: msg.fromMe,
          mediaUrl: msg.mediaUrl,
          type: msg.type
        }));

        if (page === 1) {
          setMessages(newMessages.reverse());
        } else {
          setMessages(prev => [...newMessages.reverse(), ...prev]);
        }
        
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [chatId]);

  // Load messages for the selected chat
  useEffect(() => {
    if (chatId) {
      setMessages([]); // Clear previous messages
      loadMessages(1);
    } else {
      setMessages([]);
    }
  }, [chatId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentPage]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !chatId || !activeSession) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      await messageAPI.sendMessage(activeSession, chatId, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
      alert('Failed to send message: ' + (error as Error).message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && chatId && activeSession) {
      const file = e.target.files[0];
      const mediaType = file.type.split('/')[0];
      await messageAPI.sendMessageWithMedia(activeSession, chatId, '', file, mediaType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      loadMessages(currentPage + 1);
    }
  };

  const handleSelectTemplate = (content: string) => {
    setNewMessage(content);
  };

  const handleScheduleMessage = async (schedule: Date) => {
    if (newMessage.trim() === '' || !chatId || !activeSession) return;

    try {
      await scheduledMessageAPI.createScheduledMessage(activeSession, chatId, newMessage, schedule);
      setNewMessage('');
    } catch (error) {
      console.error('Error scheduling message:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {chatId ? (
        <>
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{chatId}</h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-200">
                <Phone size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-200">
                <Video size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-200">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
          
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-opacity-50">
            {currentPage < totalPages && (
              <div className="text-center mb-4">
                <button onClick={handleLoadMore} className="bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-300">
                  Load More
                </button>
              </div>
            )}
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                      message.fromMe
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.type === 'image' && message.mediaUrl && (
                      <img src={`http://localhost:5000/${message.mediaUrl}`} alt="media" className="rounded-lg mb-2" />
                    )}
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 text-right ${message.fromMe ? 'text-blue-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700">
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 mx-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={1}
                />
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Smile size={20} />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`ml-2 p-2 rounded-full ${
                  newMessage.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="ml-2 p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <FileText size={20} />
              </button>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="ml-2 p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <Clock size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Pilih chat untuk memulai percakapan</h3>
            <p className="text-gray-500">Pilih salah satu kontak dari daftar untuk memulai percakapan</p>
          </div>
        </div>
      )}

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleSelectTemplate}
      />

      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleMessage}
      />
    </div>
  );
}
