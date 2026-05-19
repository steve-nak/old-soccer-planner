import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_API_BASE_URL = 'http://localhost:3000/api';
const expoPublicApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const legacyApiBaseUrl = process.env.API_BASE_URL?.trim();
const configuredApiBaseUrl = expoPublicApiBaseUrl || legacyApiBaseUrl;
const isProduction = process.env.NODE_ENV === 'production';
const resolvedApiBaseUrl = configuredApiBaseUrl || (isProduction ? '' : LOCAL_API_BASE_URL);

if (!expoPublicApiBaseUrl && legacyApiBaseUrl) {
  console.warn('API_BASE_URL is deprecated. Please use EXPO_PUBLIC_API_BASE_URL.');
}

if (!resolvedApiBaseUrl) {
  throw new Error('Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL for production builds.');
}

const API_BASE_URL = resolvedApiBaseUrl.replace(/\/$/, '');
export const AUTH_TOKEN_STORAGE_KEY = 'authToken';
export const AUTH_USER_STORAGE_KEY = 'authUser';

export interface ApiUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function readResponseBody(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getApiErrorMessage(body: any, fallback: string) {
  if (typeof body === 'string') {
    return body;
  }

  return (
    body?.error?.message ||
    body?.error ||
    body?.message ||
    fallback
  );
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

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseBody, `API Error: ${response.status}`));
  }

  return responseBody as T;
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await apiCall<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!response?.token || !response?.user) {
    throw new Error('Login failed: the server returned an invalid session.');
  }

  return response;
}
