'use client';

import { useState, useEffect } from 'react';
import { useSessionStore } from '@/hooks/useSessionStore';
import { fetchApiConfig as fetchApiConfigService, updateApiConfig, generateApiKey, ApiConfig } from '@/lib/api-client';

export default function ApiSettingsPage() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newRule, setNewRule] = useState({ keyword: '', response: '' });

  // Initialize the API configuration
  useEffect(() => {
    fetchApiConfig();
    fetchApiKey();
  }, []);

  const fetchApiConfig = async () => {
    try {
      setLoading(true);
      const result = await fetchApiConfigService();
      
      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        // Initialize with default values if no config exists
        setConfig({
          webhookUrl: '',
          webhookEvents: ['message_received'],
          rateLimit: 1000,
          autoReplyEnabled: false,
          autoReplyRules: [],
        });
      }
    } catch (error) {
      console.error('Error fetching API config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKey = async () => {
    // In a real implementation, you wouldn't fetch the API key from the server
    // Instead, you'd generate a new one or provide info about existing key
    // For security, API keys should never be retrieved after creation
    setApiKey('••••••••••••••••••••••••••••••••'); // Masked API key
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      const result = await updateApiConfig(config);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const result = await generateApiKey();
      
      if (result.success && result.apiKey) {
        setApiKey(result.apiKey);
        setMessage({ type: 'success', text: 'New API key generated successfully!' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to generate API key' });
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      setMessage({ type: 'error', text: 'An error occurred while generating API key' });
    }
  };

  const addAutoReplyRule = () => {
    if (!config || !newRule.keyword.trim() || !newRule.response.trim()) return;

    setConfig({
      ...config,
      autoReplyRules: [
        ...config.autoReplyRules,
        {
          keyword: newRule.keyword.trim(),
          response: newRule.response.trim(),
          enabled: true,
        }
      ]
    });
    
    setNewRule({ keyword: '', response: '' });
  };

  const removeAutoReplyRule = (index: number) => {
    if (!config) return;

    setConfig({
      ...config,
      autoReplyRules: config.autoReplyRules.filter((_, i) => i !== index)
    });
  };

  const toggleAutoReplyRule = (index: number) => {
    if (!config) return;

    const updatedRules = [...config.autoReplyRules];
    updatedRules[index] = {
      ...updatedRules[index],
      enabled: !updatedRules[index].enabled
    };

    setConfig({
      ...config,
      autoReplyRules: updatedRules
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Configuration</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">API Key Management</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current API Key</label>
          <div className="flex items-center">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-100"
            />
            <button
              onClick={handleGenerateApiKey}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg"
            >
              Generate New Key
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Click "Generate New Key" to create a new API key. Your current key will be deactivated.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">How to use your API key</h3>
          <p className="text-sm text-blue-700 mb-2">Include your API key in the header of all API requests:</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm font-mono overflow-x-auto">
            X-API-Key: YOUR_API_KEY_HERE
          </code>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Webhook Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input
            type="url"
            value={config?.webhookUrl || ''}
            onChange={(e) => setConfig({ ...config!, webhookUrl: e.target.value })}
            placeholder="https://yourdomain.com/webhook"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL where you want to receive webhook events
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Events</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['message_received', 'message_sent', 'connection_open', 'connection_close', 'qr_generated'].map((event) => (
              <div key={event} className="flex items-center">
                <input
                  type="checkbox"
                  id={event}
                  checked={config?.webhookEvents.includes(event)}
                  onChange={(e) => {
                    if (!config) return;
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        webhookEvents: [...config.webhookEvents, event]
                      });
                    } else {
                      setConfig({
                        ...config,
                        webhookEvents: config.webhookEvents.filter(ev => ev !== event)
                      });
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor={event} className="text-sm text-gray-700 capitalize">
                  {event.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Rate Limiting</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Limit (requests per hour)
          </label>
          <input
            type="number"
            value={config?.rateLimit || 1000}
            onChange={(e) => setConfig({ ...config!, rateLimit: parseInt(e.target.value) || 1000 })}
            min="1"
            max="10000"
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum number of API requests allowed per hour
          </p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Auto-reply Rules</h2>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={config?.autoReplyEnabled || false}
            onChange={(e) => setConfig({ ...config!, autoReplyEnabled: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">
            Enable Auto-reply
          </label>
        </div>

        {config?.autoReplyEnabled && (
          <>
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Add New Rule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                  <input
                    type="text"
                    value={newRule.keyword}
                    onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                    placeholder="Enter keyword to trigger auto-reply"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                  <input
                    type="text"
                    value={newRule.response}
                    onChange={(e) => setNewRule({ ...newRule, response: e.target.value })}
                    placeholder="Enter auto-reply message"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={addAutoReplyRule}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                Add Rule
              </button>
            </div>

            <div>
              <h3 className="font-medium mb-2">Active Rules</h3>
              {config.autoReplyRules.length === 0 ? (
                <p className="text-gray-500 italic">No auto-reply rules configured</p>
              ) : (
                <div className="space-y-3">
                  {config.autoReplyRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleAutoReplyRule(index)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">{rule.keyword}</div>
                          <div className="text-sm text-gray-600">{rule.response}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAutoReplyRule(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveConfig}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}