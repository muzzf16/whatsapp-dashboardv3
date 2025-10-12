'use client';

import { useState, useEffect } from 'react';
import { templateAPI } from '@/lib/api';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function TemplateModal({ isOpen, onClose, onSelect }: TemplateModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const data = await templateAPI.getTemplates();
    if (data.success) {
      setTemplates(data.templates);
    }
  };

  const handleSelect = (content: string) => {
    onSelect(content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Select a Template</h2>
        <div>
          {templates.map((template) => (
            <div key={template._id} className="p-4 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelect(template.content)}>
              <h3 className="text-lg font-bold">{template.name}</h3>
              <p>{template.content}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
