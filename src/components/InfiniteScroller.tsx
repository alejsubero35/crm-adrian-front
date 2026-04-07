import React from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';

type InfiniteScrollerProps<T> = {
  endpoint?: string;
  children: (items: T[], loading: boolean, error: string | null) => React.ReactNode;
  pageSize?: number;
  pageParam?: string;
  pageSizeParam?: string;
  queryParam?: string;
  adapter?: (data: unknown, page: number) => { items: T[]; hasMore: boolean } | Promise<{ items: T[]; hasMore: boolean }>;
  className?: string;
};

export function InfiniteScroller<T = unknown>({ endpoint, children, pageSize, pageParam, pageSizeParam, queryParam, adapter, className }: InfiniteScrollerProps<T>) {
  const { items, loading, error, sentinelRef } = useInfiniteScroll<T>(endpoint, { pageSize, pageParam, pageSizeParam, queryParam, adapter });

  return (
    <div className={className ?? ''}>
      {children(items, loading, error)}
      {/* sentinel observed by hook to auto-load more; give it a small height so observer can detect it reliably */}
      <div
        ref={sentinelRef as React.RefObject<HTMLDivElement>}
        aria-hidden
        className="h-1 w-full"
        style={{ minHeight: 1 }}
      />
    </div>
  );
}

export default InfiniteScroller;
