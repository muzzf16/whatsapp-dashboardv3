'use client';

import { useState, useEffect } from 'react';
import { scheduledMessageAPI } from '@/lib/api';

export default function ScheduledMessagesPage() {
  const [scheduledMessages, setScheduledMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [chatId, setChatId] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [editingMessage, setEditingMessage] = useState<any>(null);

  useEffect(() => {
    loadScheduledMessages();
  }, []);

  const loadScheduledMessages = async () => {
    const data = await scheduledMessageAPI.getScheduledMessages();
    if (data.success) {
      setScheduledMessages(data.scheduledMessages);
    }
  };

  const handleCreate = async () => {
    await scheduledMessageAPI.createScheduledMessage(sessionId, chatId, message, new Date(schedule));
    setSessionId('');
    setChatId('');
    setMessage('');
    setSchedule('');
    loadScheduledMessages();
  };

  const handleUpdate = async () => {
    if (editingMessage) {
      await scheduledMessageAPI.updateScheduledMessage(editingMessage._id, sessionId, chatId, message, new Date(schedule));
      setSessionId('');
      setChatId('');
      setMessage('');
      setSchedule('');
      setEditingMessage(null);
      loadScheduledMessages();
    }
  };

  const handleDelete = async (id: string) => {
    await scheduledMessageAPI.deleteScheduledMessage(id);
    loadScheduledMessages();
  };

  const handleEdit = (msg: any) => {
    setEditingMessage(msg);
    setSessionId(msg.sessionId);
    setChatId(msg.chatId);
    setMessage(msg.message);
    setSchedule(new Date(msg.schedule).toISOString().slice(0, 16));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Scheduled Messages</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <input
          type="text"
          placeholder="Chat ID"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <input
          type="datetime-local"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        {editingMessage ? (
          <button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Update Message
          </button>
        ) : (
          <button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">
            Schedule Message
          </button>
        )}
      </div>
      <div>
        {scheduledMessages.map((msg) => (
          <div key={msg._id} className="p-4 border border-gray-200 rounded-lg mb-2">
            <p>Session ID: {msg.sessionId}</p>
            <p>Chat ID: {msg.chatId}</p>
            <p>Message: {msg.message}</p>
            <p>Schedule: {new Date(msg.schedule).toLocaleString()}</p>
            <p>Sent: {msg.sent ? 'Yes' : 'No'}</p>
            <div className="mt-2">
              <button onClick={() => handleEdit(msg)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded-md mr-2">
                Edit
              </button>
              <button onClick={() => handleDelete(msg._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
