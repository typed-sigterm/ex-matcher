export function useTimeoutManager() {
  const timeoutTokens = new Set<number>();

  const scheduleTimeout = (fn: () => void, delay: number) => {
    const token = setTimeout(() => {
      try {
        fn();
      } finally {
        timeoutTokens.delete(token);
      }
    }, delay);
  };

  const clearAllTimeouts = () => {
    timeoutTokens.forEach(token => clearTimeout(token));
    timeoutTokens.clear();
  };

  return {
    scheduleTimeout,
    clearAllTimeouts,
  };
}
