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

export const authApi = IS_DEMO
  ? demoAuthApi
  : {
      me: () => api.get<User>('/auth/me').then((r) => r.data),
      loginUrl: '/api/auth/login',
    }

export const reposApi = IS_DEMO
  ? demoReposApi
  : {
      list: () => api.get<Repo[]>('/repos/').then((r) => r.data),
      sync: () => api.post<{ synced: number }>('/repos/sync').then((r) => r.data),
      scan: (id: number) => api.post(`/repos/${id}/scan`).then((r) => r.data),
      get: (id: number) => api.get<Repo>(`/repos/${id}`).then((r) => r.data),
    }

export const dashboardApi = IS_DEMO
  ? demoDashboardApi
  : {
      summary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
    }
