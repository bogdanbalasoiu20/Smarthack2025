const TOKEN_KEYS = ['authToken', 'token'] as const;

const isBrowser = typeof window !== 'undefined';

export function getStoredToken(): string | null {
  if (!isBrowser) {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}

export function setStoredToken(token: string | null) {
  if (!isBrowser) {
    return;
  }

  if (!token) {
    clearStoredToken();
    return;
  }

  for (const key of TOKEN_KEYS) {
    localStorage.setItem(key, token);
  }
}

export function clearStoredToken() {
  if (!isBrowser) {
    return;
  }

  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}
