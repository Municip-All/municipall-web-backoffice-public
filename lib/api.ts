const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Une erreur est survenue',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    return {
      error: 'Impossible de contacter le serveur',
      status: 500,
    };
  }
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'GET', undefined, headers),
  
  post: <T>(endpoint: string, body: any, headers?: Record<string, string>) => 
    request<T>(endpoint, 'POST', body, headers),
  
  put: <T>(endpoint: string, body: any, headers?: Record<string, string>) => 
    request<T>(endpoint, 'PUT', body, headers),
  
  delete: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'DELETE', undefined, headers),
};
