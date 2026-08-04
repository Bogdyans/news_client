const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Вложения хранятся в базе как относительный путь
 */
export function resolveAttachmentUrl(path: string): string {
  if (path === '') return path;
  return `${API_BASE_URL}${path}`;
}
