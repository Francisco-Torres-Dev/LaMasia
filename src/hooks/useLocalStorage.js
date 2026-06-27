import { useState, useCallback } from 'react';
import StorageService from '../services/StorageService';

/**
 * Hook para sincronizar estado con LocalStorage.
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() =>
    StorageService.get(key, initialValue)
  );

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        StorageService.set(key, next);
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
