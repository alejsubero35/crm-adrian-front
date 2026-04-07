import { useState, useEffect, useCallback } from 'react'
import { 
  type ApiWarehouse, 
  fetchAllWarehouses, 
  fetchActiveWarehouses,
  fetchWarehousesByBranch,
  searchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStock,
  type WarehousePayload,
  type WarehouseStock
} from '@/services/warehouses'

export function useWarehouses(autoFetch = true) {
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetch = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllWarehouses(pageNum, 15)
      setWarehouses(prev => append ? [...prev, ...data] : data)
      setHasMore(data.length >= 15)
      setPage(pageNum)
    } catch (err: any) {
      setError(err.message || 'Error loading warehouses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchActiveWarehouses()
      setWarehouses(data)
      setHasMore(false)
    } catch (err: any) {
      setError(err.message || 'Error loading warehouses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchByBranch = useCallback(async (branchId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchWarehousesByBranch(branchId)
      setWarehouses(data)
      setHasMore(false)
    } catch (err: any) {
      setError(err.message || 'Error loading warehouses')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (term: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchWarehouses(term)
      setWarehouses(data)
      setHasMore(false)
    } catch (err: any) {
      setError(err.message || 'Error searching warehouses')
    } finally {
      setLoading(false)
    }
  }, [])

  const getStock = useCallback(async (id: number | string): Promise<WarehouseStock[]> => {
    return await getWarehouseStock(id)
  }, [])

  const create = useCallback(async (payload: WarehousePayload) => {
    const result = await createWarehouse(payload)
    setWarehouses(prev => [result, ...prev])
    return result
  }, [])

  const update = useCallback(async (id: number | string, payload: WarehousePayload) => {
    const result = await updateWarehouse(id, payload)
    setWarehouses(prev => prev.map(w => w.id === Number(id) ? result : w))
    return result
  }, [])

  const remove = useCallback(async (id: number | string) => {
    await deleteWarehouse(id)
    setWarehouses(prev => prev.filter(w => w.id !== Number(id)))
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
    warehouses,
    loading,
    error,
    page,
    hasMore,
    fetch,
    fetchActive,
    fetchByBranch,
    search,
    getStock,
    create,
    update,
    remove,
    loadMore,
    refresh
  }
}
