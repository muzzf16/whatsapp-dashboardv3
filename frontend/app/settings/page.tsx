'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('');

  const handleProfileUpdate = () => {
    // Handle profile update logic here
  };

  const handleAutoReplyUpdate = () => {
    // Handle auto-reply update logic here
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Profile</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button onClick={handleProfileUpdate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Update Profile
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Auto-reply</h2>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={autoReplyEnabled}
            onChange={(e) => setAutoReplyEnabled(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">Enable Auto-reply</label>
        </div>
        {autoReplyEnabled && (
          <div>
            <textarea
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <button onClick={handleAutoReplyUpdate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              Update Auto-reply Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
