import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/client'

export function useAuth() {
  const token = localStorage.getItem('token')

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
  })

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }, [])

  return { user, isAuthenticated: !!user, isLoading, logout }
}
