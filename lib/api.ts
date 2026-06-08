import { translateApiError } from "./apiErrors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  let tenantId = "";
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) tenantId = (JSON.parse(raw) as { cityId?: string }).cityId || "";
    } catch {
      tenantId = "";
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { "x-tenant-id": tenantId } : {}),
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
        error: translateApiError(data, response.status),
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
      error: "Impossible de contacter le serveur",
      status: 500,
    };
  }
}

// --- Interfaces ---

export interface CityNeighborhood {
  id: string;
  name: string;
  points: [number, number][];
}

export interface CityContactConfig {
  email?: string;
  phone?: string;
  helpText?: string;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties?: { name?: string };
}

export interface CityConfig {
  name: string;
  officialName?: string;
  features: string[];
  contact?: CityContactConfig;
  neighborhoods?: CityNeighborhood[];
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

export type DashboardAlertSeverity = "urgent" | "high" | "normal";
export type DashboardAlertType = "report" | "contact";

export interface DashboardAlert {
  id: string;
  type: DashboardAlertType;
  severity: DashboardAlertSeverity;
  title: string;
  subtitle: string;
  createdAt: string;
  entityId: number;
}

export interface CityDashboardStats {
  satisfaction: number;
  satisfactionTrend: number;
  citizensCount: number;
  activeReportsCount: number;
  pendingContactMessagesCount: number;
  urgentReportsCount: number;
  reportsInProgressCount: number;
  pendingTotalCount: number;
  urgentAlertsCount: number;
  reportsTrend: number;
  suggestionsCount: number;
  suggestionsTrend: number;
  trendData: { name: string; satisfaction: number }[];
  alerts: DashboardAlert[];
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

export interface ReportMessage {
  id: number;
  senderId: number;
  senderRole: "citizen" | "agent";
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ReportCitizen {
  id: number;
  name: string;
  surname: string;
  email: string;
  cityId?: string;
  cityName?: string;
}

export interface ReportDetail extends Report {
  lat: number;
  lon: number;
  citizen?: ReportCitizen;
  messages: ReportMessage[];
}

export interface TicketMessage {
  id: number;
  senderId: number;
  senderRole: "citizen" | "agent";
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ContactTicketListItem {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    body: string;
    senderRole: "citizen" | "agent";
    createdAt: string;
  };
}

export interface ContactTicketDetail {
  id: number;
  subject: string;
  status: string;
  userId: number;
  citizenName: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  messages: TicketMessage[];
}

export interface CityEvent {
  id?: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  imageUrl?: string;
}

/** @deprecated */
export interface ContactMessage {
  id: number;
  subject: string;
  body: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  moderationAlerts: boolean;
  weeklyReports: boolean;
  citizenEngagement: boolean;
  systemMaintenance: boolean;
  contactInbox: boolean;
  teamActivity: boolean;
}

// --- Generic Methods ---

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, "GET", undefined, headers),

  post: <T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>,
  ) => request<T>(endpoint, "POST", body, headers),

