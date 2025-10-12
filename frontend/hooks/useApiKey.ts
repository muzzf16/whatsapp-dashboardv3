import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'whatsapp_api_key';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }, [apiKey]);

  const updateApiKey = (newApiKey: string | null) => {
    setApiKey(newApiKey);
  };

  return { apiKey, updateApiKey };
};