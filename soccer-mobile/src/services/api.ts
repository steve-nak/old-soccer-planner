import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
