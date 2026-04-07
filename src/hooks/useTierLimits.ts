import { useState, useEffect, useCallback } from 'react'
import { getTierLimits, type TierInfo } from '@/services/tierLimits'

export function useTierLimits() {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTierLimits()
      setTierInfo(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error loading tier limits')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const isFeatureAvailable = useCallback((feature: keyof TierInfo['limits']): boolean => {
    if (!tierInfo) return false
    const limit = tierInfo.limits[feature]
    if (typeof limit === 'boolean') return limit
    return limit === null || limit > 0
  }, [tierInfo])

  const canCreate = useCallback((resource: 'branches' | 'warehouses' | 'users' | 'products', currentCount: number): boolean => {
    if (!tierInfo) return false
    const limit = tierInfo.limits[resource]
    if (limit === null) return true // unlimited
    return currentCount < limit
  }, [tierInfo])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    tierInfo,
    tier: tierInfo?.current_tier || 'basic',
    limits: tierInfo?.limits || null,
    loading,
    error,
    fetch,
    isFeatureAvailable,
    canCreate
  }
}
