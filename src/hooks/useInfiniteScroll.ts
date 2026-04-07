import { useCallback, useEffect, useRef, useState } from 'react';
import http from '@/lib/http';

type FetchResult<T> = {
  items: T[];
  hasMore: boolean;
};

type UseInfiniteScrollOptions<T> = {
  pageSize?: number;
  /** name of the query param for page */
  pageParam?: string;
  /** name of the query param for page size */
  pageSizeParam?: string;
  /** name of the query param for search term */
  queryParam?: string;
  /** if true, avoid fetching when term is empty (useful for search endpoints) */
  requireTerm?: boolean;
  /** adapter to map fetch response to FetchResult; raw data is unknown */
  adapter?: (data: unknown, page: number) => FetchResult<T> | Promise<FetchResult<T>>;
  /** stable key extractor for deduping across pages; prevents infinite loops when backend repeats pages */
  getItemKey?: (item: T) => string | number;
  /** optional scroll container; when set, observer uses it as root (instead of viewport) */
  rootRef?: React.RefObject<HTMLElement | null>;
  /** optional scroll container element; preferred when you can pass the element directly */
  root?: HTMLElement | null;
  /** initial items to seed */
  initialItems?: T[];
  /** if true, do not attach IntersectionObserver; caller triggers loadMore manually (e.g., onScroll) */
  manual?: boolean;
};

function inferHasMoreFromResponse(data: any, page: number): boolean | null {
  // Some backends return { data: [...], meta: {...}, links: {...} }
  // Others return nested shapes like { data: { data: [...], meta: {...}, links: {...} } }
  // or resource wrappers like { productSubCategories: { data: [...], meta: {...} } }
  const candidates: any[] = [data, data?.data];

  // Try to detect a single resource wrapper (first object value) and inspect that too
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const values = Object.values(data as Record<string, any>);
    const firstObj = values.find((v) => v && typeof v === 'object' && !Array.isArray(v));
    if (firstObj) {
      candidates.push(firstObj, (firstObj as any).data);
    }
  }

  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;
    const meta = (c as any).meta;
    if (meta && typeof meta === 'object') {
      const current = Number((meta as any).current_page ?? (meta as any).currentPage ?? page);
      const last = (meta as any).last_page ?? (meta as any).lastPage;
      if (last != null && !Number.isNaN(Number(last))) {
        return current < Number(last);
      }
    }

    // Laravel paginate sometimes returns links as an array: [{url,label,active}, ...]
    const linksArray = (c as any).links;
    if (Array.isArray(linksArray)) {
      const nextLink = linksArray.find((l: any) => {
        const label = String(l?.label ?? '').toLowerCase();
        return label.includes('next');
      });
      if (nextLink && 'url' in (nextLink as any)) {
        return !!(nextLink as any).url;
      }
    }

    const nextUrl =
      (c as any).next_page_url ??
      (c as any).nextPageUrl ??
      (c as any).links?.next ??
      (c as any).links?.next_page_url;

    if (nextUrl !== undefined) {
      return !!nextUrl;
    }
  }

  return null;
}

/**
 * useInfiniteScroll - reusable hook for paginated endpoints.
 * Accepts a base endpoint (string) and options. It exposes items, loading, error, hasMore, loadMore, reset and a ref to attach to a sentinel element for automatic loading.
 */
