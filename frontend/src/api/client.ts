import axios from 'axios'
import {
  demoAuthApi,
  demoDashboardApi,
  demoReposApi,
} from './demo'

export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.params = { ...config.params, token }
  return config
})

export interface User {
  id: number
  github_id: number
  username: string
  email: string | null
  avatar_url: string | null
  api_key?: string | null
  email_notifications?: boolean
}

export interface Repo {
  id: number
  full_name: string
  name: string
  description: string | null
  is_private: boolean
  health_score: number | null
  last_scanned_at: string | null
  scan_results: {
    checks: Record<string, boolean>
    issues: Array<{ check: string; severity: string; message: string }>
  } | null
}

export interface DashboardSummary {
  total_repos: number
  scanned_repos: number
  average_health_score: number | null
  healthy: number
  needs_attention: number
}

export interface ScanHistoryEntry {
  id: number
  health_score: number
  scanned_at: string
}

export interface ListReposParams {
  q?: string
  sort?: 'name' | 'score' | 'scanned'
  page?: number
  per_page?: number
}

export const authApi = IS_DEMO
  ? demoAuthApi
  : {
      me: () => api.get<User>('/auth/me').then((r) => r.data),
      loginUrl: '/api/auth/login',
    }

export const reposApi = IS_DEMO
  ? demoReposApi
  : {
      list: (params?: ListReposParams) => api.get<Repo[]>('/repos/', { params }).then((r) => r.data),
      sync: () => api.post<{ synced: number }>('/repos/sync').then((r) => r.data),
      scanAll: () => api.post<{ count: number }>('/repos/scan-all').then((r) => r.data),
      scan: (id: number) => api.post(`/repos/${id}/scan`).then((r) => r.data),
      get: (id: number) => api.get<Repo>(`/repos/${id}`).then((r) => r.data),
      history: (id: number) =>
        api.get<ScanHistoryEntry[]>(`/repos/${id}/history`).then((r) => r.data),
    }

export const dashboardApi = IS_DEMO
  ? demoDashboardApi
  : {
      summary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
    }

export const usersApi = IS_DEMO
  ? {
      updateMe: async (prefs: { email_notifications: boolean }) =>
        ({ email_notifications: prefs.email_notifications }) as User,
      generateApiKey: async () => ({ api_key: 'demo-key-not-real' }) as User,
      revokeApiKey: async () => ({}) as User,
    }
  : {
      updateMe: (prefs: { email_notifications: boolean }) =>
        api.patch<User>('/users/me', prefs).then((r) => r.data),
      generateApiKey: () => api.post<User>('/users/me/api-key').then((r) => r.data),
      revokeApiKey: () => api.delete<User>('/users/me/api-key').then((r) => r.data),
    }
