import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, IS_DEMO } from '../api/client'

export function useAuth() {
  const token = IS_DEMO ? 'demo' : localStorage.getItem('token')
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
  })

  const logout = useCallback(() => {
    if (IS_DEMO) {
      queryClient.clear()
      window.location.reload()
    } else {
      localStorage.removeItem('token')
      window.location.href = import.meta.env.BASE_URL || '/'
    }
  }, [queryClient])

  return { user, isAuthenticated: !!user, isLoading, logout }
}
