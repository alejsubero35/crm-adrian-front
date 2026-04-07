import { useState, useEffect, useCallback } from 'react'
import { 
  type ApiBranch, 
  fetchAllBranches, 
  fetchActiveBranches,
  searchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  type BranchPayload
} from '@/services/branches'

export function useBranches(autoFetch = true) {
  const [branches, setBranches] = useState<ApiBranch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetch = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllBranches(pageNum, 15)
      setBranches(prev => append ? [...prev, ...data] : data)
      setHasMore(data.length >= 15)
      setPage(pageNum)
    } catch (err: any) {
      setError(err.message || 'Error loading branches')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchActiveBranches()
      setBranches(data)
      setHasMore(false)
    } catch (err: any) {
      setError(err.message || 'Error loading branches')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (term: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchBranches(term)
      setBranches(data)
      setHasMore(false)
    } catch (err: any) {
      setError(err.message || 'Error searching branches')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload: BranchPayload) => {
    const result = await createBranch(payload)
    setBranches(prev => [result, ...prev])
    return result
  }, [])

  const update = useCallback(async (id: number | string, payload: BranchPayload) => {
    const result = await updateBranch(id, payload)
    setBranches(prev => prev.map(b => b.id === Number(id) ? result : b))
    return result
  }, [])

  const remove = useCallback(async (id: number | string) => {
    await deleteBranch(id)
    setBranches(prev => prev.filter(b => b.id !== Number(id)))
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetch(page + 1, true)
    }
  }, [loading, hasMore, page, fetch])

  const refresh = useCallback(() => {
    fetch(1, false)
  }, [fetch])

  useEffect(() => {
    if (autoFetch) {
      fetch(1)
    }
  }, [autoFetch, fetch])

  return {
    branches,
    loading,
    error,
    page,
    hasMore,
    fetch,
    fetchActive,
    search,
    create,
    update,
    remove,
    loadMore,
    refresh
  }
}
