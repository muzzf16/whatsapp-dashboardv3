'use client';

import { useState, useEffect } from 'react';
import { templateAPI } from '@/lib/api';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await templateAPI.getTemplates();
    if (data.success) {
      setTemplates(data.templates);
    }
  };

  const handleCreate = async () => {
    await templateAPI.createTemplate(name, content);
    setName('');
    setContent('');
    loadTemplates();
  };

  const handleUpdate = async () => {
    if (editingTemplate) {
      await templateAPI.updateTemplate(editingTemplate._id, name, content);
      setName('');
      setContent('');
      setEditingTemplate(null);
      loadTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    await templateAPI.deleteTemplate(id);
    loadTemplates();
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Message Templates</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <textarea
          placeholder="Template Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        {editingTemplate ? (
          <button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Update Template
          </button>
        ) : (
          <button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">
            Create Template
          </button>
        )}
      </div>
      <div>
        {templates.map((template) => (
          <div key={template._id} className="p-4 border border-gray-200 rounded-lg mb-2">
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p>{template.content}</p>
            <div className="mt-2">
              <button onClick={() => handleEdit(template)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded-md mr-2">
                Edit
              </button>
              <button onClick={() => handleDelete(template._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
