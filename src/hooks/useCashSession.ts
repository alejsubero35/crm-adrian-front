import { useState, useEffect, useCallback } from 'react'
import { 
  type ApiCashSession,
  type CashSessionSummary,
  fetchCashSessions,
  getCurrentSession,
  getCashSession,
  getCashSessionReport,
  openCashSession,
  closeCashSession,
  type OpenSessionPayload,
  type CloseSessionPayload
} from '@/services/cashSessions'

export function useCashSession() {
  const [currentSession, setCurrentSession] = useState<ApiCashSession | null>(null)
  const [sessions, setSessions] = useState<ApiCashSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const session = await getCurrentSession()
      setCurrentSession(session)
      return session
    } catch (err: any) {
      setError(err.message || 'Error loading current session')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAll = useCallback(async (params?: Parameters<typeof fetchCashSessions>[0]) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCashSessions(params)
      setSessions(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error loading sessions')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async (id: number | string) => {
    return await getCashSession(id)
  }, [])

  const getReport = useCallback(async (id: number | string): Promise<CashSessionSummary> => {
    return await getCashSessionReport(id)
  }, [])

  const open = useCallback(async (payload: OpenSessionPayload) => {
    try {
      setLoading(true)
      setError(null)
      const session = await openCashSession(payload)
      setCurrentSession(session)
      return session
    } catch (err: any) {
      setError(err.message || 'Error opening session')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const close = useCallback(async (id: number | string, payload: CloseSessionPayload) => {
    try {
      setLoading(true)
      setError(null)
      const session = await closeCashSession(id, payload)
      setCurrentSession(null)
      return session
    } catch (err: any) {
      setError(err.message || 'Error closing session')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const hasOpenSession = currentSession?.status === 'open'

  useEffect(() => {
    fetchCurrent()
  }, [fetchCurrent])

  return {
    currentSession,
    sessions,
    loading,
    error,
    hasOpenSession,
    fetchCurrent,
    fetchAll,
    getSession,
    getReport,
    open,
    close
  }
}
