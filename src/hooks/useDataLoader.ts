import { useState, useEffect, useCallback } from 'react';

interface UseDataLoaderOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  onError?: (error: Error) => void;
}

export function useDataLoader<T>(
  loadFunction: () => Promise<T>,
  options: UseDataLoaderOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadFunction();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('데이터를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [loadFunction, onError]);

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [loadData, autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

