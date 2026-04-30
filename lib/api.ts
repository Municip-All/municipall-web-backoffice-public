const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
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

// --- Interfaces ---

export interface CityConfig {
  name: string;
  features: string[];
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    useGradient: boolean;
    logoUrl: string;
  };
  wasteConfig?: {
    services: {
      type: string;
      icon: string;
      color: string;
      days: number[];
      time: string;
    }[];
  };
}

export interface CityDashboardStats {
  satisfaction: number;
  satisfactionTrend: number;
  citizensCount: number;
  activeReportsCount: number;
  reportsTrend: number;
  suggestionsCount: number;
  suggestionsTrend: number;
  trendData: { name: string; satisfaction: number }[];
}

export interface Report {
  id: number;
  tenantId: string;
  userId?: number;
  category: string;
  status: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isResident?: boolean;
}

// --- Generic Methods ---

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'GET', undefined, headers),
  
  post: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => 
    request<T>(endpoint, 'POST', body, headers),
  
  put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => 
    request<T>(endpoint, 'PUT', body, headers),

  patch: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => 
    request<T>(endpoint, 'PATCH', body, headers),
  
  delete: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, 'DELETE', undefined, headers),

  // --- City Config ---

  async getCityConfig(cityId: string): Promise<CityConfig | null> {
    const response = await request<CityConfig>(`/api/v1/city-config/${cityId}`);
    return response.data || null;
  },

  async saveCityConfig(cityId: string, data: Partial<CityConfig> & Partial<CityConfig['theme']>): Promise<boolean> {
    const response = await request(`/api/v1/admin/cities/${cityId}`, 'PATCH', data);
    return response.status < 400;
  },

  // --- Dashboard Stats ---

  async getDashboardStats(cityId: string): Promise<CityDashboardStats | null> {
    const response = await request<CityDashboardStats>(`/api/v1/city-config/${cityId}/dashboard-stats`);
    return response.data || null;
  },

  // --- Reports ---

  async getReports(): Promise<Report[]> {
    const response = await request<Report[]>('/api/v1/reports');
    return response.data || [];
  },

  async updateReportStatus(id: number, status: string): Promise<boolean> {
    const response = await request(`/api/v1/reports/${id}/status`, 'PATCH', { status });
    return response.status < 400;
  },

  // --- User Profile ---

  async updateProfile(data: { name?: string; surname?: string; email?: string }): Promise<boolean> {
    const response = await request('/api/v1/users/profile', 'POST', data);
    return response.status < 400;
  },

  async updatePassword(data: { current: string; new: string; confirm: string }): Promise<boolean> {
    const response = await request('/api/v1/users/password', 'POST', data);
    return response.status < 400;
  },
};
