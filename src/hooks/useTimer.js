import { useState, useRef, useCallback } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setElapsed(0);
    startTimeRef.current = null;
  }, []);

  return { elapsed, start, stop, reset };
}
