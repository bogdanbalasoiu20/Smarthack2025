const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;

const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
const defaultWsBase = apiOrigin.replace(/^http/i, (match) =>
  match.toLowerCase() === 'https' ? 'wss' : 'ws'
);

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? defaultWsBase;
