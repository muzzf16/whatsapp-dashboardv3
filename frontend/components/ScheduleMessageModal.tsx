'use client';

import { useState } from 'react';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (schedule: Date) => void;
}

export default function ScheduleMessageModal({ isOpen, onClose, onSchedule }: ScheduleMessageModalProps) {
  const [schedule, setSchedule] = useState('');

  const handleSchedule = () => {
    onSchedule(new Date(schedule));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Schedule Message</h2>
        <div className="mb-4">
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md">
            Cancel
          </button>
          <button onClick={handleSchedule} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
