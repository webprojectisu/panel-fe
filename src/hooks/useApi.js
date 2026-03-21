import { useState, useEffect, useCallback, useRef } from 'react';
import { extractApiError } from '../utils/errorHandlers';

export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        const { message } = extractApiError(err);
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [run]);

  return { data, isLoading, error, refetch: run };
}
