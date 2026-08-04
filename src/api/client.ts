import type { ApiErrorDetail, ApiSuccess } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Ошибка запроса к API. Хранит HTTP-статус и детали валидации
 */
export class ApiRequestError extends Error {
  status: number;
  details?: ApiErrorDetail[];

  constructor(status: number, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
}

/**
 * Обёртка fetch: добавляет базовый URL, токен авторизации
 * и приводит ответ к единому формату
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body } = options;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  // на случай сетевого сбоя не даём JSON.parse уронить приложение
  const payload: unknown = await response.json().catch(() => null);
  const parsed = payload as { success?: boolean; message?: string; details?: ApiErrorDetail[]; data?: T } | null;

  if (!response.ok || parsed?.success === false) {
    const message = parsed?.message ?? `Не удалось выполнить запрос (${response.status}).`;
    throw new ApiRequestError(response.status, message, parsed?.details);
  }

  return (parsed as ApiSuccess<T>).data;
}

export const apiClient = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { token }),

  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body, token }),

  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body, token }),

  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE', token }),
};
