import { getApiBase, defaultOptions } from '@/config/api';
import { apiService } from '@/services/api.service';

type Query = Record<string, string | number | boolean | null | undefined>;

interface HttpOptions {
  headers?: Record<string, string>;
  query?: Query;
  timeoutMs?: number;
  withCredentials?: boolean; // include cookies if needed
  signal?: AbortSignal;
}

function buildQuery(params?: Query): string {
  if (!params) return '';
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

function getAuthHeader(): Record<string, string> {
  const token = apiService.loadToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(method: string, path: string, body?: any, options: HttpOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${getApiBase()}${path}${buildQuery(options.query)}`;
  const headers: HeadersInit = {
    ...defaultOptions.headers,
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  // Optional timeout
  const controller = new AbortController();
  const id = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : undefined;

  try {
    const res = await fetch(url, {
      method,
      headers,
      credentials: options.withCredentials ? 'include' : 'same-origin',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal ?? controller.signal,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message = data?.message || res.statusText;
      const error: any = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } finally {
    if (id) clearTimeout(id);
  }
}

const http = {
  get: <T>(path: string, options?: HttpOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: any, options?: HttpOptions) => request<T>('POST', path, body, options),
  put: <T>(path: string, body?: any, options?: HttpOptions) => request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: any, options?: HttpOptions) => request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: HttpOptions) => request<T>('DELETE', path, undefined, options),
};

export default http;
