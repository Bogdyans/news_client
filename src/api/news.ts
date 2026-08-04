import { apiClient } from './client';
import type { News, NewsListResult, NewsStatus } from '../types/api';

export interface ListNewsParams {
  page?: number;
  limit?: number;
  status?: NewsStatus;
  author?: string;
}

function buildQueryForList(params: ListNewsParams): string {
  const search = new URLSearchParams();

  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.status !== undefined) search.set('status', params.status);
  if (params.author !== undefined) search.set('author', params.author);

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listNews(token: string, params: ListNewsParams = {}) {
  return apiClient.get<NewsListResult>(`/api/news${buildQueryForList(params)}`, token);
}

export function getNews(token: string, id: string) {
  return apiClient.get<{ news: News }>(`/api/news/${id}`, token);
}

export interface CreateNewsInput {
  title: string;
  content: string;
  publishAt?: string;
}

export function createNews(token: string, input: CreateNewsInput) {
  return apiClient.post<{ news: News }>('/api/news', input, token);
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  /** null снимает новость с расписания и возвращает её в черновики */
  publishAt?: string | null;
}

export function updateNews(token: string, id: string, input: UpdateNewsInput) {
  return apiClient.patch<{ news: News }>(`/api/news/${id}`, input, token);
}

export function deleteNews(token: string, id: string) {
  return apiClient.delete<{ id: string }>(`/api/news/${id}`, token);
}

/** Без publishAt новость публикуется сразу, с ним — встаёт в расписание */
export function publishNews(token: string, id: string, publishAt?: string) {
  return apiClient.post<{ news: News }>(
    `/api/news/${id}/publish`,
    publishAt ? { publishAt } : {},
    token,
  );
}

export function uploadAttachments(token: string, id: string, files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));

  return apiClient.post<{ news: News }>(`/api/news/${id}/attachments`, form, token);
}

