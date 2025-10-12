// api-client.ts
export interface ApiConfig {
  webhookUrl?: string;
  webhookEvents: string[];
  rateLimit: number;
  autoReplyEnabled: boolean;
  autoReplyRules: {
    keyword: string;
    response: string;
    enabled: boolean;
  }[];
}

export interface ApiKeyResponse {
  success: boolean;
  apiKey?: string;
  message: string;
}

// Get the backend API URL from environment variables or use default
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

// API config operations
export const fetchApiConfig = async (): Promise<{ success: boolean; data?: ApiConfig; message?: string }> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/config`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching API config:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const updateApiConfig = async (config: ApiConfig): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating API config:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const generateApiKey = async (): Promise<ApiKeyResponse> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/config/generate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating API key:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};