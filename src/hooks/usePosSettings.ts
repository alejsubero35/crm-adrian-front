import { useState, useEffect, useCallback } from 'react'
import { 
  type ApiPosSettings,
  type PosCapabilities,
  getPosSettings,
  updatePosSettings,
  getPosCapabilities,
  type PosSettingsPayload
} from '@/services/posSettings'

export function usePosSettings() {
  const [settings, setSettings] = useState<ApiPosSettings | null>(null)
  const [capabilities, setCapabilities] = useState<PosCapabilities | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPosSettings()
      setSettings(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error loading POS settings')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCapabilities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPosCapabilities()
      setCapabilities(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error loading POS capabilities')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (payload: PosSettingsPayload) => {
    try {
      setLoading(true)
      setError(null)
      const data = await updatePosSettings(payload)
      setSettings(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error updating POS settings')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchCapabilities()
  }, [fetchSettings, fetchCapabilities])

  return {
    settings,
    capabilities,
    loading,
    error,
    fetchSettings,
    fetchCapabilities,
    update
  }
}
