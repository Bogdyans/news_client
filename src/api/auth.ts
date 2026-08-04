import { apiClient } from './client';
import type { User } from '../types/api';

interface AuthResponse {
  user: User;
  token: string;
}

export function register(email: string, password: string, name: string) {
  return apiClient.post<AuthResponse>('/api/auth/register', { email, password, name });
}

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
}

export function fetchMe(token: string) {
  return apiClient.get<{ user: User }>('/api/auth/me', token);
}
