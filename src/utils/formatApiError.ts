import { ApiRequestError } from '../api/client';

/** Приводит ошибку запроса к тексту для показа пользователю */
export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.details !== undefined && error.details.length > 0) {
      return error.details.map((detail) => detail.message).join(' ');
    }
    return error.message;
  }

  return fallback;
}
