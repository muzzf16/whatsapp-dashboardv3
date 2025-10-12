import { useState, useEffect } from 'react';
import { messageAPI } from '@/lib/api';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  groupId: string;
}

export default function GroupInfoModal({ isOpen, onClose, sessionId, groupId }: GroupInfoModalProps) {
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [newSubject, setNewSubject] = useState('');
  const [participantsToAdd, setParticipantsToAdd] = useState('');
  const [participantsToRemove, setParticipantsToRemove] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadGroupInfo();
    }
  }, [isOpen]);

  const loadGroupInfo = async () => {
    try {
      const data = await messageAPI.getGroupMetadata(sessionId, groupId);
      if (data.success) {
        setGroupInfo(data.metadata);
        setNewSubject(data.metadata.subject);
      }
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const handleUpdateSubject = async () => {
    try {
      await messageAPI.updateGroupSubject(sessionId, groupId, newSubject);
      loadGroupInfo();
    } catch (error) {
      console.error('Error updating group subject:', error);
    }
  };

  const handleAddParticipants = async () => {
    try {
      await messageAPI.addParticipants(sessionId, groupId, participantsToAdd.split(',').map(p => p.trim()));
      setParticipantsToAdd('');
      loadGroupInfo();
    } catch (error) {
      console.error('Error adding participants:', error);
    }
  };

  const handleRemoveParticipants = async () => {
    try {
      await messageAPI.removeParticipants(sessionId, groupId, participantsToRemove.split(',').map(p => p.trim()));
      setParticipantsToRemove('');
      loadGroupInfo();
    } catch (error) {
      console.error('Error removing participants:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Group Info</h2>
        {groupInfo && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleUpdateSubject} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-2">
                Update Subject
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Participants</h3>
              <ul>
                {groupInfo.participants.map((p: any) => (
                  <li key={p.id}>{p.id} ({p.admin ? 'Admin' : 'Member'})</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add Participants (comma separated)</label>
              <input
                type="text"
                value={participantsToAdd}
                onChange={(e) => setParticipantsToAdd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleAddParticipants} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-2">
                Add Participants
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Remove Participants (comma separated)</label>
              <input
                type="text"
                value={participantsToRemove}
                onChange={(e) => setParticipantsToRemove(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleRemoveParticipants} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mt-2">
                Remove Participants
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
