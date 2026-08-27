const IA_BASE_URL = process.env.NEXT_PUBLIC_API_URL_IA || "http://localhost:8000";
const IA_API_KEY = process.env.NEXT_PUBLIC_IA_API_KEY || "";

export interface AgentTopReport {
  id: number;
  content: string | null;
  category: string;
  sentiment_score: number;
  status: string;
  created_at: string | null;
  municipal_service: string | null;
}

export interface AgentAnalysisTrace {
  tool: string;
  arguments?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface AgentChatResponse {
  answer: string;
  top_reports: AgentTopReport[];
  analyses: AgentAnalysisTrace[];
  tools_used: string[];
  fallback: boolean;
}

export async function askAgent(
  question: string,
  tenantId: string,
): Promise<AgentChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (IA_API_KEY) headers["X-API-Key"] = IA_API_KEY;
  const response = await fetch(`${IA_BASE_URL}/reporting/chat/agent`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question, tenant_id: tenantId || "ia-pipeline" }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : null;
    throw new Error(detail || `Erreur ${response.status} de l'assistant IA`);
  }
  return data as AgentChatResponse;
}