export function useInfiniteScroll<T = unknown>(endpoint?: string, options: UseInfiniteScrollOptions<T> = {}) {
  const {
    pageSize = 20,
    pageParam = 'page',
    pageSizeParam = 'perPage',
    queryParam = 'q',
    requireTerm = false,
    adapter,
    getItemKey,
    rootRef,
    root,
    initialItems = [],
    manual = false,
  } = options;

  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [termState, setTermState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const wasIntersectingRef = useRef(false);
  const lastPageRef = useRef<number | null>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<string>('');
  const reqIdRef = useRef(0);
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const seenKeysRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const fetchPage = useCallback(async (p: number, term?: string) => {
    if (!endpoint) return;
    // Cancel previous request if still in-flight
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const abortController = new AbortController();
    abortRef.current = abortController;
    setLoading(true);
    setError(null);
    const currentReq = ++reqIdRef.current;
    inFlightRef.current = true;
    try {
      const data = await http.get<unknown>(endpoint, {
        query: {
          [pageParam]: p,
          [pageSizeParam]: pageSize,
          ...(term ? { [queryParam]: term } : {}),
        } as Record<string, any>,
        signal: abortController.signal,
      });

      if (reqIdRef.current !== currentReq) return;
      const result = adapter
        ? await adapter(data, p)
        : ({
            items: Array.isArray(data) ? (data as T[]) : ([] as T[]),
            hasMore: Array.isArray(data) ? (data as any[]).length >= pageSize : false,
          } as FetchResult<T>);

      const backendHasMore = inferHasMoreFromResponse(data as any, p);
      const computedHasMore = backendHasMore === null ? result.hasMore : backendHasMore && result.hasMore;

      // Track last_page if present to hard-stop loadMore beyond it
      const rawMeta = (data as any)?.meta ?? (data as any)?.data?.meta;
      if (rawMeta && typeof rawMeta === 'object') {
        const lp = (rawMeta as any).last_page ?? (rawMeta as any).lastPage;
        if (lp != null && !Number.isNaN(Number(lp))) {
          lastPageRef.current = Number(lp);
        }
      }

      if (p === 1) {
        seenKeysRef.current = new Set();
        if (getItemKey) {
          result.items.forEach((it) => {
            seenKeysRef.current.add(getItemKey(it));
          });
        }
        setItems(result.items);
        hasMoreRef.current = computedHasMore && result.items.length > 0;
        setHasMore(hasMoreRef.current);
        return;
      }

      // page > 1
      if (result.items.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      if (!getItemKey) {
        setItems((prev) => [...prev, ...result.items]);
        hasMoreRef.current = computedHasMore;
        setHasMore(hasMoreRef.current);
        return;
      }

      // dedupe across pages
      const seen = seenKeysRef.current;
      const newItems: T[] = [];
      for (const it of result.items) {
        const key = getItemKey(it);
        if (seen.has(key)) continue;
        seen.add(key);
        newItems.push(it);
      }

      if (newItems.length === 0) {
        // Backend is repeating the same page; stop to avoid infinite loops
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      setItems((prev) => [...prev, ...newItems]);
      hasMoreRef.current = computedHasMore;
      setHasMore(hasMoreRef.current);
    } catch (err) {
      if (reqIdRef.current !== currentReq) return;
      if ((err as any)?.name === 'AbortError') return;
      const message = typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Error loading');
      setError(message);
    } finally {
      if (abortRef.current === abortController) {
        abortRef.current = null;
      }
      if (reqIdRef.current === currentReq) {
        setLoading(false);
        inFlightRef.current = false;
      }
    }
  }, [endpoint, pageParam, pageSizeParam, pageSize, queryParam, adapter, getItemKey]);

  // load initial or page change
  useEffect(() => {
    if (!endpoint) return;
    if (requireTerm && !termState) return;
    fetchPage(page, termState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, termState, requireTerm]);

  const reset = useCallback((term = '') => {
    termRef.current = term;
    setItems([]);
    setPage(1);
    pageRef.current = 1;
    setTermState(term);
    hasMoreRef.current = true;
    setHasMore(true);
    seenKeysRef.current = new Set();
    inFlightRef.current = false;
    wasIntersectingRef.current = false;
    lastPageRef.current = null;
  }, []);

  const setTerm = useCallback((t: string) => {
    reset(t);
  }, [reset]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current) return;
    if (loadingRef.current || !hasMoreRef.current) return;
    // Hard-stop synchronously; never allow page to exceed last_page
    if (lastPageRef.current != null && pageRef.current >= lastPageRef.current) {
      hasMoreRef.current = false;
      setHasMore(false);
      return;
    }
    inFlightRef.current = true;
    setPage((prev) => {
      const lp = lastPageRef.current;
      if (lp != null && prev >= lp) {
        hasMoreRef.current = false;
        // keep state consistent; safe even inside state updater
        setHasMore(false);
        return prev;
      }
      const next = prev + 1;
      pageRef.current = next;
      return next;
    });
  }, []);

  // Intersection observer auto load when sentinel visible
  useEffect(() => {
    if (manual) return;
    const sentinel = sentinelRef.current;
    const rootEl = root ?? rootRef?.current ?? null;
    if (!sentinel) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) {
          wasIntersectingRef.current = false;
          return;
        }
        // Trigger only on "rising edge" to avoid loading all pages at once
        if (wasIntersectingRef.current) return;
        wasIntersectingRef.current = true;
        if (!hasMoreRef.current) return;
        if (inFlightRef.current) return;
        loadMore();
      });
    }, { root: rootEl, rootMargin: '100px' });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [loadMore, root, rootRef, manual]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    sentinelRef,
    setTerm,
  } as const;
}

export default useInfiniteScroll;
