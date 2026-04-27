import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic data fetching hook.
 * @param {Function} fetchFn - async function that returns data
 * @param {object} options
 * @param {boolean} options.immediate - run on mount (default true)
 * @param {any} options.initialData
 */
export const useApi = (fetchFn, options = {}) => {
  // Support either immediate or manual (where manual: true implies immediate: false)
  const isImmediate = options.immediate !== undefined ? options.immediate : (options.manual ? false : true);
  const { initialData = null } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(isImmediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      if (!result) {
        setData(null);
        return null;
      }
      setData(result.data);
      return result.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Request failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (isImmediate) execute().catch(() => {});
  }, []);

  return { data, loading, error, execute, setData };
};
