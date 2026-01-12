import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setTimeout(() => setMatches(media.matches), 0);
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useDarkMode(): [boolean, (value: boolean) => void] {
  const [isDark, setIsDark] = useLocalStorage('dark-mode', false);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const [isSystemDark, setIsSystemDark] = useState(prefersDark);

  useEffect(() => {
    setIsSystemDark(prefersDark);
  }, [prefersDark]);

  const toggleDarkMode = useCallback(
    (value: boolean) => {
      setIsDark(value);
    },
    [setIsDark]
  );

  return [isSystemDark ? isDark : isDark, toggleDarkMode];
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 使用 setTimeout 避免在 effect 中直接调用 setState
    setTimeout(() => setMounted(true), 0);
  }, []);

  return mounted;
}

export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: Event) => void
): void {
  useEffect(() => {
    const listener = (event: Event) => {
      if (ref.current === null || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function useScrollPosition(): { x: number; y: number } {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
}