  put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, "PUT", body, headers),

  patch: <T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>,
  ) => request<T>(endpoint, "PATCH", body, headers),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, "DELETE", undefined, headers),

  // --- City Config ---

  async getCityConfig(cityId: string): Promise<CityConfig | null> {
    const response = await request<CityConfig>(`/api/v1/city-config/${cityId}`);
    return response.data || null;
  },

  async getCityBoundary(cityId: string): Promise<GeoJsonFeature | null> {
    const response = await request<GeoJsonFeature>(
      `/api/v1/city-config/${cityId}/boundary`,
    );
    return response.data ?? null;
  },

  async saveCityConfig(
    cityId: string,
    data: Partial<CityConfig> &
      Partial<CityConfig["theme"]> & {
        contactEmail?: string;
        contactPhone?: string;
        contactHelpText?: string;
      },
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await request(
      `/api/v1/city-config/${cityId}`,
      "PATCH",
      data,
    );
    if (response.error) return { ok: false, error: response.error };
    return { ok: response.status < 400 };
  },

  // --- Dashboard Stats ---

  async getDashboardStats(cityId: string): Promise<CityDashboardStats | null> {
    const response = await request<CityDashboardStats>(
      `/api/v1/city-config/${cityId}/dashboard-stats`,
    );
    return response.data || null;
  },

  // --- Reports ---

  async getReports(): Promise<Report[]> {
    const response = await request<Report[]>("/api/v1/reports");
    return response.data || [];
  },

  async getReport(
    id: number,
  ): Promise<{ data: ReportDetail | null; error?: string }> {
    const response = await request<ReportDetail>(`/api/v1/reports/${id}`);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data ?? null };
  },

  async replyToReport(
    id: number,
    body: string,
  ): Promise<{ data: ReportDetail | null; error?: string }> {
    const response = await request<ReportDetail>(
      `/api/v1/reports/${id}/messages`,
      "POST",
      {
        body,
      },
    );
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data ?? null };
  },

  async updateReportStatus(
    id: number,
    status: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await request(`/api/v1/reports/${id}/status`, "PATCH", {
      status,
    });
    if (response.error) {
      return { ok: false, error: response.error };
    }
    return { ok: response.status < 400 };
  },

  async getContactTickets(): Promise<ContactTicketListItem[]> {
    const response = await request<ContactTicketListItem[]>(
      "/api/v1/contact-tickets",
    );
    return response.data || [];
  },

  async getContactTicket(id: number): Promise<ContactTicketDetail | null> {
    const response = await request<ContactTicketDetail>(
      `/api/v1/contact-tickets/${id}`,
    );
    return response.data || null;
  },

  async replyContactTicket(
    id: number,
    body: string,
  ): Promise<ContactTicketDetail | null> {
    const response = await request<ContactTicketDetail>(
      `/api/v1/contact-tickets/${id}/messages`,
      "POST",
      { body },
    );
    return response.data || null;
  },

  async closeContactTicket(id: number): Promise<ContactTicketDetail | null> {
    const response = await request<ContactTicketDetail>(
      `/api/v1/contact-tickets/${id}/close`,
      "PATCH",
      {},
    );
    return response.data || null;
  },

  /** @deprecated */
  async getContactMessages(): Promise<ContactTicketListItem[]> {
    return this.getContactTickets();
  },

  /** @deprecated */
  async updateContactMessageStatus(
    id: number,
    status: string,
  ): Promise<boolean> {
    if (status === "En cours") {
      const t = await this.getContactTicket(id);
      if (t && t.status === "En attente") {
        await this.replyContactTicket(id, "Prise en charge par la mairie.");
      }
      return true;
    }
    if (status === "Clôturé" || status === "Résolu") {
      return (await this.closeContactTicket(id)) !== null;
    }
    return false;
  },

  // --- Events ---

  async getEvents(): Promise<CityEvent[]> {
    const response = await request<CityEvent[]>("/api/v1/events");
    return response.data || [];
  },

  async saveEvent(event: CityEvent): Promise<CityEvent | null> {
    const body = {
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
    };
    if (event.id) {
      const response = await request<CityEvent>(
        `/api/v1/events/${event.id}`,
        "PATCH",
        body,
      );
      return response.data || null;
    }
    const response = await request<CityEvent>("/api/v1/events", "POST", body);
    return response.data || null;
  },

  async deleteEvent(id: number): Promise<boolean> {
    const response = await request(`/api/v1/events/${id}`, "DELETE");
    return response.status < 400;
  },

  // --- User Profile ---

  async updateProfile(data: {
    name?: string;
    surname?: string;
    email?: string;
  }): Promise<boolean> {
    const response = await request("/api/v1/users/profile", "POST", data);
    return response.status < 400;
  },

  async updatePassword(data: {
    current: string;
    new: string;
    confirm: string;
  }): Promise<boolean> {
    const response = await request("/api/v1/users/password", "POST", data);
    return response.status < 400;
  },

  async updateAvatar(avatarUrl: string): Promise<boolean> {
    const response = await request("/api/v1/users/avatar", "POST", {
      avatarUrl,
    });
    return response.status < 400;
  },

  async getMe(): Promise<User | null> {
    const response = await request<User>("/api/v1/auth/me");
    return response.data ?? null;
  },

  async getUserStats(): Promise<{
    reports: number;
    participations: number;
    points: number;
  } | null> {
    const response = await request<{
      reports: number;
      participations: number;
      points: number;
    }>("/api/v1/users/stats");
    return response.data ?? null;
  },

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    const response = await request<NotificationPreferences>(
      "/api/v1/users/preferences",
    );
    return response.data ?? null;
  },

  async updateNotificationPreferences(
    data: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences | null> {
    const response = await request<NotificationPreferences>(
      "/api/v1/users/preferences",
      "POST",
      data,
    );
    return response.data ?? null;
  },

  // --- Staff / équipe mairie ---

  async getTeamKpis(days = 30): Promise<AgentKpi[]> {
    const response = await request<AgentKpi[]>(
      `/api/v1/staff/team/kpis?days=${days}`,
    );
    return response.data ?? [];
  },

  async getTeamActivity(limit = 50): Promise<TeamActivityItem[]> {
    const response = await request<TeamActivityItem[]>(
      `/api/v1/staff/team/activity?limit=${limit}`,
    );
    return response.data ?? [];
  },

  async getTeam(): Promise<TeamMember[]> {
    const response = await request<TeamMember[]>("/api/v1/staff/team");
    return response.data ?? [];
  },

  async inviteTeamMember(data: {
    name: string;
    email: string;
    role: "assistant" | "agent";
  }): Promise<{ data?: StaffInvitationResult; error?: string }> {
    const response = await request<StaffInvitationResult>(
      "/api/v1/staff/invitations",
      "POST",
      data,
    );
    if (response.error) return { error: response.error };
    return { data: response.data };
  },

  async getInvitationPreview(
    token: string,
  ): Promise<{ data?: InvitationPreview; error?: string }> {
    const response = await request<InvitationPreview>(
      `/api/v1/staff/invitations/preview?token=${encodeURIComponent(token)}`,
    );
    if (response.error) return { error: response.error };
    return { data: response.data };
  },

  async acceptInvitation(data: {
    token: string;
    name: string;
    surname: string;
    password: string;
  }): Promise<{ data?: { access_token: string; user: User }; error?: string }> {
    const response = await request<{ access_token: string; user: User }>(
      "/api/v1/staff/invitations/accept",
      "POST",
      data,
    );
    if (response.error) return { error: response.error };
    return { data: response.data };
  },

  async backofficeLogin(
    email: string,
    password: string,
  ): Promise<{ data?: { access_token: string; user: User }; error?: string }> {
    const response = await request<{ access_token: string; user: User }>(
      "/api/v1/auth/backoffice/login",
      "POST",
      { email, password },
    );
    if (response.error) return { error: response.error };
    return { data: response.data };
  },
};

export interface AgentKpi {
  userId: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  reportsHandled: number;
  messagesSent: number;
  contactReplies: number;
  ticketsClosed: number;
  reportsResolved: number;
  resolutionRate: number;
  avgFirstResponseHours: number | null;
  satisfactionScore: number | null;
}

export interface TeamActivityItem {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface InvitationPreview {
  email: string;
  suggestedName?: string;
  role: string;
  cityId: string;
  cityName: string;
  status: string;
  expiresAt?: string;
}

export interface StaffInvitationResult {
  id: number;
  email: string;
  name?: string;
  role: string;
  status: string;
  expiresAt?: string;
  acceptPath: string;
}

export interface TeamMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  cityId: string;
  avatar_url?: string;
  permissions?: string[];
}
