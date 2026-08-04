// Типы ответов бэкенда

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Автор новости в ответе API */
export interface NewsAuthor {
  id: string;
  name: string;
}

export type NewsStatus = 'draft' | 'scheduled' | 'published';

export interface News {
  id: string;
  title: string;
  content: string;
  author: NewsAuthor;
  status: NewsStatus;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  // Отсутствуют в ответе, если не заданы — не undefined-поля, а просто нет ключа
  publishAt?: string;
  publishedAt?: string;
}

export interface NewsListResult {
  items: News[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Общая обёртка успешного ответа  */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/** Форма ответа при ошибке */
export interface ApiErrorBody {
  success: false;
  message: string;
  details?: ApiErrorDetail[];
}
