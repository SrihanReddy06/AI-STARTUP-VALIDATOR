import type { StartupReport } from '../types';

export interface HistoryItem {
  id: number;
  idea: string;
  brand_name: string;
  status?: string;
  error_message?: string;
  created_at: string;
}

export interface HistoryDetail {
  id: number;
  idea: string;
  brand_name: string;
  status: string;
  error_message?: string;
  created_at: string;
  report?: StartupReport | null;
}

export interface GenerateResponse {
  status: string;
  plan_id: number;
}

export interface HealthResponse {
  status: string;
  message: string;
}

// Resolve API base URL dynamically, removing any trailing slash
const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
export const API_BASE = rawBase !== undefined ? rawBase.replace(/\/+$/, '') : (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data: HealthResponse = await res.json();
      return { ok: true, message: data.message || 'Connected' };
    }
    return { ok: false, message: `HTTP ${res.status}: ${res.statusText}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, message };
  }
}

/**
 * Trigger background startup generation
 */
export async function generateStartup(
  idea: string,
  providers: Record<string, string>
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      idea,
      providers,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Failed to start generation task: ${response.status} ${response.statusText} ${errText}`);
  }

  return response.json();
}

/**
 * Fetch all saved startup plans history
 */
export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/history`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch details of a single plan by ID
 */
export async function fetchHistoryDetail(id: number): Promise<HistoryDetail> {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch startup details (ID: ${id})`);
  }
  return res.json();
}

/**
 * Delete a saved plan by ID
 */
export async function deleteHistoryItem(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  return res.ok;
}

/**
 * Get endpoint for boardroom SSE chat
 */
export function getBoardroomChatUrl(): string {
  return `${API_BASE}/api/chat`;
}
