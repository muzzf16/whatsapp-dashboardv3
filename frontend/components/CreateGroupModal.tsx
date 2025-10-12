import { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, participants: string[]) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState('');

  const handleCreate = () => {
    onCreate(name, participants.split(',').map(p => p.trim()));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Create Group</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Participants (comma separated)</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md">
            Cancel
          </button>
          <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
